import * as http from 'http';
import * as https from 'https';

/**
 * @module error-responses
 * Utility functions to fail a request if there is a problem. They all have the
 * same form: `failIf<condition>(req, res, <params>):boolean`, the function
 * returning `true` if the function returned a failure.
 */

import { Request, Response } from "filamentjs";
import Readiness from "./readiness.js";
import {
  BasePathType, isOnlineServiceConfigMode
} from "../types/connectivity-types.js";
import { getConnectivityMode } from "../dispatch.js";
import { AppMeta } from "../types/types.js";
import { error } from "./exceptions.js";
import ErrorCode, {
  DISPATCH_HTTP_ERROR,
  FAILED_ASSERTION,
  INTERNAL_ERROR,
  NET_INVALID_URL,
  NET_SCHEME,
  REQ_BODY_EMPTY,
  REQ_BODY_PARSE,
  REQ_BODY_TYPE
} from '../types/generated/error-codes.js';

const MODULE = 'http-tools';

// HTTP methods for detection
export const HTTP_METHODS = new Set([
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'
]);

/**
 * Sends a POST request to the provided endpoint with the given data and returns its JSON body.
 * @param {BasePathType} endpoint the type of endpoint Base URL to call.
 * @param {urlPath} url The path of the endpoint to call
 * @param {Record<string, any>} data The data to be sent in the request body.
 * @param {object} headers Optional headers to be sent with the request.
 * @returns {Promise<object>} A promise that resolves with the JSON body of the response.
 */
export async function aiEndpointRequest<T>(
  endpoint:BasePathType,
  urlPath: string,
  data:Record<string, any>,
  headers:Record<string, string> = {},
  parseT: (buf:Buffer|string) => T|ErrorCode
): Promise<T> {

  const connectivityMode = await getConnectivityMode('less');
  let modeBase:BasePathType = endpoint
  if (!isOnlineServiceConfigMode(connectivityMode)) {
    throw 'Offline';
  }
  const basePath = connectivityMode.basePaths[modeBase];
  const url = new URL(urlPath, basePath);

  // Set the default headers  
  const bodyBuffer = Buffer.from(JSON.stringify(data));
  const useHeaders:Record<string, string|string[]> = {
    'Content-Type': 'application/json',
    'Content-Length': `${bodyBuffer.byteLength}`,
    'Accept': 'application/json',
    'Accept-Charset': 'utf-8',
    'User-Agent': 'node-fetch',
    'Host': new URL(url).host,
  };

  // Add the provided headers to the default headers
  Object.assign(useHeaders, headers);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    // Check if the response was successful
    if (!response.ok) {
      throw error(DISPATCH_HTTP_ERROR);
    }

    const result = parseT(
      (await response.json())?.choices?.[0]?.message?.content
    );

    // Return the JSON body of the response
    return result as T;
  } catch (error) {
      // If any error occurred, throw it
      throw error;
  }
}

export async function checkHealth(url:string): Promise<boolean> {
  try {
    const response = await fetch(url);
    return !! response.ok;
  } catch (error) {
    return false;
  }
}


/**
 * Send a response with a specific status code and, if provided, content.
 * If there is content, this will set the Content-Length and Content-Type
 * headers, but other appropriate headers should be added to the response
 * before calling this method. 
 * @param res the Response to send
 * @param statusCode the status code
 * @param content if provided, the content the send with the response
 * @param contentType the MIME type of the content. Defaults to
 *  `application/json` or any existing `Content-Type` header.
 * @returns always returns `true`
 */
export function end(
  res: Response, statusCode: number,
  content?: string|Buffer, contentType?: string)
: boolean {
  res.statusCode = statusCode;
  if (content) {
    // Content-Type header
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    } else if (res.getHeader('Content-Type') === null) {
      res.setHeader('Content-Type', 'application/json');
    }
    // Content-Length header
    if (typeof content === 'string') {
      content = Buffer.from(content);
    }
    res.setHeader('Content-Length', `${content.byteLength}`);
    // send response
    res.send(content);
  } else {
    res.end();
  }
  return true;
}

/**
 * Test if this service is ready to do work, and fail if it isn't.
 * @param res if provided, send a response with a failure message (status code
 * 503, Retry-After set to 2 seconds)
 * @returns `true` if this method caught a failure, `false` if not.
 */
export function failIfNotReady(res?: Response): boolean {
  if (!Readiness.isReady) {
    if (res) {
      res.setHeader('Retry-After', '2');
      return end(res, 503);
    } else {
      return true;
    }
  }
  return false;
}
export function throwIfNotReady(res?: Response): void {
  if (failIfNotReady(res)) {
    throw('http-tools error not ready');
  }
}

/**
 * Parses a JSON response body. Assumes any non-empty and JSON-parseable
 * request body is in the correct format for `T` without validating.
 * @param req the HTTP request to get the request body from
 * @param res if provided, will respond to the HTTP request if the format is
 *  invalid
 * @returns an object of type `T`
 */
export function parseRequestBody<T>(req: Request<AppMeta>, res?: Response): T;
/**
 * Parses a JSON response body and, if provided a typeguard, validates the
 * object using the typeguard.
 * @param req the HTTP request to get the request body from
 * @param isOfTypeT the typeguard to validate the object format with
 * @returns an object of type `T`
 */
export function parseRequestBody<T>(
  req: Request<AppMeta>,
  isOfTypeT: (v: unknown) => v is T
): T;
/**
 * Parses a JSON response body and, if provided a typeguard, validates the
 * object using the typeguard.
 * @param req the HTTP request to get the request body from
 * @param res if provided, will respond to the HTTP request if the format is
 *  invalid
 * @param isOfTypeT the typeguard to validate the object format with
 * @returns an object of type `T`
 */
