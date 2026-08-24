import winston from 'winston';
import { deepClone, deepMerge, isNil, omit } from './tools.js';
import { INTERNAL_ERROR } from '../types/generated/error-codes.js';
import { error } from './exceptions.js';
import { ENDPOINT_LOG_FINALIZER, HTTP_METHODS } from './http-constants.js';
const DEFAULT_LEVEL_CONFIG = {
    level: 'info',
    format: 'colored',
    transport: { type: 'console' }
};
const MODULE = 'logger';
// Pre-canned formats - factory functions
const formats = {
    simple: () => winston.format.combine(winston.format.splat(), winston.format.simple()),
    json: () => winston.format.combine(winston.format.splat(), winston.format.json()),
    detailed: (mmp, levelConfig) => winston.format.combine(winston.format.splat(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const context = buildContextString(mmp, levelConfig, false);
        const levelTag = {
            error: '[#ERROR]',
            warn: '[*warn*]',
            info: '[ info ]',
            http: '[ http ]',
            verbose: '[  vbs ]',
            debug: '[   db ]',
            silly: '[    s ]',
        }[level] || '[      ]';
        return `${timestamp} ${levelTag} ${context} ${message}`;
    })),
    colored: (mmp, levelConfig) => winston.format.combine(winston.format.splat(), winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const reset = '\x1b[0m';
        const context = buildContextString(mmp, levelConfig);
        const levelTag = {
            error: '\x1b[97;1m[\x1b[91;1;4m#ERROR\x1b[0;97m]\x1b[0m',
            warn: '\x1b[97;1m[\x1b[94;1m*warn*\x1b[0;97m]\x1b[0m',
            info: '\x1b[97m[\x1b[92;1m info \x1b[0;97m]\x1b[0m',
            http: '\x1b[97m[\x1b[96;1m http \x1b[0;97m]\x1b[0m',
            verbose: '\x1b[37m[\x1b[35m  vbs \x1b[37m]\x1b[0m',
            debug: '\x1b[90m[\x1b[37m   db \x1b[90m]\x1b[0m',
            silly: '\x1b[90m[\x1b[90m    s \x1b[90m]\x1b[0m',
        }[level] || '\x1b[37m[\x1b[90m      \x1b[37m]\x1b[0m';
        return `${timestamp} ${levelTag} ${context}${reset} ${message}`;
    }))
};
const transportFactories = {
    console: (options) => {
        return new winston.transports.Stream({ stream: process.stderr, ...options });
    },
    file: (options) => {
        return new winston.transports.File({
            ...options,
            filename: 'logs/app.log'
        });
    },
    errorFile: (options) => {
        return new winston.transports.File(deepMerge({ level: 'error' }, options, { filename: 'logs/error.log' }));
    },
};
// Cache and config
let config = null;
const loggerCache = new Map();
// Define custom log levels globally before any loggers are created
const customLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6,
};
winston.addColors({
    error: 'red',
    warn: 'yellow',
    info: 'cyan',
    http: 'cyan',
    verbose: 'magenta',
    debug: 'white',
    silly: 'gray',
});
function buildCacheKey(module, method, path) {
    if (typeof module === 'object') {
        method = module.method;
        path = module.path;
        module = module.module;
    }
    else if (typeof module === 'string' && typeof method !== 'string') {
        throw error(INTERNAL_ERROR);
    }
    return `${module}::${method}${path ? `::${path}` : ''}`;
}
/**
 * Build a context string from module, method, and optional path
 */
function buildContextString(mmp, levelConfig, color = true) {
    const nocolor = color ? '\x1b[0m' : '';
    const green = color ? '\x1b[32m' : '';
    const blue = color ? '\x1b[34m' : '';
    if (isHttpMethod(mmp, levelConfig)) {
        if (mmp.module === ENDPOINT_LOG_FINALIZER) {
            return `${green}${mmp.method}${mmp.path ? ' ' + mmp.path : ''}${nocolor}:`;
        }
        else {
            return `${green}${mmp.method}${mmp.path ? ' ' + mmp.path : ''}${nocolor} [${mmp.module}]:`;
        }
    }
    else {
        return `${blue}${mmp.module}→${mmp.method}${mmp.path ? '[' + mmp.path + ']' : ''}${nocolor}:`;
    }
}
/**
 * Build effective config by traversing the hierarchy
 */
