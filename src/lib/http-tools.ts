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
  DISPATCH_INVALID_URL,
  DISPATCH_OFFLINE,
  FAILED_ASSERTION,
  INTERNAL_ERROR,
  NET_INVALID_URL,
  NET_SCHEME,
  REQ_BODY_EMPTY,
  REQ_BODY_PARSE,
  REQ_BODY_TYPE
} from '../types/generated/error-codes.js';
import { getLogger } from './logger.js';

const MODULE = 'http-tools';

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
  const log = getLogger(MODULE, aiEndpointRequest);
  log.debug('aiEndpointRequest called');
  const connectivityMode = await getConnectivityMode('less');
  let modeBase:BasePathType = endpoint
  if (!isOnlineServiceConfigMode(connectivityMode)) {
    throw error(DISPATCH_OFFLINE);
  }
  const basePath = connectivityMode.basePaths[modeBase];
  const url = new URL(urlPath, basePath);

  log.debug('Setting up aiEndpoitnRequest')

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

  log.debug('sending request');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    log.debug('checking response');

    // Check if the response was successful
    if (!response.ok) {
      throw error(DISPATCH_HTTP_ERROR);
    }

    const result = parseT(
      (await response.json())?.choices?.[0]?.message?.content
    );

    log.debug('sending response %s', JSON.stringify(result));

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
      res.headers.set('Content-Type', contentType);
    } else if (res.headers.get('Content-Type') === null) {
      res.headers.set('Content-Type', 'application/json');
    }
    // Content-Length header
    if (typeof content === 'string') {
      content = Buffer.from(content);
    }
    res.headers.set('Content-Length', `${content.byteLength}`);
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
      res.headers.set('Retry-After', '2');
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

  const URL_NOT_PROVIDED = 'URL_NOT_PROVIDED';

  // normalize parameters
  const parameters
    :(htRequestOptions|htRequestCallback|string|URL|undefined|null)[] = [
    url, options, callback
  ];
  if (typeof parameters[0] === 'string') {
    parameters[0] = parseUrl(parameters[0]);
  } else if (!(parameters[0] instanceof URL)) {
    parameters.unshift(undefined);
  }
  if (typeof parameters[1] === 'function') {
    parameters.splice(1, 0, {});
  }
  options = parameters[1] as htRequestOptions;
  if (parameters[0] === undefined) {
    parameters[0] = 'URL_NOT_PROVIDED';
  }
  url = parameters[0] as URL|'URL_NOT_PROVIDED';
  callback = parameters[2] as htRequestCallback;

  const schemeToAdapter = (scheme: string|null|undefined): AdapterInfo => {
    const protocols:Record<string, AdapterInfo> = {
      http: httpProtocol,
      https: httpsProtocol
    };
    if (typeof scheme !== 'string') {
      scheme = 'http'
    } else {
      scheme = scheme.replace(/:$/, '')
    }
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

  // assertions to clamp types
  if (!(url instanceof URL) && url !== 'URL_NOT_PROVIDED') {
    throw error(FAILED_ASSERTION, 'url not a url object');
  }
  if (typeof options !== 'object' || options === null) {
    throw error(FAILED_ASSERTION,
      'options of createHtRequest is not an object'
    );
  }
  if (typeof callback !== 'function') {
    throw error(FAILED_ASSERTION,
      'callback of createHtRequest is not a function'
    );
  }

  // fix the parameters. Put URL details into the options, and callback is the
  // only callback. After this if block, url is ignored.
  let adapter = schemeToAdapter(
   ( url === URL_NOT_PROVIDED) ? options.protocol : url.protocol
  );


  switch (adapter.name) {
  case 'http':
    if (url) {
      return http.request(url, options, callback);
    } else {
      return http.request(options, callback);
    }
  case 'https':
    if (url) {
      return https.request(url, options, callback);
    } else {
      return https.request(options, callback);
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
