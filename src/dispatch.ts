import * as http from 'node:http';

import { Request, Response } from "filamentjs"

import getConfig from "./lib/config.js"
import { error, errorAsObject } from "./lib/exceptions.js"
import {
  aiEndpointRequest,
  checkHealth,
  createHtRequest,
  parseRequestBody
} from "./lib/http-tools.js"
import { getLogger } from "./lib/logger.js"
import ErrorCode, {
  DISPATCH_OFFLINE,
  ERROR,
  isErrorCode,
  REQ_BODY_EMPTY
} from "./types/generated/error-codes.js"
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  isCreateChatCompletionRequest
} from "./types/generated/openai-types.js"
import {
  AppMeta,
  BasePathType,
  isOnlineServiceConfigMode,
  OnlineServiceConfigMode,
  ServiceConfigMode
} from "./types/types.js"
import { getPromptConfigData } from "./prompts/prompts.js"
import {
  Intent,
  parseIntent,
  parseSatisfaction,
  Satisfaction
} from "./prompts/prompts-types.js"
// import probe from "./probe.js"

const MODULE = 'dispatch';
const ERROR_MODE:ServiceConfigMode =
  {name: 'error', displayName: 'ERROR', icon: 'empty'};

const BACKEND_COMPLETIONS_PATH = '/v1/chat/completions';

// function classify(mode.basePaths.classify) {

// }

interface FetchModelAvailability {
  available: boolean,
  failTo: string|null
}
interface FetchModelsResponse {
  models: {
    default: FetchModelAvailability,
    escalate: FetchModelAvailability,
    classify: FetchModelAvailability
  },
  connectivity: ServiceConfigMode
}

interface ModeProbe<T> {
  lastCheck: number,
  result: T|null;
}

let connectivityModeProbe:ModeProbe<ServiceConfigMode> = {
  lastCheck: 0, result: null
}

export async function classifyByIntent(
  messages: ChatCompletionRequestMessage[]
): Promise<Intent|ErrorCode> {
  const connectivityMode = await getConnectivityMode('less');
  if (!isOnlineServiceConfigMode(connectivityMode)) {
    throw error(DISPATCH_OFFLINE);
  }
  const pc = (await getPromptConfigData()).prompts.intent;
  const requestBody:Record<string, any> = {
    ... (pc.parameters),
    messages: [...messages, pc.message],
  };
  pc.grammar && (requestBody.grammar = pc.grammar);

  const result = await aiEndpointRequest<Intent>(
    'classify', BACKEND_COMPLETIONS_PATH, requestBody, {}, parseIntent
  );

  return result;
}

export async function classifyBySatisfaction(
  messages: ChatCompletionRequestMessage[]
): Promise<Satisfaction|ErrorCode> {
  const connectivityMode = await getConnectivityMode('less');
  if (!isOnlineServiceConfigMode(connectivityMode)) {
    throw error(DISPATCH_OFFLINE);
  }
  const pc = (await getPromptConfigData()).prompts.satisfaction;
  const requestBody:Record<string, any> = {
    ... (pc.parameters),
    messages: [...messages, pc.message],
  };
  pc.grammar && (requestBody.grammar = pc.grammar);

  const result = await aiEndpointRequest<Satisfaction>(
    'classify', BACKEND_COMPLETIONS_PATH, requestBody, {}, parseSatisfaction
  );

  return result;
}

