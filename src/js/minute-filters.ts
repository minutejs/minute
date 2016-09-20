/// <reference path="../../_all.d.ts" />

module Minute {
    export function ucFirst() {
        return function (string) {
            return (string || '').charAt(0).toUpperCase() + (string || '').slice(1);
        }
    }

    export function timeAgo() {
        return function (date) {
            let moment = window['moment'];
            return moment(date).fromNow();
        }
    }

    export function timeAgoAbbr() {
        return function (date) {
            let moment = window['moment'];
            let relative = moment(date).fromNow(), matches;

            if (matches = relative.match(/^(\d+)\s(\w+)/)) {
                return matches[1] + (/month|year/.test(matches[2]) ? matches[2].substr(0, 1).toUpperCase() : matches[2].substr(0, 1).toLowerCase());
            }

            return relative;
        }
    }

    export function timeAgoStr() {
        return function (value) {
            let moment = window['moment'];
            return moment(new Date(value)).fromNow();
        }
    }

    export function replaceTags() {
        return function (text, hash = []) {
            var replacements = {};

            function flatten(json, flattened, str_key) {
                for (var key in json) {
                    if (json.hasOwnProperty(key)) {
                        if (json[key] instanceof Date) {
                            flattened[str_key + (str_key ? "." : '') + key] = json[key] + '';
                        } else if (json[key] instanceof Object && json[key] != "") {
                            flatten(json[key], flattened, str_key + (str_key ? "." : '') + key);
                        } else {
                            flattened[str_key + (str_key ? "." : '') + key] = json[key] + '';
                        }
                    }
                }
            }

            let session = Minute.getSessionData() || {};
            flatten(angular.extend({}, hash, {session: session}), replacements, "");

            return (text || '').replace(/%([^%]+)%/g, function (all, tag) {
                var parts = (tag || '').split('|');
                var prefixes = (parts[0] || '').split('&');
                var key = prefixes.length > 1 ? prefixes[1] : prefixes[0];
                var prefix = prefixes.length > 1 ? prefixes[0] : '';
                var suffix = prefixes.length > 2 ? prefixes[2] : '';
                var value = (replacements || {})[key];

                return (value ? prefix + value + suffix : (parts[1] || ''));
            });
        }
    }

    angular.module('MinuteFilters', [])
        .filter("timeAgo", timeAgo)
        .filter("ucFirst", ucFirst)
        .filter("timeAgoAbbr", timeAgoAbbr)
        .filter("timeAgoStr", timeAgoStr)
        .filter('replaceTags', replaceTags);

}