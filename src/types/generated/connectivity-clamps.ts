// THIS FILE IS GENERATED. DO NOT EDIT.

import { Logger } from 'winston'
import { FAILED_ASSERTION } from './error-codes.js'
import { error } from '../../lib/exceptions.js'
import {
  validateBasePath,
  validatePartialOnlineServiceConfigMode,
  validatePartialServiceConfigMode,
  validateOnlineServiceConfigMode,
  validateServiceConfigMode,
  validateServiceConfigProbeInterval,
  validateServiceConfigProbeCondition
} from '../validators/connectivity.js';

export {
  validateBasePath,
  validatePartialOnlineServiceConfigMode,
  validatePartialServiceConfigMode,
  validateOnlineServiceConfigMode,
  validateServiceConfigMode,
  validateServiceConfigProbeInterval,
  validateServiceConfigProbeCondition
};

import type {
  BasePath,
  PartialOnlineServiceConfigMode,
  PartialServiceConfigMode,
  OnlineServiceConfigMode,
  ServiceConfigMode,
  ServiceConfigProbeInterval,
  ServiceConfigProbeCondition
} from '../validators/connectivity.js';

export type {
  BasePath,
  PartialOnlineServiceConfigMode,
  PartialServiceConfigMode,
  OnlineServiceConfigMode,
  ServiceConfigMode,
  ServiceConfigProbeInterval,
  ServiceConfigProbeCondition
};

export function isBasePath(o: any): o is BasePath {
  return validateBasePath(o).length === 0;
}

export function assertBasePath(o: any, log?: Logger, path?: string)
: asserts o is BasePath {
  let errors = validateBasePath(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateBasePath(
        o, path ?? 'BasePath'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testBasePath(o: any): boolean {
  return validateBasePath(o).length === 0;
}

export function isPartialOnlineServiceConfigMode(o: any
  )
: o is PartialOnlineServiceConfigMode {
  return validatePartialOnlineServiceConfigMode(o).length === 0;
}

export function assertPartialOnlineServiceConfigMode(
  o: any, log?: Logger, path?: string
): asserts o is PartialOnlineServiceConfigMode {
  let errors = validatePartialOnlineServiceConfigMode(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validatePartialOnlineServiceConfigMode(
        o, path ?? 'PartialOnlineServiceConfigMode'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testPartialOnlineServiceConfigMode(o: any): boolean {
  return validatePartialOnlineServiceConfigMode(o).length === 0;
}

export function isPartialServiceConfigMode(o: any
  )
: o is PartialServiceConfigMode {
  return validatePartialServiceConfigMode(o).length === 0;
}

export function assertPartialServiceConfigMode(
  o: any, log?: Logger, path?: string
): asserts o is PartialServiceConfigMode {
  let errors = validatePartialServiceConfigMode(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validatePartialServiceConfigMode(
        o, path ?? 'PartialServiceConfigMode'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testPartialServiceConfigMode(o: any): boolean {
  return validatePartialServiceConfigMode(o).length === 0;
}

export function isOnlineServiceConfigMode(o: any
  )
: o is OnlineServiceConfigMode {
  return validateOnlineServiceConfigMode(o).length === 0;
}

export function assertOnlineServiceConfigMode(
  o: any, log?: Logger, path?: string
): asserts o is OnlineServiceConfigMode {
  let errors = validateOnlineServiceConfigMode(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateOnlineServiceConfigMode(
        o, path ?? 'OnlineServiceConfigMode'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testOnlineServiceConfigMode(o: any): boolean {
  return validateOnlineServiceConfigMode(o).length === 0;
}

export function isServiceConfigMode(o: any): o is ServiceConfigMode {
  return validateServiceConfigMode(o).length === 0;
}

export function assertServiceConfigMode(o: any, log?: Logger, path?: string)
: asserts o is ServiceConfigMode {
  let errors = validateServiceConfigMode(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateServiceConfigMode(
        o, path ?? 'ServiceConfigMode'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testServiceConfigMode(o: any): boolean {
  return validateServiceConfigMode(o).length === 0;
}

export function isServiceConfigProbeInterval(o: any
  )
: o is ServiceConfigProbeInterval {
  return validateServiceConfigProbeInterval(o).length === 0;
}

export function assertServiceConfigProbeInterval(
  o: any, log?: Logger, path?: string
): asserts o is ServiceConfigProbeInterval {
  let errors = validateServiceConfigProbeInterval(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateServiceConfigProbeInterval(
        o, path ?? 'ServiceConfigProbeInterval'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testServiceConfigProbeInterval(o: any): boolean {
  return validateServiceConfigProbeInterval(o).length === 0;
}

export function isServiceConfigProbeCondition(o: any
  )
: o is ServiceConfigProbeCondition {
  return validateServiceConfigProbeCondition(o).length === 0;
}

export function assertServiceConfigProbeCondition(
  o: any, log?: Logger, path?: string
): asserts o is ServiceConfigProbeCondition {
  let errors = validateServiceConfigProbeCondition(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateServiceConfigProbeCondition(
        o, path ?? 'ServiceConfigProbeCondition'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testServiceConfigProbeCondition(o: any): boolean {
  return validateServiceConfigProbeCondition(o).length === 0;
}
