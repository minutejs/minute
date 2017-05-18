/// <reference path="../../_all.d.ts" />

module Minute {
    export class MinuteImporter implements ng.IDirective {
        restrict = 'E';
        replace = true;
        scope = {into: '=?', data: '=', onChange: '&'};

        static instance(): ng.IDirective {
            return new MinuteImporter;
        }

        link = ($scope: any, elements: ng.IAugmentedJQuery) => {
            $scope.$watch('data', (data) => {
                $scope.into = data;

                if ($scope.onChange) {
                    $scope.onChange({data: data});
                }
            });
        }
    }

    angular.module('MinuteImporter', [])
        .directive('minuteImporter', MinuteImporter.instance);
}