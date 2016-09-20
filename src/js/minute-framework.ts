/// <reference path="../../_all.d.ts" />
module Minute {
    export class MinuteFramework implements ng.IServiceProvider {
        constructor() {
            this.$get.$inject = ['$config', '$rootScope', '$session', '$ui', '$http', '$timeout', 'gettext', 'authService'];
        }

        $get = ($config: Config, $rootScope: RootScopeEx, $session: Session, $ui: UiService, $http: ng.IHttpService, $timeout: ng.ITimeoutService,
                gettext: angular.gettext.gettextFunction, authService: any) => {
            let service: any = {};
            let lastTimeout;
            let errorStr = (e) => e && e.data && /^DUPLICATE/.test(e.data) ? e.data : gettext('Error');
            let log = (msg: any, type: string) => {
                if (msg) {
                    $ui.toast(msg === true ? gettext('Success') : msg, type);
                }
            };

            service.save = (deferred: any, args: any) => {
                let parent = args.parent;
                let items = args.items;

                if (items.length > 0) {
                    let serialized = items.map((item) => item.serialize(true));
                    let promise = $http.post(parent.metadata.url || '', {cmd: 'save', model: parent.modelClass, alias: parent.alias, items: serialized});
                    promise.then(deferred.resolve, deferred.reject);
                    promise.then(() => log(args.successMsg, 'success'), (e) => log(args.failureMsg || (args.failureMsg !== false && args.successMsg ? errorStr(e) : ''), 'error'));
                    promise.finally(service.digest);
                } else {
                    deferred.resolve({data: {items: []}});
                    service.digest();
                }
            };

            service.remove = (deferred: any, args: any) => {
                let parent = args.parent;
                let items = args.items;

                if (items.length > 0) {
                    let serialized = items.map((item) => Utils.keyValue(parent.pk, item.attr(parent.pk)));
                    let promise = $http.post(parent.metadata.url || '', {cmd: 'remove', model: parent.modelClass, alias: parent.alias, items: serialized});

                    promise.then(deferred.resolve, deferred.reject);
                    promise.then(() => log(args.successMsg, 'success'), () => log(args.failureMsg || (args.failureMsg !== false && args.successMsg ? 'Error' : ''), 'error'));
                    promise.finally(service.digest);
                } else {
                    deferred.resolve({data: {items: []}});
                    service.digest();
                }
            };

            service.removeConfirm = (deferred: any, args: any) => {
                $ui.confirm(args.confirmText || gettext('This action cannot be undone')).then(deferred.resolve, deferred.reject);
            };

            service.reload = (deferred: any, args: any) => {
                let parent = args.parent;
                let metadataChain = args.metadata || {};

                let promise = $http.get(parent.metadata.url || '', {params: {cmd: 'reload', model: parent.modelClass, alias: parent.alias, metadata: metadataChain}});
                promise.then(deferred.resolve, deferred.reject);
                promise.finally(service.digest);
            };

            service.digest = () => {
                $timeout.cancel(lastTimeout);
                lastTimeout = $timeout(() => 1);
            };

            service.init = () => {
                let events = getEventEmitter();

                events.off(MINUTE_SAVE).on(MINUTE_SAVE, service.save);
                events.off(MINUTE_REMOVE).on(MINUTE_REMOVE, service.remove);
                events.off(MINUTE_REMOVE_CONFIRM).on(MINUTE_REMOVE_CONFIRM, service.removeConfirm);
                events.off(MINUTE_RELOAD).on(MINUTE_RELOAD, service.reload);
                events.off(MINUTE_ATTR_CHANGE).on(MINUTE_ATTR_CHANGE, service.digest);

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
        }
    }

    angular.module('MinuteFramework', ['MinuteConfig', 'MinuteUI', 'MinuteSession', 'MinuteImporter', 'gettext', 'http-auth-interceptor'])
        .provider("$minute", MinuteFramework)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        }]);
}