/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var MinuteSortBar = (function () {
        function MinuteSortBar() {
            this.restrict = 'E';
            this.replace = true;
            this.scope = { on: '=?', columns: '=?' };
            this.template = "\n            <select class=\"form-control input-sm\" ng-model=\"data.sortBy\" ng-options=\"column.field as column.label for column in data.cols2\" title=\"sort by..\">\n                <option value=\"\" translate=\"\">Sort by..</option>\n            </select>\n        ";
            this.link = function ($scope, elements, attrs) {
                $scope.data = { cols2: [] };
                $scope.$watch('on', function (on) {
                    if (on) {
                        $scope.data.sortBy = on.getOrder();
                    }
                });
                $scope.$watch('columns', function (cols) {
                    $scope.data.cols2 = [];
                    angular.forEach(cols, function (v) {
                        angular.forEach(['asc', 'desc'], function (o) {
                            $scope.data.cols2.push({ label: v.label + ' (' + o + ')', field: v.field + ' ' + o });
                        });
                    });
                });
                $scope.$watch('data.sortBy', function (order) {
                    if ($scope.on && order) {
                        $scope.on.setOrder(order, true);
                    }
                });
            };
        }
        MinuteSortBar.factory = function () {
            return function () { return new MinuteSortBar(); };
        };
        return MinuteSortBar;
    }());
    Minute.MinuteSortBar = MinuteSortBar;
    var MinuteSearchBar = (function () {
        function MinuteSearchBar() {
            this.restrict = 'E';
            this.replace = true;
            this.scope = { on: '=?', search: '=?', columns: '@', operator: '@', label: '@' };
            this.template = "\n        <form ng-submit=\"find()\" class=\"form-inline\">\n            <div class=\"input-group input-group-sm search-bar\">\n              <input type=\"search\" ng-model=\"data.search\" class=\"form-control pull-right\" placeholder=\"{{label}}\">\n    \n              <div class=\"input-group-btn\">\n                <button type=\"submit\" class=\"btn btn-default\"><i class=\"fa fa-search\"></i></button>\n              </div>\n            </div>\n        </form>\n        ";
            this.link = function ($scope, elements, attrs) {
                $scope.data = {};
                $scope.find = function () {
                    if ($scope.data.search != $scope.data.last) {
                        var operator = $scope.operator || 'LIKE';
                        var term = operator == 'LIKE' ? '%' + $scope.data.search + '%' : $scope.data.search;
                        var search = { columns: $scope.columns, operator: operator, value: term };
                        $scope.search = $scope.data.search;
                        $scope.data.last = $scope.data.search;
                        $scope.on.setSearch(search, true);
                    }
                };
                $scope.$watch('search', function (search) {
                    if (search) {
                        $scope.data.search = search;
                    }
                });
            };
        }
        MinuteSearchBar.factory = function () {
            return function () { return new MinuteSearchBar(); };
        };
        return MinuteSearchBar;
    }());
    Minute.MinuteSearchBar = MinuteSearchBar;
    var MinutePager = (function () {
        function MinutePager() {
            this.restrict = 'E';
            this.replace = true;
            this.scope = { on: '=', display: '@', numPages: '@', noResults: '@', alwaysShow: '@' };
            this.template = "\n        <div ng-switch=\"!!on.getTotalItems()\">\n            <ul class=\"pagination pagination-sm no-margin\" ng-switch-when=\"true\" ng-show=\"(alwaysShow === 'true') || (on.getTotalPages() > 1)\">\n              <li><a href=\"\" ng-click=\"on.loadPrevPage(true)\">\u00AB</a></li>\n              <li ng-show=\"start > 1\"><a href=\"\">&hellip;</a href=\"\"></li>\n              <li ng-class=\"{active: i === on.getCurrentPage()}\" ng-repeat=\"i in pages()\"><a href=\"\" ng-click=\"on.setCurrentPage(i)\">{{i}}</a></li>\n              <li ng-show=\"end < on.getTotalPages()\"><a href=\"\">&hellip;</a href=\"\"></li>\n              <li><a href=\"\" ng-click=\"on.loadNextPage(true)\">\u00BB</a></li>\n            </ul>            \n            <div class=\"small\" ng-switch-when=\"false\">\n                <span>{{noResults}}</span>\n            </div>\n        </div>\n        ";
            this.link = function ($scope) {
                $scope.pages = function () {
                    var num = parseInt($scope.numPages || 2);
                    var page = $scope.on.getCurrentPage();
                    var itemsOnEachSide = num / 2;
                    var itemsOnLeft = Math.min(itemsOnEachSide, page - 1);
                    var itemsOnRight = Math.min(num - itemsOnLeft, $scope.on.getTotalPages() - page);
                    itemsOnLeft = itemsOnLeft + Math.max(itemsOnEachSide - itemsOnRight, 0);
                    $scope.start = Math.max(1, page - itemsOnLeft);
                    $scope.end = Math.min($scope.on.getTotalPages(), page + itemsOnRight);
                    var results = [];
                    for (var i = $scope.start; i <= $scope.end; i++) {
                        results.push(i);
                    }
                    return results;
                };
            };
        }
        MinutePager.factory = function () {
            return function () { return new MinutePager(); };
        };
        return MinutePager;
    }());
    Minute.MinutePager = MinutePager;
    //sort a list using jQueryUi
    var MinuteListSorter = (function () {
        function MinuteListSorter($timeout) {
            this.$timeout = $timeout;
            this.restrict = 'A';
            this.scope = { 'minuteListSorter': '=?', sortIndex: '@', selector: '@', onOrder: '=?', uiOptions: '=?' };
            this.link = function ($scope, element, attrs) {
                var selector = $scope.selector || '> [ng-repeat]';
                var sortKey = $scope.sortIndex || 'priority';
                var ordered;
                element.sortable(angular.extend({
                    axis: "y",
                    items: selector,
                    cursor: "move",
                    start: function () {
                        ordered = [];
                        for (var _i = 0, _a = $scope.minuteListSorter; _i < _a.length; _i++) {
                            var item = _a[_i];
                            ordered.push(item);
                        }
                        for (var j = 0; j < ordered.length - 1; j++) {
                            for (var i = 0, swapping = void 0; i < ordered.length - 1; i++) {
                                if ((ordered[i][sortKey] || 0) > (ordered[i + 1][sortKey] || 0)) {
                                    swapping = ordered[i + 1];
                                    ordered[i + 1] = ordered[i];
                                    ordered[i] = swapping;
                                }
                            }
                        }
                        angular.forEach(element.find(selector), function (div, index) { return angular.element(div).attr('data-sort-index', index); });
                    },
                    stop: function () {
                        var changed = [];
                        angular.forEach(element.find(selector), function (div, index) {
                            var order = angular.element(div).attr('data-sort-index');
                            if (order || order === '0') {
                                if (ordered[order][sortKey] !== index) {
                                    ordered[order][sortKey] = index;
                                    changed.push(ordered[order]);
                                }
                            }
                        });
                        if ($scope.onOrder) {
                            $scope.onOrder(changed);
                        }
                        else if (changed.length > 0) {
                            if ($scope.minuteListSorter instanceof Minute.Items) {
                                changed[0].parent.saveAll('', '', changed);
                                console.log("changed: ", changed);
                            }
                        }
                        $scope.$apply();
                    }
                }, $scope.uiOptions));
                $scope.$watch('minuteListSorter', function (arr) { return angular.forEach(arr || [], function (item) { return item[sortKey] = item[sortKey] || 0; }); });
            };
        }
        MinuteListSorter.factory = function () {
            var directive = function ($timeout) { return new MinuteListSorter($timeout); };
            directive.$inject = ["$timeout"];
            return directive;
        };
        return MinuteListSorter;
    }());
    Minute.MinuteListSorter = MinuteListSorter;
    var MinuteUploader = (function () {
        function MinuteUploader($timeout, $ui, gettext) {
            var _this = this;
            this.$timeout = $timeout;
            this.$ui = $ui;
            this.gettext = gettext;
            this.restrict = 'E';
            this.require = 'ngModel';
            this.replace = true;
            this.scope = { type: '@', multiple: '@', preview: '@', btnClass: '@', label: '@', ngRequired: '@', remove: '@', icon: '@', hint: '@', url: '@', onUpload: '=?', accept: '@' };
            this.template = "\n            <div style=\"display: inline-block\">\n                <div class=\"btn-group\" ng-show=\"!uploading\">\n                  <button type=\"button\" class=\"{{btnClass || 'btn btn-default btn-sm'}}\" ng-click=\"upload()\" tooltip=\"{{hint || 'Upload'}}\">\n                    <i class=\"fa {{icon || 'fa-upload'}}\" ng-show=\"icon !== 'false'\"></i> <span ng-show=\"label !== 'false'\">{{label || 'Upload..'}}</span>\n                  </button>\n                  <button ng-show=\"url === 'true'\" type=\"button\" class=\"{{btnClass || 'btn btn-default btn-sm'}}\" data-toggle=\"dropdown\"><span class=\"caret\"></span></button>\n                  <ul ng-show=\"url === 'true'\" class=\"dropdown-menu\">                    \n                    <li><a href=\"\" ng-click=\"addUrl()\">Upload via URL..</a></li>\n                  </ul>\n                </div>\n                \n                <button type=\"button\" class=\"{{btnClass || 'btn btn-danger btn-sm'}}\" ng-click=\"cancel()\" ng-show=\"uploading\"><i class=\"fa fa-refresh fa-spin\"></i>\n                    <span ng-show=\"label !== 'false'\">Cancel</span>\n                </button>\n                <minute-preview type=\"{{type || 'image'}}\" ng-if=\"preview == 'true'\" src=\"src()\"></minute-preview>\n                <a href=\"\" class=\"btn btn-xs btn-transparent\" ng-click=\"clear()\" ng-show=\"remove == 'true' && !!src()\" tooltip=\"Clear upload\"><i class=\"fa fa-trash\"></i></a>\n                <input type=\"text\" required value=\"{{src()}}\" style=\"opacity: 0; width:1px;height:1px\" ng-if=\"ngRequired == 'true'\">\n            </div>\n        ";
            this.link = function ($scope, elements, attrs, ngModel) {
                var iframe, uploader;
                var map = { image: '.png, .jpg, .jpeg, .gif', 'video': '.avi, .mov, .wmv, .mp4, .flv', 'audio': '.wav, .mp3, .ogg', 'other': '' };
                var guid = Minute.Utils.randomString(16);
                var frame = "<iframe name=\"" + guid + "\" width=\"1\" height=\"1\" style=\"position: absolute;top:-100px;\" tabindex=\"-1\"></iframe>";
                var form = "<form method=\"post\" action=\"/generic/uploader\" enctype=\"multipart/form-data\" id=\"theForm\">\n                                <input type=\"hidden\" name=\"cb\" id=\"cb\" value=\"" + guid + "\" />\n                                <input name=\"upload[]\" type=\"file\" id=\"theFile\">\n                            </form>";
                angular.element(document.body).append(frame);
                iframe = window.frames[guid];
                $scope.upload = function () {
                    window[guid] = { start: $scope.start, complete: $scope.complete, fail: $scope.fail };
                    iframe.document.write(form);
                    uploader = iframe.document.getElementById('theFile');
                    uploader.multiple = $scope.multiple === 'true';
                    uploader.accept = $scope.accept || map[$scope.type || 'image'];
                    uploader.addEventListener('change', function () {
                        iframe.document.getElementById('theForm').submit();
                        $scope.start();
                    });
                    uploader.click();
                };
                $scope.addUrl = function () {
                    _this.$ui.prompt(_this.gettext('Please copy-paste the URL to import'), 'https://', _this.gettext('Import URL')).then(function (url) {
                        $scope.complete([(url || '').replace(/^.*?:\/\//, '//')]);
                    });
                };
                $scope.start = function () {
                    $scope.isUploading(true);
                };
                $scope.fail = function (reason) {
                    $scope.stop();
                    $scope.toast(_this.gettext("Upload failed: ") + (reason || 'error'), 'error');
                };
                $scope.complete = function (results) {
                    $scope.stop();
                    if (results && results.length > 0) {
                        ngModel.$setViewValue($scope.multiple === 'true' ? results : results[0]);
                        if (typeof $scope.onUpload == 'function') {
                            $scope.onUpload(ngModel.$viewValue);
                        }
                        else {
                            $scope.toast(_this.gettext("Upload successful"), 'success');
                        }
                    }
                    else {
                        $scope.toast(_this.gettext("Upload failed"), 'error');
                    }
                };
                $scope.toast = function (msg, type) {
                    _this.$ui.toast(msg, type);
                };
                $scope.stop = $scope.cancel = function () {
                    $scope.isUploading(false);
                    iframe.document.write('');
                };
                $scope.src = function () { return ngModel.$viewValue; };
                $scope.clear = function () { return ngModel.$setViewValue(null); };
                $scope.isUploading = function (status) { return _this.$timeout(function () { return $scope.uploading = status; }); };
            };
        }
        MinuteUploader.factory = function () {
            var directive = function ($timeout, $ui, gettext) { return new MinuteUploader($timeout, $ui, gettext); };
            directive.$inject = ["$timeout", "$ui", "gettext"];
            return directive;
        };
        return MinuteUploader;
    }());
    Minute.MinuteUploader = MinuteUploader;
    var MinutePreviewService = (function () {
        function MinutePreviewService() {
            this.$get = function ($rootScope, $ui) {
                var service = {};
                service.lightbox = function (images) {
                    var template = "\n                <div class=\"box\">\n                    <div class=\"box-body\">\n                        <a class=\"pull-right close-button\" href=\"\"><i class=\"fa fa-times\"></i></a>\n                        <div class=\"tabs-panel\" ng-init=\"tabs = {}\">\n                            <ul class=\"nav nav-tabs\">\n                                <li ng-class=\"{active: image === tabs.selectedImage}\" ng-repeat=\"image in images\" ng-init=\"tabs.selectedImage = tabs.selectedImage || image\">\n                                    <a href=\"\" ng-click=\"tabs.selectedImage = image\">{{name(image)}}</a>\n                                </li>\n                            </ul>\n                            <div class=\"tab-content\">\n                                <div class=\"tab-pane fade in active\" ng-repeat=\"image in images\" ng-if=\"image === tabs.selectedImage\">\n                                    <a ng-href=\"{{image}}\" class=\"thumbnail\" target=\"preview\"><img ng-src=\"{{image}}\"></a>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>";
                    $ui.popup(template, false, null, { images: images, name: Minute.Utils.basename });
                };
                return service;
            };
            this.$get.$inject = ['$rootScope', '$ui'];
        }
        return MinutePreviewService;
    }());
    Minute.MinutePreviewService = MinutePreviewService;
    var MinutePreview = (function () {
        function MinutePreview($preview) {
            var _this = this;
            this.$preview = $preview;
            this.restrict = 'E';
            this.replace = true;
            this.scope = { src: '=?', type: '@' };
            this.template = "\n            <ng-switch on=\"type === 'image'\" ng-show=\"!!src\">\n                <a ng-switch-when=\"true\" href=\"\" ng-click=\"preview()\" class=\"btn btn-xs btn-transparent\"><i class=\"fa fa-eye\" tooltip=\"Preview\"></i></a>\n                <a ng-switch-when=\"false\" href=\"\" ng-href=\"{{src}}\" target=\"_blank\" class=\"btn btn-xs btn-transparent\"><i class=\"fa fa-eye\" tooltip=\"Preview\"></i></a>                \n            </ng-switch>\n        ";
            this.link = function ($scope, element, attrs) {
                $scope.preview = function () {
                    var images = angular.isArray($scope.src) ? $scope.src : [$scope.src];
                    _this.$preview.lightbox(images);
                };
            };
        }
        MinutePreview.factory = function () {
            var directive = function ($preview) { return new MinutePreview($preview); };
            directive.$inject = ["$preview"];
            return directive;
        };
        return MinutePreview;
    }());
    Minute.MinutePreview = MinutePreview;
    var MinuteCheckboxAll = (function () {
        function MinuteCheckboxAll() {
            this.restrict = 'A';
            this.scope = { on: '=?', prop: '@', selection: '=?' };
            this.link = function ($scope, element, attrs) {
                var prop = $scope.prop || 'selected';
                $scope.$watch(function () {
                    if ($scope.on && $scope.on.length > 0) {
                        var pass = true;
                        var sel = angular.isArray($scope.selection) ? $scope.selection : [];
                        sel.splice(0, sel.length);
                        for (var i = 0, j = $scope.on.length; i < j; i++) {
                            var enabled = !!$scope.on[i][prop];
                            pass = pass && enabled;
                            if (enabled) {
                                sel.push($scope.on[i]);
                            }
                        }
                        return pass;
                    }
                    return false;
                }, function (v) { return element.prop('checked', v); });
                element.on('change', function () { return $scope.$apply(function () { return angular.forEach(($scope.on || []), function (item) { return item[prop] = element.prop('checked'); }); }); });
            };
        }
        return MinuteCheckboxAll;
    }());
    Minute.MinuteCheckboxAll = MinuteCheckboxAll;
    var MinuteHotKeys = (function () {
        function MinuteHotKeys($timeout) {
            var _this = this;
            this.$timeout = $timeout;
            this.restrict = 'A';
            this.scope = { minuteHotKeys: '=?' };
            this.link = function ($scope, element, attrs) {
                var mousetrap = window['Mousetrap'];
                var removeAll = function () { return angular.forEach(mousetrap, function (v, key) { return mousetrap.unbind(key); }); };
                if (!mousetrap) {
                    return console.log("Mousetrap.js is required for minuteHotKeys");
                }
                mousetrap.prototype.stopCallback = function () {
                    return false;
                };
                $scope.$watch('minuteHotKeys', function (arr) {
                    removeAll();
                    angular.forEach(arr, function (fn, key) { return mousetrap.bind(key, function (e) {
                        e.preventDefault();
                        _this.$timeout(fn);
                    }); });
                });
                $scope.$on('$destroy', removeAll);
            };
        }
        MinuteHotKeys.factory = function () {
            var directive = function ($timeout) { return new MinuteHotKeys($timeout); };
            directive.$inject = ["$timeout"];
            return directive;
        };
        return MinuteHotKeys;
    }());
    Minute.MinuteHotKeys = MinuteHotKeys;
    var MinuteObserver = (function () {
        function MinuteObserver() {
            this.restrict = 'E';
            this.scope = { watch: '=?', onChange: '&' };
            this.link = function ($scope, element, attrs) {
                $scope.$watch('watch', function (n, o) {
                    if (n !== o) {
                        $scope.onChange({ value: n });
                    }
                }, true);
            };
        }
        return MinuteObserver;
    }());
    Minute.MinuteObserver = MinuteObserver;
    angular.module('MinuteDirectives', ['MinuteConfig', 'MinuteUI'])
        .provider("$preview", MinutePreviewService)
        .directive('minuteSearchBar', MinuteSearchBar.factory())
        .directive('minutePager', MinutePager.factory())
        .directive('minuteSortBar', MinuteSortBar.factory())
        .directive('minuteListSorter', MinuteListSorter.factory())
        .directive('minuteUploader', MinuteUploader.factory())
        .directive('minutePreview', MinutePreview.factory())
        .directive('minuteObserver', function () { return new MinuteObserver; })
        .directive('minuteCheckboxAll', function () { return new MinuteCheckboxAll; })
        .directive('minuteHotKeys', MinuteHotKeys.factory());
})(Minute || (Minute = {}));
