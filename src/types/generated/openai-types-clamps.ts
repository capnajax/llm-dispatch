// THIS FILE IS GENERATED. DO NOT EDIT.

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
): asserts o is ChatCompletionRequestMessage {
  const errors = validateChatCompletionRequestMessage(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
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
): asserts o is ChatCompletionStreamResponseDelta {
  const errors = validateChatCompletionStreamResponseDelta(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
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
): asserts o is CreateChatCompletionRequest {
  const errors = validateCreateChatCompletionRequest(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
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
): asserts o is CreateChatCompletionResponse {
  const errors = validateCreateChatCompletionResponse(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
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
): asserts o is CreateChatCompletionStreamResponse {
  const errors = validateCreateChatCompletionStreamResponse(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testCreateChatCompletionStreamResponse(o: any): boolean {
  return validateCreateChatCompletionStreamResponse(o).length === 0;
}

export function isReasoningEffort(o: any): o is ReasoningEffort {
  return validateReasoningEffort(o).length === 0;
}

export function assertReasoningEffort(o: any): asserts o is ReasoningEffort {
  const errors = validateReasoningEffort(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
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
): asserts o is ResponseFormatJsonObject {
  const errors = validateResponseFormatJsonObject(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
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
): asserts o is ResponseFormatJsonSchema {
  const errors = validateResponseFormatJsonSchema(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
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
): asserts o is ResponseFormatText {
  const errors = validateResponseFormatText(o);

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }
}

export function testResponseFormatText(o: any): boolean {
  return validateResponseFormatText(o).length === 0;
}
