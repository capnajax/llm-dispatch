import getConfig from "./lib/config.js";
import { error, errorAsObject } from "./lib/exceptions.js";
import { aiEndpointRequest, checkHealth, createHtRequest, parseRequestBody } from "./lib/http-tools.js";
import { getLogger } from "./lib/logger.js";
import { DISPATCH_OFFLINE, ERROR, isErrorCode, REQ_BODY_EMPTY } from "./types/generated/error-codes.js";
import { isCreateChatCompletionRequest } from "./types/generated/openai-types.js";
import { isOnlineServiceConfigMode } from "./types/types.js";
import { getPromptConfigData } from "./prompts/prompts.js";
import { parseIntent, parseSatisfaction } from "./prompts/prompts-types.js";
// import probe from "./probe.js"
const MODULE = 'dispatch';
const ERROR_MODE = { name: 'error', displayName: 'ERROR', icon: 'empty' };
const BACKEND_COMPLETIONS_PATH = '/v1/chat/completions';
let connectivityModeProbe = {
    lastCheck: 0, result: null
};
export async function classifyByIntent(messages) {
    const connectivityMode = await getConnectivityMode('less');
    if (!isOnlineServiceConfigMode(connectivityMode)) {
        throw error(DISPATCH_OFFLINE);
    }
    const pc = (await getPromptConfigData()).prompts.intent;
    const requestBody = {
        ...(pc.parameters),
        messages: [...messages, pc.message],
    };
    pc.grammar && (requestBody.grammar = pc.grammar);
    const result = await aiEndpointRequest('classify', BACKEND_COMPLETIONS_PATH, requestBody, {}, parseIntent);
    return result;
}
export async function classifyBySatisfaction(messages) {
    const connectivityMode = await getConnectivityMode('less');
    if (!isOnlineServiceConfigMode(connectivityMode)) {
        throw error(DISPATCH_OFFLINE);
    }
    const pc = (await getPromptConfigData()).prompts.satisfaction;
    const requestBody = {
        ...(pc.parameters),
        messages: [...messages, pc.message],
    };
    pc.grammar && (requestBody.grammar = pc.grammar);
    const result = await aiEndpointRequest('classify', BACKEND_COMPLETIONS_PATH, requestBody, {}, parseSatisfaction);
    return result;
}
export async function dispatch(req, res) {
    const log = getLogger(MODULE, dispatch);
    if (!req.body) {
        throw error(REQ_BODY_EMPTY, { res });
    }
    const requestBody = parseRequestBody(req, isCreateChatCompletionRequest);
    const doStream = requestBody.stream || false;
    let dispatchMessages = [...requestBody.messages];
    let dispatchEndpoint = 'default';
    res.setHeader('Content-Type', 'application/json');
    const serviceConfigMode = await getConnectivityMode('less');
    if (await isOnline(serviceConfigMode)) {
        try {
            const mode = serviceConfigMode;
            let escalate = false;
            let escalationExplanation = [];
            if (mode.basePaths.classify) {
                const intent = await classifyByIntent(requestBody.messages);
                let intentError = false;
                if (typeof intent === 'string') {
                    log.warn('Failed to rate intent: ' + intent +
                        '. Cannot escalate based on intent, forcing satisfaction rating.');
                    intentError = true;
                }
                let satisfactionTestNeeded = intentError ? 1 : 0;
                let escalationNeeded = 0;
                if (!intentError && intent.tone.value === 'negative') {
                    satisfactionTestNeeded += intent.tone.confidence || 100;
                    if (intent.intent.value === 'retry') {
                        escalationExplanation.push('The user is unsatisfied with the ' +
                            'previous answer and wants you to try again');
                    }
                    else {
                        escalationExplanation.push('The user is taking a negative tone ' +
                            'and is probably not liking the way this conversation is going');
                    }
                }
                if (satisfactionTestNeeded) {
                    const satisfaction = await classifyBySatisfaction(requestBody.messages);
                    if (typeof satisfaction === 'string') {
                        log.warn('Failed to rate satisfaction: ' + satisfaction +
                            '. Cannot escalate based on satisfaction.');
                    }
                    else {
                        if (satisfaction.satisfaction === 'negative') {
                            escalationNeeded += satisfaction.confidence;
                            escalationExplanation.push('Conversation analysis has indicated the conversation is not ' +
                                'progressing and is likely going in circles.  It may be a ' +
                                'wise to review the context as a whole and determine if ' +
                                'there is a better direction to go in.', ...(satisfaction.context || []));
                            satisfaction.context && (escalationExplanation.push(satisfaction.context));
                        }
                    }
                }
                if (!intentError) {
                    const c = intent.complexity;
                    if (c.value === 'high') {
                        escalationNeeded += c.confidence || 100;
                        // no need to explain escalation due to complexity
                    }
                    else if (c.value === 'medium') {
                        escalationNeeded += (c.confidence || 100) / 2;
                    }
                    if (escalationNeeded >= 75) {
                        escalate = true;
                    }
                }
                // Send to escalate or default endpoint
                if (escalate) {
                    dispatchEndpoint = 'escalate';
                    if (escalationExplanation && escalationExplanation.length) {
                        dispatchMessages.push({
                            content: escalationExplanation.join('\n'),
                            role: 'system'
                        });
                    }
                }
            }
            else {
                // use default dispatchEndpoint
            }
            // send the request
            const backendRequest = { ...requestBody };
            backendRequest.messages = dispatchMessages;
            const backendBodyBuffer = Buffer.from(JSON.stringify(backendRequest));
            const backendHeaders = [
                ...req.headers.headerPairs.map((v) => ([v[0], v[1]])),
                ['Content-Length', `${backendBodyBuffer.byteLength}`]
            ];
            const dispatchUrl = new URL(BACKEND_COMPLETIONS_PATH, mode.basePaths[dispatchEndpoint]);
            const dispatchOptions = {
                method: 'POST',
                headers: backendHeaders.flat()
            };
            const dispatchRequest = createHtRequest(dispatchUrl, dispatchOptions, dispatchResponse => {
                dispatchResponse.on('data', chunk => {
                    res.sendChunk(chunk);
                });
                dispatchResponse.on('end', () => {
                    res.end();
                });
            });
            dispatchRequest.write(backendBodyBuffer);
            dispatchRequest.end();
        }
        catch (e) {
            if (e instanceof Error) {
                const errorObj = errorAsObject(e);
                const errorCode = isErrorCode(errorObj.code) ? errorObj.code : ERROR;
                throw error(errorCode, { details: errorObj.details,
                    cause: e.cause,
                    stack: e.stack,
                    res
                });
            }
        }
    }
    else {
        res.status(503);
        res.send('Try again later');
    }
}
async function fetchConnectivityMode() {
    const log = getLogger(MODULE, fetchConnectivityMode);
    const testedEndpoints = {};
    const config = getConfig();
    log.silly('Called -- config == %s', config);
    let acceptedMode = null;
    for (const checkMode of config.connectivity.modes) {
        log.silly('checkMode: %s', JSON.stringify(checkMode));
        if (isOnlineServiceConfigMode(checkMode)) {
            log.silly('isOnlineServiceConfigMode');
            const checkModePromises = [];
            if (checkMode.if) {
                for (const condition of checkMode.if) {
                    if (condition.healthy) {
                        const healthyCondition = `healthy: ${condition.healthy}`;
                        if (Object.hasOwn(testedEndpoints, healthyCondition)) {
                            checkModePromises.push(testedEndpoints[healthyCondition]);
                        }
                        else {
                            checkModePromises.push(checkHealth(condition.healthy));
                        }
                    }
                    // ensure there aren't any unknown tests for later
                    const knownTests = ['healthy'];
                    for (const k of Object.keys(condition)) {
                        if (!knownTests.includes(k)) {
                            log.warn(`Unknown test "${k}" in connectivity mode "${checkMode.name}"` +
                                ". May accept a connectivity mode that is not actually " +
                                "available.");
                        }
                    }
                }
            }
            const checkResults = await Promise.all(checkModePromises);
            if (checkResults.every(m => m)) {
                acceptedMode = checkMode;
                break;
            }
        }
        else {
            log.silly('offline ServiceConfigMode');
            acceptedMode = checkMode;
            break;
        }
    }
    if (acceptedMode === null) {
        log.error('No available service config mode. Falling back to "error" mode.');
        acceptedMode = ERROR_MODE;
    }
    if (!isOnlineServiceConfigMode(acceptedMode)) {
        log.error('service offline');
    }
    return acceptedMode;
}
/**
 * Returns the connectivity modes and their availablity
 * @returns a promise that resolves with connectivity modes and their
 *  availability
 */
