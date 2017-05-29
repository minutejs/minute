/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var MinuteImporter = (function () {
        function MinuteImporter() {
            this.restrict = 'E';
            this.replace = true;
            this.scope = { into: '=?', data: '=', onChange: '&' };
            this.link = function ($scope, elements) {
                $scope.$watch('data', function (data) {
                    $scope.into = data;
                    if ($scope.onChange) {
                        $scope.onChange({ data: data });
                    }
                });
            };
        }
        MinuteImporter.instance = function () {
            return new MinuteImporter;
        };
        return MinuteImporter;
    }());
    Minute.MinuteImporter = MinuteImporter;
    angular.module('MinuteImporter', [])
        .directive('minuteImporter', MinuteImporter.instance);
})(Minute || (Minute = {}));
