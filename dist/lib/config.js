import { promises as fs } from 'node:fs';
import path from 'node:path';
import { format } from 'node:util';
import yaml from 'yaml';
import { normalizeConfig, validateConfigAsLoaded } from '../types/validators/raw-config.js';
import { getLogger } from './logger.js';
import { error } from './exceptions.js';
import { NOT_READY } from '../types/generated/error-codes.js';
const MODULE = 'config';
let config = undefined;
function getConfig() {
    if (config) {
        return config;
    }
    else {
        throw error(NOT_READY);
    }
}
async function loadConfig(hostname) {
    const log = getLogger(MODULE, loadConfig);
    const filename = '[service.yaml]'; // path to use for validation functions
    const configPath = path.join(path.dirname(process.argv[1]), '..', filename.substring(1, filename.length - 1));
    const configBuf = await fs.readFile(configPath);
    let configParsed;
    try {
        configParsed = yaml.parse(configBuf.toString());
        const validationErrors = validateConfigAsLoaded(configParsed, filename);
        if (validationErrors.length) {
            console.error(format('Failed to parse config at %s:', configPath));
            validationErrors.forEach(v => console.error(`  ${v}`));
            process.exit(1);
        }
    }
    catch (e) {
        console.error(format('Failed to parse config at %s:', process.argv[1], e));
        process.exit(1);
    }
    log.debug('Normalizing config');
    const configNormalization = normalizeConfig(configParsed, hostname, filename);
    log.debug('Normalized config. Valid === %s', configNormalization.valid);
    if (configNormalization.valid) {
        config = configNormalization.value;
        log.silly('set config to %s', JSON.stringify(config));
        return config;
    }
    else {
        console.error('Config incomplete for hostname "%s"%s', hostname, configNormalization.errors ? ':' : '');
        if (configNormalization.errors) {
            configNormalization.errors.forEach(v => console.error(`  ${v}`));
        }
        process.exit(1);
    }
}
export default getConfig;
export { config, getConfig, loadConfig };
//# sourceMappingURL=config.js.map