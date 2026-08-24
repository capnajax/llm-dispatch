import { inspect } from "node:util";
import { getLogger } from "../../lib/logger.js";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest,
  validateChatCompletionFunctionCallOption,
  validateChatCompletionFunctions,
  validateChatCompletionMessageToolCalls,
  validateChatCompletionRequestAssistantMessageContentPart,
  validateChatCompletionRequestMessage,
  validateChatCompletionRequestMessageContentPartText,
  validateChatCompletionRequestSystemMessageContentPart,
  validateChatCompletionRequestToolMessageContentPart,
  validateChatCompletionRequestUserMessageContentPart,
  validateChatCompletionStreamOptions,
  validateChatCompletionTool,
  validateChatCompletionToolChoiceOption,
  validateCustomToolChatCompletions,
  validateModelIdsShared,
  validateParallelToolCalls,
  validatePredictionContent,
  validateReasoningEffort,
  validateResponseFormatJsonObject,
  validateResponseFormatJsonSchema,
  validateResponseFormatText,
  validateResponseModalities,
  validateStopConfiguration,
  validateVerbosity } from "../generated/openai-types.js";
import {
  doTests,
  E,
  itemsFromTuples,
  logResult,
  TestFunc,
  TestItemTuple,
  tv,
  tva,
  tvr,
  validateNumberRange,
  validateRecord_string_any,
  validateRecord_string_string,
  validateStringEnum } from "../types-tools.js";
import { D3 } from "./raw-config.js";

const MODULE = 'validators/prompts';

// `7MM"""Mq.                                                 mm          
//   MM   `MM.                                                MM          
//   MM   ,M9  .gP"Ya   ,dW"Yvd `7MM  `7MM  .gP"Ya  ,pP"Ybd mmMMmm ,pP"Ybd
//   MMmmdM9  ,M'   Yb ,W'   MM   MM    MM ,M'   Yb 8I   `"   MM   8I   `"
//   MM  YM.  8M"""""" 8M    MM   MM    MM 8M"""""" `YMMMa.   MM   `YMMMa.
//   MM   `Mb.YM.    , YA.   MM   MM    MM YM.    , L.   I8   MM   L.   I8
// .JMML. .JMM.`Mbmmd'  `MbmdMM   `Mbod"YML.`Mbmmd' M9mmmP'   `MbmoM9mmmP'
//                           MM                                           
//                         .JMML.                                         

export const permittedOpenAIRoleTypes = [
  'developer', 'system', 'user', 'assistant', 'tool', 'function'
];
export type OpenAIRoleType = 
  'developer'|'system'|'user'|'assistant'|'tool'|'function';

export interface PromptConfigPrompt {
  grammar?: string,
  message: ChatCompletionRequestMessage,
  parameters?: Partial<ChatCompletionRequestMessage>
}

export interface PromptConfig {
  defaults: Partial<CreateChatCompletionRequest>[]
  grammar: Record<string,string>
  prompts: Record<string, PromptConfigPrompt>,
  examples?: Record<string, any>
}

export type PromptProperties = Partial<CreateChatCompletionRequest>

export function validateOpenAIRoleType(o: any, path?: string): string[] {
  return validateStringEnum(permittedOpenAIRoleTypes, o, path);
}

