/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var MinuteConfig = (function () {
        function MinuteConfig() {
            var _this = this;
            this.config = {
                debug: true,
                autoInject: true,
                urls: {}
            };
            this.boot = function (httpProvider) {
                httpProvider.defaults.headers.common.Accept = 'application/json, text/javascript';
            };
            this.$get = function () {
                return _this.config;
            };
        }
        return MinuteConfig;
    }());
    Minute.MinuteConfig = MinuteConfig;
    angular.module('MinuteConfig', [])
        .provider("$config", MinuteConfig)
        .config(['$configProvider', '$httpProvider', function ($configProvider, httpProvider) {
            $configProvider.boot(httpProvider);
        }]);
})(Minute || (Minute = {}));
