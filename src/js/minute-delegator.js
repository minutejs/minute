/// <reference path="../../_all.d.ts" />
/// This helps to decouple our core library from AngularJs
var Minute;
(function (Minute) {
    var _emitter;
    Minute.MINUTE_SAVE = 'minute.save';
    Minute.MINUTE_REMOVE = 'minute.remove';
    Minute.MINUTE_REMOVE_CONFIRM = 'minute.remove.confirm';
    Minute.MINUTE_RELOAD = 'minute.reload';
    Minute.MINUTE_ATTR_CHANGE = 'minute.attr.change';
    var Delegator = (function () {
        function Delegator() {
            var _this = this;
            this.emitter = getEventEmitter();
            this.dispatch = function (eventName, args) {
                var deferred = _this.defer();
                _this.emitter.emit(eventName, deferred, args);
                return deferred.promise;
            };
            this.defer = function () {
                var result = {};
                result.promise = new Promise(function (resolve, reject) {
                    result.resolve = resolve;
                    result.reject = reject;
                });
                return result;
            };
        }
        return Delegator;
    }());
    Minute.Delegator = Delegator;
    function getEventEmitter() {
        return (_emitter || (_emitter = new window['Emitter']()));
    }
    Minute.getEventEmitter = getEventEmitter;
})(Minute || (Minute = {}));
