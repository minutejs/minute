/// <reference path="../../_all.d.ts" />
module Minute {
    export class MinuteConfig implements ng.IServiceProvider {
        public config:Config = {
            debug: true,
            autoInject: true,
            urls: {}
        };

        boot = (httpProvider:ng.IHttpProvider) => {
            httpProvider.defaults.headers.common.Accept = 'application/json, text/javascript';
        };

        $get = ():Config => {
            return this.config;
        };
    }


    angular.module('MinuteConfig', [])
        .provider("$config", MinuteConfig)
        .config(['$configProvider', '$httpProvider', ($configProvider:MinuteConfig, httpProvider:ng.IHttpProvider) => {
            $configProvider.boot(httpProvider);
        }]);
}
