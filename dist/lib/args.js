import Parser, { stringArg } from 'args-and-envs';
const MODULE = 'args';
let debugLevel = 'info';
let parsedArgs;
function preflowArgs(args) {
    const result = [...args];
    let i = 0;
    while (i < result.length) {
        if (/^-v{1,3}$/.test(result[i])) {
            debugLevel = ({ '-vvv': 'silly', '-vv': 'debug' }[result[i]] || 'verbose');
            result.splice(i, 1);
        }
        else {
            i++;
        }
    }
    return result;
}
export function args() {
    if (!parsedArgs) {
        const parseOptions = {
            argv: preflowArgs(process.argv.slice(2))
        };
        const optionsDef = [
            { name: 'hostname', required: false, type: stringArg,
                arg: ['-h', '--hostname'] },
        ];
        const parser = new Parser(parseOptions, optionsDef);
        if (parser.parse()) {
            // parsed ok
            parsedArgs = { debugLevel, ...parser.args };
            globalThis.debugLevel = debugLevel;
        }
        else {
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
//# sourceMappingURL=args.js.map