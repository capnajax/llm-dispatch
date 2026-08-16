/**
 * Class to indicate what things are ready
 */
import { getLogger } from "./logger.js";
const MODULE = 'Readiness';
class Readiness {
    static trackedItems = [];
    static get isReady() {
        return Readiness.trackedItems.every(t => t.isReady);
    }
    static events = {
        ready: [],
        loading: [],
        update: []
    };
    static log;
    static on(event, moduleOrCallback, callback) {
        let module = null;
        if (typeof moduleOrCallback === 'string') {
            module = moduleOrCallback;
        }
        else {
            callback = moduleOrCallback;
        }
        switch (event) {
            case 'ready':
                this.events.ready.push(callback);
                break;
            case 'loading':
            case 'update':
                this.events[event].push({ module, cb: callback });
                break;
        }
    }
    static fireEvent(event, module) {
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
                        cb.cb(module);
                    }
                }
                break;
        }
    }
    static get(name, constructIfNotAvailable = true) {
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
    static preload(...names) {
        names.flat().forEach(name => Readiness.get(name));
    }
    _promise = null;
    _isReady = false;
    _name;
    thens = [];
    constructor(name, promise) {
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
    get isReady() {
        return !!(this._promise && this._isReady);
    }
    get name() {
        return this._name;
    }
    set promise(p) {
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
    then(cb) {
        if (this.isReady) {
            cb();
        }
        else {
            this.thens.push(cb);
        }
    }
}
export default Readiness;
//# sourceMappingURL=readiness.js.map