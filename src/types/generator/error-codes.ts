'use strict';
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { format } from 'node:util';

import yaml from 'yaml';

import { getLogger, initializeLogger } from '../../lib/logger.js';
import { LoggerConfig } from '../logger-types.js';

const MODULE = 'types/generator/error-codes';

function splitLines(str:string):string[] {
  const result = str.split('\n');
  if (result.length > 1 && result[result.length-1] === '') {
    result.pop();
  }
  return result;
}

interface SpecFileModuleCode {
  message: string,
  description?: string,
  statusCode?: number
}

interface SpecFile extends LoggerConfig {
  blocks?: {
    head?: string,
    foot?: string,
  },
  modules: {
    name: string,
    description?: string,
    codes: Record<string, string|SpecFileModuleCode>
  }[]
}

const runConfigPathname = process.argv[2];
const runConfig:SpecFile = (():SpecFile => {
  const specPathname = path.resolve(runConfigPathname);
  const specFile = readFileSync(specPathname);
  const spec = yaml.parse(specFile.toString()) as SpecFile;
  return spec;
})();

async function generate() {
  await initializeLogger(runConfig);
  const log = getLogger(MODULE, generate);

  log.debug(format('Log started with spec %s', JSON.stringify(runConfig.logging)));
  log.debug(JSON.stringify(runConfig));

  const lines = [];

  if (runConfig.blocks?.head) {
    lines.push(runConfig.blocks.head);
  }

  lines.push('export const errorCodes:Record<ErrorCode, string> = {');
  for (const m of runConfig.modules) {
    if (m.description) {
      lines.push(...splitLines(m.description).map(l => `  // ${l}`));
    }
    Object.entries(m.codes).forEach((k) => {
      const message = typeof k[1] === 'object' ? k[1].message : k[1];
      lines.push(`  ${k[0]}: ${JSON.stringify(message)},`);
    });
  }
  lines[lines.length-1] = lines[lines.length-1].replace(/,$/, '');
  lines.push('};', '')
  lines.push(
    'export const defaultStatusCodes:Partial<Record<ErrorCode, number>> = {'
  );
  for (const m of runConfig.modules) {
    Object.entries(m.codes).forEach((k) => {
      const v = k[1];
      if (typeof v === 'object' && v.statusCode) {
        lines.push(`  ${k[0]}: ${v.statusCode},`);
      }
    })
  }
  lines[lines.length-1] = lines[lines.length-1].replace(/,$/, '');
  lines.push('};')

  lines.push('', '//');
  lines.push('// The ErrorCode type');
  lines.push('//', '');

  const errorCodeModules:string[] = []
  for (const m of runConfig.modules) {
    const typename =
      m.name.substring(0,1).toUpperCase() + m.name.substring(1) + 'ErrorCode';
    if (m.description) {
      lines.push('/**');
      lines.push(...splitLines(m.description).map(l => ` * ${l}`));
      lines.push(' */');
    }
    lines.push(`type ${typename} =`);
    Object.keys(m.codes).forEach((k,i,v) => {
      lines.push(`  '${k}'${i < v.length-1 ? ' |' : ';'}`);
    });

    lines.push(`function is${typename}(o: any):o is ${typename} {`);
    if (Object.keys(m.codes).length === 1) {
      lines.push(`  return o === ${Object.keys(m.codes)[0]};`);
    } else {
      lines.push(`  return [`);
      lines.push(Object.keys(m.codes)
        .map(k => `    ${k}`)
        .join(',\n'));
      lines.push('  ].includes(o);')
    }
    lines.push('}');

    errorCodeModules.push(typename);
  }

  lines.push('export type ErrorCode =');
  errorCodeModules.forEach((k,i,v) => {
    lines.push(`  ${k}${i < v.length-1 ? ' |' : ';'}`);
  });
  lines.push('export function isErrorCode(o: any):o is ErrorCode {');
  const tests = `  return ${errorCodeModules
    .map(m => `is${m}(o)`)
    .join(' ||\n    ')};\n}`;
  lines.push(tests)

  lines.push('', '//');
  lines.push('// Useful constants for each error code');
  lines.push('//', '');

  for (const m of runConfig.modules) {
    lines.push(`// ${m.name}`);
    if (m.description) {
      lines.push(...splitLines(m.description).map(l => `// ${l}`));
    }
    for (const code in m.codes) {
      const mcc = m.codes[code];
      const message = (typeof mcc === 'object' ? mcc.message : mcc).trim();
      lines.push('/**');
      lines.push(` * Message: \`${message}\``)
      if ((typeof mcc === 'object') && mcc.statusCode) {
        lines.push(` * Status Code: ${mcc.statusCode}`)
      }
      if ((typeof mcc === 'object') && mcc.description) {
        lines.push(...splitLines(mcc.description).map(l => ` * ${l}`));
      }
      lines.push(' */');
      lines.push(`export const ${code}:ErrorCode = ${JSON.stringify(code)};`);
    }
  }

  if (runConfig.blocks?.foot) {
    lines.push(runConfig.blocks.foot);
  }

  lines.push('', 'export default ErrorCode', '');

  if (process.argv[3]) {
    const filename = `${process.argv[3]}.ts`
    log.info(`Generating enums and codes to ${filename}:`);
    writeFileSync(filename, lines.join('\n'));
  } else {
    console.log(lines.join('\n'));
  }
}

generate();
