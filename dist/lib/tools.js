export function assertType(name, thing, type) {
    if (thing) {
        if (type === 'array') {
            if (!Array.isArray(thing)) {
                throw new Error(`"${name}" is not an array`);
            }
        }
        else if (typeof thing !== type) {
            throw new Error(`"${name}" is not ${type === 'object' ? 'an' : 'a'} "${type}`);
        }
    }
}
export function assertRecordHasProperties(name, object, ...propertyNames) {
    const messages = [];
    for (const pt of propertyNames.flat()) {
        const p = pt.replace(/\??:.*/, '');
        const isRequired = (pt.indexOf('?') === -1);
        const t = pt.indexOf(':') === -1
            ? null
            : pt.replace(/[^:]*:/, '');
        if (Object.hasOwn(object, p)) {
            if (t) {
                try {
                    assertType(`object "${name}" property "${p}"`, object[p], t);
                }
                catch (m) {
                    messages.push(m);
                }
            }
        }
        else if (isRequired) {
            messages.push(`object "${name}" property "${p}" does not exist`);
        }
    }
    if (messages.length > 1) {
        throw new Error(messages.join('\n'));
    }
}
export function assertSingleItemRecord(name, object, propertyName, validateType) {
    const unexpectedMembers = [];
    for (const member of Object.keys(object)) {
        if (member != propertyName) {
            unexpectedMembers.push(member);
        }
    }
    if (unexpectedMembers.length > 1) {
        throw new Error(`object "${name}" has unexpected members: ${unexpectedMembers}`);
    }
    if (!Object.hasOwn(object, propertyName)) {
        throw new Error(`object "${name}" does not contain property "${propertyName}"`);
    }
    if (validateType) {
        assertType(`object "${name}" property "${propertyName}"`, object[propertyName], validateType);
    }
}
export function deepClone(obj, options) {
    const without = options?.without
        ? (Array.isArray(options.without) ? options.without : [options.without])
        : [];
    if (Array.isArray(obj)) {
        return obj.map(o => deepClone(o, options));
    }
    else if (obj === null) {
        return null;
    }
    else if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key) && !without.includes(key)) {
                newObj[key] = deepClone(obj[key]);
            }
        }
        return newObj;
    }
    else {
        return obj;
    }
}
export function deepMerge(complete, ...sources) {
    let result = deepClone(complete);
    // deep merge each source into the result. Replace whole arrays, but merge
    // objects
    for (const source of sources) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' &&
                !Array.isArray(source[key])) {
                result[key] = deepMerge(result[key] || {}, source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
    }
    return result;
}
/**
 * Extends an object in place by adding the values of other objects to it. If
 * two objects have the same key, the last one will override the first one.
 * @param extendMeObj the object to extend
 * @param o Objects to extend the `extendMeObj` with
 * @returns the extended `extendMeObj`
 */
export function extend(extendMeObj, ...o) {
    for (const oi of o) {
        for (const k of Object.keys(oi)) {
            extendMeObj[k] = oi[k];
        }
    }
    return extendMeObj;
}
export function isNil(value) {
    return value === null || value === undefined;
}
export function omit(obj, ...keys) {
    const result = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !keys.includes(key)) {
            result[key] = obj[key];
        }
    }
    return result;
}
export function pick(o, keys, include = true) {
    const result = {};
    const wo = keys.flat();
    for (const k of Object.keys(o)) {
        if (wo.includes(k) === include) {
            result[k] = o[k];
        }
    }
    return result;
}
function reflowParagraph(paragraph, nCols) {
    const firstLine = paragraph.split('\n', 1)[0];
    // Any leading non-word characters. Hyphen and digits count as
    // word characters for our purposes.
    const prefix = firstLine.match(/^[^A-Za-z0-9_-]*/)?.[0] ?? '';
    const available = Math.max(1, nCols - prefix.length);
    const longWordThreshold = Math.floor(available / 2);
    const words = paragraph
        .split(/\r?\n/)
        .map((line) => line.startsWith(prefix)
        ? line.slice(prefix.length)
        : line)
        .join(' ')
        .trim()
        .split(/\s+/);
    if (words.length === 0 || words[0] === '') {
        return '';
    }
    const lines = [];
    let line = '';
    for (const word of words) {
        if (line.length === 0) {
            line = word;
            continue;
        }
        const candidateLength = line.length + 1 + word.length;
        if (candidateLength <= available ||
            word.length > longWordThreshold) {
            line += ' ' + word;
        }
        else {
            lines.push(prefix + line);
            line = word;
        }
    }
    if (line.length > 0) {
        lines.push(prefix + line);
    }
    return lines.join('\n');
}
/**
 * Reflow text to a maximum line width.
 *
 * - Breaks only on whitespace.
 * - Preserves blank lines.
 * - Preserves any leading non-word prefix (e.g. " * ").
 * - Words longer than half the available width are allowed to exceed
 *   the width.
 */
