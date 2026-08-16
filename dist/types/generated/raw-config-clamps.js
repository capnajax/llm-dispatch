// THIS FILE IS GENERATED. DO NOT EDIT.
import { validateConfigAsLoaded } from '../validators/raw-config.js';
export { validateConfigAsLoaded };
export function isConfigAsLoaded(o) {
    return validateConfigAsLoaded(o).length === 0;
}
export function assertConfigAsLoaded(o) {
    const errors = validateConfigAsLoaded(o);
    if (errors.length) {
        throw new Error(errors.join('\n'));
    }
}
export function testConfigAsLoaded(o) {
    return validateConfigAsLoaded(o).length === 0;
}
//# sourceMappingURL=raw-config-clamps.js.map