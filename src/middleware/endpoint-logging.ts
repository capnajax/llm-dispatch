import { Application, AsyncRequestHandler, Finalizer, Request, Response } from "filamentjs";
import { AppMeta } from "../types/types.js";
import { getLogger } from "../lib/logger.js";
import { statusIsSuccess } from "../lib/http-tools.js";

const MODULE = 'middleware/endpoint-logging';

export const ENDPOINT_LOG_FINALIZER = '[export-log-finalizer]';

let repetitiveLogs:null|{
  method: string,
  path: string,
  statusCode: number,
  times: number[]
} = null;

function isNewLog(method: string, path: string, statusCode: number): boolean {
  return ( repetitiveLogs === null ) || (
    repetitiveLogs.method !== method ||
    repetitiveLogs.path !== path ||
    repetitiveLogs.statusCode !== statusCode
  );
}

const preRequest:AsyncRequestHandler<AppMeta> = (req: Request<AppMeta>) => {
  req.context.endpointLogging = {
    request: {
      time: Date.now()
    }
  }
}

const finalizer:Finalizer<AppMeta> = (req: Request<AppMeta>, res: Response) => {

  const finalizerLog = getLogger(MODULE, finalizer);

  finalizerLog.silly(
    `Logging ${req.method} ${req.path} type "${req.endpointMeta.logging}"`
  );

  if (req.endpointMeta.logging === 'never') {
    return;
  }
  if (req.endpointMeta.logging === 'on-error' && statusIsSuccess(res)) {
    return;
  }

  const method = req.method;
  const path = req.path;
  const elapsedTime = Date.now() - req.context.endpointLogging.request.time;

  const singleLog = (sc: number, et: number) => {
    getLogger(ENDPOINT_LOG_FINALIZER, method, path).http(`${sc} (${et}ms)`);
  }

  const dumpRepetitiveLogs = () => {
    if (repetitiveLogs !== null) {
      const rolledLogLogger = getLogger(
        ENDPOINT_LOG_FINALIZER, repetitiveLogs.method, repetitiveLogs.path
      );
      if (repetitiveLogs.times.length < 5) {
        rolledLogLogger.http(
          `${repetitiveLogs.statusCode} (${repetitiveLogs.times.length}x - ` +
          `${repetitiveLogs.times.map(t => `${t}ms`).join(', ')})`
        );
      } else {
        const min = Math.min(...repetitiveLogs.times);
        const max = Math.max(...repetitiveLogs.times);
        const mean = Math.round(
          10 * (repetitiveLogs.times.reduce((a, b) => a + b, 0) /
            repetitiveLogs.times.length)
          ) / 10;
        rolledLogLogger.http(
          `${repetitiveLogs.statusCode} (${repetitiveLogs.times.length}x - ` +
          `min: ${min}, max: ${max}, mean: ${mean})`
        );
      }
      repetitiveLogs = null;
    }
  }

  if (isNewLog(method, path, res.statusCode)) {
    finalizerLog.silly('new log');
    dumpRepetitiveLogs()
  }

  if (req.endpointMeta.logging === 'collapse') {
    if (repetitiveLogs) {
      repetitiveLogs.times.push(elapsedTime);
    } else {
      repetitiveLogs = {
        method, path, statusCode: res.statusCode, times: [elapsedTime]
      };
    }
  } else {
    // always log
    singleLog(res.statusCode, elapsedTime);
  }
}

export default function setupLogging(app:Application<AppMeta>) {
  app.use(preRequest);
  app.onFinalize(finalizer);
}

