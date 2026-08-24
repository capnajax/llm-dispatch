'use strict';
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import yaml from 'yaml';
import {
  assertRecordHasProperties, assertSingleItemRecord, deepClone, pick,
  reflowText
} from '../../lib/tools.js';
import { getLogger, initializeLogger } from '../../lib/logger.js';
import { LoggerConfig } from '../logger-types.js';
import { format } from 'util';

const MODULE = 'types/generator/openai';

interface PRActionType {
  schemaName: string,
  action: string
}
interface SpecFile extends LoggerConfig {
  swaggar: string,
  blocks?: {
    head?: string,
    mid?: string,
    foot?: string,
  },
  types: {
    export: string[],
    omissions: Record<string, string[]>,
    postReadActions?: (PRActionType & Record<string, any>)[],
    specifiedTypes?: Record<string, PropertySpecType>
  },
  validators?: Record<string, string>
}

type RefType = {
  type: 'ref',
  ref: string
};

interface PropertySpecType {
  default?: any,
  description?: string,
  deprecated?: boolean,
  examples?: string[],
  nullable?: boolean,
  type: string
}

interface AnyOfType extends PropertySpecType {
  type: 'anyOf',
  union: (RefType|PropertySpecType)[],
}
interface ArrayType extends PropertySpecType {
  items: RefType|PropertySpecType,
  type: 'array',
  minItems?: number
}
interface BooleanType extends PropertySpecType {
  type: 'boolean'
}
interface NullType extends PropertySpecType {
  type: 'null'
}
interface ObjectType extends PropertySpecType {
  type: 'object',
  extends?: string,
  object?: {
    properties: Record<string, (
      TypeFromSchema &
       { required: boolean }
    )>,
    additionalProperties?: boolean|'integer'|'float'|'object'|'string'|'array'
  }
}
interface OneOfType extends PropertySpecType {
  type: 'oneOf',
  union: (RefType|PropertySpecType)[],
  discriminator?: string
}
interface NumberType extends PropertySpecType {
  format?: 'unixtime',
  minimum?:number,
  maximum?:number,
  type: 'integer'|'float'
}
interface StringType extends PropertySpecType {
  type: 'string',
  pattern?: string,
  enum?: string[],
}
interface TypeFromSchema {
  name?: string,
  spec: RefType|PropertySpecType
}

function doActions(
  actions:(PRActionType & Record<string, any>)[],
  specs: Record<string, PropertySpecType>
):{successful: number, failed: number, skipped: number} {
  const log = getLogger(MODULE, doActions);

  type ActionDoersType = (action: PRActionType & Record<string, any>) => void;
  const actionDoers:Record<string, ActionDoersType> = {




  }
  const result = { successful: 0, failed: 0, skipped: 0};

  for (const action of actions) {
    if (Object.hasOwn(specs, action.schemaName)) {
      if (!Object.hasOwn(actionDoers, action.action)) {
        result.failed++;
        log.error(`No defined action ${action.action}`)
      } else {
        try {
          actionDoers[action.action](action);
          result.successful++;
        } catch(e) {
          log.error(`Failed to perform action ${action.action} on ${
            action.schemaName}: ${e}`);
          result.failed++;
        }
      }
    } else {
      result.skipped++;
    }
  }
  return result;
}

/**
 * Returns a list of interfaces
 */
interface GenerateResult {
  types: Record<string, string>,
  validators: Record<string, string>
}

