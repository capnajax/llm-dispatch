;
;
export function isLoggerConfig(value) {
    return (typeof value === 'object' &&
        value !== null &&
        isLoggerConfigLoggingObject(value.logging));
}
export function isLoggerConfigLoggingObject(value) {
    const v = value;
    return (isLoggerLevelConfig(value) &&
        (v.modules === undefined ||
            (typeof v.modules === 'object' && v.modules !== null &&
                Object.values(v.modules).every(isModuleConfig))));
}
export function isLoggerLevelConfig(value) {
    return (typeof value === 'object' &&
        value !== null &&
        (value.level === undefined || typeof value.level === 'string') &&
        (value.transport === undefined || isLogTransportConfig(value.transport) ||
            (Array.isArray(value.transport) && value.transport.every(isLogTransportConfig))) &&
        (value.format === undefined || typeof value.format === 'string') &&
        (value.isEndpoint === undefined || typeof value.isEndpoint === 'boolean'));
}
export function isLogTransportConfig(value) {
    return (typeof value === 'object' &&
        value !== null &&
        typeof value.type === 'string' &&
        (value.level === undefined || typeof value.level === 'string') &&
        (value.format === undefined || typeof value.format === 'string'));
}
export function isLogTransportFactoryOptions(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value.format !== undefined &&
        value.level !== undefined &&
        typeof value.level === 'string');
}
export function isMethodConfig(value) {
    const v = value;
    return (isLoggerLevelConfig(value) &&
        (v.paths === undefined ||
            (typeof v.paths === 'object' && v.paths !== null &&
                Object.values(v.paths).every(isPathConfig))));
}
export function isMMP(value) {
    return (typeof value === 'object' &&
        value !== null &&
        typeof value.module === 'string' &&
        typeof value.method === 'string' &&
        (value.path === undefined || typeof value.path === 'string'));
}
export function isModuleConfig(value) {
    const v = value;
    return (isLoggerLevelConfig(value) &&
        (v.methods === undefined ||
            (typeof v.methods === 'object' && v.methods !== null &&
                Object.values(v.methods).every(isMethodConfig))));
}
export function isPathConfig(value) {
    return isLoggerLevelConfig(value);
}
//# sourceMappingURL=logger-types.js.map