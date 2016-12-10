/// <reference path="../../_all.d.ts" />

module Minute {
    export class MinuteSortBar implements ng.IDirective {
        restrict = 'E';
        replace = true;
        scope: any = {on: '=?', columns: '=?'};
        template: string = `
            <select class="form-control input-sm" ng-model="data.sortBy" ng-options="column.field as column.label for column in data.cols2" title="sort by..">
                <option value="" translate="">Sort by..</option>
            </select>
        `;

        static factory(): ng.IDirectiveFactory {
            return () => new MinuteSortBar();
        }

        link = ($scope: any, elements: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            $scope.data = {cols2: []};

            $scope.$watch('on', (on) => {
                if (on) {
                    $scope.data.sortBy = on.getOrder();
                }
            });

            $scope.$watch('columns', (cols) => {
                $scope.data.cols2 = [];
                angular.forEach(cols, function (v) {
                    angular.forEach(['asc', 'desc'], function (o) {
                        $scope.data.cols2.push({label: v.label + ' (' + o + ')', field: v.field + ' ' + o});
                    });
                });
            });

            $scope.$watch('data.sortBy', (order) => {
                if ($scope.on && order) {
                    $scope.on.setOrder(order, true);
                }
            })
        }
    }

    export class MinuteSearchBar implements ng.IDirective {
        restrict = 'E';
        replace = true;
        scope: any = {on: '=?', search: '=?', columns: '@', operator: '@', label: '@'};
        template: string = `
        <form ng-submit="find()" class="form-inline">
            <div class="input-group input-group-sm search-bar">
              <input type="search" ng-model="data.search" class="form-control pull-right" placeholder="{{label}}">
    
              <div class="input-group-btn">
                <button type="submit" class="btn btn-default"><i class="fa fa-search"></i></button>
              </div>
            </div>
        </form>
        `;

        static factory(): ng.IDirectiveFactory {
            return () => new MinuteSearchBar();
        }

        link = ($scope: any, elements: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            $scope.data = {};

            $scope.find = function () {
                if ($scope.data.search != $scope.data.last) {
                    let operator = $scope.operator || 'LIKE';
                    let term = operator == 'LIKE' ? '%' + $scope.data.search + '%' : $scope.data.search;
                    let search: Search = {columns: $scope.columns, operator: operator, value: term};

                    $scope.search = $scope.data.search;
                    $scope.data.last = $scope.data.search;
                    $scope.on.setSearch(search, true);
                }
            };

            $scope.$watch('search', (search) => {
                if (search) {
                    $scope.data.search = search;
                }
            });
        }
    }

    export class MinutePager implements ng.IDirective {
        restrict = 'E';
        replace = true;
        scope: any = {on: '=', display: '@', numPages: '@', noResults: '@', alwaysShow: '@'};
        template: string = `
        <div ng-switch="!!on.getTotalItems()">
            <ul class="pagination pagination-sm no-margin" ng-switch-when="true" ng-show="(alwaysShow === 'true') || (on.getTotalPages() > 1)">
              <li><a href="" ng-click="on.loadPrevPage(true)">«</a></li>
              <li ng-show="start > 1"><a href="">&hellip;</a href=""></li>
              <li ng-class="{active: i === on.getCurrentPage()}" ng-repeat="i in pages()"><a href="" ng-click="on.setCurrentPage(i)">{{i}}</a></li>
              <li ng-show="end < on.getTotalPages()"><a href="">&hellip;</a href=""></li>
              <li><a href="" ng-click="on.loadNextPage(true)">»</a></li>
            </ul>            
            <div class="small" ng-switch-when="false">
                <span>{{noResults}}</span>
            </div>
        </div>
        `;

        static factory(): ng.IDirectiveFactory {
            return () => new MinutePager();
        }

        link = ($scope: any) => {
            $scope.pages = () => {
                let num = parseInt($scope.numPages || 2);
                let page = $scope.on.getCurrentPage();
                let itemsOnEachSide = num / 2;
                let itemsOnLeft = Math.min(itemsOnEachSide, page - 1);
                let itemsOnRight = Math.min(num - itemsOnLeft, $scope.on.getTotalPages() - page);
                itemsOnLeft = itemsOnLeft + Math.max(itemsOnEachSide - itemsOnRight, 0);

                $scope.start = Math.max(1, page - itemsOnLeft);
                $scope.end = Math.min($scope.on.getTotalPages(), page + itemsOnRight);

                let results = [];
                for (let i = $scope.start; i <= $scope.end; i++) {
                    results.push(i);
                }
                return results;
            };
        }
    }

