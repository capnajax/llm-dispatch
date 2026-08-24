import { getLogger } from "../lib/logger.js";
import { statusIsSuccess } from "../lib/http-tools.js";
import { ENDPOINT_LOG_FINALIZER } from "../lib/http-constants.js";
const MODULE = 'middleware/endpoint-logging';
let repetitiveLogs = null;
function isNewLog(method, path, statusCode) {
    return (repetitiveLogs === null) || (repetitiveLogs.method !== method ||
        repetitiveLogs.path !== path ||
        repetitiveLogs.statusCode !== statusCode);
}
const preRequest = (req) => {
    req.context.endpointLogging = {
        request: {
            time: Date.now()
        }
    };
};
const finalizer = (req, res) => {
    const finalizerLog = getLogger(MODULE, finalizer);
    finalizerLog.silly(`Logging ${req.method} ${req.path} type "${req.endpointMeta.logging}"`);
    if (req.endpointMeta.logging === 'never') {
        return;
    }
    if (req.endpointMeta.logging === 'on-error' && statusIsSuccess(res)) {
        return;
    }
    const method = req.method;
    const path = req.path;
    const elapsedTime = Date.now() - req.context.endpointLogging.request.time;
    const singleLog = (sc, et) => {
        getLogger(ENDPOINT_LOG_FINALIZER, method, path).http(`${sc} (${et}ms)`);
    };
    const dumpRepetitiveLogs = () => {
        if (repetitiveLogs !== null) {
            const rolledLogLogger = getLogger(ENDPOINT_LOG_FINALIZER, repetitiveLogs.method, repetitiveLogs.path);
            if (repetitiveLogs.times.length < 5) {
                rolledLogLogger.http(`${repetitiveLogs.statusCode} (${repetitiveLogs.times.length}x - ` +
                    `${repetitiveLogs.times.map(t => `${t}ms`).join(', ')})`);
            }
            else {
                const min = Math.min(...repetitiveLogs.times);
                const max = Math.max(...repetitiveLogs.times);
                const mean = Math.round(10 * (repetitiveLogs.times.reduce((a, b) => a + b, 0) /
                    repetitiveLogs.times.length)) / 10;
                rolledLogLogger.http(`${repetitiveLogs.statusCode} (${repetitiveLogs.times.length}x - ` +
                    `min: ${min}, max: ${max}, mean: ${mean})`);
            }
            repetitiveLogs = null;
        }
    };
    if (isNewLog(method, path, res.statusCode)) {
        finalizerLog.silly('new log');
        dumpRepetitiveLogs();
    }
    if (req.endpointMeta.logging === 'collapse') {
        if (repetitiveLogs) {
            repetitiveLogs.times.push(elapsedTime);
        }
        else {
            repetitiveLogs = {
                method, path, statusCode: res.statusCode, times: [elapsedTime]
            };
        }
    }
    else {
        // always log
        singleLog(res.statusCode, elapsedTime);
    }
};
export default function setupLogging(app) {
    app.use(preRequest);
    app.onFinalize(finalizer);
}
//# sourceMappingURL=endpoint-logging.js.map