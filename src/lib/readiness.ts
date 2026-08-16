/**
 * Class to indicate what things are ready
 */

import { Logger } from "winston";
import { getLogger } from "./logger.js";

const MODULE = 'Readiness';

type FnVoid = () => void;
type FnStringVoid = (module: string) => void;
type ReadinessEventCallback = FnVoid | FnStringVoid;

type ReadinessEvent = 'ready'|'loading'|'update';
type ReadinessEventMap = {
  ready: FnVoid[],
  loading: { module:string|null, cb:FnStringVoid }[],
  update: { module:string|null, cb:FnStringVoid }[]
}

class Readiness {

  static trackedItems: Readiness[] = [];
  static get isReady(): boolean {
    return Readiness.trackedItems.every(t => t.isReady)
  }

  static events: ReadinessEventMap = {
    ready: [],
    loading: [],
    update: []
  };

  private static log:Logger|undefined;

  static on(event:'loading'|'update', cb:FnStringVoid): void;
  static on(event:'loading'|'update', module: string, cb:FnStringVoid): void;
  static on(event:'ready', cb:FnVoid): void;
  static on(
    event:ReadinessEvent,
    moduleOrCallback:ReadinessEventCallback|string,
    callback?:ReadinessEventCallback
  ) {
    let module:string|null = null;
    if (typeof moduleOrCallback === 'string') {
      module = moduleOrCallback
    } else {
      callback = moduleOrCallback;
    }

    switch (event) {
    case 'ready':
      this.events.ready.push(callback as FnVoid);
      break;
    case 'loading':
    case 'update':
      this.events[event].push({module, cb: callback as FnStringVoid});
      break;
    }
  }
  
  private static fireEvent(event:'loading'|'update', module:string): void;
  private static fireEvent(event:'ready'): void;
  private static fireEvent(event:ReadinessEvent, module?:string): void {
    switch (event) {
    case 'ready':
      for (const cb of this.events.ready) {
        cb();
      }
      break;
    case 'loading':
    case 'update':
      for (const cb of this.events[event]) {
        if (cb.module === null || cb.module === module) {
          cb.cb(module as string);
        }
      }
      break;
    }
  }

  static get(name: string): Readiness;
  static get(name: string, constructIfNotAvailable: true): Readiness;
  static get(name: string, constructIfNotAvailable: false): Readiness|null;
  static get(
    name: string,
    constructIfNotAvailable: boolean=true
  ): Readiness|null {
    for (const item of Readiness.trackedItems) {
      if (item.name === name) {
        return item;
      }
    }
    if (constructIfNotAvailable) {
      return new Readiness(name);
    }
    return null;
  }

  /**
   * Indicate that the given names are expected to be tracked, even if a promise
   * is not yet ready.
   */
  static preload(...names:(string[]|string)[]) {
    names.flat().forEach(name => Readiness.get(name));
  }

  private _promise: Promise<any>|null = null;
  private _isReady = false;
  private _name: string;
  private thens: (()=>{})[] = [];

  constructor(name: string, promise?: Promise<any>) {
    if (!Readiness.log) {
      Readiness.log = getLogger(MODULE, 'class');
    }
    for (const item of Readiness.trackedItems) {
      if (item.name === name) {
        throw new Error(`Duplicate name "${name}"`);
      }
    }
    this._name = name;
    Readiness.trackedItems.push(this);
    promise && (this.promise = promise);
  }

  get isReady(): boolean {
    return !!(this._promise && this._isReady);
  }
  get name(): string {
    return this._name;
  }

  set promise(p: Promise<any>) {
    this._isReady = false;
    p.then(() => {
      Readiness.log?.verbose('Readiness object %s is ready.', this.name);
      this._isReady = true;
      for (const then of this.thens) {
        then();
      }
      Readiness.fireEvent('update', this.name);
      if (Readiness.isReady) {
        Readiness.log?.verbose('Readiness.isReady is true, firing event');
        Readiness.fireEvent('ready');
      }
    });
    if (this._promise) {
      this.thens = [];
    }
    this._promise = p;
    Readiness.fireEvent('loading', this.name);
  }

  /**
   * Add a callback to run when the promise of this readiness object is
   * fulfilled. If the promise hasn't been added yet, the callback will be
   * remembered for when the promise is available.
   * @param cb 
   */
  then(cb:()=>{}) {
    if (this.isReady) {
      cb();
    } else {
      this.thens.push(cb);
    }
  }
}

export default Readiness;
