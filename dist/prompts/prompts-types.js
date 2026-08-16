import { DISPATCH_BODY_EMPTY, DISPATCH_BODY_PARSE, DISPATCH_BODY_TYPE } from "../types/generated/error-codes.js";
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
function isConfidence(o) {
    return typeof (o.confidence) === 'number' &&
        o.confidence <= 100 &&
        o.confidence >= 0;
}
function isConfidenceRatedObject(o, isInnerType) {
    return typeof o === "object" && o !== null &&
        isInnerType(o.value) &&
        isConfidence(o.confidence);
}
const hmlValPermittedValues = ["high", "medium", "low"];
function isHmlRating(o) {
    return isConfidenceRatedObject(o, isHmlValue);
}
function isHmlValue(o) {
    return typeof o === 'string' &&
        hmlValPermittedValues.includes(o);
}
const pnnValPermittedValues = ["positive", "neutral", "negative"];
function isPnnRating(o) {
    return isConfidenceRatedObject(o, isPnnValue);
}
function isPnnValue(o) {
    return typeof o === 'string' &&
        pnnValPermittedValues.includes(o);
}
export function isSatisfaction(o) {
    return typeof o === 'object' && o !== null &&
        isPnnValue(o.pnnValue) &&
        isConfidence(o.confidence) &&
        (o.context === undefined || typeof o.context === 'string');
}
/**
 * Parse the satisfaction object from the format it would come in from the
 * service. If the object fails to parse, it returns an error code instead of an
 * `Satisfaction` object
 * @param buf the data to parse.
 */
export function parseSatisfaction(buf) {
    const satString = typeof buf === 'string' ? buf : buf.toString();
    if (!satString) {
        return DISPATCH_BODY_EMPTY;
    }
    const result = {};
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
    while (lines.length && lines[lines.length - 1] === '') {
        lines.pop();
    }
    if (lines.length) {
        result.context = lines.join('\n');
    }
    if (isSatisfaction(result)) {
        return result;
    }
    else {
        return DISPATCH_BODY_TYPE;
    }
}
export function isIntent(o) {
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
export function parseIntent(buf) {
    const intentString = typeof buf === 'string' ? buf : buf.toString();
    if (!intentString) {
        return DISPATCH_BODY_EMPTY;
    }
    try {
        var intentObj = JSON.parse(intentString);
    }
    catch (e) {
        return DISPATCH_BODY_PARSE;
    }
    return isIntent(intentObj) ? intentObj : DISPATCH_BODY_TYPE;
}
const intentValPermittedValues = [
    "analysis",
    "develop",
    "question",
    "retry"
];
function isIntentRating(o) {
    return isConfidenceRatedObject(o, isIntentValue);
}
function isIntentValue(o) {
    return typeof o === 'string' &&
        intentValPermittedValues.includes(o);
}
//# sourceMappingURL=prompts-types.js.map