function validatePartialChatCompletionRequestMessage(o: any, path?: string)
: string[] {
  const log = getLogger(MODULE, validatePartialChatCompletionRequestMessage);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));

  if (typeof o !== 'object') {
    return [path ? `${path} is not an object` : E];
  }

  const result:string[] = [];
  const v = (member: string, vf:(o:any, path?:string)=>string[]) => {
    return tva(result, vf, path, member, false);
  }
  const properties: Record<string, string[]> = {
    'developer': [ 'content', 'name' ],
    'system': [ 'content', 'name' ],
    'user': [ 'content', 'name' ],
    'assistant': [ 'refusal', 'name', 'audio', 'tool_calls', 'function_call' ],
    'tool': [ 'content', 'tool_call_id' ],
    'function': [ 'content', 'name' ],
  }
  const role = o.role as string;

  if (!Object.keys(properties).includes(role)) {
    return [path ? `${path} is not a valid role` : E];
  }

  const tuples: Record<string, TestItemTuple> = {
    audio: v('audio', (o, p) => {
      if (o === null || (
        typeof o === 'object' &&
        typeof o.id === 'string'
      )) {
        return [];
      } else {
        return [p ? `${p} must be null or an object with an id` : E]
      }
    }),
    content: typeof o === 'string'
      ? () => true
      : tva(result, ({
            developer: validateChatCompletionRequestMessageContentPartText,
            system: validateChatCompletionRequestSystemMessageContentPart,
            user: validateChatCompletionRequestUserMessageContentPart,
            assistant: validateChatCompletionRequestAssistantMessageContentPart,
            tool: validateChatCompletionRequestToolMessageContentPart,
            function: (o: any, p?: string) => {
              if (typeof o !== 'string' && o !== null) {
                return [p ? `${p} must be a string or null` : E];
              } else {
                return [];
              }
            }
          }[role] as (o: any, p?:string) => string[]),
          path, 'content', false
        ),
    name: [false, 'string', '%s must be a string', 'name'],
    refusal: v(
      'refusal',
      (o, p) => {
        if (typeof o === 'string' || o === null) {
          return [];
        } else {
          return [p ? `${p} must be a string or null` : E];
        }
      }
    ),
    tool_calls: tv(result, validateChatCompletionMessageToolCalls, path,
      'tool_calls', false
    ),
    tool_call_id: [false, 'string', '%s must be a string', 'tool_call_id']
  };

  doTests(
    [result, o, path],
    itemsFromTuples(...properties[role].map(k => tuples[k]))
  );
  logResult(result, log);
  return result;
}

function validatePartialCreateChatCompletionRequest(o: any, path?: string)
: string[] {
  const log = getLogger(MODULE, validatePartialCreateChatCompletionRequest);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = [];
  const v = (member: string, vf:(o:any, path?:string)=>string[]) => {
    return tva(result, vf, path, member, false);
  }
  const validateFunctionCall = () => {
    if (typeof o === 'string') {
      const validator = (o: any, path?:string) => {
        const permittedValues = ['none', 'auto'];
        if (permittedValues.includes(o)) {
          return [];
        } else {
          return [path
            ? `${path} has invalid string values. ` +
              `Permitted: [${permittedValues.join(', ')}] `
            : E];
        }
      };
      return tv(result, validator, path, 'function_call', false);
    } else {
      return tv(
        result, validateChatCompletionFunctionCallOption, path,
        'function_call', false
      );
    }
  }
  const validateResponseFormat = (o:any, path?:string) => {
    const result:string[] = [];
    if (typeof o === 'object') {
      switch(o.type) {
      case 'text':
        result.push(...validateResponseFormatText(o, path));
        break;
      case 'json_object':
        result.push(...validateResponseFormatJsonObject(o, path));
        break;
      case 'json_schema':
        result.push(...validateResponseFormatJsonSchema(o, path));
        break;
      default:
        if (!o.type) {
          result.push(path ? `${path}.type is not defined` : E);
        } else {
          result.push(path
            ? `${path}.type is not valid. ` +
              'Must be in [text, json_object, json_schema]'
            : E
          );
        }
      }
    } else {
      result.push(path ? `${path} must be an object` : E);
    }
    return result;
  }
  const validateTools:()=>TestFunc = () => {
    if (Array.isArray(o)) {
      return tva(
        result, validateCustomToolChatCompletions, path, 'tools', false
      );
    } else {
      return v('tools', validateChatCompletionTool);
    }
  }
  const validateUnder20 = (o:any, path?:string) => {
    const result:string[] = [];
    if (typeof o === 'number') {
      if (o > 20) {
        result.push(path ? `${path} must be less than 20` : E);
      }
    } else {
      result.push(path ? `${path} must be a number` : E );      
    }
    return result;
  }
  const validateWithinOneHundredOfZero = (o:any, path?:string) => {
    const result:string[] = [];
    if (typeof o === 'number') {
      if (o < -100 || o > 100) {
        result.push(path ? `${path} must be between -100 and 100` : E);
      }
    } else {
      result.push(path ? `${path} must be a number` : E );      
    }
    return result;
  }
  const validateWithinTwoOfZero = (o:any, path?:string) => {
    const result:string[] = [];
    if (typeof o === 'number') {
      if (o < -2.0 || o > 2.0) {
        result.push(path ? `${path} must be between -2.0 and 2.0` : E);
      }
    } else {
      result.push(path ? `${path} must be a number` : E );      
    }
    return result;
  }
  doTests([result, o, path], itemsFromTuples(
    v('messages', validateChatCompletionRequestMessage),
    v('model', validateModelIdsShared),
    v('modalities', validateResponseModalities),
    v('verbosity', validateVerbosity),
    v('reasoning_effort', validateReasoningEffort),
    [false, 'number', '%s must be a number', 'max_completion_tokens'],
    v('frequency_penalty', validateWithinTwoOfZero),
    v('presence_penalty', validateWithinTwoOfZero),
    [false, 'object', '%s must be an object', 'web_search_options'],
    v('top_logprobs', validateUnder20),
    v('response_format', validateResponseFormat),
    [false, 'boolean', '%s must be boolean', 'store'],
    [false, 'boolean', '%s must be boolean', 'stream'],
    v('stop', validateStopConfiguration),
    tvr(result, validateWithinOneHundredOfZero, path, 'logit_bias', false),
    [false, 'boolean', '%s must be boolean', 'logprobs'],
    [false, 'number', '%s must be a number', 'max_tokens'],
    [false, 'number', '%s must be a number', 'n'],
    v('prediction', validatePredictionContent),
    [false, 'number', '%s must be a number', 'seed'],
    v('stream_options', validateChatCompletionStreamOptions),
    validateTools(),
    v('tool_choice', validateChatCompletionToolChoiceOption),
    v('parallel_tool_calls', validateParallelToolCalls),
    validateFunctionCall(),
    tva(result, validateChatCompletionFunctions, path, 'functions', false)
  ));
  logResult(result, log);
  return result;
}

