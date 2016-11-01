/// <reference path="../../_all.d.ts" />
module Minute {
    let scopes = [];
    let sessionData: any = {user: {}, site: {}, request: {}, providers: [{name: 'Email', showIcons: true, showLabels: true, enabled: true}]};

    export function setSessionData(data: Session, event: string = 'session_user_update') {
        if (data) {
            if (data.request && location.hash) {
                angular.extend(data.request, {hash: location.hash.substr(1)});
            }

            sessionData = data;

            //console.log("event: ", event);
            //console.log("data: ", data);

            angular.forEach(scopes, (scope) => {
                angular.extend(scope.session, data);
                scope.$broadcast('session_user_update', {event: event, data: scope.session});

                if (event !== 'session_user_update') {
                    scope.$broadcast(event, scope.session);
                }
            });
        }
    }

    export function getSessionData() {
        return sessionData;
    }

    export class MinuteSession implements ng.IServiceProvider {
        constructor() {
            this.$get.$inject = ['$config', '$rootScope', '$ui', '$http', '$timeout'];
        }

        $get = ($config: Config, $rootScope: any, $ui: UiService, $http: ng.IHttpService, $timeout: ng.ITimeoutService): Session => {
            let service: any = {};
            let data: any = {form: {}};

            let popup = (url: string, modal: boolean, operation: string = '') => {
                angular.extend(data, {service: service, error: ''});

                $ui.closePopup();
                $ui.popupUrl(url, modal, null, {data: data, submit: () => service.submit(url, operation)});
            };

            let showHideLinks = (data: any) => {
                let loggedIn = data && data.user && data.user.user_id > 0;

                angular.element(document).find(loggedIn ? '.visible-members' : '.visible-non-members').show();
                angular.element(document).find(!loggedIn ? '.visible-members' : '.visible-non-members').hide();
            };

            service.login = (modal: boolean = false) => {
                popup($config.urls.login || '/auth/login-popup', modal, 'login');
            };

            service.signup = (modal: boolean = false) => {
                popup($config.urls.signup || '/auth/signup-popup', modal, 'signup');
            };

            service.forgotPassword = (modal: boolean = false) => {
                popup($config.urls.forgotPassword || '/auth/forgot-password-popup', modal, 'forgot-password');
            };

            service.createPassword = (modal: boolean = false) => {
                popup($config.urls.createPassword || '/auth/create-password-popup', modal, 'create-password');
            };

            service.logout = (redirect: string = '') => {
                let promise = $http.get($config.urls.logout || '/logout');
                if (redirect) {
                    promise.then(() => top.location.href = redirect);
                }

                return promise;
            };

            service.update = (data) => {
                setSessionData(data);
            };

            service.reload = () => {
                $http.get($config.urls.sessionReload || '/auth/session').then((result: any) => setSessionData(result.data));
            };

            service.socialLogin = (id: string) => {
                window.open('/auth/hauth/' + id, "login", "location=0,status=0,scrollbars=0,width=640,height=480"); //(/\=Facebook/.test(url) ?
            };

            service.socialSignup = (id: string) => {
                service.socialLogin(id);
            };

            service.submit = (url: string, operation: string = '') => {
                data.isLoading = true;
                let promise = $http.post(url, data.form);

                promise.then(
                    (result: any) => {
                        $ui.closePopup();
                        setSessionData(result.data.update, result.data.event);
                        $rootScope.$broadcast('session_popup_submit_pass', {operation: operation, data: result.data});
                    },
                    (result) => {
                        data.error = result.data;
                        $rootScope.$broadcast('session_popup_submit_fail', {operation: operation, data: result.data});
                    }
                ).then(() => data.isLoading = false);
            };


            service.init = () => {
                if ($config.autoInject) {
                    scopes.push($rootScope);
                    $rootScope.session = angular.extend({}, service, sessionData);
                    $rootScope.$on('session_user_update', (data: any) => $timeout(showHideLinks));
                    $timeout(() => showHideLinks(sessionData));
                }

                if (!/tz\_offset\=/.test(document.cookie)) {
                    let expires = new Date("2020-01-01");
                    document.cookie = "tz_offset=" + expires.getTimezoneOffset() + ";expires=" + expires.toString() + ";path=/;domain=." + location.hostname.replace(/^www\./, '');
                }

                return service;
            };


            return service.init();
        };
    }

    angular.module('MinuteSession', ['MinuteConfig', 'MinuteUI'])
        .provider("$session", MinuteSession);
}