function buildLevelConfig(module, method, path, options) {
    let useConfig = config ||
        { logging: globalThis.debugLevel
                ? { ...DEFAULT_LEVEL_CONFIG,
                    level: globalThis.debugLevel
                }
                : DEFAULT_LEVEL_CONFIG
        };
    const baseConfig = useConfig.logging;
    let resultConfig = deepMerge(DEFAULT_LEVEL_CONFIG, omit(baseConfig, 'modules')) || {};
    if (options) {
        // Apply overrides from options (e.g. for testing or loggers that have
        // extra requirements beyond module/method/path)
        resultConfig = deepMerge(resultConfig, options);
    }
    // Apply module config
    if (baseConfig.modules?.[module]) {
        const moduleConfig = omit(baseConfig.modules[module], 'methods');
        if (Object.keys(moduleConfig).length > 0) {
            resultConfig = deepMerge(resultConfig, moduleConfig);
        }
    }
    // Apply method config
    if (baseConfig.modules?.[module]?.methods?.[method]) {
        const methodConfig = omit(baseConfig.modules[module].methods[method], 'paths');
        if (Object.keys(methodConfig).length > 0) {
            resultConfig = deepMerge(resultConfig, methodConfig);
        }
    }
    // Apply path config (HTTP only)
    if ((resultConfig?.isEndpoint !== false) && path &&
        baseConfig.modules?.[module]?.methods?.[method]?.paths?.[path]) {
        const pathConfig = baseConfig.modules[module].methods[method].paths[path];
        if (Object.keys(pathConfig).length > 0) {
            resultConfig = deepMerge(resultConfig, pathConfig);
        }
    }
    return resultConfig;
}
/**
 * Build a Winston format from configuration value(s)
 */
function buildFormat(mmp, levelConfig, formatConfig) {
    if (!formatConfig) {
        return (formats.colored || (() => winston.format.simple()))(mmp, levelConfig);
    }
    const formatNames = Array.isArray(formatConfig) ? formatConfig : [formatConfig];
    const selectedFormats = formatNames
        .map(name => formats[name])
        .filter((f) => f !== undefined)
        .map(formatFn => formatFn(mmp, levelConfig));
    if (selectedFormats.length === 0) {
        return winston.format.simple();
    }
    return winston.format.combine(...selectedFormats);
}
/**
 * Build Winston transports from configuration value(s)
 */
function buildTransports(mmp, levelConfig, transportConfig) {
    const transportsToUse = [];
    if (!transportConfig) {
        transportsToUse.push(getTransport(mmp, levelConfig, { type: 'console' }));
    }
    else {
        const transportConfigs = Array.isArray(transportConfig)
            ? transportConfig
            : [transportConfig];
        for (const transportConifg of transportConfigs) {
            try {
                transportsToUse.push(getTransport(mmp, levelConfig, transportConifg));
            }
            catch {
                // Skip unknown transports
            }
        }
    }
    return transportsToUse.length > 0
        ? transportsToUse
        : [getTransport(mmp, levelConfig, { type: 'console' })];
}
/**
 * Clear all cached loggers (useful for testing)
 */
