// THIS FILE IS GENERATED. DO NOT EDIT.
import { validateBasePath, validatePartialOnlineServiceConfigMode, validatePartialServiceConfigMode, validateOnlineServiceConfigMode, validateServiceConfigMode, validateServiceConfigProbeInterval, validateServiceConfigProbeCondition } from '../validators/connectivity.js';
export { validateBasePath, validatePartialOnlineServiceConfigMode, validatePartialServiceConfigMode, validateOnlineServiceConfigMode, validateServiceConfigMode, validateServiceConfigProbeInterval, validateServiceConfigProbeCondition };
export function isBasePath(o) {
    return validateBasePath(o).length === 0;
}
export function assertBasePath(o) {
    const errors = validateBasePath(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testBasePath(o) {
    return validateBasePath(o).length === 0;
}
export function isPartialOnlineServiceConfigMode(o) {
    return validatePartialOnlineServiceConfigMode(o).length === 0;
}
export function assertPartialOnlineServiceConfigMode(o) {
    const errors = validatePartialOnlineServiceConfigMode(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testPartialOnlineServiceConfigMode(o) {
    return validatePartialOnlineServiceConfigMode(o).length === 0;
}
export function isPartialServiceConfigMode(o) {
    return validatePartialServiceConfigMode(o).length === 0;
}
export function assertPartialServiceConfigMode(o) {
    const errors = validatePartialServiceConfigMode(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testPartialServiceConfigMode(o) {
    return validatePartialServiceConfigMode(o).length === 0;
}
export function isOnlineServiceConfigMode(o) {
    return validateOnlineServiceConfigMode(o).length === 0;
}
export function assertOnlineServiceConfigMode(o) {
    const errors = validateOnlineServiceConfigMode(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testOnlineServiceConfigMode(o) {
    return validateOnlineServiceConfigMode(o).length === 0;
}
export function isServiceConfigMode(o) {
    return validateServiceConfigMode(o).length === 0;
}
export function assertServiceConfigMode(o) {
    const errors = validateServiceConfigMode(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testServiceConfigMode(o) {
    return validateServiceConfigMode(o).length === 0;
}
export function isServiceConfigProbeInterval(o) {
    return validateServiceConfigProbeInterval(o).length === 0;
}
export function assertServiceConfigProbeInterval(o) {
    const errors = validateServiceConfigProbeInterval(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testServiceConfigProbeInterval(o) {
    return validateServiceConfigProbeInterval(o).length === 0;
}
export function isServiceConfigProbeCondition(o) {
    return validateServiceConfigProbeCondition(o).length === 0;
}
export function assertServiceConfigProbeCondition(o) {
    const errors = validateServiceConfigProbeCondition(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testServiceConfigProbeCondition(o) {
    return validateServiceConfigProbeCondition(o).length === 0;
}
//# sourceMappingURL=connectivity-clamps.js.map