export async function dispatch(req:Request<AppMeta>, res:Response)
: Promise<void> {
  const log = getLogger(MODULE, dispatch);
  if (!req.body) {
    throw error(REQ_BODY_EMPTY, {res});
  }
  const requestBody = parseRequestBody<CreateChatCompletionRequest>(
    req, isCreateChatCompletionRequest);

  const doStream = requestBody.stream || false;

  let dispatchMessages:ChatCompletionRequestMessage[] =
    [ ... requestBody.messages ];
  let dispatchEndpoint:BasePathType = 'default';

  res.setHeader('Content-Type', 'application/json');
  const serviceConfigMode = await getConnectivityMode('less');
  if (await isOnline(serviceConfigMode)) {
    try {
      const mode = serviceConfigMode as OnlineServiceConfigMode;
      let escalate = false;
      let escalationExplanation:string[] = []

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
        if (!intentError && (intent as Intent).tone.value === 'negative') {
          satisfactionTestNeeded += (intent as Intent).tone.confidence || 100;
          if ((intent as Intent).intent.value === 'retry') {
            escalationExplanation.push('The user is unsatisfied with the ' +
              'previous answer and wants you to try again');
          } else {
            escalationExplanation.push('The user is taking a negative tone ' +
              'and is probably not liking the way this conversation is going');
          }
        }
        if (satisfactionTestNeeded) {
          const satisfaction =
            await classifyBySatisfaction(requestBody.messages);
          if (typeof satisfaction === 'string') {
            log.warn('Failed to rate satisfaction: ' + satisfaction +
              '. Cannot escalate based on satisfaction.');
          } else {
            if (satisfaction.satisfaction === 'negative') {
              escalationNeeded += satisfaction.confidence;
              escalationExplanation.push(
                'Conversation analysis has indicated the conversation is not ' +
                  'progressing and is likely going in circles.  It may be a ' +
                  'wise to review the context as a whole and determine if ' +
                  'there is a better direction to go in.',
                ... (satisfaction.context || [])
              );
              satisfaction.context && (
                escalationExplanation.push(satisfaction.context)
              );
            }
          }
        }
        if (!intentError) {
          const c = (intent as Intent).complexity;
          if (c.value === 'high') {
            escalationNeeded += c.confidence || 100;
            // no need to explain escalation due to complexity
          } else if (c.value === 'medium') {
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

      } else {
        // use default dispatchEndpoint
      }

      // send the request
      const backendRequest = {...requestBody};
      backendRequest.messages = dispatchMessages;
      const backendBodyBuffer = Buffer.from(JSON.stringify(backendRequest));      
      const backendHeaders:[string, string][] = [
        ... req.headers.headerPairs.map(
          (v:readonly [string, string]):[string, string] => ([v[0], v[1]])
        ),
        ['Content-Length', `${backendBodyBuffer.byteLength}`]
      ];
      const dispatchUrl = new URL(
        BACKEND_COMPLETIONS_PATH,
        mode.basePaths[dispatchEndpoint]
      );
      const dispatchOptions:http.RequestOptions = {
        method: 'POST',
        headers: backendHeaders.flat()
      }

      const dispatchRequest = createHtRequest(
        dispatchUrl, dispatchOptions, dispatchResponse => {
          dispatchResponse.on('data', chunk => {
            res.sendChunk(chunk);
          });
          dispatchResponse.on('end', () => {
            res.end();
          })
        });
      dispatchRequest.write(backendBodyBuffer);
      dispatchRequest.end();

    } catch(e) {
      if (e instanceof Error) {
        const errorObj = errorAsObject(e);
        const errorCode = isErrorCode(errorObj.code) ? errorObj.code : ERROR;
        throw error(
          errorCode,
          { details: errorObj.details,
            cause: e.cause,
            stack: e.stack,
            res
          });
      }
    }
  } else {
    res.status(503)
    res.send('Try again later');
  }
}

async function fetchConnectivityMode(): Promise<ServiceConfigMode> {
  const log = getLogger(MODULE, fetchConnectivityMode);
  const testedEndpoints:Record<string, Promise<boolean>> = {};
  const config = getConfig();
  log.silly('Called -- config == %s', config);
  let acceptedMode:ServiceConfigMode|null = null;
  for (const checkMode of config.connectivity.modes as ServiceConfigMode[]) {
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
            } else {
              checkModePromises.push(checkHealth(condition.healthy));
            }
          }
          // ensure there aren't any unknown tests for later
          const knownTests = ['healthy'];
          for (const k of Object.keys(condition)) {
            if (!knownTests.includes(k)) {
              log.warn(
                `Unknown test "${k}" in connectivity mode "${checkMode.name}"` +
                ". May accept a connectivity mode that is not actually " +
                "available."
              );
            }
          }
        }
      }
      const checkResults = await Promise.all(checkModePromises);
      if (checkResults.every(m => m)) {
        acceptedMode = checkMode;
        break;
      }
    } else {
      log.silly('offline ServiceConfigMode');
      acceptedMode = checkMode;
      break;
    }
  }
  if (acceptedMode === null) {
    log.error(
      'No available service config mode. Falling back to "error" mode.'
    );
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
export async function fetchModels(check:'always'|'recent'|'less' = 'recent')
: Promise<FetchModelsResponse> {

  const offlineModels = {
    default: {available: false, failTo: 'escalate'},
    escalate: {available: false, failTo: 'default'},
    classify: {available: false, failTo: null}
  };

  // check the connectivity
  const connectivity = await getConnectivityMode(check);

  // set the models
  const modelAvailable = (name:string):boolean => {
    if (isOnlineServiceConfigMode(connectivity)) {
      return Object.hasOwn(connectivity.basePaths, name)
    } else {
      return false;
    }
  }

  let models = offlineModels;
  models.default.available = modelAvailable('default');
  models.escalate.available = modelAvailable('escalate');
  models.classify.available = modelAvailable('classify');

  return { models, connectivity };
}

export async function getConnectivityMode(
  check:'always'|'recent'|'less' = 'less'
): Promise<ServiceConfigMode> {
  const log = getLogger(MODULE, getConnectivityMode);
  let fetchNeeded: boolean = !! (
    connectivityModeProbe.result === null ||
    check === 'always'
  );
  const now = Date.now();
  const config = getConfig();
  if (!fetchNeeded) {
    if (!config) {
      log.warn('Attempt to get connectivity mode before config is ready');
      return ERROR_MODE;
    }
    switch(check) {
      case 'recent':
        fetchNeeded = !! (
          connectivityModeProbe.lastCheck + config.connectivity.probe.min > now
        );
        break;
      case 'less':
        fetchNeeded = !! (
          config.connectivity.probe.max &&
          connectivityModeProbe.lastCheck + config.connectivity.probe.max > now
        );
    }
  }

  log.silly('connectivityModeProbe: %s', JSON.stringify(connectivityModeProbe));
  log.debug('fetchNeeded: %s', fetchNeeded);

  return fetchNeeded
    ? fetchConnectivityMode()
    : ( connectivityModeProbe.result as ServiceConfigMode );
}

export async function isOnline(
  check:'always'|'recent'|'less'|ServiceConfigMode = 'less')
:Promise<boolean> {
  const mode = typeof check === 'string'
    ? await getConnectivityMode(check)
    : check;
  return isOnlineServiceConfigMode(mode);
}

export default dispatch;
