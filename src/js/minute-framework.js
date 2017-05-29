/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var MinuteFramework = (function () {
        function MinuteFramework() {
            this.$get = function ($config, $rootScope, $session, $ui, $http, $timeout, gettext, authService) {
                var service = {};
                var lastTimeout;
                var errorStr = function (e) { return e && e.data && /^DUPLICATE/.test(e.data) ? e.data : gettext('Error'); };
                var log = function (msg, type) {
                    if (msg) {
                        $ui.toast(msg === true ? gettext('Success') : msg, type);
                    }
                };
                service.save = function (deferred, args) {
                    var parent = args.parent;
                    var items = args.items;
                    if (items.length > 0) {
                        var serialized = items.map(function (item) { return item.serialize(true); });
                        var promise = $http.post(parent.metadata.url || '', { cmd: 'save', model: parent.modelClass, alias: parent.alias, items: serialized });
                        promise.then(deferred.resolve, deferred.reject);
                        promise.then(function () { return log(args.successMsg, 'success'); }, function (e) { return log(args.failureMsg || (args.failureMsg !== false && args.successMsg ? errorStr(e) : ''), 'error'); });
                        promise["finally"](service.digest);
                    }
                    else {
                        deferred.resolve({ data: { items: [] } });
                        service.digest();
                    }
                };
                service.remove = function (deferred, args) {
                    var parent = args.parent;
                    var items = args.items;
                    if (items.length > 0) {
                        var serialized = items.map(function (item) { return Minute.Utils.keyValue(parent.pk, item.attr(parent.pk)); });
                        var promise = $http.post(parent.metadata.url || '', { cmd: 'remove', model: parent.modelClass, alias: parent.alias, items: serialized });
                        promise.then(deferred.resolve, deferred.reject);
                        promise.then(function () { return log(args.successMsg, 'success'); }, function () { return log(args.failureMsg || (args.failureMsg !== false && args.successMsg ? 'Error' : ''), 'error'); });
                        promise["finally"](service.digest);
                    }
                    else {
                        deferred.resolve({ data: { items: [] } });
                        service.digest();
                    }
                };
                service.removeConfirm = function (deferred, args) {
                    $ui.confirm(args.confirmText || gettext('This action cannot be undone')).then(deferred.resolve, deferred.reject);
                };
                service.reload = function (deferred, args) {
                    var parent = args.parent;
                    var metadataChain = args.metadata || {};
                    var promise = $http.get(parent.metadata.url || '', { params: { cmd: 'reload', model: parent.modelClass, alias: parent.alias, metadata: metadataChain } });
                    promise.then(deferred.resolve, deferred.reject);
                    promise["finally"](service.digest);
                };
                service.digest = function () {
                    $timeout.cancel(lastTimeout);
                    lastTimeout = $timeout(function () { return 1; });
                };
                service.init = function () {
                    var events = Minute.getEventEmitter();
                    events.off(Minute.MINUTE_SAVE).on(Minute.MINUTE_SAVE, service.save);
                    events.off(Minute.MINUTE_REMOVE).on(Minute.MINUTE_REMOVE, service.remove);
                    events.off(Minute.MINUTE_REMOVE_CONFIRM).on(Minute.MINUTE_REMOVE_CONFIRM, service.removeConfirm);
                    events.off(Minute.MINUTE_RELOAD).on(Minute.MINUTE_RELOAD, service.reload);
                    events.off(Minute.MINUTE_ATTR_CHANGE).on(Minute.MINUTE_ATTR_CHANGE, service.digest);
                    if ($config.autoInject) {
                        $rootScope.$on('event:auth-loginRequired', function () {
                            $rootScope.session.login();
                        });
                        $rootScope.$on('session_user_update', function () {
                            authService.loginConfirmed();
                        });
                        Minute.Loader($rootScope);
                    }
                };
                service.init();
                return service;
            };
            this.$get.$inject = ['$config', '$rootScope', '$session', '$ui', '$http', '$timeout', 'gettext', 'authService'];
        }
        return MinuteFramework;
    }());
    Minute.MinuteFramework = MinuteFramework;
    angular.module('MinuteFramework', ['MinuteConfig', 'MinuteUI', 'MinuteSession', 'MinuteImporter', 'gettext', 'http-auth-interceptor'])
        .provider("$minute", MinuteFramework)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        }]);
})(Minute || (Minute = {}));
