import { FrameworkMeta } from 'filamentjs';

export type ProxyConfig = {
  backendUrl: string;
};

export interface Backend {
  name: string, // internal name, must be unique
  description?: string,
  url: string
}

export const permittedLoggingRuleValues =[
  'always', 'collapse', 'on-error', 'never'
];
type LoggingRule = 'always'|'collapse'|'on-error'|'never';

export interface AppMeta extends FrameworkMeta {
  logging: LoggingRule,
  backends: Backend[]
};

/**
 * Always log requests to this endpoint. This is the default value of `logging`.
 */
export const LOG_ALWAYS:Partial<AppMeta> = { logging: 'always' };
/**
 * Avoid repetitive logs to this endpoint to counting results and only log when
 * either a new end point is logged, this endpoint has a different result, or
 * this endpoint fails in error.
 */
export const LOG_COLLAPSE:Partial<AppMeta> = { logging: 'collapse' };
/**
 * Only log this endpoint when there is an error
 */
export const LOG_ON_ERROR:Partial<AppMeta> = { logging: 'on-error' };
/**
 * Never log requests to this endpoint
 */
export const LOG_NEVER:Partial<AppMeta> = { logging: 'never' };

export const defaultMeta: AppMeta = {
  logging: 'always',
  backends: [{
    name: 'automatic',
    description: 'Automatically selects model best for your request',
    url: 'http://localhost:8081'
  },{
    name: 'local',
    description: 'Local LLM service with a lean model',
    url: 'http://localhost:8081'
  }]
};

export * from './connectivity-types.js';
export * from './logger-types.js';
