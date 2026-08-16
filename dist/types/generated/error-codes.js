/**
 * @module error-codes
 * Error codes for use with the error management
 */
// ** ** ** ** ** ** DO NOT MODIFY ** ** ** ** ** ** **
// This is generated code. `npm run generate` to update
// ** ** ** ** ** ** DO NOT MODIFY ** ** ** ** ** ** **
export const errorCodes = {
    // General codes used in multiple places throughout the sources.
    ERROR: "An error has occured",
    FAILED_ASSERTION: "Assertion failed",
    INTERNAL_ERROR: "Internal error",
    NOT_READY: "Not ready",
    // Codes used by the dispatcher that calls different AI endpoints
    DISPATCH_OFFLINE: "AI Endpoint is offline",
    DISPATCH_TIMEOUT: "Request timed out",
    DISPATCH_BODY_EMPTY: "Request body empty",
    DISPATCH_BODY_PARSE: "Request body failed to parse",
    DISPATCH_BODY_TYPE: "Request body of incorrect format",
    DISPATCH_HTTP_ERROR: "Failed to send request to backend",
    // Codes used for general networking issues.
    NET_INVALID_URL: "URL string is not valid",
    NET_SCHEME: "Scheme unsupported",
    // Codes used for HTTP request issues. This is for requests to the proxy service
    REQ_BODY_EMPTY: "Request body empty",
    REQ_BODY_PARSE: "Request body failed to parse",
    REQ_BODY_TYPE: "Request body of incorrect format"
};
export const defaultStatusCodes = {
    DISPATCH_OFFLINE: 503,
    DISPATCH_TIMEOUT: 504,
    DISPATCH_BODY_EMPTY: 400,
    DISPATCH_BODY_PARSE: 400,
    DISPATCH_BODY_TYPE: 400,
    DISPATCH_HTTP_ERROR: 500,
    REQ_BODY_EMPTY: 400,
    REQ_BODY_PARSE: 400,
    REQ_BODY_TYPE: 400
};
function isGeneralErrorCode(o) {
    return [
        ERROR,
        FAILED_ASSERTION,
        INTERNAL_ERROR,
        NOT_READY
    ].includes(o);
}
function isDispatchErrorCode(o) {
    return [
        DISPATCH_OFFLINE,
        DISPATCH_TIMEOUT,
        DISPATCH_BODY_EMPTY,
        DISPATCH_BODY_PARSE,
        DISPATCH_BODY_TYPE,
        DISPATCH_HTTP_ERROR
    ].includes(o);
}
function isNetErrorCode(o) {
    return [
        NET_INVALID_URL,
        NET_SCHEME
    ].includes(o);
}
function isHttpRequestErrorCode(o) {
    return [
        REQ_BODY_EMPTY,
        REQ_BODY_PARSE,
        REQ_BODY_TYPE
    ].includes(o);
}
export function isErrorCode(o) {
    return isGeneralErrorCode(o) ||
        isDispatchErrorCode(o) ||
        isNetErrorCode(o) ||
        isHttpRequestErrorCode(o);
}
//
// Useful constants for each error code
//
// general
// General codes used in multiple places throughout the sources.
/**
 * Message: `An error has occured`
 * A catch-all for any unknown error.
 */
export const ERROR = "ERROR";
/**
 * Message: `Assertion failed`
 * An assertion failed. Information about which assertion failed should
 * be included in the details.
 */
export const FAILED_ASSERTION = "FAILED_ASSERTION";
/**
 * Message: `Internal error`
 * A supposedly "impossible" error but is tripped by a code defect.
 */
export const INTERNAL_ERROR = "INTERNAL_ERROR";
/**
 * Message: `Not ready`
 * Attempted to access an object before it's ready
 */
export const NOT_READY = "NOT_READY";
// dispatch
// Codes used by the dispatcher that calls different AI endpoints
/**
 * Message: `AI Endpoint is offline`
 * Status Code: 503
 * All the end points available to the host are offline
 */
export const DISPATCH_OFFLINE = "DISPATCH_OFFLINE";
/**
 * Message: `Request timed out`
 * Status Code: 504
 */
export const DISPATCH_TIMEOUT = "DISPATCH_TIMEOUT";
/**
 * Message: `Request body empty`
 * Status Code: 400
 * Used when a message body is expected, but it's actually empty.
 */
export const DISPATCH_BODY_EMPTY = "DISPATCH_BODY_EMPTY";
/**
 * Message: `Request body failed to parse`
 * Status Code: 400
 */
export const DISPATCH_BODY_PARSE = "DISPATCH_BODY_PARSE";
/**
 * Message: `Request body of incorrect format`
 * Status Code: 400
 */
export const DISPATCH_BODY_TYPE = "DISPATCH_BODY_TYPE";
/**
 * Message: `Failed to send request to backend`
 * Status Code: 500
 */
export const DISPATCH_HTTP_ERROR = "DISPATCH_HTTP_ERROR";
// net
// Codes used for general networking issues.
/**
 * Message: `URL string is not valid`
 */
export const NET_INVALID_URL = "NET_INVALID_URL";
/**
 * Message: `Scheme unsupported`
 * Thrown when the URL scheme (e.g. the `myapp` in `myapp://example.com`)
 * is not supported. Details should be an object that looks like
 * `{scheme: 'myapp', supported: ['http', 'https']}`
 */
export const NET_SCHEME = "NET_SCHEME";
// httpRequest
// Codes used for HTTP request issues. This is for requests to the proxy service
/**
 * Message: `Request body empty`
 * Status Code: 400
 * Used when a message body is expected, but it's actually empty.
 */
export const REQ_BODY_EMPTY = "REQ_BODY_EMPTY";
/**
 * Message: `Request body failed to parse`
 * Status Code: 400
 */
export const REQ_BODY_PARSE = "REQ_BODY_PARSE";
/**
 * Message: `Request body of incorrect format`
 * Status Code: 400
 */
export const REQ_BODY_TYPE = "REQ_BODY_TYPE";
//# sourceMappingURL=error-codes.js.map