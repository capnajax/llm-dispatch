'use strict';
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import yaml from 'yaml';
import { assertRecordHasProperties, assertSingleItemRecord, deepClone, pick, reflowText } from '../../lib/tools.js';
import { getLogger, initializeLogger } from '../../lib/logger.js';
import { format } from 'util';
const MODULE = 'types/generator/openai';
function doActions(actions, specs) {
    const log = getLogger(MODULE, doActions);
    const actionDoers = {};
    const result = { successful: 0, failed: 0, skipped: 0 };
    for (const action of actions) {
        if (Object.hasOwn(specs, action.schemaName)) {
            if (!Object.hasOwn(actionDoers, action.action)) {
                result.failed++;
                log.error(`No defined action ${action.action}`);
            }
            else {
                try {
                    actionDoers[action.action](action);
                    result.successful++;
                }
                catch (e) {
                    log.error(`Failed to perform action ${action.action} on ${action.schemaName}: ${e}`);
                    result.failed++;
                }
            }
        }
        else {
            result.skipped++;
        }
    }
    return result;
}
function generate(specs) {
    const log = getLogger(MODULE, generate);
    const result = { types: {}, typeguards: {} };
    const parenAndIndent = (line, indent = 0) => {
        // only affects the first line of a multiline string
        const lines = line.split('\n');
        log.debug(`parenAndIndent(${lines.length} line${lines.length !== 1 ? 's' : ''}): ${line}`);
        if (lines.length > 0) {
            const line1 = lines[0];
            const otherLines = lines.slice(1);
            log.debug(`line1: ${line1}`);
            log.debug(`otherLines: ${otherLines}`);
            const m = line1.match(/^(\s*)([a-z].*)/);
            if (!m) {
                log.debug(`otherLines: ${otherLines}`);
                return line;
            }
            return indent === -1
                ? [`${m[1]}${'( '}${m[2]}`, ...otherLines].join('\n') + ' )'
                : [`${m[1]}${indent === 0 ? `\n${m[1]}( ` : '( '}${m[2]}`,
                    ...otherLines.map(l => `  ${l}`)
                ].join('\n') + `${m[1]})`;
        }
        else {
            return line;
        }
    };
    const generateTest = (name, spec, level) => {
        const log = getLogger(MODULE, `generate.generateTest[${name}]`);
        level ||= 0;
        const h = '  '.repeat(level + 2); // indent level
        const result = [];
        let isAtomic = false; // set to true if parentheses are not necessary
        const trimFirstLine = (lines) => {
            const result = [];
            lines = Array.isArray(lines) ? lines : lines.lines;
            if (lines.length >= 1) {
                result.push(lines[0].trim());
            }
            if (lines.length > 1) {
                result.push(...lines.slice(1));
            }
            return result;
        };
        switch (spec.type) {
            case 'anyOf':
            case 'oneOf':
                log.debug('ANYOF/ONEOF on spec ' +
                    JSON.stringify(spec.union));
                // not really making the distinction between oneOf and anyOf here.
                if (spec.union.length > 0) {
                    const union = spec.union;
                    const itemsOred = union.map((u) => {
                        log.debug(` --> u ${JSON.stringify(u)}`);
                        const gt = generateTest(name, u, level + 1);
                        const gtIsAtomic = !Array.isArray(gt) && gt.isAtomic;
                        const gtLines = Array.isArray(gt) ? gt : gt.lines;
                        let result;
                        if (gtIsAtomic && gt.lines.length === 1) {
                            result = `${gt.lines}`;
                        }
                        else if (!gtIsAtomic &&
                            gtLines.length === 1 &&
                            gtLines[0].indexOf('\n') === -1) {
                            result = parenAndIndent(gtLines[0]);
                        }
                        else {
                            result = `${h}( ${trimFirstLine(gt).join(' &&\n')}\n${h})`;
                        }
                        return result;
                    }).join(' ||\n') + `\n`;
                    log.debug(`itemsOred: ${JSON.stringify(itemsOred)}`);
                    result.push(itemsOred);
                }
                break;
            case 'array':
                result.push(`${h}Array.isArray(${name})`);
                log.debug('Building test for array ' + name);
                const itemName = name.replace(/.*\./, '') + 'Item';
                const items = generateTest(itemName, spec.items, level + 2);
                const itemsAr = Array.isArray(items) ? items : items.lines;
                const itemsIsAtomic = Array.isArray(items) ? false : items.isAtomic;
                if (itemsAr.length === 0) {
                    log.warn(`No test for items of array ${name}`);
                }
                else if (itemsAr.length === 1 && itemsIsAtomic) {
                    result.push(`${h}${name}.every((${itemName}:any) => ${itemsAr[0].trim()})`);
                }
                else {
                    const item = [];
                    item.push(`${h}${name}.every((${itemName}:any) => {`);
                    item.push(`${h}  return (`);
                    item.push(...itemsAr.map((l, i, a) => {
                        return i === a.length - 1 ? l : `${l} &&`;
                    }));
                    item.push(`${h}  );`);
                    item.push(`${h}})`);
                    result.push(item.join('\n'));
                }
                break;
            case 'boolean':
                result.push(`${h}typeof ${name} === 'boolean'`);
                break;
            case 'integer':
            case 'float':
                result.push(`${h}typeof ${name} === 'number'`);
                if (spec.minimum) {
                    result.push(`${h}${name} >= ${spec.minimum}`);
                }
                if (spec.maximum) {
                    result.push(`${h}${name} <= ${spec.maximum}`);
                }
                if (spec.format) {
                    switch (spec.format) {
                        case 'unixtime':
                            // no validation
                            break;
                        default:
                            log.warn(`Unknown integer format "${spec.format}"`);
                    }
                }
                if (spec.type === 'integer') {
                    result.push(`${h}Number.isInteger(${name})`);
                }
                break;
            case 'object':
                log.debug('OBJECT on spec ' +
                    JSON.stringify(spec.object));
                result.push(`${h}( typeof ${name} === 'object' )`);
                const so = spec.object;
                // for the extended class
                const se = spec.extends;
                if (se) {
                    const gt = generateTest(name, specs[se], level);
                    let gtLines = Array.isArray(gt) ? gt : gt.lines;
                    const indent = gtLines[0].match(/^(\s*)  /)?.[1] || '';
                    gtLines[0] = indent + '( ' + gtLines[0].trim();
                    result.push(gtLines.join(' &&\n') + `${indent})`);
                }
                const propertiesTests = [];
                if (so?.properties) {
                    for (const oKey of Object.keys(so.properties)) {
                        const oValue = so.properties[oKey];
                        const gt = generateTest(`${name}.${oKey}`, oValue.spec, level + 1);
                        let gtLines = Array.isArray(gt) ? gt : gt.lines;
                        if (['anyOf', 'oneOf'].includes(oValue.spec.type)) {
                            if (gtLines.length > 1) {
                                const indent = gtLines[0].match(/^(\s*)  /)?.[1] || '';
                                log.debug(`oValue for ${name}/${oKey} requirement is ${oValue.required}`);
                                if (oValue.required) {
                                    gtLines[0] = indent + '( ' + gtLines[0].trim();
                                }
                                else {
                                    gtLines[0] = `${indent}( !! ( ${name} ??\n` +
                                        `(${indent}( ${gtLines[0].trim()}) )`;
                                }
                                gtLines.push(`${indent})`);
                            }
                            else if (gtLines.length === 1) {
                                const indent = gtLines[0].match(/^(\s*)  /)?.[1] || '';
                                if (!oValue.required) {
                                    gtLines[0] =
                                        `${indent}( !! ( ${name} ?? (${gtLines[0].trim()}) ))`;
                                }
                            }
                        }
                        log.debug(`gt = ${JSON.stringify(gtLines)}`);
                        propertiesTests.push(...gtLines);
                    }
                }
                if (spec.nullable !== true) {
                    result.push(`${h}( ${name} !== null )`, ...propertiesTests);
                }
                break;
            case 'null':
                result.push(`${h}(${name} === null || ${name} === undefined)`);
                isAtomic = true;
                break;
            case 'ref':
                result.push(`${h}is${spec.ref}(${name})`);
                isAtomic = true;
                break;
            case 'string':
                if (spec.enum) {
                    result.push(`${h}${JSON.stringify(spec.enum)}.includes(${name})`);
                    isAtomic = true;
                }
                else {
                    result.push(`(${h}typeof ${name} === 'string')`);
                    isAtomic = true;
                }
                break;
            default:
                result.push(`${h}// ${name} is ${spec.type}`);
                log.warn(`No test generator for spec.type == ${spec.type}`);
                break;
        }
        if (spec.nullable) {
            const newResult = [
                `( ${name} === null || (`,
                result.map(r => `  ${r}`).join(` &&\n${h}`),
                '))'
            ];
            result.length = 0;
            result.push(newResult.join('\n'));
        }
        return isAtomic ? { isAtomic: true, lines: result } : result;
    };
    const generateType = (name, spec) => {
        const resultLines = [];
        const inner = generateTypeInner(name, spec);
        const ex = runConfig.types.export.includes(name) ? 'export ' : '';
        if (inner.length > 0) {
            const inner1 = inner.shift();
            if (spec.description) {
                resultLines.push(`/**`);
                resultLines.push(...spec.description
                    .split('\n')
                    .map(l => reflowText(l.trim(), 76))
                    .filter(l => !!l)
                    .map(l => ` *  ${l}`));
                if (spec.examples) {
                    resultLines.push(' *', ' * Examples:', ' *', ...spec.examples.map(l => ` *. ${l}`));
                }
                resultLines.push(' */');
            }
            resultLines.push(spec.type === 'object'
                ? /\{$/.test(inner1)
                    ? `${ex}interface ${name} ${inner1.replace(/((.* )& )\{/, `extends $2{`)}`
                    : inner1
                : `${ex}type ${name} = ${inner1}`);
            if (inner.length > 0) {
                resultLines.push(...inner.map(l => l.startsWith('}') ? l : `  ${l}`));
            }
        }
        return resultLines.join('\n') + ';';
    };
    const generateTypeInner = (name, spec) => {
        const result = [];
        switch (spec.type) {
            case 'anyOf':
            case 'oneOf':
                result.push(spec.union.map((t, i) => {
                    const gt = generateTypeInner(`${name}[${i}]`, t);
                    log.debug(`ANYOF/ONEOF ${name}[${i}] - t === ${JSON.stringify(t)}`);
                    log.debug(`        --> ${name}[${i}] - gt === ${JSON.stringify(gt)}`);
                    return gt.join(' ');
                }).join('|').replace(/ +/g, ' '));
                log.debug(`==RESULT==> ${result[result.length - 1]}`);
                break;
            case 'array':
                result.push(...(generateTypeInner(`${name}[]`, spec.items)
                    .map((l, i, a) => {
                    if (['anyOf', 'allOf'].includes(spec.type)) {
                        if (i === 0) {
                            l = `(${l}`;
                        }
                        else if (i === a.length - 1) {
                            l = `${l})`;
                        }
                    }
                    if (i === a.length - 1) {
                        l = `${l}[]`;
                    }
                    return l;
                })));
                break;
            case 'boolean':
                result.push('boolean');
                break;
            case 'integer':
            case 'float':
                result.push('number');
                break;
            case 'object':
                (() => {
                    const o = spec;
                    if (o.object?.properties) {
                        result.push(o.extends ? `${o.extends} & {` : '{');
                        const items = [];
                        const addCommaToLastItem = () => {
                            if (items.length >= 1) {
                                items[items.length - 1] = items[items.length - 1] + ',';
                            }
                        };
                        Object.entries(o.object.properties).forEach(([p, v], i) => {
                            const t = generateTypeInner(p, v.spec);
                            addCommaToLastItem();
                            if (v.spec.description) {
                                let d = v.spec.description?.split('\n') || [];
                                if (d.length && d[d.length - 1] === '') {
                                    d = d?.slice(0, d.length - 1);
                                }
                                d = d.map(dt => ` *  ${dt}`);
                                {
                                    const dCopy = [...d];
                                    d = [];
                                    for (const di of dCopy) {
                                        d.push(...reflowText(di, 72).split('\n'));
                                    }
                                }
                                if (v.spec.examples) {
                                    let exAny = v.spec?.examples || [];
                                    log.debug(`${name} exAny (${typeof exAny}) == ${JSON.stringify(exAny)}`);
                                    let ex = (Array.isArray(exAny) ? exAny : [exAny]).map(e => {
                                        return typeof e === 'string' ? e : `${e}`;
                                    });
                                    log.debug(`${name} ex == ${JSON.stringify(ex)}`);
                                    ex = ex.map((e) => {
                                        log.debug(`${name} e:string = ${e}`);
                                        return e.split('\n').map(((ee, ii, vv) => {
                                            if (ii === vv.length - 1 && ee.trim() === '') {
                                                return '';
                                            }
                                            else {
                                                return ` *  - \`${ee.trim()}\``;
                                            }
                                        })).filter(l => l != '').join('\n');
                                    });
                                    if (ex.length > 0) {
                                        d.push(' *', ` *  Example${(ex.length === 1) ? '' : 's'}:`, ...ex);
                                    }
                                }
                                items.push('/**', ...d, ' */');
                            }
                            items.push(`${p}${v.required ? ':' : '?:'} ${t.shift()}`);
                            if (t.length) {
                                items.push(...t.map(tt => `  ${tt}`));
                            }
                        });
                        if (o.object?.additionalProperties) {
                            const ap = o.object.additionalProperties;
                            const t = typeof ap === 'boolean'
                                ? 'any'
                                : (['integer', 'float'].includes(ap) ? 'number' : ap);
                            addCommaToLastItem();
                            items.push(`[key: string]: ${t}`);
                        }
                        result.push(...items);
                        log.debug('Object items ' + JSON.stringify(items));
                        result.push('}');
                    }
                    else {
                        result.push('Record<string, any>');
                    }
                })();
                break;
            case 'null':
                result.push('null');
                break;
            case 'ref':
                result.push(spec.ref);
                break;
            case 'string':
                if (spec.enum) {
                    result.push(`${spec.enum?.map(s => {
                        return `"${s.replace('"', '\\"')}"`;
                    }).join('|')}`);
                }
                else {
                    result.push('string');
                }
                break;
            default:
                log.warn(`Type ${spec.type} for ${name} not recognized, cannot create typedef`);
        }
        return result;
    };
    for (const specName of Object.keys(specs)) {
        log.info(`Generating test for ${specName}`);
        const spec = specs[specName];
        const ex = runConfig.types.export.includes(specName) ? 'export ' : '';
        log.debug('runConfig.types.export === ', JSON.stringify(runConfig.types.export));
        log.debug('Generating typeguard for specName ' + specName + ', ex === "' + ex + '"');
        const generatedTest = generateTest('o', spec);
        const testLines = Array.isArray(generatedTest)
            ? generatedTest
            : generatedTest.lines;
        const linesIsAtomic = Array.isArray(generatedTest)
            ? false
            : generatedTest.isAtomic;
        const lineIsSingle = (l) => {
            return l.length === 1 && l.indexOf('\n') === -1;
        };
        const type = generateType(specName, spec);
        const parenthesizeLines = () => {
            return testLines.map((l, i) => {
                return linesIsAtomic
                    ? l
                    : parenAndIndent(l, lineIsSingle(l) ? -1 : i);
            });
        };
        if (type) {
            result.types[specName] = type;
        }
        if (testLines.length > 0) {
            if (testLines.length === 1 && testLines[0].indexOf('\n') === -1) {
                result.typeguards[specName] =
                    `${ex}function is${specName}(o: any): o is ${specName} {\n` +
                        `  return ${testLines[0].trim()};\n}`;
            }
            else {
                result.typeguards[specName] =
                    `${ex}function is${specName}(o: any): o is ${specName} {\n` +
                        `  return (\n${parenthesizeLines().join(' &&\n')}\n  );\n}`;
            }
        }
    }
    if (process.argv[3]) {
        const filename = `${process.argv[3]}.ts`;
        log.info(`Generated types and typeguards to ${filename}:`);
        const valuesSorted = (record, isExport, isTypeGuard) => {
            return Object.keys(record)
                .sort()
                .filter((name) => {
                const isExportable = runConfig.types.export
                    .includes(name);
                return isExport === isExportable;
            })
                .map((name) => record[name]);
        };
        let fileContent = [
            [...valuesSorted(result.types, true, false),
                ...valuesSorted(result.typeguards, true, true)
            ].join('\n\n'),
            [...valuesSorted(result.types, false, false),
                ...valuesSorted(result.typeguards, false, true)
            ].join('\n\n')
        ];
        if (runConfig.blocks?.mid) {
            fileContent = [fileContent.join('\n\n' + runConfig.blocks.mid + '\n')];
        }
        ;
        runConfig.blocks?.head && fileContent.unshift(runConfig.blocks?.head + '\n');
        runConfig.blocks?.foot && fileContent.push('\n' + runConfig.blocks?.foot);
        writeFileSync(filename, fileContent.join('\n'));
    }
    else {
        log.info('Generated types:');
        for (const t of Object.values(result.types)) {
            console.log(t);
        }
        log.info('Generated typeguards:');
        for (const t of Object.values(result.typeguards)) {
            console.log(t);
        }
    }
    return result;
}
const runConfigPathname = process.argv[2];
const runConfig = (() => {
    const specPathname = path.resolve(runConfigPathname);
    const specFile = readFileSync(specPathname);
    const spec = yaml.parse(specFile.toString());
    Object.freeze(spec.types);
    Object.freeze(spec.types.export);
    return spec;
})();
async function swaggar2TypeCode() {
    await initializeLogger(runConfig);
    const log = getLogger(MODULE, swaggar2TypeCode);
    log.debug(format('Log started with spec %s', JSON.stringify(runConfig.logging)));
    log.debug(JSON.stringify(runConfig));
    const swaggarPathname = path.resolve(path.dirname(runConfigPathname), runConfig.swaggar);
    const swaggar = yaml.parse((await readFileSync(swaggarPathname)).toString());
    log.debug(format('Swagger at %s read:', swaggarPathname));
    log.debug(format(' --> %s', Object.keys(swaggar)));
    const schemas = swaggar.components.schemas;
    const typesQueue = [...(runConfig.types.export || [])];
    const normalizedSpecs = runConfig.types.specifiedTypes
        ? deepClone(runConfig.types.specifiedTypes)
        : {};
    const typesProcessed = Object.keys(normalizedSpecs);
    log.info(format('Scanning for types %s', JSON.stringify(typesQueue)));
    const addRefType = (ref) => {
        const result = ref.replace(new RegExp('#/components/schemas/'), '');
        typesQueue.push(result);
        return result;
    };
    const normalizers = {
        anyOf: function (name, schema) {
            assertRecordHasProperties(name, schema, 'oneOf:array');
            const result = {
                type: 'anyOf',
                union: schema.anyOf.map((o, idx) => {
                    if (Object.hasOwn(o, '$ref')) {
                        assertSingleItemRecord(`${name}[${idx}]`, pick(o, ['description'], false), '$ref', 'string');
                        return { type: 'ref', ref: addRefType(o.$ref) };
                    }
                    else {
                        return normalizePropertySpecType(`${name}[${idx}]`, o, true);
                    }
                })
            };
            dde(result, schema, 'discriminator');
            return result;
        },
        array: function (name, schema) {
            assertRecordHasProperties(name, schema, 'items');
            const result = {
                type: 'array',
                items: normalizePropertySpecType(`${name}[]`, schema.items, true)
            };
            dde(result, schema, 'minItems');
            return result;
        },
        boolean: function (name, schema) {
            const result = {
                type: 'boolean'
            };
            dde(result, schema);
            return result;
        },
        integer: function (_name, schema) {
            const result = {
                type: 'integer'
            };
            dde(result, schema, 'minimum', 'maximum', 'format');
            return result;
        },
        null: function (_name, schema) {
            const result = {
                type: 'null'
            };
            dde(result, schema);
            return result;
        },
        number: function (_name, schema) {
            const result = {
                type: 'float'
            };
            dde(result, schema, 'minimum', 'maximum');
            return result;
        },
        object: function (name, schema) {
            const result = {
                type: 'object',
                object: {
                    properties: {},
                    additionalProperties: false
                }
            };
            dde(result, schema);
            if (Object.hasOwn(schema, 'allOf')) {
                // This object mixes objects together
                assertSingleItemRecord(`${name}`, schema, 'allOf', 'array');
                const mixType = [];
                schema.allOf.forEach((item, idx) => {
                    if (typeof item !== 'object') {
                        throw new Error(`${name}[${item}] must be an object.`);
                    }
                    if (Array.isArray(item)) {
                        throw new Error(`${name}[${item}] must not be an array.`);
                    }
                    if (Object.hasOwn(item, '$ref')) {
                        assertSingleItemRecord(`${name}[${idx}]`, pick(item, ['description'], false), '$ref', 'string');
                        const refType = addRefType(item.$ref);
                        result.extends = refType;
                    }
                    else {
                        if (item.type !== 'object') {
                            throw new Error(`${name}[${item}] object "allOf" members must ` +
                                'either be a $ref or have a member "type" that is set to ' +
                                '"object"');
                        }
                        mixType.push(normalizers.object(`${name}[${idx}]`, item));
                    }
                });
                if (mixType.length > 1) {
                    log.warn(`${name} has more than one main object which is not
            supported at this time. This will be inaccurate.`);
                }
                if (mixType.length > 0) {
                    result.object ||= { properties: {} };
                    if (mixType[0].object) {
                        result.object.properties = mixType[0].object.properties;
                    }
                }
            }
            else {
                // this is a primary definition of an object
                assertRecordHasProperties(name, schema, 'type:string', 'properties?:object', 'required?:array', 'additionalProperties?:object');
                for (const p of Object.keys(schema?.properties || [])) {
                    log.debug(`${name}.${p}`);
                    if ((runConfig.types.omissions && runConfig.types.omissions[name])) {
                        if (runConfig.types.omissions[name].includes(p)) {
                            log.info(`skipping ${name}.${p} per omissions config`);
                            continue;
                        }
                    }
                    const normalizedP = normalizePropertySpecType(`${name}.${p}`, schema.properties[p], true);
                    result.object ||= { properties: {} };
                    result.object.properties[p] = {
                        name: p,
                        spec: normalizedP,
                        required: !!(schema.required?.includes(p))
                    };
                }
                if (schema.additionalProperties) {
                    if (typeof schema.additionalProperties === 'object') {
                        assertRecordHasProperties(`${name}.additionalProperties`, schema.additionalProperties, 'type:string');
                        result.object ||= { properties: {} };
                        result.object.additionalProperties =
                            schema.additionalProperties.type;
                    }
                    else if (typeof schema.additionalProperties === 'boolean') {
                        result.object ||= { properties: {} };
                        result.object.additionalProperties = schema.additionalProperties;
                    }
                    else {
                        log.error(`object ${name}.additionalProperties of unknown format`);
                    }
                }
            }
            return result;
        },
        oneOf: function (name, schema) {
            assertRecordHasProperties(name, schema, 'oneOf:array');
            const result = {
                type: 'oneOf',
                union: schema.oneOf.map((o, idx) => {
                    if (Object.hasOwn(o, '$ref')) {
                        assertSingleItemRecord(`${name}[${idx}]`, pick(o, ['description'], false), '$ref', 'string');
                        return { type: 'ref', ref: addRefType(o.$ref) };
                    }
                    else {
                        return normalizePropertySpecType(`${name}[${idx}]`, o, true);
                    }
                })
            };
            dde(result, schema, 'discriminator');
            return result;
        },
        string: function (_name, schema) {
            const result = {
                type: 'string'
            };
            dde(result, schema, 'enum');
            return result;
        }
    };
    const dde = (result, schema, ...otherProperties) => {
        // modifies result inline
        schema.description && (result.description = schema.description);
        schema.default && (result.default = schema.default);
        schema.example && (result.examples = [schema.example]);
        schema.nullable && (result.nullable = schema.nullable);
        for (const p of otherProperties.flat()) {
            schema[p] && (result[p] = schema[p]);
        }
    };
    const normalizePropertySpecType = (name, schema, refTypeOk = false) => {
        assertRecordHasProperties(name, schema, 'type:string');
        if (Object.keys(normalizers).includes(schema.type)) {
            log.debug(`Normalizing ${name} - ${schema.type}`);
            return normalizers[schema.type](name, schema);
        }
        else if (refTypeOk && schema.$ref) {
            log.debug(`Normalizing ${name} - $ref`);
            return { type: 'ref', ref: addRefType(schema.$ref) };
        }
        else if (schema.allOf) {
            log.debug(`Normalizing ${name} - allOf`);
            return normalizers.object(name, schema);
        }
        else if (schema.oneOf) {
            log.debug(`Normalizing ${name} - oneOf`);
            return normalizers.oneOf(name, schema);
        }
        else if (schema.anyOf) {
            log.debug(`Normalizing ${name} - anyOf`);
            return normalizers.anyOf(name, schema);
        }
        else {
            throw new Error(`Normalizing ${name} has an UNKNOWN object type ${schema.type} // ${JSON.stringify(schema).substring(0, 100)}`);
        }
    };
    // read all the property types
    const typesRead = { succesful: 0, failed: 0 };
    while (typesQueue.length) {
        const typeName = typesQueue.shift();
        const schema = schemas[typeName];
        if (typesProcessed.includes(typeName)) {
            continue;
        }
        log.info(format('Reading type "%s"', typeName));
        try {
            normalizedSpecs[typeName] =
                normalizePropertySpecType(typeName, schema);
            typesRead.succesful++;
        }
        catch (e) {
            typesRead.failed++;
            if (e instanceof Error) {
                log.error(e.message);
                log.error(e.stack);
            }
            else {
                log.error(e);
            }
        }
    }
    log.info(`Successfully read ${typesRead.succesful} types`);
    if (typesRead.failed) {
        log.info(`Failed to read ${typesRead.failed} types`);
    }
    if (process.argv[3]) {
        writeFileSync(`${process.argv[3]}-model.json`, JSON.stringify(normalizedSpecs, null, 2));
    }
    else {
        console.log(JSON.stringify(normalizedSpecs, null, 3));
    }
    // do actions
    if (runConfig.types.postReadActions?.length) {
        const actionsResult = doActions(runConfig.types.postReadActions, normalizedSpecs);
        log.info(`Successfully handled ${actionsResult.successful} actions.`);
        if (actionsResult.failed) {
            log.info(`Failed to handle ${actionsResult.failed} actions.`);
        }
        if (actionsResult.skipped) {
            log.info(`Skipped ${actionsResult.skipped} actions.`);
        }
    }
    else {
        log.info(`No post-read actions to perform`);
    }
    generate(normalizedSpecs);
}
swaggar2TypeCode();
//# sourceMappingURL=openai.js.map