export function parseRequestBody<T>(
  req: Request<AppMeta>,
  res?: Response|((v: unknown) => v is T),
  isOfTypeT?: (v: unknown) => v is T
): T {
  const rawBody:string|undefined = req.body?.toString();
  if (typeof res === 'function') {
    isOfTypeT = res;
    res = undefined;
  }
  if (rawBody) {
    try {
      const result = JSON.parse(rawBody);
      if (! isOfTypeT || isOfTypeT(result)) {
        return result as T;
      } else {
        throw error(REQ_BODY_TYPE, {}, res);
      }
    } catch(e) {
      throw error(REQ_BODY_PARSE, {}, res);
    }
  } else {
    throw error(REQ_BODY_EMPTY, {}, res);
  }
}

type htRequestCallback = (res: http.IncomingMessage) => void;
type htRequestOptions = https.RequestOptions | http.RequestOptions;
interface HtAdapter {
  request: (((
    options: http.RequestOptions | URL | string,
    callback?: htRequestCallback
  ) => http.ClientRequest) | ((
    url: string | URL,
    options: http.RequestOptions,
    callback?: htRequestCallback
  ) => http.ClientRequest) | ((
    options: https.RequestOptions | URL | string,
    callback?: htRequestCallback
  ) => http.ClientRequest) | ((
    url: string | URL,
    options: https.RequestOptions,
    callback?: htRequestCallback
  ) => http.ClientRequest))
}

/**
 * Creates a ClientRequest of http or https
 */
export function createHtRequest(
  options: htRequestOptions,
  callback?: htRequestCallback
): http.ClientRequest;
export function createHtRequest(
  url: string | URL,
  options?: htRequestOptions,
  callback?: htRequestCallback,
): http.ClientRequest;
export function createHtRequest(
  url: string | URL,
  callback?: htRequestCallback,
): http.ClientRequest;
export function createHtRequest(
  url: htRequestOptions | string | URL,
  options?: htRequestOptions | htRequestCallback,
  callback?: htRequestCallback,
): http.ClientRequest {

  type AdapterInfo = {adapter: HtAdapter, name: string};
  const httpProtocol: AdapterInfo = {adapter: http, name: 'http'};
  const httpsProtocol: AdapterInfo = {adapter: https, name: 'https'};

  const schemeToAdapter = (scheme: string): AdapterInfo => {
    const protocols:Record<string, AdapterInfo> = {
      http: httpProtocol,
      https: httpsProtocol
    };
    const useAdapter = protocols[scheme];
    if (useAdapter) {
      return useAdapter;
    } else {
      throw error(NET_SCHEME, {
        details: {
          scheme, supported: Object.keys(protocols)
        }
      });
    }
  }

  function assertURLObject(o: any): asserts o is URL {
    if (!(o instanceof URL)) {
      throw error(FAILED_ASSERTION, {details: 'assertURLObject'});
    };
  }

  const makeEmptyOptions = ():htRequestOptions => {
    switch (adapter.name) {
    case 'http':
      return {} as http.RequestOptions;
    case 'https':
      return {} as https.RequestOptions;
    default:
      throw error(INTERNAL_ERROR);
    }
  }

  const parseUrl = (urlString: string):URL => {
    const result = URL.parse(urlString);
    if (!result) {
      throw error(NET_INVALID_URL, {details: urlString});
    }
    return result;
  }

  // fix the parameters. Put URL details into the options, and callback is the
  // only callback. After this if block, url is ignored.
  let adapter:AdapterInfo = httpProtocol;
  let useUrl!:URL|null; // null means the URL is derived from the options
  let useOptions!:htRequestOptions;
  let useCallback:htRequestCallback|undefined = undefined;

  const setUseUrl = (url:string|URL) => {
    if (typeof url === 'string') {
      useUrl = parseUrl(url);
    } else {
      assertURLObject(url);
      useUrl = url;
    }
    adapter = schemeToAdapter(useUrl.protocol);    
  }
  const setUseOptions = (options:htRequestOptions) => {
    if (typeof options === 'object' && options != null) {
      useOptions = options;
    } else {
      throw error(FAILED_ASSERTION,
        'options of createHtRequest(url, options, callback) is not an object'
      );
    }
  }
  const setUseCallback = (callback?:htRequestCallback) => {
    if (typeof callback === 'object' || callback === undefined) {
      useCallback = callback;
    } else {
      throw error(FAILED_ASSERTION,
        'callback of createHtRequest(url, options, callback) is not a function'
      );
    }
  }

  if (callback) {
    // guaranteed three parameter
    setUseUrl(url as string|URL);
    setUseOptions(options as htRequestOptions);
    setUseCallback(callback as htRequestCallback);
  } else if ((url instanceof URL) || (typeof URL === 'string')) {
    if (typeof url === 'string' || url instanceof URL) {
      setUseUrl(url);
      if (typeof options === 'function') {
        setUseOptions(makeEmptyOptions());
        setUseCallback(options);
      } else {
        setUseOptions(options as htRequestOptions);
      }
    } else {
      useUrl = null;
      adapter = httpProtocol;
      setUseOptions(url);
      setUseCallback(options as htRequestCallback);
    }
  }

  switch (adapter.name) {
  case 'http':
    if (useUrl) {
      return http.request(useUrl, useOptions, useCallback);
    } else {
      return http.request(useOptions, useCallback);
    }
  case 'https':
    if (useUrl) {
      return https.request(useUrl, useOptions, useCallback);
    } else {
      return https.request(useOptions, useCallback);
    }
  default:
    throw error(INTERNAL_ERROR);
  }
}

export function statusIsSuccess(res: Response): boolean {
  return (res.statusCode >= 200 && res.statusCode < 400);
}

export function statusIsError(res: Response): boolean {
  return (res.statusCode >= 400);
}
