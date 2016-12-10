/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var MinuteCookie = (function () {
        function MinuteCookie() {
            this.$get = function ($rootScope, $session) {
                var service = {};
                service.setCookie = function (name, value, days) {
                    if (days === void 0) { days = 365; }
                    var expires = "";
                    if (days > 0) {
                        var date = new Date();
                        date.setTime(date.getTime() + Math.round(days * 24 * 60 * 60 * 1000));
                        expires = "; expires=" + date['toGMTString']();
                    }
                    else if ((days < 0) || (value === null)) {
                        expires = "; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                    }
                    document.cookie = name + "=" + value + expires + "; path=/; domain=." + $rootScope.session.site.domain;
                };
                service.getCookie = function (name) {
                    var nameEQ = name + "=";
                    var ca = document.cookie.split(';');
                    for (var i = 0; i < ca.length; i++) {
                        var c = ca[i];
                        while (c.charAt(0) == ' ')
                            c = c.substring(1, c.length);
                        if (c.indexOf(nameEQ) == 0)
                            return c.substring(nameEQ.length, c.length);
                    }
                    return null;
                };
                service.init = function () {
                    return service;
                };
                return service.init();
            };
            this.$get.$inject = ['$rootScope', '$session'];
        }
        return MinuteCookie;
    }());
    Minute.MinuteCookie = MinuteCookie;
    angular.module('MinuteCookie', ['MinuteFramework'])
        .provider("$cookie", MinuteCookie);
})(Minute || (Minute = {}));
