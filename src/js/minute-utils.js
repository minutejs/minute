/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.copy = function (o, u) {
            if (o && u) {
                var keysO = Object.keys(o), keysU_1 = Object.keys(u);
                keysO.forEach(function (k) {
                    if (-1 === keysU_1.indexOf(k)) {
                        delete o[k];
                    }
                });
                keysU_1.forEach(function (k) {
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
        Utils.basename = function (url) { return angular.isString(url) ? url.split('/').pop() : ''; };
        Utils.randomString = function (len, prefix, possible) {
            if (len === void 0) { len = 16; }
            if (prefix === void 0) { prefix = ''; }
            if (possible === void 0) { possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"; }
            while (prefix.length < len) {
                prefix += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return prefix;
        };
        Utils.findWhere = function (obj, matchers) {
            if (obj && matchers) {
                for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
                    var item = obj_1[_i];
                    var pass = true;
                    for (var prop in matchers) {
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
        Utils.enabledKeys = function (obj, match) {
            if (match === void 0) { match = null; }
            var results = [];
            angular.forEach(obj, function (v, k) {
                if ((match === null && !!v) || (v === match)) {
                    results.push(k);
                }
            });
            return results;
        };
        Utils.ucFirst = function (str, lcRemaining) {
            if (lcRemaining === void 0) { lcRemaining = false; }
            return (str || '').charAt(0).toUpperCase() + (lcRemaining ? (str || '').slice(1).toLowerCase() : (str || '').slice(1));
        };
        Utils.getObjValue = function (obj, path, def) {
            if (def === void 0) { def = null; }
            return path.split(".").reduce(function (o, x) {
                return (typeof o == "undefined" || o === null) ? o : o[x];
            }, obj) || def;
        };
        Utils.setObjValue = function (obj, path, value) {
            if (path.indexOf('.') != -1) {
                path = path.split('.');
                for (var i = 0, l = path.length; i < l; i++) {
                    if (typeof (obj[path[i]]) !== 'object') {
                        obj[path[i - 1]][path[i]] = value;
                    }
                }
            }
            else {
                obj[path] = value;
            }
            return obj;
        };
        Utils.getParameterByName = function (name) {
            var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        };
        return Utils;
    }());
    Minute.Utils = Utils;
})(Minute || (Minute = {}));
