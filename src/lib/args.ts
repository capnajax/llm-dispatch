import Parser, { OptionsDef, ParserOptions, stringArg } from 'args-and-envs';

const MODULE = 'args';

let debugLevel = 'info';

interface ParsedArgsType {
  debugLevel: 'info'|'verbose'|'debug'|'silly';
  hostname?: string
}

let parsedArgs:ParsedArgsType|undefined;

function preflowArgs(args:string[]) {
  const result = [...args];
  let i = 0;
  while (i < result.length) {
    if (/^-v{1,3}$/.test(result[i])) {
      debugLevel = ({'-vvv': 'silly', '-vv': 'debug'}[result[i]] || 'verbose');
      result.splice(i, 1);
    } else {
      i++;
    }
  }
  return result;
}

export function args():ParsedArgsType {
  if (!parsedArgs) {
    const parseOptions:Partial<ParserOptions> = {
      argv: preflowArgs(process.argv.slice(2))
    };

    const optionsDef:OptionsDef[] = [
      { name: 'hostname', required: false, type: stringArg,
        arg: ['-h', '--hostname']},
    ];

    const parser = new Parser(parseOptions, optionsDef);
    if (parser.parse()) {
      // parsed ok
      parsedArgs = { debugLevel, ... parser.args } as ParsedArgsType
      (globalThis as Record<string, unknown>).debugLevel = debugLevel;
    } else {
      // has errors
      Object.entries(parser.errors || {}).forEach(([o, e]) => {
        console.error(`${o} option invalid: ${e}`);
      });
      process.exit(1);
    }
  }
  return parsedArgs;
}

export default args;
