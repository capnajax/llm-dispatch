// THIS FILE IS GENERATED. DO NOT EDIT.
import { FAILED_ASSERTION } from './error-codes.js';
import { error } from '../../lib/exceptions.js';
import { validateConfigAsLoaded } from '../validators/raw-config.js';
export { validateConfigAsLoaded };
export function isConfigAsLoaded(o) {
    return validateConfigAsLoaded(o).length === 0;
}
export function assertConfigAsLoaded(o, log, path) {
    let errors = validateConfigAsLoaded(o);
    if (errors.length) {
        if (log && log.isDebugEnabled()) {
            errors = validateConfigAsLoaded(o, path ?? 'ConfigAsLoaded');
            errors.forEach(log.debug);
            throw error(FAILED_ASSERTION, errors.join('\n'));
        }
        else {
            throw error(FAILED_ASSERTION);
        }
    }
}
export function testConfigAsLoaded(o) {
    return validateConfigAsLoaded(o).length === 0;
}
//# sourceMappingURL=raw-config-clamps.js.map