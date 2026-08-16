import $ from 'rocket-shell';
import args from './args.js';
import { getLogger } from './logger.js';

const MODULE = 'hostname';

let hostname:null|string = null;

export async function loadHostname()
: Promise<string> {
  const log = getLogger(MODULE, loadHostname);
  let result:string|null = args().hostname || null;
  if (!result) {
    if (process.env.HOSTNAME) {
      result = process.env.HOSTNAME as string;
    } else {
      result = (await $`hostname -s`).trim();
    }
  }
  hostname = result;
  log.verbose(`Using config host.name "${result}"`);
  return result;
}

export default function getHostname():string {
  if (hostname) {
    return hostname;
  } else {
    // should almost never happen because the caller should be checking that
    // everything is ready first.
    throw new Error("hostname not ready yet");
  }
};