export function validatePromptConfigPrompt(o: any, path?: string)
: string[] {
  const log = getLogger(MODULE, validatePromptConfigPrompt);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = [];
  doTests([result, o, path], itemsFromTuples(
    [true, 'object', '%s must be an object'],
    [false, 'string', '%s must be a string', 'grammar'],
    tv(result, validateChatCompletionRequestMessage, path, 'message', true),
    tv(result,
      validatePartialChatCompletionRequestMessage,
      path, 'parameters', false
    )
  ));
  logResult(result, log);
  return result;
}

export function validatePromptConfig(o: any, path?: string)
: string[] {
  const log = getLogger(MODULE, validatePromptConfig);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = [];
  doTests([result, o, path], itemsFromTuples(
    [true, 'object', '%s must be an object'],
    tva(result,
      validatePartialCreateChatCompletionRequest,
      path, 'defaults', true
    ),
    tv(result, validateRecord_string_string, path, 'grammar', true),
    tvr(result, validatePromptConfigPrompt, path, 'prompts', true),
    tv(result, validateRecord_string_any, path, 'examples', false)
  ));
  logResult(result, log);
  return result;
}

// `7MM"""Mq.                                                                 
//   MM   `MM.                                                                
//   MM   ,M9  .gP"Ya  ,pP"Ybd `7MMpdMAo.  ,pW"Wq.`7MMpMMMb.  ,pP"Ybd  .gP"Ya 
//   MMmmdM9  ,M'   Yb 8I   `"   MM   `Wb 6W'   `Wb MM    MM  8I   `" ,M'   Yb
//   MM  YM.  8M"""""" `YMMMa.   MM    M8 8M     M8 MM    MM  `YMMMa. 8M""""""
//   MM   `Mb.YM.    , L.   I8   MM   ,AP YA.   ,A9 MM    MM  L.   I8 YM.    ,
// .JMML. .JMM.`Mbmmd' M9mmmP'   MMbmmd'   `Ybmd9'.JMML  JMML.M9mmmP'  `Mbmmd'
//                               MM                                           
//                             .JMML.                                         

// Confidence

export type Confidence = number;
export interface ConfidenceRatedObject<T> {
  value: T,
  confidence?: Confidence
}
// Hml - High, Medium, Low

