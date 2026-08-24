// THIS FILE IS GENERATED. DO NOT EDIT.

import { Logger } from 'winston'
import { FAILED_ASSERTION } from './error-codes.js'
import { error } from '../../lib/exceptions.js'
import {
  validateOpenAIRoleType,
  validatePromptConfigPrompt,
  validatePromptConfig,
  validateConfidence,
  validateHmlRating,
  validateHmlValue,
  validateIntent,
  validateIntentRating,
  validateIntentValue,
  validatePnnRating,
  validatePnnValue,
  validateSatisfaction
} from '../validators/prompts.js';

export {
  validateOpenAIRoleType,
  validatePromptConfigPrompt,
  validatePromptConfig,
  validateConfidence,
  validateHmlRating,
  validateHmlValue,
  validateIntent,
  validateIntentRating,
  validateIntentValue,
  validatePnnRating,
  validatePnnValue,
  validateSatisfaction
};

import type {
  OpenAIRoleType,
  PromptConfigPrompt,
  PromptConfig,
  Confidence,
  HmlRating,
  HmlValue,
  Intent,
  IntentRating,
  IntentValue,
  PnnRating,
  PnnValue,
  Satisfaction
} from '../validators/prompts.js';

export type {
  OpenAIRoleType,
  PromptConfigPrompt,
  PromptConfig,
  Confidence,
  HmlRating,
  HmlValue,
  Intent,
  IntentRating,
  IntentValue,
  PnnRating,
  PnnValue,
  Satisfaction
};

export function isOpenAIRoleType(o: any): o is OpenAIRoleType {
  return validateOpenAIRoleType(o).length === 0;
}

export function assertOpenAIRoleType(o: any, log?: Logger, path?: string)
: asserts o is OpenAIRoleType {
  let errors = validateOpenAIRoleType(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateOpenAIRoleType(
        o, path ?? 'OpenAIRoleType'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testOpenAIRoleType(o: any): boolean {
  return validateOpenAIRoleType(o).length === 0;
}

export function isPromptConfigPrompt(o: any): o is PromptConfigPrompt {
  return validatePromptConfigPrompt(o).length === 0;
}

export function assertPromptConfigPrompt(o: any, log?: Logger, path?: string)
: asserts o is PromptConfigPrompt {
  let errors = validatePromptConfigPrompt(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validatePromptConfigPrompt(
        o, path ?? 'PromptConfigPrompt'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testPromptConfigPrompt(o: any): boolean {
  return validatePromptConfigPrompt(o).length === 0;
}

export function isPromptConfig(o: any): o is PromptConfig {
  return validatePromptConfig(o).length === 0;
}

export function assertPromptConfig(o: any, log?: Logger, path?: string)
: asserts o is PromptConfig {
  let errors = validatePromptConfig(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validatePromptConfig(
        o, path ?? 'PromptConfig'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testPromptConfig(o: any): boolean {
  return validatePromptConfig(o).length === 0;
}

export function isConfidence(o: any): o is Confidence {
  return validateConfidence(o).length === 0;
}

export function assertConfidence(o: any, log?: Logger, path?: string)
: asserts o is Confidence {
  let errors = validateConfidence(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateConfidence(
        o, path ?? 'Confidence'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testConfidence(o: any): boolean {
  return validateConfidence(o).length === 0;
}

export function isHmlRating(o: any): o is HmlRating {
  return validateHmlRating(o).length === 0;
}

export function assertHmlRating(o: any, log?: Logger, path?: string)
: asserts o is HmlRating {
  let errors = validateHmlRating(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateHmlRating(
        o, path ?? 'HmlRating'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testHmlRating(o: any): boolean {
  return validateHmlRating(o).length === 0;
}

export function isHmlValue(o: any): o is HmlValue {
  return validateHmlValue(o).length === 0;
}

export function assertHmlValue(o: any, log?: Logger, path?: string)
: asserts o is HmlValue {
  let errors = validateHmlValue(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateHmlValue(
        o, path ?? 'HmlValue'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testHmlValue(o: any): boolean {
  return validateHmlValue(o).length === 0;
}

export function isIntent(o: any): o is Intent {
  return validateIntent(o).length === 0;
}

export function assertIntent(o: any, log?: Logger, path?: string)
: asserts o is Intent {
  let errors = validateIntent(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateIntent(
        o, path ?? 'Intent'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testIntent(o: any): boolean {
  return validateIntent(o).length === 0;
}

export function isIntentRating(o: any): o is IntentRating {
  return validateIntentRating(o).length === 0;
}

export function assertIntentRating(o: any, log?: Logger, path?: string)
: asserts o is IntentRating {
  let errors = validateIntentRating(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateIntentRating(
        o, path ?? 'IntentRating'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testIntentRating(o: any): boolean {
  return validateIntentRating(o).length === 0;
}

export function isIntentValue(o: any): o is IntentValue {
  return validateIntentValue(o).length === 0;
}

export function assertIntentValue(o: any, log?: Logger, path?: string)
: asserts o is IntentValue {
  let errors = validateIntentValue(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateIntentValue(
        o, path ?? 'IntentValue'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testIntentValue(o: any): boolean {
  return validateIntentValue(o).length === 0;
}

export function isPnnRating(o: any): o is PnnRating {
  return validatePnnRating(o).length === 0;
}

export function assertPnnRating(o: any, log?: Logger, path?: string)
: asserts o is PnnRating {
  let errors = validatePnnRating(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validatePnnRating(
        o, path ?? 'PnnRating'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testPnnRating(o: any): boolean {
  return validatePnnRating(o).length === 0;
}

export function isPnnValue(o: any): o is PnnValue {
  return validatePnnValue(o).length === 0;
}

export function assertPnnValue(o: any, log?: Logger, path?: string)
: asserts o is PnnValue {
  let errors = validatePnnValue(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validatePnnValue(
        o, path ?? 'PnnValue'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testPnnValue(o: any): boolean {
  return validatePnnValue(o).length === 0;
}

export function isSatisfaction(o: any): o is Satisfaction {
  return validateSatisfaction(o).length === 0;
}

export function assertSatisfaction(o: any, log?: Logger, path?: string)
: asserts o is Satisfaction {
  let errors = validateSatisfaction(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateSatisfaction(
        o, path ?? 'Satisfaction'
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION)
    }
  }
}

export function testSatisfaction(o: any): boolean {
  return validateSatisfaction(o).length === 0;
}
