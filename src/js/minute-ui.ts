/// <reference path="../../_all.d.ts" />

module Minute {
    //this library uses alertifyjs but you can use any library that implements UiService

    export class MinuteUI implements ng.IServiceProvider {
        constructor() {
            this.$get.$inject = ['$config', '$rootScope', '$timeout', '$templateCache', '$http', 'gettext', '$compile', '$sce'];
        }

        $get = ($config: Config, $rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService, $templateCache: ng.ITemplateCacheService,
                $http: ng.IHttpService, gettext: angular.gettext.gettextFunction, $compile: ng.ICompileService, $sce: ng.ISCEService): UiService => {

            let service: any = {};//{confirm: null, alert: null, prompt: null, toast: null, popup: null, popupUrl: null, closePopup: null, init: null};
            let alertify: any = window['alertify'];
            let CustomEvent = (event, params = {bubbles: false, cancelable: false, detail: undefined}) => {
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            };

            let getScope = (scope) => {
                return (scope || $rootScope).$new(false);
            };

            if (!alertify) {
                throw new Error("Alertifyjs is required for this MinuteUI");
            }

            service.alert = (text: string, okLabel: string = ''): Promise<Object> => {
                return new Promise((resolve)=> {
                    alertify.okBtn(okLabel || gettext('OK')).alert(text, resolve);
                });
            };

            service.confirm = (text: string, okLabel: string = '', cancelLabel: string = ''): Promise<Object> => {
                return new Promise((resolve, reject)=> {
                    alertify.okBtn(okLabel || gettext('OK')).cancelBtn(cancelLabel || gettext('Cancel'))
                        .confirm(text || gettext('Are you sure?'), resolve, reject);
                });
            };

            service.prompt = (prompt: string = 'Enter value', placeholder: string = '', okLabel: string = '', cancelLabel: string = ''): Promise<Object> => {
                return new Promise((resolve, reject)=> {
                    alertify.okBtn(okLabel || gettext('OK')).cancelBtn(cancelLabel || gettext('Cancel'))
                        .defaultValue(placeholder).prompt(prompt, (value) => value ? resolve(value) : reject(), reject);
                });
            };

            service.toast = (text: string, type: string = '', html = false, hideAfter: number = 6000, position: string = 'top right'): Promise<Object> => {
                return new Promise((resolve)=> {
                    let method = /^(success|error|log)$/.test(type) ? type : 'log';
                    let parent = alertify.maxLogItems(3).closeLogOnClick(true).delay(hideAfter).logPosition(position);
                    let body = html ? text : angular.element('<div></div>').html(text).text();

                    parent[method](body, resolve);
                });
            };

            service.popup = (template: string, modal: boolean = false, scope: any = null, params: any = {}, type: string = 'dialog'): Promise<Object> => {
                return new Promise((resolve)=> {
                    let el = document.createElement("div");
                    let parent = document.body;
                    let esc = (ev) => ev.which === 27 ? hide() : false;
                    let stop = (ev) => ev.stopImmediatePropagation();
                    let theScope = getScope(scope);

                    let hide = () => {
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
                                setTimeout(() => el.parentNode.removeChild(el), 250);
                            }

                            $timeout(resolve);
                        } finally {
                            theScope.$destroy();
                        }

                        return false;
                    };

                    el.className = "minute-modal";
                    el.innerHTML = '<div class="' + type + ' home-in">' + template + '</div>';

                    parent.appendChild(el);
                    angular.extend(theScope, {modal: modal}, params || {});

                    $compile(el)(theScope);

                    let closeButtons: any = el.getElementsByClassName('close-button');
                    if (closeButtons.length > 0) {
                        for (var i = 0; i < closeButtons.length; i++) {
                            closeButtons[i].onclick = () => hide();
                        }
                    }

                    setTimeout(()=> {
                        let autoFocus: any = el.getElementsByClassName('auto-focus');

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

            service.popupUrl = (url: string, modal: boolean = false, scope: any = null, params: any = {}): Promise<Object> => {
                return new Promise((resolve, reject)=> {
                    let template = $templateCache.get(url);

                    if (template) {
                        service.popup(template, modal, scope, params).then(resolve, reject);
                    } else {
                        $http.get(url).then((result: any) => {
                            service.popup(result.data, modal, scope, params).then(resolve, reject)
                        }, reject);
                    }
                });
            };

            service.bottomSheet = (actions: Array<any>, title: string = '', scope: any = null, params: any = {}) => {
                let hide = service.closePopup;
                let template = `
                <h3 ng-bind-html="title" ng-show="title"></h3>
                <a class="btn btn-app" ng-repeat="action in actions" ng-href="{{action.href}}" ng-click="hide() && $eval(action.click)" tooltip="{{action.hint}}" target="{{action.target || '_self'}}" 
                    ng-show="{{!action.show || $eval(action.show)}}"><i class="fa {{action.icon}}"></i> {{action.text}}</a>`;

                angular.extend(params, {actions: actions, title: $sce.trustAsHtml(title), hide: hide});
                service.popup(template, false, scope, params, 'minute-bottom-sheet');
            };

            service.closePopup = () => {
                var popups = document.getElementsByClassName('minute-modal');
                if (popups.length > 0) {
                    for (let i = 0; i < popups.length; i++) {
                        popups[i].dispatchEvent(CustomEvent("hide"));
                    }
                }

                return true;
            };

            service.init = () => {
                alertify.parent(document.body);

                return service;
            };

            return service.init();
        };
    }

    angular.module('MinuteUI', ['MinuteConfig', 'gettext'])
        .provider('$ui', MinuteUI);
}