export type HmlRating = ConfidenceRatedObject<HmlValue>;
export type HmlValue = "high" | "medium" | "low";
export const hmlValuePermittedValues = ["high", "medium", "low"];

// Pnn - Positive, Neutral, Negative

export type PnnRating = ConfidenceRatedObject<PnnValue>;
export type PnnValue = "positive" | "neutral" | "negative";
export const pnnValuePermittedValues = ["positive", "neutral", "negative"];

/**
 * The result of the "satisfaction" prompt
 */
export interface Satisfaction {
  satisfaction: PnnValue;
  confidence: number;
  context?: string;
}

/**
 * The result of the "intent" prompt
 */
export interface Intent {
  intent: IntentRating;
  tone: PnnRating;
  complexity: HmlRating;
}

export type IntentRating = ConfidenceRatedObject<IntentValue>;
export type IntentValue = "analysis" | "develop" | "question" | "retry";
export const intentValuePermittedValues = [
  "analysis",
  "develop",
  "question",
  "retry"
];

export function validateConfidence(o: any, path?: string): string[] {
  return validateNumberRange(0, 100, o, path);
}

function validateConfidenceRatedObject(o: any, path?: string): string[] {
  // does not validate the T value
  const subjectPath = path ? `${path}.confidence` : path;
  if (typeof o !== 'object') {
    return [path ? `${path} must be an object` : E];
  }
  const subject = o.confidence;
  return validateConfidence(subject, subjectPath);  
}

export function validateHmlRating(o: any, path?: string): string[] {
  const log = getLogger(MODULE, validateHmlRating);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = validateConfidenceRatedObject(o, path);
  if (!result.length) {    
    const assertedO = o as ConfidenceRatedObject<unknown>;
    const subjectPath = path ? `${path}.value` : path;
    result.push(...validateHmlValue(assertedO.value, subjectPath))
  }
  return result;
}

export function validateHmlValue(o: any, path?: string): string[] {
  return validateStringEnum(hmlValuePermittedValues, o, path);
}

export function validateIntent(o: any, path?: string): string[] {
  const log = getLogger(MODULE, validateIntent);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = [];
  const v = (member: string, vf:(o:any, path?:string)=>string[]) => {
    return tv(result, vf, path, member, false);
  }  
  doTests([result, o, path], itemsFromTuples(
    [true, 'object', '%s must be an object'],
    v('intent', validateIntentRating),
    v('tone', validatePnnRating),
    v('complexity', validateHmlRating)
  ));
  logResult(result, log);
  return result;
}

export function validateIntentRating(o: any, path?: string): string[] {
  const log = getLogger(MODULE, validateIntentRating);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = validateConfidenceRatedObject(o, path);
  if (!result.length) {    
    const assertedO = o as ConfidenceRatedObject<unknown>;
    const subjectPath = path ? `${path}.value` : path;
    result.push(...validateIntentValue(assertedO.value, subjectPath))
  }
  return result;
}

export function validateIntentValue(o: any, path?: string): string[] {
  return validateStringEnum(intentValuePermittedValues, o, path);
}

export function validatePnnRating(o: any, path?: string): string[] {
  const log = getLogger(MODULE, validatePnnRating);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = validateConfidenceRatedObject(o, path);
  if (!result.length) {    
    const assertedO = o as ConfidenceRatedObject<unknown>;
    const subjectPath = path ? `${path}.value` : path;
    result.push(...validatePnnValue(assertedO.value, subjectPath))
  }
  return result;
}

export function validatePnnValue(o: any, path?: string): string[] {
  return validateStringEnum(pnnValuePermittedValues, o, path);
}

export function validateSatisfaction(o: any, path?: string): string[] {
  const log = getLogger(MODULE, validateSatisfaction);
  log.silly('called on {path, o}: %s', inspect({path, o}, D3));
  const result:string[] = [];
  const v = (member: string, vf:(o:any, path?:string)=>string[]) => {
    return tv(result, vf, path, member, false);
  }  
  doTests([result, o, path], itemsFromTuples(
    [true, 'object', '%s must be an object'],
    v('satisfaction', validatePnnValue),
    v('confidence', validateConfidence),
    [false, 'string', '%s must be a string', 'context']
  ));
  logResult(result, log);
  return result;
}

