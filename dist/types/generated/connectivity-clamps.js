// THIS FILE IS GENERATED. DO NOT EDIT.
import { FAILED_ASSERTION } from './error-codes.js';
import { error } from '../../lib/exceptions.js';
import { validateBasePath, validatePartialOnlineServiceConfigMode, validatePartialServiceConfigMode, validateOnlineServiceConfigMode, validateServiceConfigMode, validateServiceConfigProbeInterval, validateServiceConfigProbeCondition } from '../validators/connectivity.js';
export { validateBasePath, validatePartialOnlineServiceConfigMode, validatePartialServiceConfigMode, validateOnlineServiceConfigMode, validateServiceConfigMode, validateServiceConfigProbeInterval, validateServiceConfigProbeCondition };
export function isBasePath(o) {
    return validateBasePath(o).length === 0;
}
export function assertBasePath(o, log, path) {
    let errors = validateBasePath(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validateBasePath(o, path ?? 'BasePath');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testBasePath(o) {
    return validateBasePath(o).length === 0;
}
export function isPartialOnlineServiceConfigMode(o) {
    return validatePartialOnlineServiceConfigMode(o).length === 0;
}
export function assertPartialOnlineServiceConfigMode(o, log, path) {
    let errors = validatePartialOnlineServiceConfigMode(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validatePartialOnlineServiceConfigMode(o, path ?? 'PartialOnlineServiceConfigMode');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testPartialOnlineServiceConfigMode(o) {
    return validatePartialOnlineServiceConfigMode(o).length === 0;
}
export function isPartialServiceConfigMode(o) {
    return validatePartialServiceConfigMode(o).length === 0;
}
export function assertPartialServiceConfigMode(o, log, path) {
    let errors = validatePartialServiceConfigMode(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validatePartialServiceConfigMode(o, path ?? 'PartialServiceConfigMode');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testPartialServiceConfigMode(o) {
    return validatePartialServiceConfigMode(o).length === 0;
}
export function isOnlineServiceConfigMode(o) {
    return validateOnlineServiceConfigMode(o).length === 0;
}
export function assertOnlineServiceConfigMode(o, log, path) {
    let errors = validateOnlineServiceConfigMode(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validateOnlineServiceConfigMode(o, path ?? 'OnlineServiceConfigMode');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testOnlineServiceConfigMode(o) {
    return validateOnlineServiceConfigMode(o).length === 0;
}
export function isServiceConfigMode(o) {
    return validateServiceConfigMode(o).length === 0;
}
export function assertServiceConfigMode(o, log, path) {
    let errors = validateServiceConfigMode(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validateServiceConfigMode(o, path ?? 'ServiceConfigMode');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testServiceConfigMode(o) {
    return validateServiceConfigMode(o).length === 0;
}
export function isServiceConfigProbeInterval(o) {
    return validateServiceConfigProbeInterval(o).length === 0;
}
export function assertServiceConfigProbeInterval(o, log, path) {
    let errors = validateServiceConfigProbeInterval(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validateServiceConfigProbeInterval(o, path ?? 'ServiceConfigProbeInterval');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testServiceConfigProbeInterval(o) {
    return validateServiceConfigProbeInterval(o).length === 0;
}
export function isServiceConfigProbeCondition(o) {
    return validateServiceConfigProbeCondition(o).length === 0;
}
export function assertServiceConfigProbeCondition(o, log, path) {
    let errors = validateServiceConfigProbeCondition(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validateServiceConfigProbeCondition(o, path ?? 'ServiceConfigProbeCondition');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testServiceConfigProbeCondition(o) {
    return validateServiceConfigProbeCondition(o).length === 0;
}
//# sourceMappingURL=connectivity-clamps.js.map