export function clearLoggerCache() {
    loggerCache.clear();
}
export function getLogger(module, method, optionsOrPath, ...options) {
    if (typeof method === 'function') {
        method = method.name;
    }
    const path = typeof optionsOrPath === 'string' ? optionsOrPath : undefined;
    const collapsedOptions = typeof optionsOrPath === 'object' && optionsOrPath !== null
        ? (options.length > 0
            ? deepMerge(optionsOrPath, ...options)
            : optionsOrPath)
        : (isNil(optionsOrPath)
            ? {}
            : (options.length > 0
                ? (options.length === 1
                    ? deepClone(options[0])
                    : deepMerge(options[0], ...options.slice(1)))
                : {}));
    const cacheKey = buildCacheKey(module, method, path);
    const mmp = { module, method, path };
    // Return cached logger if exists
    if (loggerCache.has(cacheKey)) {
        return loggerCache.get(cacheKey);
    }
    getLoggerLog?.debug(`Creating logger for ${module}→${method}${path ? `→${path}` : ''}`);
    // Determine if this is an HTTP endpoint or TS function
    if (isNil(collapsedOptions?.isEndpoint)) {
        collapsedOptions.isEndpoint = isHttpMethod(mmp);
    }
    // Build effective config by traversing hierarchy
    const levelConfig = buildLevelConfig(module, method, path, collapsedOptions);
    // Build format with context awareness
    const format = buildFormat({ module, method, path }, levelConfig, levelConfig.format);
    // Create a dedicated logger for this context
    const contextLogger = winston.createLogger({
        level: levelConfig.level || 'info',
        levels: customLevels,
        format,
        transports: buildTransports(mmp, levelConfig, levelConfig.transport),
    });
    const actualLevel = contextLogger.level;
    // Cache and return
    loggerCache.set(cacheKey, contextLogger);
    return contextLogger;
}
let getLoggerLog;
getLoggerLog = getLogger(MODULE, 'getLogger');
/**
 * Get or create a transport instance. Create a new instance per logger to avoid
 * level confusion when the same transport is used by loggers with different levels.
 */
function getTransport(mmp, levelConfig, transportConfig) {
    const factory = transportFactories[transportConfig.type];
    if (!factory) {
        throw new Error(`Unknown transport: ${transportConfig.type}`);
    }
    const tConfig = {
        format: buildFormat(mmp, levelConfig, transportConfig.format || levelConfig.format),
        level: transportConfig.level || levelConfig.level || 'info',
    };
    const transport = factory(tConfig);
    // Increase max listeners since transports might be long-lived
    transport.setMaxListeners(0); // 0 = unlimited
    return transport;
}
/**
 * Load configuration from file path or object
 */
export function initializeLogger(configInput) {
    resetLogger();
    config = configInput;
    if (!config?.logging) {
        throw new Error('Invalid logger configuration: missing "logging" key');
    }
}
function isHttpMethod(mmp, levelConfig) {
    function isMmpHttpMethod(mmp) {
        return HTTP_METHODS.has(mmp.method);
    }
    return isNil(levelConfig)
        ? isMmpHttpMethod(mmp)
        : isNil(levelConfig?.isEndpoint)
            ? isMmpHttpMethod(mmp)
            : levelConfig?.isEndpoint;
}
/**
 * Type guard for HttpRequestLogData
 */
function isHttpRequestLogData(data) {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    const obj = data;
    return (typeof obj.method === 'string' &&
        typeof obj.url === 'string' &&
        (obj.statusCode === undefined || typeof obj.statusCode === 'number') &&
        (obj.durationMs === undefined || typeof obj.durationMs === 'number'));
}
function mmpCmp(mmp1, mmp2) {
    const toKey = (mmp) => {
        if (Array.isArray(mmp)) {
            return buildCacheKey(...mmp);
        }
        else {
            return buildCacheKey(mmp);
        }
    };
    const key1 = toKey(mmp1);
    const key2 = toKey(mmp2);
    return key1 === key2 ? 0 : (key1 < key2 ? -1 : 1);
}
/**
 * Register a custom format factory
 */
export function registerFormat(name, format) {
    formats[name] = format;
}
/**
 * Register a custom transport factory
 */
export function registerTransport(name, factory) {
    transportFactories[name] = factory;
}
/**
 * Reset the entire logger state - config and cache (useful for testing)
 */
export function resetLogger() {
    config = null;
    loggerCache.clear();
}
//# sourceMappingURL=logger.js.map