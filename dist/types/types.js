export const permittedLoggingRuleValues = [
    'always', 'collapse', 'on-error', 'never'
];
;
/**
 * Always log requests to this endpoint. This is the default value of `logging`.
 */
export const LOG_ALWAYS = { logging: 'always' };
/**
 * Avoid repetitive logs to this endpoint to counting results and only log when
 * either a new end point is logged, this endpoint has a different result, or
 * this endpoint fails in error.
 */
export const LOG_COLLAPSE = { logging: 'collapse' };
/**
 * Only log this endpoint when there is an error
 */
export const LOG_ON_ERROR = { logging: 'on-error' };
/**
 * Never log requests to this endpoint
 */
export const LOG_NEVER = { logging: 'never' };
export const defaultMeta = {
    logging: 'always',
    backends: [{
            name: 'automatic',
            description: 'Automatically selects model best for your request',
            url: 'http://localhost:8081'
        }, {
            name: 'local',
            description: 'Local LLM service with a lean model',
            url: 'http://localhost:8081'
        }]
};
export * from './connectivity-types.js';
export * from './logger-types.js';
//# sourceMappingURL=types.js.map