    //sort a list using jQueryUi
    export class MinuteListSorter implements ng.IDirective {
        restrict = 'A';
        scope: any = {'minuteListSorter': '=?', sortIndex: '@', selector: '@', onOrder: '=?'};

        constructor(private $timeout: ng.ITimeoutService) {
        }

        static factory(): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = ($timeout: ng.ITimeoutService) => new MinuteListSorter($timeout);
            directive.$inject = ["$timeout"];
            return directive;
        }

        link = ($scope: any, element: any, attrs: ng.IAttributes) => {
            let selector = $scope.selector || '> [ng-repeat]';
            let sortKey = $scope.sortIndex || 'priority';
            let ordered;

            element.sortable({
                axis: "y",
                items: selector,
                start: () => {
                    ordered = [];

                    for (var item of $scope.minuteListSorter) {
                        ordered.push(item);
                    }

                    for (var j = 0; j < ordered.length - 1; j++) { //javascript's Array.sort() triggers scope.$apply
                        for (var i = 0, swapping; i < ordered.length - 1; i++) {
                            if ((ordered[i][sortKey] || 0) > (ordered[i + 1][sortKey] || 0)) {
                                swapping = ordered[i + 1];
                                ordered[i + 1] = ordered[i];
                                ordered[i] = swapping;
                            }
                        }
                    }

                    angular.forEach(element.find(selector), (div, index) => angular.element(div).attr('data-sort-index', index));
                },
                stop: () => {
                    let changed = [];

                    angular.forEach(element.find(selector), function (div, index) {
                        let order = angular.element(div).attr('data-sort-index');
                        if (order || order === '0') {
                            if (ordered[order][sortKey] !== index) {
                                ordered[order][sortKey] = index;
                                changed.push(ordered[order]);
                            }
                        }
                    });

                    if ($scope.onOrder) {
                        $scope.onOrder(changed);
                    } else if (changed.length > 0) {
                        if ($scope.minuteListSorter instanceof Minute.Items) {
                            changed[0].parent.saveAll('', '', changed);
                            console.log("changed: ", changed);
                        }
                    }

                    $scope.$apply();
                }
            });
            $scope.$watch('minuteListSorter', (arr) => angular.forEach(arr || [], (item) => item[sortKey] = item[sortKey] || 0));
        }
    }

    export class MinuteUploader implements ng.IDirective {
        restrict = 'E';
        require = 'ngModel';
        replace = true;
        scope: any = {type: '@', multiple: '@', preview: '@', btnClass: '@', label: '@', ngRequired: '@', remove: '@', icon: '@', hint: '@', url: '@', onUpload: '=?', accept: '@'};
        template = `
            <div style="display: inline-block">
                <div class="btn-group" ng-show="!uploading">
                  <button type="button" class="{{btnClass || 'btn btn-default btn-sm'}}" ng-click="upload()" tooltip="{{hint || 'Upload'}}">
                    <i class="fa {{icon || 'fa-upload'}}" ng-show="icon !== 'false'"></i> <span ng-show="label !== 'false'">{{label || 'Upload..'}}</span>
                  </button>
                  <button ng-show="url === 'true'" type="button" class="{{btnClass || 'btn btn-default btn-sm'}}" data-toggle="dropdown"><span class="caret"></span></button>
                  <ul ng-show="url === 'true'" class="dropdown-menu">                    
                    <li><a href="" ng-click="addUrl()">Upload via URL..</a></li>
                  </ul>
                </div>
                
                <button type="button" class="{{btnClass || 'btn btn-danger btn-sm'}}" ng-click="cancel()" ng-show="uploading"><i class="fa fa-refresh fa-spin"></i>
                    <span ng-show="label !== 'false'">Cancel</span>
                </button>
                <minute-preview type="{{type || 'image'}}" ng-if="preview == 'true'" src="src()"></minute-preview>
                <a href="" class="btn btn-xs btn-transparent" ng-click="clear()" ng-show="remove == 'true' && !!src()" tooltip="Clear upload"><i class="fa fa-trash"></i></a>
                <input type="text" required value="{{src()}}" style="opacity: 0; width:1px;height:1px" ng-if="ngRequired == 'true'">
            </div>
        `;

        constructor(private $timeout: ng.ITimeoutService, private $ui: UiService, private gettext: any) {
        }

        static factory(): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = ($timeout: ng.ITimeoutService, $ui: UiService, gettext: any) => new MinuteUploader($timeout, $ui, gettext);
            directive.$inject = ["$timeout", "$ui", "gettext"];
            return directive;
        }

        link = ($scope: any, elements: ng.IAugmentedJQuery, attrs: ng.IAttributes, ngModel: ng.INgModelController) => {
            let iframe, uploader;
            let map = {image: '.png, .jpg, .jpeg, .gif', 'video': '.avi, .mov, .wmv, .mp4, .flv', 'audio': '.wav, .mp3, .ogg', 'other': ''};

            let guid = Minute.Utils.randomString(16);
            let frame = `<iframe name="${guid}" width="1" height="1" style="position: absolute;top:-100px;" tabindex="-1"></iframe>`;
            let form = `<form method="post" action="/generic/uploader" enctype="multipart/form-data" id="theForm">
                                <input type="hidden" name="cb" id="cb" value="${guid}" />
                                <input name="upload[]" type="file" id="theFile">
                            </form>`;

            angular.element(document.body).append(frame);
            iframe = window.frames[guid];

            $scope.upload = () => {
                window[guid] = {start: $scope.start, complete: $scope.complete, fail: $scope.fail};

                iframe.document.write(form);

                uploader = iframe.document.getElementById('theFile');
                uploader.multiple = $scope.multiple === 'true';
                uploader.accept = $scope.accept || map[$scope.type || 'image'];
                uploader.addEventListener('change', () => {
                    iframe.document.getElementById('theForm').submit();
                    $scope.start();
                });

                uploader.click();
            };

            $scope.addUrl = () => {
                this.$ui.prompt(this.gettext('Please copy-paste the URL to import'), 'http://', this.gettext('Import URL')).then((url) => {
                    $scope.complete([url]);
                });
            };

            $scope.start = () => {
                $scope.isUploading(true);
            };

            $scope.fail = (reason: any) => {
                $scope.stop();
                $scope.toast(this.gettext("Upload failed: ") + (reason || 'error'), 'error');
            };

            $scope.complete = (results: any) => {
                $scope.stop();

                if (results && results.length > 0) {
                    ngModel.$setViewValue($scope.multiple === 'true' ? results : results[0]);

                    if (typeof $scope.onUpload == 'function') {
                        $scope.onUpload(ngModel.$viewValue);
                    } else {
                        $scope.toast(this.gettext("Upload successful"), 'success');
                    }
                } else {
                    $scope.toast(this.gettext("Upload failed"), 'error');
                }
            };

            $scope.toast = (msg, type) => {
                this.$ui.toast(msg, type);
            };

            $scope.stop = $scope.cancel = () => {
                $scope.isUploading(false);
                iframe.document.write('');
            };

            $scope.src = () => ngModel.$viewValue;
            $scope.clear = () => ngModel.$setViewValue(null);

            $scope.isUploading = (status) => this.$timeout(() => $scope.uploading = status);
        }
    }

    export class MinutePreviewService implements ng.IServiceProvider {
        constructor() {
            this.$get.$inject = ['$rootScope', '$ui'];
        }

        $get = ($rootScope: ng.IRootScopeService, $ui: any) => {
            let service: any = {};

            service.lightbox = (images) => {
                let template = `
                <div class="box">
                    <div class="box-body">
                        <a class="pull-right close-button" href=""><i class="fa fa-times"></i></a>
                        <div class="tabs-panel" ng-init="tabs = {}">
                            <ul class="nav nav-tabs">
                                <li ng-class="{active: image === tabs.selectedImage}" ng-repeat="image in images" ng-init="tabs.selectedImage = tabs.selectedImage || image">
                                    <a href="" ng-click="tabs.selectedImage = image">{{name(image)}}</a>
                                </li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane fade in active" ng-repeat="image in images" ng-if="image === tabs.selectedImage">
                                    <a ng-href="{{image}}" class="thumbnail" target="preview"><img ng-src="{{image}}"></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

                $ui.popup(template, false, null, {images: images, name: Utils.basename});
            };

            return service;
        }
    }

    export class MinutePreview implements ng.IDirective {
        restrict = 'E';
        replace = true;
        scope: any = {src: '=?', type: '@'};
        template = `
            <ng-switch on="type === 'image'" ng-show="!!src">
                <a ng-switch-when="true" href="" ng-click="preview()" class="btn btn-xs btn-transparent"><i class="fa fa-eye" tooltip="Preview"></i></a>
                <a ng-switch-when="false" href="" ng-href="{{src}}" target="_blank" class="btn btn-xs btn-transparent"><i class="fa fa-eye" tooltip="Preview"></i></a>                
            </ng-switch>
        `;

        constructor(private $preview: any) {
        }

        static factory(): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = ($preview: any) => new MinutePreview($preview);
            directive.$inject = ["$preview"];
            return directive;
        }

        link = ($scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            $scope.preview = () => {
                let images = angular.isArray($scope.src) ? $scope.src : [$scope.src];
                this.$preview.lightbox(images);
            };
        }
    }

    export class MinuteCheckboxAll implements ng.IDirective {
        restrict = 'A';
        scope: any = {on: '=?', prop: '@', selection: '=?'};

        link = ($scope: any, element: any, attrs: ng.IAttributes) => {
            let prop = $scope.prop || 'selected';

            $scope.$watch(() => {
                    if ($scope.on && $scope.on.length > 0) {
                        let pass = true;
                        let sel = angular.isArray($scope.selection) ? $scope.selection : [];

                        sel.splice(0, sel.length);

                        for (let i = 0, j = $scope.on.length; i < j; i++) {
                            let enabled = !!$scope.on[i][prop];
                            pass = pass && enabled;

                            if (enabled) {
                                sel.push($scope.on[i]);
                            }
                        }

                        return pass;
                    }

                    return false;
                }, (v) => element.prop('checked', v)
            );

            element.on('change', () => $scope.$apply(() => angular.forEach(($scope.on || []), (item) => item[prop] = element.prop('checked'))));
        }
    }

    export class MinuteHotKeys implements ng.IDirective {
        restrict = 'A';
        scope: any = {minuteHotKeys: '=?'};

        constructor(private $timeout: ng.ITimeoutService) {
        }

        static factory(): ng.IDirectiveFactory {
            var directive: ng.IDirectiveFactory = ($timeout: ng.ITimeoutService) => new MinuteHotKeys($timeout);
            directive.$inject = ["$timeout"];
            return directive;
        }

        link = ($scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            let mousetrap = window['Mousetrap'];
            let removeAll = () => angular.forEach(mousetrap, (v, key) => mousetrap.unbind(key));

            if (!mousetrap) {
                return console.log("Mousetrap.js is required for minuteHotKeys");
            }

            mousetrap.prototype.stopCallback = function () {
                return false;
            };

            $scope.$watch('minuteHotKeys', (arr) => {
                removeAll();

                angular.forEach(arr, (fn, key) => mousetrap.bind(key, (e) => {
                    e.preventDefault();
                    this.$timeout(fn);
                }));
            });

            $scope.$on('$destroy', removeAll);
        }
    }

    export class MinuteObserver implements ng.IDirective {
        restrict = 'E';
        scope: any = {watch: '=?', onChange: '&'};
        link = ($scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
            $scope.$watch('watch', (n, o) => {
                if (n !== o) {
                    $scope.onChange({value: n});
                }
            }, true);
        }
    }

    angular.module('MinuteDirectives', ['MinuteConfig', 'MinuteUI'])
        .provider("$preview", MinutePreviewService)
        .directive('minuteSearchBar', MinuteSearchBar.factory())
        .directive('minutePager', MinutePager.factory())
        .directive('minuteSortBar', MinuteSortBar.factory())
        .directive('minuteListSorter', MinuteListSorter.factory())
        .directive('minuteUploader', MinuteUploader.factory())
        .directive('minutePreview', MinutePreview.factory())
        .directive('minuteObserver', () => new MinuteObserver)
        .directive('minuteCheckboxAll', () => new MinuteCheckboxAll)
        .directive('minuteHotKeys', MinuteHotKeys.factory());
}
