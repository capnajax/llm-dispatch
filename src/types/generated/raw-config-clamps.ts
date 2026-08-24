// THIS FILE IS GENERATED. DO NOT EDIT.

import { Logger } from 'winston'
import { FAILED_ASSERTION } from './error-codes.js'
import { error } from '../../lib/exceptions.js'
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

export function isConfigAsLoaded(o: any): o is ConfigAsLoaded {
  return validateConfigAsLoaded(o).length === 0;
}

export function assertConfigAsLoaded(o: any, log?: Logger, path?: string)
: asserts o is ConfigAsLoaded {
  let errors = validateConfigAsLoaded(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateConfigAsLoaded(
        o, path ?? 'ConfigAsLoaded'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testConfigAsLoaded(o: any): boolean {
  return validateConfigAsLoaded(o).length === 0;
}
