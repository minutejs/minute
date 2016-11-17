/// <reference path="../../_all.d.ts" />
module Minute {
    export class Utils {
        static copy(o, u) {
            if (o && u) {
                var keysO = Object.keys(o), keysU = Object.keys(u);

                keysO.forEach(function (k) {
                    if (-1 === keysU.indexOf(k)) {
                        delete o[k];
                    }
                });

                keysU.forEach(function (k) {
                    if (typeof u[k] === 'object') {
                        if (typeof o[k] !== 'object') {
                            o[k] = {};
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

        static basename = (url) => url ? url.split('/').pop() : '';

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
    }
}