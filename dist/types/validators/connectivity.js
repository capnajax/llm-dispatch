import { format, inspect } from "node:util";
import { doTests, E, itemsFromTuples, logResult, tv, tva } from "../types-tools.js";
import { getLogger } from "../../lib/logger.js";
import { D3 } from "./raw-config.js";
const MODULE = 'validators/connectivity';
export const OFFLINE_MODE = 'offline';
/**
 * The regular expression used to validate a base path
 */
const basePathPattern = /^(https?:\/\/)?[a-z0-9A-Z\-\.]+(:[0-9]+)?(\/.*[^\/])?$/;
const permittedBasePathTypeValues = ['classify', 'default', 'escalate'];
const permittedIconValues = ['half', 'full', 'empty'];
export function validateBasePath(o, path) {
    const log = getLogger(MODULE, validateBasePath);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    if (typeof o !== 'string') {
        return [path ? `${path} is not a string` : E];
    }
    else if (!basePathPattern.test(o)) {
        return [path ? `${path} value "${o}" is not a valid basePath URL` : E];
    }
    return [];
}
/**
 * Validates the base paths in OnlineServiceConfigMode objects.
 * @param o
 * @param path
 * @returns
 */
function validateBasePaths(o, path) {
    const log = getLogger(MODULE, validateBasePaths);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    if (typeof o === 'object') {
        let hasDefault = false;
        for (const k in o) {
            const kPath = path ? `${path}.${k}` : path;
            result.push(...validateBasePathType(k, kPath), ...validateBasePath(o[k], kPath));
            if (k === 'default') {
                hasDefault = true;
            }
        }
        if (!hasDefault) {
            result.push(path ? `${path} has no default base path` : E);
        }
    }
    else {
        result.push(path ? `${path} is not an object` : E);
    }
    logResult(result, log);
    return result;
}
;
export function validateConfig(o, path) {
    const result = [];
    const subPath = (leaf) => {
        if (path) {
            return `${path}.${leaf}`;
        }
        else if (path === '') {
            return leaf;
        }
        else {
            return undefined;
        }
    };
    if (o === null) {
        result.push('Config must be non-null');
    }
    else if (typeof o === 'object') {
        const orsu = o;
        if (orsu.connectivity && (typeof orsu.connectivity === 'object')) {
            const crsu = orsu.connectivity;
            if (Array.isArray(crsu.modes)) {
                crsu.modes.forEach((mode, i) => {
                    const modePath = subPath(`connectivity.modes[${i}]`);
                    if (mode !== null && typeof mode === 'object') {
                        if (mode.name === OFFLINE_MODE) {
                            result.push(...validateServiceConfigMode(mode, modePath));
                        }
                        else {
                            result.push(...validateOnlineServiceConfigMode(mode, modePath));
                        }
                    }
                    else {
                        result.push(`${modePath} must be a non-null object`);
                    }
                });
            }
            else {
                result.push('Config modes must be an array');
            }
            result.push(...validateServiceConfigProbeInterval(crsu.probe, subPath('probe')));
        }
        else {
            result.push('Config connectivity must be an object');
        }
    }
    else {
        result.push('Config must be an object');
    }
    return result;
}
// export function validateConnectivityModes(o: any, path?:string): string[] {
//   const log = getLogger(MODULE, validateConnectivityModes);
//   log.silly('called on {path, o}: %s', inspect({path, o}, D3));
//   const result:string[] = [];
//   doTests([result, o, path], itemsFromTuples(
//     [true, 'object', '%s must be an object'],
//     [true, 'string', '%s must be a string', 'name'],
//     [true, 'string', '%s must be a string', 'displayName'],
//     tv(result, validateBasePath, path, 'baseUrl', false)
//   ));
//   logResult(result, log);
//   return result;
// }
function validateBasePathType(o, path) {
    const log = getLogger(MODULE, validateBasePathType);
    const result = [];
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    if (typeof o === 'string' && !permittedBasePathTypeValues.includes(o)) {
        result.push(path ? format('%s is not a basePath type key', path) : E);
    }
    logResult(result, log);
    return result;
}
function validateIcon(o, path) {
    const log = getLogger(MODULE, validateIcon);
    const result = [];
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    if (!(typeof o === 'string' && permittedIconValues.includes(o))) {
        result.push(path ? format('%s is not a valid icon value', path) : E);
    }
    logResult(result, log);
    return result;
}
export function validatePartialOnlineServiceConfigMode(o, path) {
    const log = getLogger(MODULE, validatePartialOnlineServiceConfigMode);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = validatePartialServiceConfigMode(o, path);
    if (path || !result.length) {
        doTests([result, o, path], itemsFromTuples(tv(result, validateBasePaths, path, 'basePaths', false), tva(result, validateServiceConfigProbeCondition, path, 'if', false)));
    }
    logResult(result, log);
    return result;
}
/**
 * Tests if `o` is a `Partial<ServiceConfigMode>` without clamping.
 * @param o the object to validate
 * @returns An array of error messages. If the array's length is zero, there
 *  are no errors.
 */
