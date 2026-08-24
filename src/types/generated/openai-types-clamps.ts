// THIS FILE IS GENERATED. DO NOT EDIT.

import { Logger } from 'winston';
import { FAILED_ASSERTION } from './error-codes.js';
import { error } from '../../lib/exceptions.js';
import {
  validateChatCompletionRequestMessage,
  validateChatCompletionStreamResponseDelta,
  validateCreateChatCompletionRequest,
  validateCreateChatCompletionResponse,
  validateCreateChatCompletionStreamResponse,
  validateReasoningEffort,
  validateResponseFormatJsonObject,
  validateResponseFormatJsonSchema,
  validateResponseFormatText,
} from './openai-types.js';

export {
  validateChatCompletionRequestMessage,
  validateChatCompletionStreamResponseDelta,
  validateCreateChatCompletionRequest,
  validateCreateChatCompletionResponse,
  validateCreateChatCompletionStreamResponse,
  validateReasoningEffort,
  validateResponseFormatJsonObject,
  validateResponseFormatJsonSchema,
  validateResponseFormatText,
};

import type {
  ChatCompletionRequestMessage,
  ChatCompletionStreamResponseDelta,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateChatCompletionStreamResponse,
  ReasoningEffort,
  ResponseFormatJsonObject,
  ResponseFormatJsonSchema,
  ResponseFormatText,
} from './openai-types.js';

export type {
  ChatCompletionRequestMessage,
  ChatCompletionStreamResponseDelta,
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateChatCompletionStreamResponse,
  ReasoningEffort,
  ResponseFormatJsonObject,
  ResponseFormatJsonSchema,
  ResponseFormatText,
};

export function isChatCompletionRequestMessage(
  o: any,
): o is ChatCompletionRequestMessage {
  return validateChatCompletionRequestMessage(o).length === 0;
}

export function assertChatCompletionRequestMessage(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is ChatCompletionRequestMessage {
  let errors = validateChatCompletionRequestMessage(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateChatCompletionRequestMessage(
        o,
        path ?? 'ChatCompletionRequestMessage',
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testChatCompletionRequestMessage(o: any): boolean {
  return validateChatCompletionRequestMessage(o).length === 0;
}

export function isChatCompletionStreamResponseDelta(
  o: any,
): o is ChatCompletionStreamResponseDelta {
  return validateChatCompletionStreamResponseDelta(o).length === 0;
}

export function assertChatCompletionStreamResponseDelta(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is ChatCompletionStreamResponseDelta {
  let errors = validateChatCompletionStreamResponseDelta(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateChatCompletionStreamResponseDelta(
        o,
        path ?? 'ChatCompletionStreamResponseDelta',
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testChatCompletionStreamResponseDelta(o: any): boolean {
  return validateChatCompletionStreamResponseDelta(o).length === 0;
}

export function isCreateChatCompletionRequest(
  o: any,
): o is CreateChatCompletionRequest {
  return validateCreateChatCompletionRequest(o).length === 0;
}

export function assertCreateChatCompletionRequest(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is CreateChatCompletionRequest {
  let errors = validateCreateChatCompletionRequest(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateCreateChatCompletionRequest(
        o,
        path ?? 'CreateChatCompletionRequest',
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testCreateChatCompletionRequest(o: any): boolean {
  return validateCreateChatCompletionRequest(o).length === 0;
}

export function isCreateChatCompletionResponse(
  o: any,
): o is CreateChatCompletionResponse {
  return validateCreateChatCompletionResponse(o).length === 0;
}

export function assertCreateChatCompletionResponse(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is CreateChatCompletionResponse {
  let errors = validateCreateChatCompletionResponse(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateCreateChatCompletionResponse(
        o,
        path ?? 'CreateChatCompletionResponse',
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testCreateChatCompletionResponse(o: any): boolean {
  return validateCreateChatCompletionResponse(o).length === 0;
}

export function isCreateChatCompletionStreamResponse(
  o: any,
): o is CreateChatCompletionStreamResponse {
  return validateCreateChatCompletionStreamResponse(o).length === 0;
}

export function assertCreateChatCompletionStreamResponse(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is CreateChatCompletionStreamResponse {
  let errors = validateCreateChatCompletionStreamResponse(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateCreateChatCompletionStreamResponse(
        o,
        path ?? 'CreateChatCompletionStreamResponse',
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testCreateChatCompletionStreamResponse(o: any): boolean {
  return validateCreateChatCompletionStreamResponse(o).length === 0;
}

export function isReasoningEffort(o: any): o is ReasoningEffort {
  return validateReasoningEffort(o).length === 0;
}

export function assertReasoningEffort(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is ReasoningEffort {
  let errors = validateReasoningEffort(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateReasoningEffort(o, path ?? 'ReasoningEffort');
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testReasoningEffort(o: any): boolean {
  return validateReasoningEffort(o).length === 0;
}

export function isResponseFormatJsonObject(
  o: any,
): o is ResponseFormatJsonObject {
  return validateResponseFormatJsonObject(o).length === 0;
}

export function assertResponseFormatJsonObject(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is ResponseFormatJsonObject {
  let errors = validateResponseFormatJsonObject(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateResponseFormatJsonObject(
        o,
        path ?? 'ResponseFormatJsonObject',
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testResponseFormatJsonObject(o: any): boolean {
  return validateResponseFormatJsonObject(o).length === 0;
}

export function isResponseFormatJsonSchema(
  o: any,
): o is ResponseFormatJsonSchema {
  return validateResponseFormatJsonSchema(o).length === 0;
}

export function assertResponseFormatJsonSchema(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is ResponseFormatJsonSchema {
  let errors = validateResponseFormatJsonSchema(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateResponseFormatJsonSchema(
        o,
        path ?? 'ResponseFormatJsonSchema',
      );
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testResponseFormatJsonSchema(o: any): boolean {
  return validateResponseFormatJsonSchema(o).length === 0;
}

export function isResponseFormatText(o: any): o is ResponseFormatText {
  return validateResponseFormatText(o).length === 0;
}

export function assertResponseFormatText(
  o: any,
  log?: Logger,
  path?: string,
): asserts o is ResponseFormatText {
  let errors = validateResponseFormatText(o);
  if (errors.length) {
    if (log && log.isDebugEnabled()) {
      errors = validateResponseFormatText(o, path ?? 'ResponseFormatText');
      errors.forEach(log.debug);
      throw error(FAILED_ASSERTION, errors.join('\n'));
    } else {
      throw error(FAILED_ASSERTION);
    }
  }
}

export function testResponseFormatText(o: any): boolean {
  return validateResponseFormatText(o).length === 0;
}
