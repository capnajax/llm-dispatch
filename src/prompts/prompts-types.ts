import ErrorCode, {
  DISPATCH_BODY_EMPTY,
  DISPATCH_BODY_PARSE,
  DISPATCH_BODY_TYPE
} from "../types/generated/error-codes.js";
import {
  ChatCompletionRequestMessage,
  CreateChatCompletionRequest
} from "../types/generated/openai-types.js";

// `7MM"""Mq.                                                 mm          
//   MM   `MM.                                                MM          
//   MM   ,M9  .gP"Ya   ,dW"Yvd `7MM  `7MM  .gP"Ya  ,pP"Ybd mmMMmm ,pP"Ybd
//   MMmmdM9  ,M'   Yb ,W'   MM   MM    MM ,M'   Yb 8I   `"   MM   8I   `"
//   MM  YM.  8M"""""" 8M    MM   MM    MM 8M"""""" `YMMMa.   MM   `YMMMa.
//   MM   `Mb.YM.    , YA.   MM   MM    MM YM.    , L.   I8   MM   L.   I8
// .JMML. .JMM.`Mbmmd'  `MbmdMM   `Mbod"YML.`Mbmmd' M9mmmP'   `MbmoM9mmmP'
//                           MM                                           
//                         .JMML.                                         

export const openAIRoleTypes = [
  'developer', 'system', 'user', 'assistant',
  'tool', 'function'
];
export type OpenAIRoleTypes = 'developer'|'system'|'user'|'assistant'|
  'tool'|'function';

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

type Confidence = number;
interface ConfidenceRatedObject<T> {
  value: T,
  confidence?: Confidence
}
function isConfidence(o: any): o is Confidence {
  return typeof(o.confidence) === 'number' &&
    o.confidence <= 100 &&
    o.confidence >= 0
}
function isConfidenceRatedObject<T>(o: any, isInnerType: (v: unknown) => v is T)
: o is ConfidenceRatedObject<T> {
  return typeof o === "object" && o !== null &&
    isInnerType(o.value) &&
    isConfidence(o.confidence)
}

// Hml - High, Medium, Low

type HmlRating = ConfidenceRatedObject<HmlValue>;
type HmlValue = "high" | "medium" | "low";
const hmlValPermittedValues = ["high", "medium", "low"];
function isHmlRating(o:any): o is HmlRating {
  return isConfidenceRatedObject<HmlValue>(o, isHmlValue);
}
function isHmlValue(o:any): o is HmlValue {
  return typeof o === 'string' &&
    hmlValPermittedValues.includes(o);
}

// Pnn - Positive, Neutral, Negative

type PnnRating = ConfidenceRatedObject<PnnValue>;
type PnnValue = "positive" | "neutral" | "negative";
const pnnValPermittedValues = ["positive", "neutral", "negative"];
function isPnnRating(o:any): o is PnnRating {
  return isConfidenceRatedObject<PnnValue>(o, isPnnValue);
}
function isPnnValue(o:any): o is PnnValue {
  return typeof o === 'string' &&
    pnnValPermittedValues.includes(o);
}

/**
 * The result of the "satisfaction" prompt
 */
export interface Satisfaction {
  satisfaction: PnnValue;
  confidence: number;
  context?: string;
}
export function isSatisfaction(o:any): o is Satisfaction {
  return typeof o === 'object' && o !== null &&
    isPnnValue(o.pnnValue) &&
    isConfidence(o.confidence) &&
    ( o.context === undefined || typeof o.context === 'string' )
}
/**
 * Parse the satisfaction object from the format it would come in from the
 * service. If the object fails to parse, it returns an error code instead of an
 * `Satisfaction` object
 * @param buf the data to parse.
 */
export function parseSatisfaction(buf:Buffer|string): Satisfaction|ErrorCode {
  const satString = typeof buf === 'string' ? buf : buf.toString();
  if (!satString) {
    return DISPATCH_BODY_EMPTY;
  }
  const result:Partial<Satisfaction> = {};
  // first two lines should be satisfaction: and confidence
  const lines = satString.split('\n');
  const satLine = lines.shift();
  const satLineMatch = satLine?.match(/satisfaction: (.*)/);
  if (satLineMatch) {
    if (isPnnValue(satLineMatch[1])) {
      result.satisfaction = satLineMatch[1];
    }
  }
  const confidenceLine = lines.shift();
  const confidenceLineMatch = confidenceLine?.match(/confidence: ([0-9]*)/);
  if (confidenceLineMatch) {
    if (isConfidence(confidenceLineMatch[1])) {
      result.confidence = confidenceLineMatch[1];
    }
  }
  while (lines.length && lines[lines.length-1] === '') {
    lines.pop();
  }
  if (lines.length) {
    result.context = lines.join('\n');
  }
  if (isSatisfaction(result)) {
    return result;
  } else {
    return DISPATCH_BODY_TYPE;
  }
}

/**
 * The result of the "intent" prompt
 */
export interface Intent {
  intent: IntentRating;
  tone: PnnRating;
  complexity: HmlRating;
}
export function isIntent(o:any): o is Intent {
  return typeof o === 'object' && o !== null &&
    isIntentRating(o.intent) &&
    isPnnRating(o.tone) &&
    isHmlRating(o.complexity);  
}
/**
 * Parse the intent object from the format it would come in from the service.
 * If the object fails to parse, it returns an error code instead of an
 * `Intent` object
 * @param buf the data to parse.
 */
export function parseIntent(buf:Buffer|string): Intent|ErrorCode {
  const intentString = typeof buf === 'string' ? buf : buf.toString();
  if (!intentString) {
    return DISPATCH_BODY_EMPTY;
  }
  try {
    var intentObj = JSON.parse(intentString);
  } catch(e) {
    return DISPATCH_BODY_PARSE;
  }
  return isIntent(intentObj) ? intentObj : DISPATCH_BODY_TYPE;
}
 
type IntentRating = ConfidenceRatedObject<IntentValue>;
type IntentValue = "analysis" | "develop" | "question" | "retry";
const intentValPermittedValues = [
  "analysis",
  "develop",
  "question",
  "retry"
];
function isIntentRating(o:any): o is IntentRating {
  return isConfidenceRatedObject<IntentValue>(o, isIntentValue);
}
function isIntentValue(o:any): o is IntentValue {
  return typeof o === 'string' &&
    intentValPermittedValues.includes(o);
}
