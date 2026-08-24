import { format } from "node:util";
import { error } from "../lib/exceptions.js";
import { INTERNAL_ERROR } from "./generated/error-codes.js";
import { getLogger } from "../lib/logger.js";
const MODULE = 'types/types-tools';
export const NULLABLE_OBJECT = 'nullable object';
export const E = 'error';
export function validateNumberRange(min, max, o, path) {
    const result = [];
    const rangeString = path
        ? min !== null && max !== 0
            ? ` between ${min} and ${max} inclusive`
            : min !== null
                ? ` at least ${min}`
                : max !== null
                    ? ` no higher than ${max}`
                    : ''
        : '';
    if (typeof o === 'number') {
        if (min !== null && o < min) {
            result.push(path
                ? `${path} value is too low. It must be${rangeString}.`
                : E);
        }
        if (max !== null && o > max) {
            result.push(path
                ? `${path} value is too low. It must be${rangeString}.`
                : E);
        }
    }
    else {
        result.push(path
            ? `${path} must be a number${rangeString ? ' that\'s' : ''}${rangeString}]`
            : E);
    }
    return result;
}
export function validateStringEnum(permittedValues, o, path) {
    const result = [];
    if (typeof o === 'string') {
        if (!permittedValues.includes(o)) {
            result.push(path ? `${path} not in [${permittedValues.join(', ')}]` : E);
        }
    }
    else {
        result.push(path
            ? `${path} must be a string with value in ${permittedValues.join(', ')}]`
            : E);
    }
    return result;
}
export function validateRecord_string_any(o, path) {
    return validateRecord_string_validator(() => [], o, path);
}
export function validateRecord_string_string(o, path) {
    return validateRecord_string_validator((o, path) => {
        if (typeof o !== 'string') {
            return [path ? `${path} is not a string` : E];
        }
        else {
            return [];
        }
    }, o, path);
}
export function validateRecord_string_validator(validateFn, o, path) {
    const result = [];
    if (typeof o === 'object') {
        for (const k in o) {
            if (typeof k === 'string') {
                const subjectPath = path ? `${path}.${k}` : path;
                result.push(...validateFn(o[k], subjectPath));
                if (result.length && !path) {
                    break;
                }
            }
            else {
                result.push(path ? `${path} key ${k} is not a string` : E);
                if (!path) {
                    break;
                }
            }
        }
    }
    else {
        result.push(path ? `${path}:Record<string, string> must be an object` : E);
    }
    return result;
}
export function doTests(rop, ...tests) {
    const [result, o, path] = rop;
    const tf = tests.flat();
    const doTest = (subject, test, required = true) => {
        switch (typeof test) {
            case 'function':
                return test(subject, required);
            case 'boolean':
                return test;
            case 'string':
                switch (test) {
                    case NULLABLE_OBJECT:
                        return typeof subject === 'object';
                    case 'object':
                        return typeof subject === 'object' && subject !== null;
                    default:
                        return typeof subject === test;
                }
            default:
                throw error(INTERNAL_ERROR);
        }
    };
    while ((path || !result.length) && tf.length) {
        const test = tf.shift();
        if (test === undefined)
            throw error(INTERNAL_ERROR);
        const subject = test.member
            ? typeof o === 'object' && o !== null
                ? o[test.member]
                : undefined
            : o;
        if (subject === undefined && test.required === false) {
            continue;
        }
        const subjectPath = path && test.member ? `${path}.${test.member}` : path;
        if (!doTest(subject, test.fn, test.required)) {
            // failed test
            if (subjectPath) {
                if (test.message !== null) {
                    result.push(format(test.message, subjectPath));
                }
            }
            else {
                test.message && result.push(E);
            }
        }
    }
}
export function itemsFromTuples(...tuples) {
    return tuples.map(t => {
        let result;
        if (typeof t === 'function') {
            result = { required: true, fn: t, message: null };
        }
        else {
            const [required, fn, message, member] = t;
            result = { required, fn, message: message || null };
            member && (result.member = member);
        }
        return result;
    });
}
export function logResult(result, logger) {
    const log = logger || getLogger(MODULE, logResult);
    if (result.length) {
        result.forEach(log.debug);
    }
    else {
        log.silly('[no errors]');
    }
}
/**
 * Test function from validator
 * @param fn the validator
 * @param path the path of the object
 */
export function tv(result, fn, path, member, required) {
    if (typeof member === 'boolean') {
        required = member;
        member = undefined;
    }
    if (required === undefined) {
        required = true;
    }
    return (oo) => {
        let errors = [];
        let subjectPath = path;
        let subject = oo;
        let doTests = true;
        if (member) {
            if (typeof subject === 'object' && subject !== null) {
                subject = subject[member];
                subjectPath = path ? `${path}.${member}` : path;
                if (subject === undefined) {
                    if (required) {
                        errors = [path ? `${path}.${member} is required` : E];
                    }
                    else {
                        doTests = false;
                    }
                }
            }
            else if (subject === null) {
                errors = [path ? `${path} is null` : E];
            }
            else {
                errors = [path ? `${path} is not an object` : E];
            }
        }
        if (!errors.length && doTests) {
            if (subject === undefined) {
                errors = [path ? `${subjectPath} is undefined, object expected.` : E];
            }
            else if (subject === null) {
                errors = [path ? `${subjectPath} is null, object expected.` : E];
            }
            else {
                errors = fn(subject, subjectPath);
            }
        }
        result.push(...errors);
        return errors.length === 0;
    };
}
/**
 * Test function from validator for arrays
 * @param fn the validator
 * @param path the path of the object
 */
export function tva(result, fn, path, member, required) {
    if (typeof member === 'boolean') {
        required = member;
        member = undefined;
    }
    if (required === undefined) {
        required = true;
    }
    return (oo) => {
        let errors = [];
        let subjectPath = path;
        let subject = oo;
        let doTests = true;
        if (member) {
            if (typeof subject === 'object' && subject !== null) {
                subject = subject[member];
                subjectPath = path ? `${path}.${member}` : path;
                if (subject === undefined) {
                    if (required) {
                        errors = [path ? `${path}.${member} is required` : E];
                    }
                    else {
                        doTests = false;
                    }
                }
            }
            else if (subject === null) {
                errors = [path ? `${oo} is null` : E];
            }
            else {
                errors = [path ? `${oo} is not an object` : E];
            }
        }
        if (doTests && !errors.length) {
            if (Array.isArray(subject)) {
                errors.push(...(subject.map((ooi, i) => {
                    const itemSubjectPath = subjectPath
                        ? `${subjectPath}[${i}]`
                        : undefined;
                    return fn(ooi, itemSubjectPath);
                })).flat());
            }
            else {
                errors.push(path ? `${subjectPath} must be an array` : E);
            }
        }
        result.push(...errors);
        return errors.length === 0;
    };
}
export function tvr(result, fn, path, member, required) {
    return tv(result, (o, path) => {
        return validateRecord_string_validator(fn, o, path);
    }, path, member, required);
}
//# sourceMappingURL=types-tools.js.map