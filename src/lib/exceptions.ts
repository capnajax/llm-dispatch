import { Response } from "filamentjs";
import { inspect } from "node:util";
import { defaultStatusCodes, ErrorCode, errorCodes } from "../types/generated/error-codes.js"

const DETAIL_SEPARATOR = ' :: ';

export interface ErrorAsObject extends Error {
  code: string,
  details?: string,
}

export interface ErrorHeaderInstruction {
  [key:string]: string|string[]|{action: 'add'|'set', value: string|string[]}
}

export interface ErrorOptions {
  details?: string|string[]|Record<string, any>,
  /**
   * If provided, send an error response to an HTTP request while creating this
   * error object.
   */
  res?: Response,
  /**
   * If `res` is provided, use this status code in this error response. Default
   * is 500.
   */
  statusCode?: number,
  /**
   * If `res` is provided, add these headers to the error response. Default
   * headers vary by status code and are overridden on an individual basis.
   * To add to the default value, use the object form
   * `{action: 'add', value: '<my-value>'}`
   */
  responseHeaders?: ErrorHeaderInstruction[],
  /**
   * If `res` is provided, add this to the response body
   */
  responseBody?: string|Buffer
  /**
   * If this error is caused by something else, add the cause here.
   */
  cause?: unknown
  /**
   * If this error is caused by something else, add the stack here.
   */
  stack?: unknown
}

/**
 * Creates an error object and optionally sends an HTTP response. Sends the
 * HTTP response but does not throw the error.
 * @param code the error code. A key from the `ERROR_CODE` object
 * @param options options for the error or extra details about the
 *  error as a `string`.
 * @param res a convenience parameter for the HTTP response. If this is
 *  provided, options.res is ignored.
 * @param statusCode a convenience parameter for the HTTP status code. If this
 *  is provided, options.statusCode is ignored.
 * @returns 
 */
export function error(
  code: ErrorCode,
  options: ErrorOptions|string = {},
  res?: Response,
  statusCode?: number
): Error {

  const useRes:Response|null = (() => {
    if (res) {
      return res;
    } else if (typeof options === 'object' && options.res) {
      return options.res;
    }
    return null;
  })();

  if (useRes) {
    const useStatusCode = (() => {
      if (useRes) {
        if (typeof statusCode === 'number') {
          return statusCode;
        } else if (typeof options === 'object' && options.statusCode) {
          return options.statusCode;
        } else {
          return defaultStatusCodes[code] || 500
        }
      }
      return 500;
    })();

    // per statusCode 
    const defaultHeaders: ErrorHeaderInstruction[] = [];
    switch (useStatusCode) {
    default:
      // add nothing
    }
    const responseHeaders = typeof options === 'object'
      ? (options.responseHeaders || [])
      : []

    for (const h of [...defaultHeaders, ...responseHeaders]) {
      for (const hk in h) {
        const hv = h[hk];
        if (typeof hv === 'string' || Array.isArray(hv)) {
          useRes.setHeader(hk, hv);
        } else {
          if (hv.action === 'add') {
            useRes.addHeader(hk, hv.value);
          } else {
            useRes.setHeader(hk, hv.value);
          }
        }
      }
    }

    if (typeof options === 'object' && options.responseBody) {
      useRes.send(options.responseBody);
    } else {
      useRes.end();
    }
  }

  const errorMessage = errorCodes[code] || '<unknown error>';
  let details = null;
  if (typeof options === 'string') {
    details = options;
  } else if (typeof options === 'object') {
    const eo = options as ErrorOptions;
    if (typeof eo.details === 'string') {
      details = eo.details;
    } else if (Array.isArray(eo.details)) {
      details = JSON.stringify(eo.details);
    } else {
      details = inspect(eo.details, {depth:4, colors:true});
    }
  }
  if (details !== null) {
    details = `${DETAIL_SEPARATOR}${details}`;
  }

  const result = new Error(
    `${code} ${errorMessage}${details}`,
    typeof options === 'object'
      ? ( options.cause || undefined )
      : undefined
  );

  return result;
};

/**
 * Parse an error message into an extended Error object, breaking down the
 * message into code, message, and details. This is meant to work specifically
 * with errors that are created with the `error` method. Other errors may have
 * code simply set to ERROR, message left untouched, and details empty.
 * @param error 
 * @returns 
 */
export function errorAsObject(error:Error):ErrorAsObject {
  const codeMatch = error.message.match(/([A-Z][A-Z0-9_]+)[: ](.*)/);
  const result:ErrorAsObject = {
    ... error,
    code: codeMatch ? codeMatch[1] : 'ERROR'
  };

  if (codeMatch) {
    const withoutCode = codeMatch[2].trim(); 
    const detailIdx = withoutCode.indexOf(DETAIL_SEPARATOR);
    if (detailIdx === -1) {
      result.message = withoutCode;
    } else {
      result.message = withoutCode.substring(0, detailIdx);
      result.details =
        withoutCode.substring(detailIdx + DETAIL_SEPARATOR.length);
    }
  }

  return result;
}

