import { inspect } from "node:util";
import { error } from "../../lib/exceptions.js";
import { getLogger } from "../../lib/logger.js";
import { INTERNAL_ERROR } from "../generated/error-codes.js";
import { isLoggerConfig } from "../logger-types.js";
import { doTests, E, itemsFromTuples, logResult, tv, tva } from "../types-tools.js";
import { OFFLINE_MODE, validateOnlineServiceConfigMode, validatePartialOnlineServiceConfigMode, validateServiceConfigMode, validateServiceConfigProbeInterval } from "./connectivity.js";
const MODULE = 'validators/raw-config';
export const D1 = { depth: 1, colors: true };
export const D2 = { depth: 2, colors: true };
export const D3 = { depth: 3, colors: true };
export const D4 = { depth: 4, colors: true };
export function normalizeConfig(o, hostname, path) {
    const log = getLogger(MODULE, normalizeConfig);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const validation = validateConfigAsLoaded(o, path);
    if (validation.length > 0) {
        return { valid: false, errors: path ? validation : undefined };
    }
    let s = o;
    if (!Object.hasOwn(s.hosts, hostname)) {
        return {
            valid: false,
            errors: path
                ? [`Hostname "${hostname}" not in service config`]
                : undefined
        };
    }
    // this construct here is to avoid tracking errors when it's not
    // necessary
    let _hasErrors = false;
    const errors = path
        ? new Array()
        : { push: () => { _hasErrors = true; } };
    const hasErrors = () => {
        if (Array.isArray(errors)) {
            const filteredErrors = errors.filter(e => e.length);
            errors.length = 0;
            errors.push(...filteredErrors);
            return errors.length > 0;
        }
        else {
            return _hasErrors;
        }
    };
    const subjectPath = (member) => {
        if (path) {
            return member ? `${path}.${member}` : path;
        }
    };
    const combinedProbe = {
        ...(s.defaults.connectivity.probe || {}),
        ...(s.hosts[hostname].connectivity.probe || {})
    };
    const probeIntervalsPath = subjectPath('probe');
    // normalize min and max values
    const minProbe = normalizeConfigServiceConfigProbeIntervalValue(combinedProbe.min, path ? `${probeIntervalsPath}.min` : path);
    const maxProbe = combinedProbe.max === null ? null :
        normalizeConfigServiceConfigProbeIntervalValue(combinedProbe.max, path ? `${probeIntervalsPath}.max` : path);
    if (minProbe.valid) {
        combinedProbe.min = minProbe.value;
    }
    else {
        minProbe.errors && minProbe.errors.forEach(e => errors.push([e]));
    }
    if (maxProbe !== null) {
        if (maxProbe.valid) {
            combinedProbe.max = maxProbe.value;
        }
        else {
            maxProbe.errors && maxProbe.errors.forEach(e => errors.push([e]));
        }
    }
    const probeErrors = validateServiceConfigProbeInterval(combinedProbe, probeIntervalsPath);
    errors.push(probeErrors);
    const resultValue = {
        connectivity: {
            modes: [],
            probe: combinedProbe
        },
        logging: s.logging
    };
    for (const hcm of s.hosts[hostname].connectivity.modes) {
        const combinedMode = {
            ...(s.defaults.connectivity.modes.find(m => m.name === hcm.name)),
            ...(hcm)
        };
        if (hcm.name === OFFLINE_MODE) {
            errors.push(validateServiceConfigMode(combinedMode, subjectPath('[name=offline]')));
            resultValue.connectivity.modes.push(combinedMode);
        }
        else {
            errors.push(validateOnlineServiceConfigMode(combinedMode, subjectPath(`[name=${hcm.name}]`)));
            resultValue.connectivity.modes.push(combinedMode);
        }
    }
    if (hasErrors()) {
        if (Array.isArray(errors)) {
            const result = [];
            result.push(...errors);
            return { valid: false, errors: result };
        }
        else {
            return { valid: false };
        }
    }
    else {
        return { valid: true, value: resultValue };
    }
}
export function normalizeConfigServiceConfigProbeIntervalValue(o, path) {
    const log = getLogger(MODULE, 'normalizeCSCPIV');
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const validation = validateConfigServiceConfigProbeIntervalValue(o, path);
    if (validation.length > 0) {
        return { valid: false, errors: path ? validation : undefined };
    }
    let s = o;
    if (typeof s === 'number') {
        return { valid: true, value: s };
    }
    else {
        s = s.trim();
        const match = s.match(/(\d+)([a-z]+)/);
        // because of the testServiceConfigProbeIntervalValue, this should always
        // match
        if (null === match) {
            throw error(INTERNAL_ERROR);
        }
        const value = Number.parseInt(match[1]);
        const unit = match[2];
        const multiplier = {
            h: 60 * 60 * 1000,
            m: 60 * 1000,
            s: 1000,
            ms: 1,
        }[unit];
        if (multiplier === undefined) {
            throw new Error(`Unknown unit ${unit}`);
        }
        return { valid: true, value: value * multiplier };
    }
}
export function validateConfigAsLoaded(o, path) {
    const log = getLogger(MODULE, validateConfigAsLoaded);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    // validates the default connectivity record from the _whole config_ -- so
    // it looks for `defaults.connectivity` within `o` and detects valid reasons
    // that `defaults.connectivity` might not exist.
    const validateDefaultConnectivityRecord = (o, path) => {
        const log = getLogger(MODULE, 'validateConfigAsLoaded.vDCR');
        log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
        const result = [];
        if (typeof o === 'object') {
            if (o?.defaults?.connectivity === null) {
                result.push(path ? `${path}.defaults.connectivity must not be null` : E);
            }
            else if (typeof o?.defaults?.connectivity === 'object') {
                // this is the desired path
                const subjectPath = path ? `${path}.defaults` : path;
                validateConfigHostConfig(o.defaults, path);
            }
            else if (typeof o === 'object' && ((o.defaults === undefined) || (typeof o.defaults === 'object' &&
                o.defaults.connectivity === undefined))) {
                // a valid case that requires no action
            }
            else if (path) {
                // a
                // at this point we are just generating error messages for null or
                // non-object things in the path to o.defaults.connectivity
                if (o === undefined) {
                    result.push(`${path} is undefined`);
                }
                else if (o === null) {
                    result.push(`${path} is null`);
                }
                else if (typeof o !== 'object') {
                    result.push(`${path} is not an object`);
                }
                else if (o.defaults === null) {
                    result.push(`${path}.defaults is null`);
                }
                else if (typeof o.defaults !== 'object') {
                    result.push(`${path}.defaults is not an object`);
                }
                else {
                    result.push(`${path} is not valid`);
                }
            }
            else {
                // there is an error, but we're not looking for it.
                result.push(E);
            }
        }
        else if (o !== undefined && o !== null) {
            result.push(path ? `${path} must be an object` : E);
        }
        return result;
    };
    const validateCHCRecord = (o, path) => {
        const log = getLogger(MODULE, 'validateConfigAsLoaded.vCHCR');
        log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
        const result = [];
        if (typeof o !== 'object') {
            result.push(path ? `${path} is not an object` : E);
        }
        else {
            for (const k in o) {
                result.push(...validateConfigHostConfig(o[k], path ? `${path}[${k}]` : undefined));
            }
        }
        return result;
    };
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], tv(result, validateDefaultConnectivityRecord, path), tv(result, validateCHCRecord, path, 'hosts')));
    if (!isLoggerConfig(o)) {
        result.push(`${path} needs a valid logging config`);
    }
    logResult(result, log);
    return result;
}
function validateConfigHostConfig(o, path) {
    const log = getLogger(MODULE, validateConfigHostConfig);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], 
    // relies on all things that would validatePartialServiceConfigMode also
    // would validatePartialOnlineServiceConfigMode
    tv(result, validateConfigHostConnectivityConfig, path, 'connectivity')));
    logResult(result, log);
    return result;
}
function validateConfigHostConnectivityConfig(o, path) {
    const log = getLogger(MODULE, validateConfigHostConnectivityConfig);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], 
    // relies on all things that would validatePartialServiceConfigMode also
    // would validatePartialOnlineServiceConfigMode
    tva(result, validatePartialOnlineServiceConfigMode, path, 'modes'), tv(result, validateConfigServiceConfigProbeInterval, path, 'probe', false)));
    logResult(result, log);
    return result;
}
function validateConfigServiceConfigProbeInterval(o, path) {
    const log = getLogger(MODULE, validateConfigServiceConfigProbeInterval);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    const validateMax = (o, path) => {
        return (o === null
            ? []
            : validateConfigServiceConfigProbeIntervalValue(o, path));
    };
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], 
    // relies on all things that would validatePartialServiceConfigMode also
    // would validatePartialOnlineServiceConfigMode
    tv(result, validateConfigServiceConfigProbeIntervalValue, path, 'min', false), tv(result, validateMax, path, 'max', false)));
    logResult(result, log);
    return result;
}
function validateConfigServiceConfigProbeIntervalValue(o, path) {
    const log = getLogger(MODULE, 'validateCSCPIV');
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    if (typeof o === 'number') {
        if (o <= 0) {
            result.push(path
                ? `${path} interval value must be greater than zero`
                : E);
        }
        ;
    }
    else if (typeof o === 'string') {
        if (!/^[1-9][0-9]*(m|s|ms|h)?$/.test(o)) {
            result.push(path
                ? path + ' interval string value must parse as a whole number > 0 ' +
                    'with optional units m, s, ms, or h'
                : E);
        }
    }
    else {
        result.push(path ? `${path} is on invalid type ${typeof o}` : E);
    }
    logResult(result, log);
    return result;
}
//# sourceMappingURL=raw-config.js.map