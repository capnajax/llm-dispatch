// /**
//  * @module Probe tests which backend services are healthy to route requests
//  *  correctly.
//  */
export {};
// TODO: REMOVE ME
// import os from 'node:os'
// import {
//   ServiceConfigMode,
//   ServiceConfigProbeCondition,
//   isOnlineServiceConfigMode,
//   normalizeServiceConfigProbeIntervalValue
// } from './types/types.js';
// import config from './lib/config.js';
// import { getLogger } from './lib/logger.js';
// import Readiness from './lib/readiness.js';
// const MODULE = 'probe';
// // Define a function to check the health of a URL
// function checkUrlHealth(url: string, permitRedirects:boolean = false)
// : Promise<boolean> {
//   return fetch(url, {
//     method: 'GET',
//     headers: {
//       'User-Agent': 'NodeJS Health Checker'
//     }
//   })
//   .then((res) => {
//     // Check the status code of the response
//     if (res.ok) {
//       // If the status code is 2xx, accept
//       return true;
//     } else if (res.status >= 300 && res.status < 400) {
//       // If the status code is 3xx, accept if permitRedirects is true
//       return permitRedirects;
//     } else {
//       // If the status code is not 2xx or 3xx, reject
//       return false;
//     }
//   })
//   .catch((err) => {
//     // If there's an error making the request, reject
//     return false;
//   });
// }
// export const OFFLINE = 'offline';
// export const OFFLINE_MODE:ServiceConfigMode = {
//   name: OFFLINE,
//   displayName: 'Offline',
//   icon: 'empty'
// };
// class Probe {
//   private _lastChecked = 0;
//   private _lastNetInfo = '';
//   private _currentMode:ServiceConfigMode = OFFLINE_MODE;
//   private _currentModePromise:null|Promise<ServiceConfigMode> = null;
//   private _connectivityChangeInterval: NodeJS.Timeout|null = null;
//   private _nextProbe: NodeJS.Timeout|null = null;
//   constructor() {
//     Readiness.on('update', 'config', () => this.startProbe(true));
//     if (Readiness.getTrackedReadinessItem('config', false)?.isReady) {
//       this.startProbe(true);
//     }
//   }
//   get currentMode():ServiceConfigMode {
//     return this._currentMode;
//   }
//   get isOnline():boolean {
//     return this._currentMode.name !== OFFLINE;
//   }
//   private async startProbe(force: boolean = false) {
//     const c = (await config)?.connectivity;
//     if (!c) {
//       // should not be possible -- config should be confirmed loaded before
//       // starting probe
//       throw ('Config not available yet');
//     }
//     this.getMode(force);
//     const intervals = c.probe;
//     const minProbe = normalizeServiceConfigProbeIntervalValue(intervals.min);
//     const maxProbe = intervals.max !== null
//       ? normalizeServiceConfigProbeIntervalValue(intervals.max)
//       : 0;
//     if (this._nextProbe) {
//       clearTimeout(this._nextProbe);
//       this._nextProbe = null;
//     }
//     if (maxProbe > 0) {
//       this._nextProbe = setTimeout(this.startProbe, maxProbe);
//     }
//     if (!this._connectivityChangeInterval) {
//       this._connectivityChangeInterval = setInterval(() => {
//         if (this.connectivityChanged()) {
//           this._connectivityChangeInterval &&
//             clearInterval(this._connectivityChangeInterval);
//           this.startProbe(true);
//         }
//       }, minProbe);
//     }
//   }
//   connectivityChanged() {
//     const now = Date.now();
//     const oldLastNetInfo = this._lastNetInfo;
//     const newLastNetInfo = JSON.stringify(os.networkInterfaces());
//     this._lastNetInfo = newLastNetInfo;
//     if (oldLastNetInfo !== newLastNetInfo) {
//       return true;
//     } else {
//       return false;
//     }
//   }
//   async getMode(force:boolean=false):Promise<ServiceConfigMode> {
//     // is a request is already in flight, return the inflight promise
//     if (this._currentModePromise) {
//       return this._currentModePromise;
//     }
//     // test if the request is necessary
//     if (!force) {
//       const minimum = normalizeServiceConfigProbeIntervalValue(
//         config?.connectivity.probe.min || 0
//       );
//       if (Date.now() - this._lastChecked < minimum) {
//         return this._currentMode;
//       }
//     }
//     // do actual probe
//     this._currentModePromise = new Promise<ServiceConfigMode>((r) => {
//       this.doProbe();
//       r(this._currentMode);
//     });
//     return this._currentModePromise;
//   }
//   private async probeTest(condition:ServiceConfigProbeCondition)
//   : Promise<boolean> {
//     const log = getLogger(MODULE, 'Probe.probeTest');
//     let result = false;
//     if (condition.healthy) {
//       if (typeof condition.healthy === 'string') {
//         return checkUrlHealth(condition.healthy);
//       } else {
//         log.warn(
//           'Unknown structure of `healthy`: %s',
//           JSON.stringify(condition.healthy)
//         );
//       }
//     }
//     return result;
//   }
//   async doProbe() {
//     const log = getLogger(MODULE, 'Probe.doProbe');
//     if (config?.connectivity?.modes) {
//       let preferredMode:ServiceConfigMode = OFFLINE_MODE;
//       for (const mode of config.connectivity.modes) {
//         if (isOnlineServiceConfigMode(mode)) {
//           const probeResults = await Promise.all(mode.if.map(this.probeTest));
//           if (probeResults.every(t => t)) {
//             preferredMode = mode;
//           }
//         } else {
//           preferredMode = mode;
//         }
//         if (preferredMode) {
//           break;          
//         }
//       }
//       this._currentMode = preferredMode || OFFLINE_MODE;
//     } else {
//       log.warn('No connectivity modes established. Will assume offline');
//     }
//   }
// }
// const probe = new Probe();
// export default probe;
// export { probe };
//# sourceMappingURL=probe.js.map