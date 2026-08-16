/**
 * @module index
 * starts the service
 */
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();
import startServer from './server.js';
import Readiness from './lib/readiness.js';
import { loadConfig } from './lib/config.js';
import { getLogger, initializeLogger } from './lib/logger.js';
import { loadPromptsConfig } from './prompts/prompts.js';
import { loadHostname } from './lib/hostname.js';
import args from './lib/args.js';
import { validateConfig } from './types/connectivity-types.js';
const MODULE = 'index';
async function startupSequence() {
    args();
    let hostname = '';
    let config;
    let log = getLogger(MODULE, startupSequence);
    Readiness.preload('config', 'prompts');
    const hostnamePromise = loadHostname();
    Readiness.get('hostname').promise = hostnamePromise;
    hostnamePromise
        .then((gotHostname) => {
        log.silly(`Got hostname: ${JSON.stringify(gotHostname)}`);
        hostname = gotHostname;
    })
        .then(() => {
        return Readiness.get('config').promise = loadConfig(hostname);
    })
        .then((gotConfig) => {
        config = gotConfig;
    })
        .then(() => {
        return Readiness.get('prompts').promise = loadPromptsConfig();
    });
    Readiness.on('ready', () => {
        log.verbose('Effective config:\n%s', JSON.stringify(config, null, 3));
        const validationErrors = validateConfig(config, '');
        if (validationErrors.length) {
            validationErrors.forEach(log.error);
            process.exit(3);
        }
        try {
            // switch logger to runtime logging
            initializeLogger(config);
            log.verbose('Switching from startup logging to runtime logging');
            log = getLogger(MODULE, startupSequence);
        }
        catch (e) {
            console.error('Failed to read logging config: %s', e);
            process.exit(2);
        }
        log.info('Starting service on host[name="%s"]', hostname);
        startServer();
    });
}
await startupSequence();
//# sourceMappingURL=index.js.map