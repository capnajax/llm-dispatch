import winston from 'winston';

export type OneOrMany<T> = T | T[];

// Interfaces and type guards for logger configuration

export interface MMP {
  module: string;
  method: string;
  path?: string;
}

export interface LogTransportConfig {
  type: string;
  level?: string;
  format?: string;
}

export interface LogTransportFactoryOptions {
  format: winston.Logform.Format;
  level: string;
}
export interface LoggerLevelConfig {
  level?: string;
  transport?: OneOrMany<LogTransportConfig>;
  format?: string;
  // force logger to be treated as an HTTP endpoint (for `true`) or TS function
  // (for `false`), regardless of method/path
  isEndpoint?: boolean;
}
export interface PathConfig extends LoggerLevelConfig {}

export interface MethodConfig extends LoggerLevelConfig {
  paths?: Record<string, PathConfig>;
}
export interface ModuleConfig extends LoggerLevelConfig {
  methods?: Record<string, MethodConfig>;
}

export interface LoggerConfigLoggingObject extends LoggerLevelConfig {
  modules?: Record<string, ModuleConfig>;
};

export interface LoggerConfig {
  logging: LoggerConfigLoggingObject;
};

export function isLoggerConfig(value: any): value is LoggerConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    isLoggerConfigLoggingObject(value.logging)
  );
}
export function isLoggerConfigLoggingObject(value: any): value is LoggerConfigLoggingObject {
  const v = value as any;
  return (
    isLoggerLevelConfig(value) &&
    (v.modules === undefined || 
      (typeof v.modules === 'object' && v.modules !== null && 
        Object.values(v.modules).every(isModuleConfig)))
  );
}
export function isLoggerLevelConfig(value: any): value is LoggerLevelConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value.level === undefined || typeof value.level === 'string') &&
    (value.transport === undefined || isLogTransportConfig(value.transport) || 
      (Array.isArray(value.transport) && value.transport.every(isLogTransportConfig))) &&
    (value.format === undefined || typeof value.format === 'string') &&
    (value.isEndpoint === undefined || typeof value.isEndpoint === 'boolean')
  );
}
export function isLogTransportConfig(value: any): value is LogTransportConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.type === 'string' &&
    (value.level === undefined || typeof value.level === 'string') &&
    (value.format === undefined || typeof value.format === 'string')
  );
}
export function isLogTransportFactoryOptions(value: any): value is LogTransportFactoryOptions {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.format !== undefined &&
    value.level !== undefined &&
    typeof value.level === 'string'
  );
}
export function isMethodConfig(value: any): value is MethodConfig {
  const v = value as any;
  return (
    isLoggerLevelConfig(value) &&
    (v.paths === undefined || 
      (typeof v.paths === 'object' && v.paths !== null && 
        Object.values(v.paths).every(isPathConfig)))
  );
}
export function isMMP(value: any): value is MMP {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.module === 'string' &&
    typeof value.method === 'string' &&
    (value.path === undefined || typeof value.path === 'string')
  );
}
export function isModuleConfig(value: any): value is ModuleConfig {
  const v = value as any;
  return (
    isLoggerLevelConfig(value) &&
    (v.methods === undefined || 
      (typeof v.methods === 'object' && v.methods !== null && 
        Object.values(v.methods).every(isMethodConfig)))
  );
}
export function isPathConfig(value: any): value is PathConfig {
  return isLoggerLevelConfig(value);
}

export type FormatType = (
  mmp: MMP, levelConfig: LoggerLevelConfig
) => winston.Logform.Format
