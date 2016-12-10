/// <reference path="../../_all.d.ts" />
module Minute {
    export class MinuteCookie implements ng.IServiceProvider {
        constructor() {
            this.$get.$inject = ['$rootScope', '$session'];
        }

        $get = ($rootScope: any, $session: any) => {
            let service: any = {};

            service.setCookie = (name, value, days = 365) => {
                var expires = "";

                if (days > 0) {
                    var date = new Date();
                    date.setTime(date.getTime() + Math.round(days * 24 * 60 * 60 * 1000));
                    expires = "; expires=" + date['toGMTString']();
                } else if ((days < 0) || (value === null)) {
                    expires = "; expires=Thu, 01 Jan 1970 00:00:01 GMT";
                }

                document.cookie = name + "=" + value + expires + "; path=/; domain=." + $rootScope.session.site.domain;
            };

            service.getCookie = (name) => {
                var nameEQ = name + "=";
                var ca = document.cookie.split(';');

                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
                }

                return null;
            };

            service.init = () => {
                return service;
            };

            return service.init();
        }
    }

    angular.module('MinuteCookie', ['MinuteFramework'])
        .provider("$cookie", MinuteCookie);
}