export function validatePartialServiceConfigMode(o, path) {
    const log = getLogger(MODULE, validatePartialServiceConfigMode);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], [true, 'string', '%s must be a string', 'name'], [false, 'string', '%s must be a string or undefined', 'displayName'], tv(result, validateIcon, path, 'icon', false)));
    logResult(result, log);
    return result;
}
export function validateOnlineServiceConfigMode(o, path) {
    const log = getLogger(MODULE, validateOnlineServiceConfigMode);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], tv(result, validateServiceConfigMode, path), tv(result, validateBasePaths, path, 'basePaths'), tva(result, validateServiceConfigProbeCondition, path, 'if')));
    logResult(result, log);
    return result;
}
export function validateServiceConfigMode(o, path) {
    const log = getLogger(MODULE, validateServiceConfigMode);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], [true, 'string', '%s must be a string', 'displayName'], [true, 'string', '%s must be a string', 'name'], tv(result, validateIcon, path, 'icon')));
    logResult(result, log);
    return result;
}
export function validateServiceConfigProbeInterval(o, path) {
    const log = getLogger(MODULE, validateServiceConfigProbeInterval);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    const validateMilliseconds = (o, path) => {
        if (typeof o !== 'number') {
            return [path ? `${path} value "${o.toString()}" is not a number` : E];
        }
        else if (o <= 0) {
            return [path ? `${path} value ${o} must be greater than zero` : E];
        }
        else {
            return [];
        }
    };
    const validateMax = (o, path) => {
        return (o === null
            ? []
            : validateMilliseconds(o, path));
    };
    doTests([result, o, path], itemsFromTuples([true, 'object', '%s must be an object'], tv(result, validateMilliseconds, path, 'min'), tv(result, validateMax, path, 'max')));
    logResult(result, log);
    return result;
}
export function validateServiceConfigProbeCondition(o, path) {
    const log = getLogger(MODULE, validateServiceConfigProbeCondition);
    log.silly('called on {path, o}: %s', inspect({ path, o }, D3));
    const result = [];
    if (typeof o !== 'object') {
        result.push(path ? `${path} must be an object` : E);
    }
    else if (o === null) {
        result.push(path ? `${path} must not be null` : E);
    }
    else {
        let numConditionsInCondition = 0;
        if (o.healthy) {
            numConditionsInCondition++;
            if (typeof o.healthy !== 'string') {
                result.push(path ? `${path}.healthy must be a URL string` : E);
            }
            else if (!URL.canParse(o.healthy)) {
                result.push(path ? `${path}.healthy cannot parse into a URL string` : E);
            }
        }
        if (numConditionsInCondition > 1) {
            result.push(path ? `${path} too many conditions in condition` : E);
        }
        else if (numConditionsInCondition === 0) {
            result.push(path ? `${path} no conditions in condition` : E);
        }
    }
    logResult(result, log);
    return result;
}
//# sourceMappingURL=connectivity.js.map