export function reflowText(text, nCols) {
    if (nCols < 2) {
        throw new RangeError('nCols must be at least 2');
    }
    return text
        .split(/\n\s*\n/)
        .map((paragraph) => reflowParagraph(paragraph, nCols))
        .join('\n\n');
}
/**
 * Returns `true` if `v` of type `t`. This is useful for validating required
 * fields in a typeguard. Always returns false if v === undefined unless
 * t is `undefined`.
 * @param v the value to test
 * @param t the type to test against. Can be either:
 *  - a primitive type (e.g. 'string','number',...),
 *  - a function that tests `v`, returning the result as a boolean, or
 *  - a RegExp that tests the value of `v` as a string
 * @param nullable if `null` is a valid value. If this is `true` a `null` value
 *  will always pass. If this is `false` and `t` is a function, the function
 *  decides if `null` is valid. If `t` is a string or a RegExp, a `null` value
 *  is always a fail. Note that in JavaScript, `null` is considered an `object`,
 *  but this will not pass a `null` as an `object` unless `nullable` is set to
 *  `true`. Default is `false`.
 * @returns `true` if the type of `v` validates to `t`, `false` if not.
 */
export function ofType(v, t, nullable = false) {
    return ((v !== undefined || t === 'undefined') &&
        ((nullable && v === null) ||
            (typeof t === 'function'
                ? t(v)
                : typeof t === 'string'
                    ? (v !== null && typeof v === t)
                    : (typeof v === 'string' && t.test(v)))));
}
/**
 * Returns `true` if `v` is either undefined or of type `t`. This is useful for
 * validating optional fields in a typeguard.
 * @param v the value to test
 * @param t the type to test against. Can be either:
 *  - a primitive type (e.g. 'string','number',...),
 *  - a function that tests `v`, returning the result as a boolean, or
 *  - a RegExp that tests the value of `v` as a string
 * @param nullable if `null` is a valid value. If this is `true` a `null` value
 *  will always pass. If this is `false` and `t` is a function, the function
 *  decides if `null` is valid. If `t` is a string or a RegExp, a `null` value
 *  is always a fail. Note that in JavaScript, `null` is considered an `object`,
 *  but this will not pass a `null` as an `object` unless `nullable` is set to
 *  `true`. Default is `false`.
 * @returns `true` if the type of `v` validates to `t`, `false` if not.
 */
export function ofTypeOrUndefined(v, t, nullable = true) {
    return ((v === undefined) || ofType(v, t, nullable));
}
/**
 * Yield to the event loop, allowing other asynchronous operations to proceed
 * before continuing execution of the current function. This is useful for
 * preventing long-running operations from blocking the event loop.
 * @returns Promise that resolves on the next tick of the event loop.
 */
export function yieldToEventLoop() {
    return new Promise(resolve => process.nextTick(resolve));
}
//# sourceMappingURL=tools.js.map