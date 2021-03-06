/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var scopes = [];
    var sessionData = { user: {}, site: {}, request: {}, providers: [{ name: 'Email', showIcons: true, showLabels: true, enabled: true }] };
    function setSessionData(data, event) {
        if (event === void 0) { event = 'session_user_update'; }
        if (data) {
            if (data.request && location.hash) {
                angular.extend(data.request, { hash: location.hash.substr(1) });
            }
            sessionData = data;
            //console.log("event: ", event);
            //console.log("data: ", data);
            angular.forEach(scopes, function (scope) {
                angular.extend(scope.session, data);
                scope.$broadcast('session_user_update', { event: event, data: scope.session });
                if (event !== 'session_user_update') {
                    scope.$broadcast(event, scope.session);
                }
            });
        }
    }
    Minute.setSessionData = setSessionData;
    function getSessionData() {
        return sessionData;
    }
    Minute.getSessionData = getSessionData;
    var MinuteSession = (function () {
        function MinuteSession() {
            this.$get = function ($config, $rootScope, $ui, $http, $timeout, $q) {
                var service = {};
                var data = { form: {} };
                var popup = function (url, modal, operation, params) {
                    if (operation === void 0) { operation = ''; }
                    if (params === void 0) { params = {}; }
                    angular.extend(data, { service: service, error: '' }, params);
                    $ui.closePopup();
                    $ui.popupUrl(url, modal, null, { data: data, submit: function () { return service.submit(url, operation); } });
                };
                var showHideLinks = function (data) {
                    var loggedIn = data && data.user && data.user.user_id > 0;
                    angular.element(document).find(loggedIn ? '.visible-members' : '.visible-non-members').show();
                    angular.element(document).find(!loggedIn ? '.visible-members' : '.visible-non-members').hide();
                };
                service.login = function (modal) {
                    if (modal === void 0) { modal = false; }
                    popup($config.urls.login || '/auth/login-popup', modal, 'login');
                };
                service.signup = function (modal) {
                    if (modal === void 0) { modal = false; }
                    popup($config.urls.signup || '/auth/signup-popup', modal, 'signup');
                };
                service.forgotPassword = function (modal) {
                    if (modal === void 0) { modal = false; }
                    popup($config.urls.forgotPassword || '/auth/forgot-password-popup', modal, 'forgot-password');
                };
                service.createPassword = function (modal) {
                    if (modal === void 0) { modal = false; }
                    popup($config.urls.createPassword || '/auth/create-password-popup', modal, 'create-password');
                };
                service.checkRegistration = function (params) {
                    if (params === void 0) { params = { title: '', msg: '', cta: '' }; }
                    var deferred = $q.defer();
                    if (sessionData && sessionData.user && sessionData.user.hasOwnProperty('email') && /@/.test(sessionData.user.email)) {
                        $timeout(function () { return deferred.resolve(sessionData.user); });
                    }
                    else {
                        var removeWatch_1 = $rootScope.$on('session_user_update', function (event, obj) {
                            removeWatch_1();
                            service.checkRegistration(params).then(function () { return deferred.resolve(sessionData.user); });
                        });
                        popup($config.urls.completeSignup || '/auth/complete-signup-popup', true, 'signup', params);
                    }
                    return deferred.promise;
                };
                service.logout = function (redirect) {
                    if (redirect === void 0) { redirect = ''; }
                    var promise = $http.get($config.urls.logout || '/logout');
                    if (redirect) {
                        promise.then(function () { return top.location.href = redirect; });
                    }
                    return promise;
                };
                service.update = function (data) {
                    setSessionData(data);
                };
                service.reload = function () {
                    $http.get($config.urls.sessionReload || '/auth/session').then(function (result) { return setSessionData(result.data); });
                };
                service.socialLogin = function (id) {
                    window.open('/auth/hauth/' + id, "login", "location=0,status=0,scrollbars=0,width=640,height=480"); //(/\=Facebook/.test(url) ?
                };
                service.socialSignup = function (id) {
                    service.socialLogin(id);
                };
                service.submit = function (url, operation) {
                    if (operation === void 0) { operation = ''; }
                    data.isLoading = true;
                    var promise = $http.post(url, data.form);
                    promise.then(function (result) {
                        $ui.closePopup();
                        setSessionData(result.data.update, result.data.event);
                        $rootScope.$broadcast('session_popup_submit_pass', { operation: operation, data: result.data });
                    }, function (result) {
                        data.error = result.data;
                        $rootScope.$broadcast('session_popup_submit_fail', { operation: operation, data: result.data });
                    }).then(function () { return data.isLoading = false; });
                };
                service.init = function () {
                    if ($config.autoInject) {
                        scopes.push($rootScope);
                        $rootScope.session = angular.extend({}, service, sessionData);
                        $rootScope.$on('session_user_update', function (data) { return $timeout(showHideLinks); });
                        $timeout(function () { return showHideLinks(sessionData); });
                    }
                    if (!/tz\_offset\=/.test(document.cookie)) {
                        var expires = new Date("2020-01-01");
                        document.cookie = "tz_offset=" + expires.getTimezoneOffset() + ";expires=" + expires.toString() + ";path=/;domain=." + location.hostname.replace(/^www\./, '');
                    }
                    return service;
                };
                return service.init();
            };
            this.$get.$inject = ['$config', '$rootScope', '$ui', '$http', '$timeout', '$q'];
        }
        return MinuteSession;
    }());
    Minute.MinuteSession = MinuteSession;
    angular.module('MinuteSession', ['MinuteConfig', 'MinuteUI'])
        .provider("$session", MinuteSession);
})(Minute || (Minute = {}));
