/// <reference path="../../_all.d.ts" />
var Minute;
(function (Minute) {
    function ucFirst() {
        return function (string) {
            return (string || '').charAt(0).toUpperCase() + (string || '').slice(1);
        };
    }
    Minute.ucFirst = ucFirst;
    function timeAgo() {
        return function (date) {
            var moment = window['moment'];
            return moment(date).fromNow();
        };
    }
    Minute.timeAgo = timeAgo;
    function timeAgoAbbr() {
        return function (date) {
            var moment = window['moment'];
            var relative = moment(date).fromNow(), matches;
            if (matches = relative.match(/^(\d+)\s(\w+)/)) {
                return matches[1] + (/month|year/.test(matches[2]) ? matches[2].substr(0, 1).toUpperCase() : matches[2].substr(0, 1).toLowerCase());
            }
            return relative;
        };
    }
    Minute.timeAgoAbbr = timeAgoAbbr;
    function timeAgoStr() {
        return function (value) {
            var moment = window['moment'];
            return moment(new Date(value)).fromNow();
        };
    }
    Minute.timeAgoStr = timeAgoStr;
    function replaceTags() {
        return function (text, hash) {
            if (hash === void 0) { hash = []; }
            var replacements = {};
            function flatten(json, flattened, str_key) {
                for (var key in json) {
                    if (json.hasOwnProperty(key)) {
                        if (json[key] instanceof Date) {
                            flattened[str_key + (str_key ? "." : '') + key] = json[key] + '';
                        }
                        else if (json[key] instanceof Object && json[key] != "") {
                            flatten(json[key], flattened, str_key + (str_key ? "." : '') + key);
                        }
                        else {
                            flattened[str_key + (str_key ? "." : '') + key] = json[key] + '';
                        }
                    }
                }
            }
            var session = Minute.getSessionData() || {};
            flatten(angular.extend({}, hash, { session: session }), replacements, "");
            return (text || '').replace(/%([^%]+)%/g, function (all, tag) {
                var parts = (tag || '').split('|');
                var prefixes = (parts[0] || '').split('&');
                var key = prefixes.length > 1 ? prefixes[1] : prefixes[0];
                var prefix = prefixes.length > 1 ? prefixes[0] : '';
                var suffix = prefixes.length > 2 ? prefixes[2] : '';
                var value = (replacements || {})[key];
                return (value ? prefix + value + suffix : (parts[1] || ''));
            });
        };
    }
    Minute.replaceTags = replaceTags;
    angular.module('MinuteFilters', [])
        .filter("timeAgo", timeAgo)
        .filter("ucFirst", ucFirst)
        .filter("timeAgoAbbr", timeAgoAbbr)
        .filter("timeAgoStr", timeAgoStr)
        .filter('replaceTags', replaceTags);
})(Minute || (Minute = {}));