function generate(specs: Record<string, PropertySpecType>): GenerateResult {
  const log = getLogger(MODULE, generate);
  const result = {types: {}, validators: {}} as GenerateResult;

  const generateType = (name: string, spec: PropertySpecType): string|null => {
    const resultLines:string[] = [];
    const inner = generateTypeInner(name, spec);
    const ex = runConfig.types.export.includes(name) ? 'export ' : '';
    if (inner.length > 0) {
      const inner1 = inner.shift() as string;
      if (spec.description) {
        resultLines.push(`/**`);
        resultLines.push(
          ...spec.description
            .split('\n')
            .map(l => reflowText(l.trim(), 76))
            .filter(l => !!l)
            .map(l => ` *  ${l}`)
        );
        if (spec.examples) {
          resultLines.push(' *', ' * Examples:', ' *',
            ...spec.examples.map(l => ` *. ${l}`));
        }
        resultLines.push(' */')
      }
      resultLines.push(spec.type === 'object'
        ? /\{$/.test(inner1)
          ? `${ex}interface ${name} ${inner1.replace(/((.* )& )\{/, `extends $2{`)}`
          : inner1
        : `${ex}type ${name} = ${inner1}`
      );
      if (inner.length > 0) {
        resultLines.push(...inner.map(l => l.startsWith('}') ? l : `  ${l}`));
      }
    }
    return resultLines.join('\n') + ';';
  }

  const generateTypeInner = (
    name: string, spec: RefType|PropertySpecType
  ):string[] => {
    const result:string[] = [];

    switch (spec.type) {
    case 'anyOf':
    case 'oneOf':      
      result.push((spec as (AnyOfType|OneOfType)).union.map((t,i) => {
        const gt = generateTypeInner(`${name}[${i}]`, t);
        log.debug(`ANYOF/ONEOF ${name}[${i}] - t === ${JSON.stringify(t)}`);
        log.debug(`        --> ${name}[${i}] - gt === ${JSON.stringify(gt)}`);
        return gt.join(' ');
      }).join('|').replace(/ +/g, ' '));
      log.debug(`==RESULT==> ${result[result.length-1]}`)
      break;
    case 'array':
      result.push(
        ...(generateTypeInner(`${name}[]`, (spec as ArrayType).items)
            .map((l,i,a) => {
              if (['anyOf','allOf'].includes(spec.type)) {
                if (i === 0) {
                  l = `(${l}`;
                } else if (i === a.length - 1) {
                  l = `${l})`;
                }
              }
              if (i === a.length - 1) {
                l = `${l}[]`
              }
              return l;
            })
          )
      );
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
        const o = spec as ObjectType;
        if (o.object?.properties) {
          result.push(o.extends ? `${o.extends} & {` : '{');
          const items:string[] = [];
          const addCommaToLastItem = () => {
            if (items.length >= 1) {
              items[items.length-1] = items[items.length-1] + ',';
            }
          }
          Object.entries(o.object.properties).forEach(([p,v], i) => {            
            const t = generateTypeInner(p, v.spec);
            addCommaToLastItem();
            if ((v.spec as PropertySpecType).description) {
              let d =
                (v.spec as PropertySpecType).description?.split('\n') || [];
              if (d.length && d[d.length - 1] === '') {
                d = d?.slice(0, d.length-1);
              }
              d = d.map(dt => ` *  ${dt}`);
              { const dCopy = [...d];
                d = [];
                for (const di of dCopy) {
                  d.push(...reflowText(di, 72).split('\n'));
                }
              }
              if ((v.spec as PropertySpecType).examples) {
                let exAny:string|string[]|number|number[] =
                  (v.spec as PropertySpecType)?.examples || [];
                log.debug(`${name} exAny (${typeof exAny}) == ${JSON.stringify(exAny)}`);
                let ex:string[] =
                  (Array.isArray(exAny) ? exAny : [exAny]).map(e => {
                    return typeof e === 'string' ? e : `${e}`;
                  });
                log.debug(`${name} ex == ${JSON.stringify(ex)}`);
                ex = ex.map((e:string) => {
                  log.debug(`${name} e:string = ${e}`);
                  return e.split('\n').map(((ee,ii,vv):string => {                      
                    if (ii === vv.length - 1 && ee.trim() === '') {
                      return '';
                    } else {
                      return ` *  - \`${ee.trim()}\``
                    }
                  })).filter(l => l != '').join('\n')
                });
                if (ex.length > 0) {
                  d.push(' *', ` *  Example${(ex.length===1)?'':'s'}:`, ...ex);
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
              : ( ['integer', 'float'].includes(ap) ? 'number' : ap );
            addCommaToLastItem();
            items.push(`[key: string]: ${t}`);
          }
          result.push(...items);
          log.debug('Object items ' + JSON.stringify(items));
          result.push('}');
        } else {
          result.push('Record<string, any>');
        }
      })()
      break;
    case 'null':
      result.push('null');
      break;
    case 'ref':
      result.push((spec as RefType).ref);
      break;
    case 'string':
      if ((spec as StringType).enum) {
        result.push(`${(spec as StringType).enum?.map(s => {
          return `"${s.replace('"','\\"')}"`
        }).join('|')}`)
      } else {
        result.push('string');
      }
      break;
    default:
      log.warn(
        `Type ${spec.type} for ${name} not recognized, cannot create typedef`
      );
    }
    return result;
  }

  for (const specName of Object.keys(specs)) {
    log.info(`Generating type for ${specName}`);
    const spec = specs[specName];
    log.debug('runConfig.types.export === ', JSON.stringify(runConfig.types.export));
    const type = generateType(specName, spec);

    if (type) {
      result.types[specName] = type;
    }

    log.info(`Generating validator for ${specName}`);
    result.validators[specName] =
      `export function validate${specName}(` +
      `o: any, path?: string): string[] {\n` +
      `  return checkNamed(${JSON.stringify(specName)}, o, path);\n` +
      `}`;
  }

  if (process.argv[3]) {
    const filename = `${process.argv[3]}.ts`
    log.info(`Generated types and validators to ${filename}:`);
    const valuesSorted = (
      record: Record<string, string>,
      isExport: boolean
    ): string[] => {
      return Object.keys(record)
        .sort()
        .filter((name) => {
          const isExportable = runConfig.types.export
            .includes(name);
          return isExport === isExportable;
        })
        .map((name) => record[name]);
    };

    let fileContent: string[] = [
      [ ...valuesSorted(result.types, true),
        ...valuesSorted(result.validators, true)
      ].join('\n\n'),
      [ ...valuesSorted(result.types, false),
        ...valuesSorted(result.validators, false),
        generateValidatorRuntime(specs)
      ].join('\n\n')
    ];
    if (runConfig.blocks?.mid) {
      fileContent = [fileContent.join('\n\n'+runConfig.blocks.mid+'\n')];
    };
    runConfig.blocks?.head && fileContent.unshift(runConfig.blocks?.head + '\n');
    runConfig.blocks?.foot && fileContent.push('\n' + runConfig.blocks?.foot);

    writeFileSync(
      filename,
      fileContent.join('\n')
    );
  } else {
    log.info('Generated types:');
    for (const t of Object.values(result.types)) {
      console.log(t);
    }
    log.info('Generated validators:');
    for (const t of Object.values(result.validators)) {
      console.log(t);
    }
  }

  return result;
}

function generateValidatorRuntime(
  specs: Record<string, PropertySpecType>,
): string {
  const toValidationSpec = (
    spec: RefType | PropertySpecType,
  ): Record<string, unknown> => {
    const source = spec as Record<string, any>;
    const result: Record<string, unknown> = { type: spec.type };

    for (const name of [
      'nullable',
      'ref',
      'enum',
      'pattern',
      'minimum',
      'maximum',
      'minItems',
      'extends',
    ]) {
      if (Object.hasOwn(source, name)) {
        result[name] = source[name];
      }
    }

    if (source.union) {
      result.union = source.union.map(toValidationSpec);
    }
    if (source.items) {
      result.items = toValidationSpec(source.items);
    }
    if (source.object) {
      result.object = {
        properties: Object.fromEntries(
          Object.entries(source.object.properties ?? {}).map(
            ([name, property]: [string, any]) => [
              name,
              {
                required: property.required,
                spec: toValidationSpec(property.spec),
              },
            ],
          ),
        ),
        additionalProperties: source.object.additionalProperties,
      };
    }

    return result;
  };

  const validationSpecs = Object.fromEntries(
    Object.entries(specs).map(([name, spec]) => [name, toValidationSpec(spec)]),
  );

  return `type ValidationSpec = {
  type: string;
  nullable?: boolean;
  ref?: string;
  union?: ValidationSpec[];
  items?: ValidationSpec;
  enum?: string[];
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minItems?: number;
  extends?: string;
  object?: {
    properties?: Record<string, {
      required: boolean;
      spec: ValidationSpec;
    }>;
    additionalProperties?: boolean | string;
  };
};

type ObjectShape = {
  properties: Record<string, {
    required: boolean;
    spec: ValidationSpec;
  }>;
  additionalProperties: boolean | string;
};

const validationSpecs: Record<string, ValidationSpec> = ${JSON.stringify(
    validationSpecs,
    null,
    2,
  )};

const objectShapes = new WeakMap<ValidationSpec, ObjectShape>();

function validationError(path: string | undefined, message: string): string[] {
  return [path ? \`\${path} \${message}\` : 'error'];
}

function checkNamed(
  name: string,
  o: any,
  path?: string
): string[] {
  const spec = validationSpecs[name];

  if (!spec) {
    return validationError(path, \`has unknown schema \${name}\`);
  }

  return checkSpec(spec, o, path);
}

function checkSpec(
  spec: ValidationSpec,
  o: any,
  path?: string
): string[] {
  if (spec.nullable && o === null) {
    return [];
  }

  switch (spec.type) {
  case 'anyOf':
  case 'oneOf':
    return checkUnion(spec, o, path);

  case 'array': {
    if (!Array.isArray(o)) {
      return validationError(path, 'must be an array');
    }

    if (spec.minItems !== undefined && o.length < spec.minItems) {
      return validationError(
        path,
        \`must contain at least \${spec.minItems} item\${
          spec.minItems === 1 ? '' : 's'
        }\`
      );
    }

    if (!spec.items) {
      return [];
    }

    const result: string[] = [];
    for (let i = 0; i < o.length; i++) {
      const errors = checkSpec(
        spec.items,
        o[i],
        path ? \`\${path}[\${i}]\` : undefined
      );
      result.push(...errors);
      if (!path && errors.length) {
        break;
      }
    }
    return result;
  }

  case 'boolean':
    return typeof o === 'boolean'
      ? []
      : validationError(path, 'must be a boolean');

  case 'integer':
  case 'float': {
    if (typeof o !== 'number' || !Number.isFinite(o)) {
      return validationError(path, 'must be a number');
    }
    if (spec.type === 'integer' && !Number.isInteger(o)) {
      return validationError(path, 'must be an integer');
    }
    if (spec.minimum !== undefined && o < spec.minimum) {
      return validationError(path, \`must be at least \${spec.minimum}\`);
    }
    if (spec.maximum !== undefined && o > spec.maximum) {
      return validationError(path, \`must be at most \${spec.maximum}\`);
    }
    return [];
  }

  case 'null':
    return o === null ? [] : validationError(path, 'must be null');

  case 'object':
    return checkObject(spec, o, path);

  case 'ref':
    return spec.ref
      ? checkNamed(spec.ref, o, path)
      : validationError(path, 'has a reference without a schema name');

  case 'string': {
    if (typeof o !== 'string') {
      return validationError(path, 'must be a string');
    }
    if (spec.enum && !spec.enum.includes(o)) {
      return validationError(
        path,
        \`must be one of \${spec.enum.map(value => JSON.stringify(value)).join(', ')}\`
      );
    }
    if (spec.pattern && !new RegExp(spec.pattern).test(o)) {
      return validationError(path, \`must match /\${spec.pattern}/\`);
    }
    return [];
  }

  default:
    return validationError(path, \`has unsupported schema type \${spec.type}\`);
  }
}

function checkUnion(
  spec: ValidationSpec,
  o: any,
  path?: string
): string[] {
  const alternatives = spec.union ?? [];
  const results = alternatives.map(alternative =>
    checkSpec(alternative, o, path)
  );
  const matches = results.filter(errors => errors.length === 0).length;

  if (spec.type === 'anyOf' ? matches > 0 : matches === 1) {
    return [];
  }

  if (matches > 1) {
    return validationError(path, 'must match exactly one allowed schema');
  }

  if (path && results.length) {
    return results.reduce((best, errors) =>
      errors.length < best.length ? errors : best
    );
  }

  return validationError(path, 'does not match an allowed schema');
}

function getObjectShape(spec: ValidationSpec): ObjectShape {
  const cached = objectShapes.get(spec);
  if (cached) {
    return cached;
  }

  let properties: ObjectShape['properties'] = {};
  let additionalProperties: ObjectShape['additionalProperties'] = false;

  if (spec.extends) {
    const base = validationSpecs[spec.extends];
    if (base?.type === 'object') {
      const baseShape = getObjectShape(base);
      properties = { ...baseShape.properties };
      additionalProperties = baseShape.additionalProperties;
    }
  }

  properties = {
    ...properties,
    ...(spec.object?.properties ?? {})
  };
  if (spec.object?.additionalProperties !== undefined) {
    additionalProperties = spec.object.additionalProperties;
  }

  const result = { properties, additionalProperties };
  objectShapes.set(spec, result);
  return result;
}

function checkObject(
  spec: ValidationSpec,
  o: any,
  path?: string
): string[] {
  if (typeof o !== 'object' || o === null || Array.isArray(o)) {
    return validationError(path, 'must be an object');
  }

  const result: string[] = [];
  const shape = getObjectShape(spec);

  for (const [name, property] of Object.entries(shape.properties)) {
    const propertyPath = path ? \`\${path}.\${name}\` : undefined;
    const value = o[name];

    if (value === undefined) {
      if (property.required) {
        const errors = validationError(propertyPath, 'is required');
        result.push(...errors);
        if (!path) {
          return result;
        }
      }
      continue;
    }

    const errors = checkSpec(property.spec, value, propertyPath);
    result.push(...errors);
    if (!path && errors.length) {
      return result;
    }
  }

  for (const name of Object.keys(o)) {
    if (Object.hasOwn(shape.properties, name)) {
      continue;
    }

    const propertyPath = path ? \`\${path}.\${name}\` : undefined;
    if (shape.additionalProperties === false) {
      const errors = validationError(propertyPath, 'is not allowed');
      result.push(...errors);
      if (!path) {
        return result;
      }
    } else if (typeof shape.additionalProperties === 'string') {
      const errors = checkSpec(
        { type: shape.additionalProperties },
        o[name],
        propertyPath
      );
      result.push(...errors);
      if (!path && errors.length) {
        return result;
      }
    }
  }

  return result;
}`;
}

const runConfigPathname = process.argv[2];
const runConfig:SpecFile = (():SpecFile => {
  const specPathname = path.resolve(runConfigPathname);
  const specFile = readFileSync(specPathname);
  const spec = yaml.parse(specFile.toString()) as SpecFile;
  Object.freeze(spec.types);
  Object.freeze(spec.types.export);
  return spec;
})();

async function swaggar2TypeCode() {
  await initializeLogger(runConfig);
  const log = getLogger(MODULE, swaggar2TypeCode);

  log.debug(format('Log started with spec %s', JSON.stringify(runConfig.logging)));
  log.debug(JSON.stringify(runConfig));

  const swaggarPathname = path.resolve(
    path.dirname(runConfigPathname),runConfig.swaggar
  );
  const swaggar = yaml.parse((await readFileSync(swaggarPathname)).toString());

  log.debug(format('Swagger at %s read:', swaggarPathname));
  log.debug(format(' --> %s', Object.keys(swaggar)));

  const schemas = swaggar.components.schemas;

  const typesQueue = [...(runConfig.types.export || [])];
  type NormalizedSpecType = Record<string, PropertySpecType>;
  const normalizedSpecs: NormalizedSpecType =
    runConfig.types.specifiedTypes
      ? deepClone(runConfig.types.specifiedTypes) as NormalizedSpecType
      : {};
  const typesProcessed:string[] = Object.keys(normalizedSpecs);

  log.info(format('Scanning for types %s', JSON.stringify(typesQueue)));

  const addRefType = (ref: string): string => {
    const result = ref.replace(new RegExp('#/components/schemas/'), '')
    typesQueue.push(result)
    return result;
  };

  type normalizerFn =
    (name: string, schema: Record<string, any>) => PropertySpecType
  const normalizers: Record<string, normalizerFn> = {

    anyOf: function(name: string, schema: Record<string, any>): AnyOfType {
      assertRecordHasProperties(name, schema, 'oneOf:array');
      const result: AnyOfType = {
        type: 'anyOf',
        union: (schema.anyOf as Array<any>).map((o:any, idx:number) => {
          if (Object.hasOwn(o, '$ref')) {
            assertSingleItemRecord(
              `${name}[${idx}]`,
              pick(o , ['description'], false),
              '$ref',
              'string'
            );
            return {type: 'ref', ref: addRefType(o.$ref)};
          } else {
            return normalizePropertySpecType(`${name}[${idx}]`, o, true);
          }
        })
      }
      dde(result, schema, 'discriminator');
      return result;
    },

    array: function(name: string, schema:Record<string, any>): ArrayType {
      assertRecordHasProperties(name, schema, 'items');
      const result: ArrayType = {
        type: 'array',
        items: normalizePropertySpecType(`${name}[]`, schema.items, true)
      }
      dde(result, schema, 'minItems');
      return result;
    },

    boolean: function(name: string, schema: Record<string, any>): BooleanType {
      const result: BooleanType = {
        type: 'boolean'
      };
      dde(result, schema);
      return result;
    },

    integer: function(_name: string, schema:Record<string, any>): NumberType {
      const result: NumberType = {
        type: 'integer'
      }
      dde(result, schema, 'minimum', 'maximum', 'format');
      return result;
    },

    null: function(_name: string, schema:Record<string, any>): NullType {
      const result: NullType = {
        type: 'null'
      };
      dde(result, schema);
      return result;
    },

    number: function(_name: string, schema:Record<string, any>): NumberType {
      const result: NumberType = {
        type: 'float'
      }
      dde(result, schema, 'minimum', 'maximum');
      return result;
    },

    object: function(name: string, schema:Record<string, any>): ObjectType {
      const result: ObjectType = {
        type: 'object',
        object: {
          properties: {} as
            Record<string, (TypeFromSchema & {required: boolean})>,
          additionalProperties: false
        }
      };
      dde(result, schema)

      if (Object.hasOwn(schema, 'allOf')) {
        // This object mixes objects together
        assertSingleItemRecord(`${name}`, schema, 'allOf', 'array');
        const mixType: Array<ObjectType> = [];
        (schema.allOf as Array<any>).forEach((item:any, idx) => {
          if (typeof item !== 'object') {
            throw new Error(`${name}[${item}] must be an object.`);
          }
          if (Array.isArray(item)) {
            throw new Error(`${name}[${item}] must not be an array.`);
          }
          if (Object.hasOwn(item, '$ref')) {
            assertSingleItemRecord(
              `${name}[${idx}]`,
              pick(item , ['description'], false),
              '$ref',
              'string'
            );
            const refType = addRefType(item.$ref);
            result.extends = refType;
          } else {
            if (item.type !== 'object') {
              throw new Error(`${name}[${item}] object "allOf" members must ` +
                'either be a $ref or have a member "type" that is set to ' +
                '"object"');
            }
            mixType.push(
              normalizers.object(`${name}[${idx}]`, item) as ObjectType
            );
          }
        });
        if (mixType.length > 1) {
          log.warn(`${name} has more than one main object which is not
            supported at this time. This will be inaccurate.`);
        }
        if (mixType.length > 0) {
          result.object ||= {properties: {}};
          if (mixType[0].object) {
            result.object.properties = mixType[0].object.properties;
          }
        }

      } else {
        // this is a primary definition of an object
        assertRecordHasProperties(name, schema,
          'type:string', 'properties?:object', 'required?:array',
          'additionalProperties?:object'
        );
        for (const p of Object.keys(schema?.properties || [])) {
          log.debug(`${name}.${p}`);
          if ((runConfig.types.omissions && runConfig.types.omissions[name])) {
            if (runConfig.types.omissions[name].includes(p)) {
              log.info(`skipping ${name}.${p} per omissions config`);
              continue;
            }
          }
          const normalizedP = normalizePropertySpecType(
            `${name}.${p}`, schema.properties[p], true
          );
          result.object ||= {properties: {}};
          result.object.properties[p] = {
            name: p,
            spec: normalizedP,
            required: !!(schema.required?.includes(p))
          }
        }
        if (schema.additionalProperties) {
          if (typeof schema.additionalProperties === 'object') {
            assertRecordHasProperties(
              `${name}.additionalProperties`, schema.additionalProperties,
              'type:string'
            )
            result.object ||= {properties: {}};
            result.object.additionalProperties =
              schema.additionalProperties.type;
          } else if (typeof schema.additionalProperties === 'boolean') {
            result.object ||= {properties: {}};
            result.object.additionalProperties = schema.additionalProperties;
          } else {
            log.error(`object ${name}.additionalProperties of unknown format`);
          }
        }
      }

      return result;
    },

    oneOf: function(name: string, schema: Record<string, any>): OneOfType {
      assertRecordHasProperties(name, schema, 'oneOf:array');
      const result: OneOfType = {
        type: 'oneOf',
        union: (schema.oneOf as Array<any>).map((o:any, idx:number) => {
          if (Object.hasOwn(o, '$ref')) {
            assertSingleItemRecord(
              `${name}[${idx}]`,
              pick(o , ['description'], false),
              '$ref',
              'string'
            );
            return {type: 'ref', ref: addRefType(o.$ref)};
          } else {
            return normalizePropertySpecType(`${name}[${idx}]`, o, true);
          }
        })
      };
      dde(result, schema, 'discriminator');
      return result;
    },

    string: function(_name: string, schema: Record<string, any>): StringType {
      const result: StringType = {
        type: 'string'
      };
      dde(result, schema, 'enum');
      return result;
    }
  }

  const dde = (
    result: PropertySpecType & Record<string, any>,
    schema: Record<string, any>,
    ...otherProperties:(string|string[])[]
  ): void => {
    // modifies result inline
    schema.description && (result.description = schema.description);
    schema.default && (result.default = schema.default);
    schema.example && (result.examples = [schema.example]);
    schema.nullable && (result.nullable = schema.nullable);
    for (const p of otherProperties.flat()) {
      schema[p] && (result[p] = schema[p])
    }
  };

  const normalizePropertySpecType = (
    name: string, schema:Record<string, any>, refTypeOk:boolean=false)
  : PropertySpecType|RefType => {
    assertRecordHasProperties(name, schema, 'type:string');
    if (Object.keys(normalizers).includes(schema.type)) {
      log.debug(`Normalizing ${name} - ${schema.type}`)
      return normalizers[schema.type](name, schema);
    } else if (refTypeOk && schema.$ref) {
      log.debug(`Normalizing ${name} - $ref`);
      return {type: 'ref', ref: addRefType(schema.$ref)};
    } else if (schema.allOf) {
      log.debug(`Normalizing ${name} - allOf`);
      return normalizers.object(name, schema);
    } else if (schema.oneOf) {
      log.debug(`Normalizing ${name} - oneOf`);
      return normalizers.oneOf(name, schema);
    } else if (schema.anyOf) {
      log.debug(`Normalizing ${name} - anyOf`);
      return normalizers.anyOf(name, schema);
    } else {
      throw new Error(`Normalizing ${name} has an UNKNOWN object type ${
        schema.type} // ${JSON.stringify(schema).substring(0, 100)}`);
    }
  }

  // read all the property types
  const typesRead = {succesful: 0, failed: 0};
  while (typesQueue.length) {
    const typeName = typesQueue.shift() as string;
    const schema = schemas[typeName];
    if (typesProcessed.includes(typeName)) {
      continue;
    }
    log.info(format('Reading type "%s"', typeName));
    try {
      normalizedSpecs[typeName] =
        normalizePropertySpecType(typeName, schema) as PropertySpecType;
      typesRead.succesful++;
    } catch(e) {
      typesRead.failed++;
      if (e instanceof Error) {
        log.error(e.message);
        log.error(e.stack);
      } else {
        log.error(e);
      }
    }
  }
  log.info(`Successfully read ${typesRead.succesful} types`);
  if (typesRead.failed) {
    log.info(`Failed to read ${typesRead.failed} types`);
  }

  if (process.argv[3]) {
    writeFileSync(
      `${process.argv[3]}-model.json`,
      JSON.stringify(normalizedSpecs, null, 2)
    );
  } else {
    console.log(JSON.stringify(normalizedSpecs, null, 3));
  }

  // do actions
  if (runConfig.types.postReadActions?.length) {
    const actionsResult = doActions(
      runConfig.types.postReadActions, normalizedSpecs
    );
    log.info(`Successfully handled ${actionsResult.successful} actions.`);
    if (actionsResult.failed) {
      log.info(`Failed to handle ${actionsResult.failed} actions.`);
    }
    if (actionsResult.skipped) {
      log.info(`Skipped ${actionsResult.skipped} actions.`);
    }
  } else {
    log.info(`No post-read actions to perform`);
  }

  generate(normalizedSpecs);
}

swaggar2TypeCode();