export async function fetchModels(check = 'recent') {
    const offlineModels = {
        default: { available: false, failTo: 'escalate' },
        escalate: { available: false, failTo: 'default' },
        classify: { available: false, failTo: null }
    };
    // check the connectivity
    const connectivity = await getConnectivityMode(check);
    // set the models
    const modelAvailable = (name) => {
        if (isOnlineServiceConfigMode(connectivity)) {
            return Object.hasOwn(connectivity.basePaths, name);
        }
        else {
            return false;
        }
    };
    let models = offlineModels;
    models.default.available = modelAvailable('default');
    models.escalate.available = modelAvailable('escalate');
    models.classify.available = modelAvailable('classify');
    return { models, connectivity };
}
export async function getConnectivityMode(check = 'less') {
    const log = getLogger(MODULE, getConnectivityMode);
    let fetchNeeded = !!(connectivityModeProbe.result === null ||
        check === 'always');
    const now = Date.now();
    const config = getConfig();
    if (!fetchNeeded) {
        if (!config) {
            log.warn('Attempt to get connectivity mode before config is ready');
            return ERROR_MODE;
        }
        switch (check) {
            case 'recent':
                fetchNeeded = !!(connectivityModeProbe.lastCheck + config.connectivity.probe.min > now);
                break;
            case 'less':
                fetchNeeded = !!(config.connectivity.probe.max &&
                    connectivityModeProbe.lastCheck + config.connectivity.probe.max > now);
        }
    }
    log.silly('connectivityModeProbe: %s', JSON.stringify(connectivityModeProbe));
    log.debug('fetchNeeded: %s', fetchNeeded);
    return fetchNeeded
        ? fetchConnectivityMode()
        : connectivityModeProbe.result;
}
export async function isOnline(check = 'less') {
    const mode = typeof check === 'string'
        ? await getConnectivityMode(check)
        : check;
    return isOnlineServiceConfigMode(mode);
}
export default dispatch;
//# sourceMappingURL=dispatch.js.map