/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    //this library uses alertifyjs but you can use any library that implements UiService
    var MinuteUI = (function () {
        function MinuteUI() {
            this.$get = function ($config, $rootScope, $timeout, $templateCache, $http, gettext, $compile, $sce) {
                var service = {}; //{confirm: null, alert: null, prompt: null, toast: null, popup: null, popupUrl: null, closePopup: null, init: null};
                var alertify = window['alertify'];
                var CustomEvent = function (event, params) {
                    if (params === void 0) { params = { bubbles: false, cancelable: false, detail: undefined }; }
                    var evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                    return evt;
                };
                var getScope = function (scope) {
                    return (scope || $rootScope).$new(false);
                };
                if (!alertify) {
                    throw new Error("Alertifyjs is required for this MinuteUI");
                }
                service.alert = function (text, okLabel) {
                    if (okLabel === void 0) { okLabel = ''; }
                    return new Promise(function (resolve) {
                        alertify.okBtn(okLabel || gettext('OK')).alert(text, resolve);
                    });
                };
                service.confirm = function (text, okLabel, cancelLabel) {
                    if (okLabel === void 0) { okLabel = ''; }
                    if (cancelLabel === void 0) { cancelLabel = ''; }
                    return new Promise(function (resolve, reject) {
                        alertify.okBtn(okLabel || gettext('OK')).cancelBtn(cancelLabel || gettext('Cancel'))
                            .confirm(text || gettext('Are you sure?'), resolve, reject);
                    });
                };
                service.prompt = function (prompt, placeholder, okLabel, cancelLabel) {
                    if (prompt === void 0) { prompt = 'Enter value'; }
                    if (placeholder === void 0) { placeholder = ''; }
                    if (okLabel === void 0) { okLabel = ''; }
                    if (cancelLabel === void 0) { cancelLabel = ''; }
                    return new Promise(function (resolve, reject) {
                        alertify.okBtn(okLabel || gettext('OK')).cancelBtn(cancelLabel || gettext('Cancel'))
                            .defaultValue(placeholder).prompt(prompt, function (value) { return value ? resolve(value) : reject(null); }, function () { return reject('cancel'); });
                    });
                };
                service.toast = function (text, type, html, hideAfter, position) {
                    if (type === void 0) { type = ''; }
                    if (html === void 0) { html = false; }
                    if (hideAfter === void 0) { hideAfter = 6000; }
                    if (position === void 0) { position = 'top right'; }
                    return new Promise(function (resolve) {
                        var method = /^(success|error|log)$/.test(type) ? type : 'log';
                        var parent = alertify.maxLogItems(3).closeLogOnClick(true).delay(hideAfter).logPosition(position);
                        var body = html ? text : angular.element('<div></div>').html(text).text();
                        parent[method](body, resolve);
                    });
                };
                service.popup = function (template, modal, scope, params, type) {
                    if (modal === void 0) { modal = false; }
                    if (scope === void 0) { scope = null; }
                    if (params === void 0) { params = {}; }
                    if (type === void 0) { type = 'dialog'; }
                    return new Promise(function (resolve) {
                        var el = document.createElement("div");
                        var parent = document.body;
                        var esc = function (ev) { return ev.which === 27 ? hide() : false; };
                        var stop = function (ev) { return ev.stopImmediatePropagation(); };
                        var theScope = getScope(scope);
                        var hide = function () {
                            if (event && event.target && (event.type === 'mousedown') && (event.target['id'] === 'global-zeroclipboard-flash-bridge')) {
                                return;
                            }
                            try {
                                parent.removeEventListener("keyup", esc);
                                parent.removeEventListener("mousedown", hide);
                                el.removeEventListener("hide", hide);
                                el.children[0].removeEventListener("mousedown", stop);
                                el.children[0].removeEventListener("keyup", stop);
                                el.children[0].className += ' home-out';
                                if (el.parentNode) {
                                    setTimeout(function () { return el.parentNode.removeChild(el); }, 250);
                                }
                                $timeout(resolve);
                            }
                            finally {
                                theScope.$destroy();
                            }
                            return false;
                        };
                        el.className = "minute-modal";
                        el.innerHTML = '<div class="' + type + ' home-in">' + template + '</div>';
                        parent.appendChild(el);
                        angular.extend(theScope, { modal: modal }, params || {});
                        $compile(el)(theScope);
                        var closeButtons = el.getElementsByClassName('close-button');
                        if (closeButtons.length > 0) {
                            for (var i = 0; i < closeButtons.length; i++) {
                                closeButtons[i].onclick = function () { return hide(); };
                            }
                        }
                        setTimeout(function () {
                            var autoFocus = el.getElementsByClassName('auto-focus');
                            if (autoFocus.length > 0) {
                                autoFocus[0].focus();
                            }
                        }, 500);
                        if (!modal) {
                            parent.addEventListener("keyup", esc);
                            parent.addEventListener("mousedown", hide);
                            el.children[0].addEventListener("mousedown", stop);
                            el.children[0].addEventListener("keyup", stop);
                        }
                        el.addEventListener("hide", hide);
                    });
                };
                service.popupUrl = function (url, modal, scope, params) {
                    if (modal === void 0) { modal = false; }
                    if (scope === void 0) { scope = null; }
                    if (params === void 0) { params = {}; }
                    return new Promise(function (resolve, reject) {
                        var template = $templateCache.get(url);
                        if (template) {
                            service.popup(template, modal, scope, params).then(resolve, reject);
                        }
                        else {
                            $http.get(url).then(function (result) {
                                service.popup(result.data, modal, scope, params).then(resolve, reject);
                            }, reject);
                        }
                    });
                };
                service.bottomSheet = function (actions, title, scope, params) {
                    if (title === void 0) { title = ''; }
                    if (scope === void 0) { scope = null; }
                    if (params === void 0) { params = {}; }
                    var hide = service.closePopup;
                    var template = "\n                <h3 ng-bind-html=\"title\" ng-show=\"title\"></h3>\n                <a class=\"btn btn-app\" ng-repeat=\"action in actions\" ng-href=\"{{action.href}}\" ng-click=\"hide() && $eval(action.click)\" tooltip=\"{{action.hint}}\" target=\"{{action.target || '_self'}}\" \n                    ng-show=\"{{!action.show || $eval(action.show)}}\"><i class=\"fa {{action.icon}}\"></i> {{action.text}}</a>";
                    angular.extend(params, { actions: actions, title: $sce.trustAsHtml(title), hide: hide });
                    service.popup(template, false, scope, params, 'minute-bottom-sheet');
                };
                service.closePopup = function () {
                    var popups = document.getElementsByClassName('minute-modal');
                    if (popups.length > 0) {
                        for (var i = 0; i < popups.length; i++) {
                            popups[i].dispatchEvent(CustomEvent("hide"));
                        }
                    }
                    return true;
                };
                service.init = function () {
                    alertify.parent(document.body);
                    return service;
                };
                return service.init();
            };
            this.$get.$inject = ['$config', '$rootScope', '$timeout', '$templateCache', '$http', 'gettext', '$compile', '$sce'];
        }
        return MinuteUI;
    }());
    Minute.MinuteUI = MinuteUI;
    angular.module('MinuteUI', ['MinuteConfig', 'gettext'])
        .provider('$ui', MinuteUI);
})(Minute || (Minute = {}));
