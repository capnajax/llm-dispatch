import { inspect } from "node:util";
import { defaultStatusCodes, errorCodes } from "../types/generated/error-codes.js";
const DETAIL_SEPARATOR = ' :: ';
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
export function error(code, options = {}, res, statusCode) {
    const useRes = (() => {
        if (res) {
            return res;
        }
        else if (typeof options === 'object' && options.res) {
            return options.res;
        }
        return null;
    })();
    if (useRes) {
        const useStatusCode = (() => {
            if (useRes) {
                if (typeof statusCode === 'number') {
                    return statusCode;
                }
                else if (typeof options === 'object' && options.statusCode) {
                    return options.statusCode;
                }
                else {
                    return defaultStatusCodes[code] || 500;
                }
            }
            return 500;
        })();
        // per statusCode 
        const defaultHeaders = [];
        switch (useStatusCode) {
            default:
            // add nothing
        }
        const responseHeaders = typeof options === 'object'
            ? (options.responseHeaders || [])
            : [];
        for (const h of [...defaultHeaders, ...responseHeaders]) {
            for (const hk in h) {
                const hv = h[hk];
                if (typeof hv === 'string' || Array.isArray(hv)) {
                    useRes.setHeader(hk, hv);
                }
                else {
                    if (hv.action === 'add') {
                        useRes.addHeader(hk, hv.value);
                    }
                    else {
                        useRes.setHeader(hk, hv.value);
                    }
                }
            }
        }
        if (typeof options === 'object' && options.responseBody) {
            useRes.send(options.responseBody);
        }
        else {
            useRes.end();
        }
    }
    const errorMessage = errorCodes[code] || '<unknown error>';
    let details = null;
    if (typeof options === 'string') {
        details = options;
    }
    else if (typeof options === 'object') {
        const eo = options;
        if (typeof eo.details === 'string') {
            details = eo.details;
        }
        else if (Array.isArray(eo.details)) {
            details = JSON.stringify(eo.details);
        }
        else {
            details = inspect(eo.details, { depth: 4, colors: true });
        }
    }
    if (details !== null) {
        details = `${DETAIL_SEPARATOR}${details}`;
    }
    const result = new Error(`${code} ${errorMessage}${details}`, typeof options === 'object'
        ? (options.cause || undefined)
        : undefined);
    return result;
}
;
/**
 * Parse an error message into an extended Error object, breaking down the
 * message into code, message, and details. This is meant to work specifically
 * with errors that are created with the `error` method. Other errors may have
 * code simply set to ERROR, message left untouched, and details empty.
 * @param error
 * @returns
 */
export function errorAsObject(error) {
    const codeMatch = error.message.match(/([A-Z][A-Z0-9_]+)[: ](.*)/);
    const result = {
        ...error,
        code: codeMatch ? codeMatch[1] : 'ERROR'
    };
    if (codeMatch) {
        const withoutCode = codeMatch[2].trim();
        const detailIdx = withoutCode.indexOf(DETAIL_SEPARATOR);
        if (detailIdx === -1) {
            result.message = withoutCode;
        }
        else {
            result.message = withoutCode.substring(0, detailIdx);
            result.details =
                withoutCode.substring(detailIdx + DETAIL_SEPARATOR.length);
        }
    }
    return result;
}
//# sourceMappingURL=exceptions.js.map