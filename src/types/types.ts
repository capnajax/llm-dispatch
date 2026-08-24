import { FrameworkMeta, ContextMeta } from 'filamentjs';

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

export interface AppMeta extends FrameworkMeta {
};

export interface Context extends ContextMeta {
};

export * from './connectivity-types.js';
export * from './logger-types.js';
