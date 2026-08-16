// THIS FILE IS GENERATED. DO NOT EDIT.

import {
  validateConfigAsLoaded
} from '../validators/raw-config.js';

export {
  validateConfigAsLoaded
};

import type {
  ConfigAsLoaded
} from '../validators/raw-config.js';

export type {
  ConfigAsLoaded
};

export function isConfigAsLoaded(o: any
): o is ConfigAsLoaded {
  return validateConfigAsLoaded(o).length === 0;
}

export function assertConfigAsLoaded(o: any
): asserts o is ConfigAsLoaded {
  const errors = validateConfigAsLoaded(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testConfigAsLoaded(o: any
): boolean {
  return validateConfigAsLoaded(o).length === 0;
}
