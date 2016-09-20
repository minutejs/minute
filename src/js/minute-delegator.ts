/// <reference path="../../_all.d.ts" />
/// This helps to decouple our core library from AngularJs
module Minute {
    let _emitter;

    export const MINUTE_SAVE = 'minute.save';
    export const MINUTE_REMOVE = 'minute.remove';
    export const MINUTE_REMOVE_CONFIRM = 'minute.remove.confirm';
    export const MINUTE_RELOAD = 'minute.reload';
    export const MINUTE_ATTR_CHANGE = 'minute.attr.change';

    export class Delegator {
        public promise;
        protected emitter = getEventEmitter();

        dispatch = (eventName:string, args:any) => {
            let deferred = this.defer();

            this.emitter.emit(eventName, deferred, args);

            return deferred.promise;
        };

        defer = () => {
            var result:any = {};
            result.promise = new Promise(function (resolve, reject) {
                result.resolve = resolve;
                result.reject = reject;
            });

            return result;
        };
    }

    export function getEventEmitter():Emitter {
        return (_emitter || (_emitter = new window['Emitter']()));
    }
}