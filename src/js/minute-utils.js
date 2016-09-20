/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.copy = function (o, u) {
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
        ;
        Utils.extend = function (o) {
            var objects = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                objects[_i - 1] = arguments[_i];
            }
            return angular.extend.apply(o, [o].concat(objects));
        };
        Utils.keyValue = function (key, value) {
            var obj = {};
            obj[key] = value;
            return obj;
        };
        Utils.unique = function (items, attr, value) {
            var unique = false;
            var count = 1;
            var name = value;
            while (!unique) {
                unique = true;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].attr(attr) == name) {
                        name = value + ' ' + (count++);
                        unique = false;
                        break;
                    }
                }
            }
            return name;
        };
        Utils.basename = function (url) { return url ? url.split('/').pop() : ''; };
        Utils.randomString = function (len, prefix, possible) {
            if (len === void 0) { len = 16; }
            if (prefix === void 0) { prefix = ''; }
            if (possible === void 0) { possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; }
            while (prefix.length < len) {
                prefix += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return prefix;
        };
        return Utils;
    }());
    Minute.Utils = Utils;
})(Minute || (Minute = {}));
