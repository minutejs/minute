/// <reference path="../../_all.d.ts" />
module Minute {
    export class Utils {
        static copy(o, u) {
            if (o && u) {
                let keysO = Object.keys(o), keysU = Object.keys(u);

                keysO.forEach(function (k) {
                    if (-1 === keysU.indexOf(k)) {
                        delete o[k];
                    }
                });

                keysU.forEach(function (k) {
                    if (typeof u[k] === 'object') {
                        if (typeof o[k] !== 'object') {
                            o[k] = u[k] instanceof Array ? [] : {};
                        }

                        Utils.copy(o[k], u[k]);
                        return;
                    }

                    o[k] = u[k];
                });
            }

            return o;
        };

        static extend(o, ...objects) {
            return angular.extend.apply(o, [o].concat(objects));
        }

        static keyValue(key: string, value: any): Object {
            var obj = {};
            obj[key] = value;
            return obj;
        }

        static unique(items: any, attr: string, value: any) {
            let unique = false;
            let count = 1;
            let name = value;

            while (!unique) {
                unique = true;

                for (let i = 0; i < items.length; i++) {
                    if (items[i].attr(attr) == name) {
                        name = value + ' ' + (count++);
                        unique = false;
                        break;
                    }
                }
            }

            return name;
        }

        static basename = (url) => angular.isString(url) ? url.split('/').pop() : '';

        static randomString = (len = 16, prefix = '', possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz") => {
            while (prefix.length < len) {
                prefix += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return prefix;
        };

        static findWhere = (obj: any, matchers: any) => {
            if (obj && matchers) {
                for (let item of obj) {
                    let pass = true;

                    for (let prop in matchers) {
                        if (matchers.hasOwnProperty(prop)) {
                            pass = pass && item.hasOwnProperty(prop) && !!matchers[prop] && (item[prop] === matchers[prop]);
                        }
                    }

                    if (pass) {
                        return item;
                    }
                }
            }

            return false;
        };

        static enabledKeys = (obj: any, match: any = null) => {
            let results = [];

            angular.forEach(obj, (v, k) => {
                if ((match === null && !!v) || (v === match)) {
                    results.push(k);
                }
            });

            return results;
        };

        static ucFirst = (str: string, lcRemaining: boolean = false) => {
            return (str || '').charAt(0).toUpperCase() + (lcRemaining ? (str || '').slice(1).toLowerCase() : (str || '').slice(1));
        };

        static getObjValue = (obj, path, def = null) => {
            return path.split(".").reduce(function (o, x) {
                    return (typeof o == "undefined" || o === null) ? o : o[x];
                }, obj) || def;
        };

        static setObjValue = (obj, path, value) => {
            if (path.indexOf('.') != -1) {
                path = path.split('.');

                for (let i = 0, l = path.length; i < l; i++) {
                    if (typeof(obj[path[i]]) !== 'object') {
                        obj[path[i - 1]][path[i]] = value;
                    }
                }
            } else {
                obj[path] = value;
            }

            return obj;
        };

        static getParameterByName = (name) => {
            let match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        }
    }
}