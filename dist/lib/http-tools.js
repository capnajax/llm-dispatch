import * as http from 'http';
import * as https from 'https';
import Readiness from "./readiness.js";
import { isOnlineServiceConfigMode } from "../types/connectivity-types.js";
import { getConnectivityMode } from "../dispatch.js";
import { error } from "./exceptions.js";
import { DISPATCH_HTTP_ERROR, FAILED_ASSERTION, INTERNAL_ERROR, NET_INVALID_URL, NET_SCHEME, REQ_BODY_EMPTY, REQ_BODY_PARSE, REQ_BODY_TYPE } from '../types/generated/error-codes.js';
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
export async function aiEndpointRequest(endpoint, urlPath, data, headers = {}, parseT) {
    const connectivityMode = await getConnectivityMode('less');
    let modeBase = endpoint;
    if (!isOnlineServiceConfigMode(connectivityMode)) {
        throw 'Offline';
    }
    const basePath = connectivityMode.basePaths[modeBase];
    const url = new URL(urlPath, basePath);
    // Set the default headers  
    const bodyBuffer = Buffer.from(JSON.stringify(data));
    const useHeaders = {
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
        const result = parseT((await response.json())?.choices?.[0]?.message?.content);
        // Return the JSON body of the response
        return result;
    }
    catch (error) {
        // If any error occurred, throw it
        throw error;
    }
}
export async function checkHealth(url) {
    try {
        const response = await fetch(url);
        return !!response.ok;
    }
    catch (error) {
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
export function end(res, statusCode, content, contentType) {
    res.statusCode = statusCode;
    if (content) {
        // Content-Type header
        if (contentType) {
            res.setHeader('Content-Type', contentType);
        }
        else if (res.getHeader('Content-Type') === null) {
            res.setHeader('Content-Type', 'application/json');
        }
        // Content-Length header
        if (typeof content === 'string') {
            content = Buffer.from(content);
        }
        res.setHeader('Content-Length', `${content.byteLength}`);
        // send response
        res.send(content);
    }
    else {
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
export function failIfNotReady(res) {
    if (!Readiness.isReady) {
        if (res) {
            res.setHeader('Retry-After', '2');
            return end(res, 503);
        }
        else {
            return true;
        }
    }
    return false;
}
export function throwIfNotReady(res) {
    if (failIfNotReady(res)) {
        throw ('http-tools error not ready');
    }
}
/**
 * Parses a JSON response body and, if provided a typeguard, validates the
 * object using the typeguard.
 * @param req the HTTP request to get the request body from
 * @param res if provided, will respond to the HTTP request if the format is
 *  invalid
 * @param isOfTypeT the typeguard to validate the object format with
 * @returns an object of type `T`
 */
export function parseRequestBody(req, res, isOfTypeT) {
    const rawBody = req.body?.toString();
    if (typeof res === 'function') {
        isOfTypeT = res;
        res = undefined;
    }
    if (rawBody) {
        try {
            const result = JSON.parse(rawBody);
            if (!isOfTypeT || isOfTypeT(result)) {
                return result;
            }
            else {
                throw error(REQ_BODY_TYPE, {}, res);
            }
        }
        catch (e) {
            throw error(REQ_BODY_PARSE, {}, res);
        }
    }
    else {
        throw error(REQ_BODY_EMPTY, {}, res);
    }
}
export function createHtRequest(url, options, callback) {
    const httpProtocol = { adapter: http, name: 'http' };
    const httpsProtocol = { adapter: https, name: 'https' };
    const schemeToAdapter = (scheme) => {
        const protocols = {
            http: httpProtocol,
            https: httpsProtocol
        };
        const useAdapter = protocols[scheme];
        if (useAdapter) {
            return useAdapter;
        }
        else {
            throw error(NET_SCHEME, {
                details: {
                    scheme, supported: Object.keys(protocols)
                }
            });
        }
    };
    function assertURLObject(o) {
        if (!(o instanceof URL)) {
            throw error(FAILED_ASSERTION, { details: 'assertURLObject' });
        }
        ;
    }
    const makeEmptyOptions = () => {
        switch (adapter.name) {
            case 'http':
                return {};
            case 'https':
                return {};
            default:
                throw error(INTERNAL_ERROR);
        }
    };
    const parseUrl = (urlString) => {
        const result = URL.parse(urlString);
        if (!result) {
            throw error(NET_INVALID_URL, { details: urlString });
        }
        return result;
    };
    // fix the parameters. Put URL details into the options, and callback is the
    // only callback. After this if block, url is ignored.
    let adapter = httpProtocol;
    let useUrl; // null means the URL is derived from the options
    let useOptions;
    let useCallback = undefined;
    const setUseUrl = (url) => {
        if (typeof url === 'string') {
            useUrl = parseUrl(url);
        }
        else {
            assertURLObject(url);
            useUrl = url;
        }
        adapter = schemeToAdapter(useUrl.protocol);
    };
    const setUseOptions = (options) => {
        if (typeof options === 'object' && options != null) {
            useOptions = options;
        }
        else {
            throw error(FAILED_ASSERTION, 'options of createHtRequest(url, options, callback) is not an object');
        }
    };
    const setUseCallback = (callback) => {
        if (typeof callback === 'object' || callback === undefined) {
            useCallback = callback;
        }
        else {
            throw error(FAILED_ASSERTION, 'callback of createHtRequest(url, options, callback) is not a function');
        }
    };
    if (callback) {
        // guaranteed three parameter
        setUseUrl(url);
        setUseOptions(options);
        setUseCallback(callback);
    }
    else if ((url instanceof URL) || (typeof URL === 'string')) {
        if (typeof url === 'string' || url instanceof URL) {
            setUseUrl(url);
            if (typeof options === 'function') {
                setUseOptions(makeEmptyOptions());
                setUseCallback(options);
            }
            else {
                setUseOptions(options);
            }
        }
        else {
            useUrl = null;
            adapter = httpProtocol;
            setUseOptions(url);
            setUseCallback(options);
        }
    }
    switch (adapter.name) {
        case 'http':
            if (useUrl) {
                return http.request(useUrl, useOptions, useCallback);
            }
            else {
                return http.request(useOptions, useCallback);
            }
        case 'https':
            if (useUrl) {
                return https.request(useUrl, useOptions, useCallback);
            }
            else {
                return https.request(useOptions, useCallback);
            }
        default:
            throw error(INTERNAL_ERROR);
    }
}
export function statusIsSuccess(res) {
    return (res.statusCode >= 200 && res.statusCode < 400);
}
export function statusIsError(res) {
    return (res.statusCode >= 400);
}
//# sourceMappingURL=http-tools.js.map