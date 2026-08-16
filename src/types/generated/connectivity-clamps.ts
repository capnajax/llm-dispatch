// THIS FILE IS GENERATED. DO NOT EDIT.

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

export function isBasePath(o: any
): o is BasePath {
  return validateBasePath(o).length === 0;
}

export function assertBasePath(o: any
): asserts o is BasePath {
  const errors = validateBasePath(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testBasePath(o: any
): boolean {
  return validateBasePath(o).length === 0;
}

export function isPartialOnlineServiceConfigMode(o: any
): o is PartialOnlineServiceConfigMode {
  return validatePartialOnlineServiceConfigMode(o).length === 0;
}

export function assertPartialOnlineServiceConfigMode(o: any
): asserts o is PartialOnlineServiceConfigMode {
  const errors = validatePartialOnlineServiceConfigMode(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testPartialOnlineServiceConfigMode(o: any
): boolean {
  return validatePartialOnlineServiceConfigMode(o).length === 0;
}

export function isPartialServiceConfigMode(o: any
): o is PartialServiceConfigMode {
  return validatePartialServiceConfigMode(o).length === 0;
}

export function assertPartialServiceConfigMode(o: any
): asserts o is PartialServiceConfigMode {
  const errors = validatePartialServiceConfigMode(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testPartialServiceConfigMode(o: any
): boolean {
  return validatePartialServiceConfigMode(o).length === 0;
}

export function isOnlineServiceConfigMode(o: any
): o is OnlineServiceConfigMode {
  return validateOnlineServiceConfigMode(o).length === 0;
}

export function assertOnlineServiceConfigMode(o: any
): asserts o is OnlineServiceConfigMode {
  const errors = validateOnlineServiceConfigMode(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testOnlineServiceConfigMode(o: any
): boolean {
  return validateOnlineServiceConfigMode(o).length === 0;
}

export function isServiceConfigMode(o: any
): o is ServiceConfigMode {
  return validateServiceConfigMode(o).length === 0;
}

export function assertServiceConfigMode(o: any
): asserts o is ServiceConfigMode {
  const errors = validateServiceConfigMode(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testServiceConfigMode(o: any
): boolean {
  return validateServiceConfigMode(o).length === 0;
}

export function isServiceConfigProbeInterval(o: any
): o is ServiceConfigProbeInterval {
  return validateServiceConfigProbeInterval(o).length === 0;
}

export function assertServiceConfigProbeInterval(o: any
): asserts o is ServiceConfigProbeInterval {
  const errors = validateServiceConfigProbeInterval(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testServiceConfigProbeInterval(o: any
): boolean {
  return validateServiceConfigProbeInterval(o).length === 0;
}

export function isServiceConfigProbeCondition(o: any
): o is ServiceConfigProbeCondition {
  return validateServiceConfigProbeCondition(o).length === 0;
}

export function assertServiceConfigProbeCondition(o: any
): asserts o is ServiceConfigProbeCondition {
  const errors = validateServiceConfigProbeCondition(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testServiceConfigProbeCondition(o: any
): boolean {
  return validateServiceConfigProbeCondition(o).length === 0;
}
