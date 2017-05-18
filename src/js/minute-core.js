///<reference path="../../_all.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Minute;
(function (Minute) {
    Minute.Models = {};
    Minute.Loader = function () {
    };
    var Item = (function () {
        function Item(parent, attrs) {
            var _this = this;
            if (parent === void 0) { parent = null; }
            if (attrs === void 0) { attrs = []; }
            this.parent = parent;
            this.attrs = attrs;
            this.lastSave = '{}';
            this._data = { serialized: {}, dump: {} };
            this.metadata = {};
            this.attr = function (name, value) {
                if (value === void 0) { value = void 0; }
                if (value === void 0) {
                    return _this[name];
                }
                else if (_this.attrs.indexOf(name) !== -1) {
                    if (typeof value === 'string') {
                        if (/_json$/.test(name)) {
                            try {
                                value = value ? JSON.parse(value) : {};
                            }
                            catch (e) {
                                console.log("Broken Json: ", value, e);
                                value = {};
                            }
                        }
                        else if (/_at$/.test(name) && (isNaN(Date.parse(((value || '').replace(/-/g, '/') + 'Z'))) === false)) {
                            value = new Date(Date.parse(((value || '').replace(/-/g, '/') + 'Z')));
                        }
                        else if (value === 'true' || value === 'false') {
                            value = value === 'true';
                        }
                    }
                    if (_this[name] && /_json$/.test(name) && value !== null) {
                        Minute.Utils.copy(_this[name], value);
                    }
                    else {
                        _this[name] = value;
                    }
                    (new Minute.Delegator()).dispatch(Minute.MINUTE_ATTR_CHANGE, { parent: _this });
                    return _this;
                }
                else {
                    console.log("Warning: attr '%s' not found in %s", name, _this);
                }
            };
            this.removeAttr = function (name) {
                delete (_this[name]);
                return _this;
            };
            this.getAttributes = function () {
                var result = {};
                for (var _i = 0, _a = _this.attrs; _i < _a.length; _i++) {
                    var attr = _a[_i];
                    result[attr] = _this[attr];
                }
                return result;
            };
            this.serialize = function (ignoreUndefined, ignoreJoinKey) {
                if (ignoreUndefined === void 0) { ignoreUndefined = false; }
                if (ignoreJoinKey === void 0) { ignoreJoinKey = false; }
                var serialized = {};
                var parent = _this.parent;
                if (parent && !ignoreJoinKey) {
                    var joinKey = parent.joinPk;
                    var parentOfParent = parent.parent;
                    if (joinKey && parentOfParent && !_this.attr(joinKey)) {
                        var joinKeyVal = parentOfParent.attr(joinKey);
                        if (joinKeyVal) {
                            _this.attr(joinKey, joinKeyVal);
                        }
                        else {
                            throw new Error("Before calling serialized() on children, please call save() on the parent node first.");
                        }
                    }
                }
                for (var _i = 0, _a = _this.attrs; _i < _a.length; _i++) {
                    var key = _a[_i];
                    var value = _this.attr(key);
                    if ((value instanceof Items) || (value instanceof Item)) {
                        throw new Error("Item cannot have an attribute and child of same name: " + key);
                    }
                    else if (value instanceof Date && /_at$/.test(key)) {
                        value = value.toISOString().slice(0, 19).replace('T', ' ');
                    }
                    else if (typeof value !== 'string' && /_json$/.test(key)) {
                        value = JSON.stringify(value, function (key, val) { return /^[_$]/.test(key) ? undefined : val; });
                    }
                    else if (value === true || value === false) {
                        value = value ? 'true' : 'false';
                    }
                    if (!ignoreUndefined || (value !== void 0)) {
                        serialized[key] = value;
                    }
                }
                return Minute.Utils.copy(_this._data.serialized, serialized);
            };
            this.load = function (data) {
                var loaded = false;
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        var val = data[key];
                        if (typeof val !== 'object') {
                            _this.attr(key, val);
                            loaded = true;
                        }
                        else if (_this.hasOwnProperty(key)) {
                            if ((_this[key] instanceof Items) || (_this[key] instanceof Item)) {
                                _this[key].load(val);
                            }
                            else if (key === 'metadata') {
                                _this.metadata = val;
                            }
                        }
                    }
                }
                _this.lastSave = JSON.stringify(_this.serialize(true, true));
                return _this;
            };
            this.dirty = function () {
                return JSON.stringify(_this.serialize(true, true)) != _this.lastSave;
            };
            this.clone = function () {
                var data = JSON.parse(JSON.stringify(_this.serialize()));
                ['created_at', _this.parent.pk].forEach(function (key) {
                    delete (data[key]);
                });
                return _this.parent.create(data);
            };
            this.save = function (successMsg, failureMsg) {
                if (successMsg === void 0) { successMsg = void 0; }
                if (failureMsg === void 0) { failureMsg = void 0; }
                var parent = _this.getParentOrDie('save');
                return parent.saveAll(successMsg, failureMsg, _this);
            };
            this.remove = function (successMsg, failureMsg) {
                if (successMsg === void 0) { successMsg = void 0; }
                if (failureMsg === void 0) { failureMsg = void 0; }
                var parent = _this.getParentOrDie('remove');
                return parent.removeAll(successMsg, failureMsg, _this);
            };
            this.removeConfirm = function (confirmTitle, confirmText, successMsg, failureMsg) {
                if (confirmTitle === void 0) { confirmTitle = void 0; }
                if (confirmText === void 0) { confirmText = void 0; }
                if (successMsg === void 0) { successMsg = void 0; }
                if (failureMsg === void 0) { failureMsg = void 0; }
                var parent = _this.getParentOrDie('removeConfirm');
                return parent.removeConfirmAll(confirmTitle, confirmText, successMsg, failureMsg, _this);
            };
            this.reload = function () {
                var parent = _this.getParentOrDie('reload');
                return parent.reloadAll(true, _this);
            };
            this.dump = function () {
                var result = _this.serialize(true, true);
                for (var i in _this) {
                    if (_this.hasOwnProperty(i) && (i != 'parent') && ((_this[i] instanceof Item) || (_this[i] instanceof Items))) {
                        var iter = _this[i];
                        result[i] = iter.dump();
                    }
                }
                return Minute.Utils.copy(_this._data.dump, result);
            };
            this.getParentOrDie = function (caller) {
                if (!_this.parent) {
                    throw new Error('Item must have a parent for ' + caller);
                }
                return _this.parent;
            };
        }
        return Item;
    }());
    Minute.Item = Item;
    var Items = (function (_super) {
        __extends(Items, _super);
        function Items(itemType, parent, alias, modelClass, pk, joinPk) {
            var _this = this;
            if (parent === void 0) { parent = null; }
            if (alias === void 0) { alias = ''; }
            if (modelClass === void 0) { modelClass = ''; }
            if (pk === void 0) { pk = ''; }
            if (joinPk === void 0) { joinPk = ''; }
            _super.call(this);
            this.itemType = itemType;
            this.parent = parent;
            this.alias = alias;
            this.modelClass = modelClass;
            this.pk = pk;
            this.joinPk = joinPk;
            this.metadata = { offset: 0, total: 0, limit: 0 };
            this.create = function (data) {
                if (data === void 0) { data = {}; }
                var item = new _this.itemType(_this);
                _this.push(item);
                item.load(data);
                return item;
            };
            this.load = function (data) {
                if (data) {
                    _this.setMetadata(data.metadata || {}, false);
                    for (var _i = 0, _a = data.items || []; _i < _a.length; _i++) {
                        var item = _a[_i];
                        _this.create().load(item);
                    }
                }
                return _this;
            };
            this.cloneItem = function (item) {
                var copy = item.clone();
                var newItem = _this.create(copy.serialize(true, true));
                delete (newItem[_this.joinPk]);
                return newItem;
            };
            this.saveAll = function (successMsg, failureMsg, selection) {
                if (successMsg === void 0) { successMsg = void 0; }
                if (failureMsg === void 0) { failureMsg = void 0; }
                var items = (!selection ? _this.toArray() : (selection instanceof Item ? [selection] : selection));
                var unsaved = _this.filterItemsBy(items, _this.pk, true);
                var delegate = new Minute.Delegator();
                var deferred = delegate.defer();
                var promise = delegate.dispatch(Minute.MINUTE_SAVE, { successMsg: successMsg, failureMsg: failureMsg, parent: _this, items: items });
                promise.then(function (result) {
                    var updates = result.data;
                    if (updates.hasOwnProperty('items')) {
                        updates = updates.items;
                        if (updates.length === items.length) {
                            for (var i = 0; i < items.length; i++) {
                                items[i].load(updates[i]);
                            }
                        }
                        else {
                            throw new Error("Update length should always match item length");
                        }
                    }
                    for (var _i = 0, _a = unsaved || []; _i < _a.length; _i++) {
                        var item = _a[_i];
                        item.reload();
                        _this.metadata.total++;
                    }
                    deferred.resolve({ self: _this, item: items[0], updates: updates, successMsg: successMsg });
                }, function (error) {
                    deferred.reject({ self: _this, failureMsg: failureMsg, error: error });
                });
                return deferred.promise;
            };
            this.removeAll = function (successMsg, failureMsg, selection) {
                if (successMsg === void 0) { successMsg = void 0; }
                if (failureMsg === void 0) { failureMsg = void 0; }
                var items = (!selection ? _this.toArray() : (selection instanceof Item ? [selection] : selection));
                var saved = _this.filterItemsBy(items, _this.pk, false);
                var delegate = new Minute.Delegator();
                var deferred = delegate.defer();
                var promise = delegate.dispatch(Minute.MINUTE_REMOVE, { successMsg: successMsg, failureMsg: failureMsg, parent: _this, items: saved });
                promise.then(function (result) {
                    var updates = result.data.items;
                    if (updates.length === saved.length) {
                        for (var i = items.length - 1; i >= 0; i--) {
                            _this.splice(_this.indexOf(items[i]), 1);
                        }
                    }
                    else {
                        throw new Error("Update length should always match item length");
                    }
                    deferred.resolve({ self: _this, item: items[0], updates: updates, successMsg: successMsg });
                }, function (error) {
                    deferred.reject({ self: _this, failureMsg: failureMsg, error: error });
                });
                return deferred.promise;
            };
            this.removeConfirmAll = function (successMsg, failureMsg, confirmTitle, confirmText, selection) {
                if (successMsg === void 0) { successMsg = void 0; }
                if (failureMsg === void 0) { failureMsg = void 0; }
                if (confirmTitle === void 0) { confirmTitle = void 0; }
                if (confirmText === void 0) { confirmText = void 0; }
                var items = (!selection ? _this.toArray() : (selection instanceof Item ? [selection] : selection));
                var delegate = new Minute.Delegator();
                var deferred = delegate.defer();
                var promise = delegate.dispatch(Minute.MINUTE_REMOVE_CONFIRM, { parent: _this, confirmTitle: confirmTitle, confirmText: confirmText });
                promise.then(function () { return _this.removeAll(successMsg, failureMsg, items).then(deferred.resolve, deferred.reject); }, function () { return deferred.reject({ self: _this }); });
                return deferred.promise;
            };
            this.reloadAll = function (replace, singleItem) {
                if (singleItem === void 0) { singleItem = null; }
                var start = singleItem || _this.parent;
                var metadataChain = Minute.Utils.keyValue(_this.alias, _this.metadata);
                while (start && start.parent) {
                    metadataChain[start.parent.alias] = { pk: start.attr(start.parent.pk) };
                    start = start.parent.parent;
                }
                var delegate = new Minute.Delegator();
                var deferred = delegate.defer();
                var promise = delegate.dispatch(Minute.MINUTE_RELOAD, { parent: _this, metadata: metadataChain });
                promise.then(function (result) {
                    var updates = result.data;
                    if (singleItem) {
                        if (updates.hasOwnProperty('items')) {
                            singleItem.load(updates.items[0]);
                        }
                        else if (updates.length > 0) {
                            singleItem.load(updates[0]);
                        }
                    }
                    else if (updates.hasOwnProperty('items')) {
                        if (replace === true) {
                            _this.splice(0, _this.length);
                        }
                        _this.load(updates);
                    }
                    deferred.resolve({ self: _this, item: singleItem, updates: updates });
                }, function (error) {
                    deferred.reject({ self: _this, error: error });
                });
                return deferred.promise;
            };
            this.getOffset = function () {
                return _this.metadata.offset || 0;
            };
            this.getTotalItems = function () {
                return _this.metadata.total || 0;
            };
            this.getItemsPerPage = function () {
                return _this.metadata.limit || 1;
            };
            this.getCurrentPage = function () {
                return 1 + Math.floor(_this.getOffset() / _this.getItemsPerPage());
            };
            this.getTotalPages = function () {
                return Math.ceil(_this.getTotalItems() / _this.getItemsPerPage());
            };
            this.getOrder = function () {
                return (_this.metadata.order || '').toLowerCase();
            };
            this.getSearch = function () {
                return _this.metadata.search || null;
            };
            this.setItemsPerPage = function (limit, reload) {
                if (reload === void 0) { reload = true; }
                return _this.setMetadata({ limit: parseInt(limit) }, reload);
            };
            this.setCurrentPage = function (num, reload) {
                if (reload === void 0) { reload = true; }
                var offset = Math.min(_this.getTotalItems(), Math.max(0, (parseInt(num) - 1)) * _this.getItemsPerPage());
                return _this.setMetadata({ offset: offset }, reload);
            };
            this.setOrder = function (order, reload) {
                if (reload === void 0) { reload = true; }
                return _this.setMetadata({ order: order }, reload);
            };
            this.toggleOrder = function (reload) {
                if (reload === void 0) { reload = true; }
                var matches = /(\w+)\s*(asc|desc)?/i.exec(_this.getOrder() || _this.pk);
                var newOrder = (matches[1] || _this.pk) + ' ' + (/desc/i.test(matches[2]) ? 'asc' : 'desc');
                return _this.setOrder(newOrder, reload);
            };
            this.setSearch = function (search, reload) {
                if (reload === void 0) { reload = true; }
                return _this.setMetadata({ offset: 0, search: search }, reload);
            };
            this.setMetadata = function (metadata, reload) {
                var lastMetaData = JSON.stringify(_this.metadata);
                var newMetaData = JSON.stringify(Minute.Utils.extend(_this.metadata, metadata));
                var delegate = new Minute.Delegator();
                var deferred = delegate.defer();
                if (reload && (lastMetaData !== newMetaData)) {
                    _this.reloadAll(true).then(function (result) { return deferred.resolve(result); });
                }
                else {
                    deferred.resolve({});
                }
                return deferred.promise;
            };
            this.dump = function () {
                return _this.map(function (item) { return item.dump(); });
            };
            this.loadPrevPage = function (replace) {
                if (replace === void 0) { replace = true; }
                if (_this.hasLessPages()) {
                    _this.setCurrentPage(_this.getCurrentPage() - 1, replace);
                }
                else {
                    console.log("error: already on first page");
                }
            };
            this.loadNextPage = function (replace) {
                if (replace === void 0) { replace = true; }
                if (_this.hasMorePages()) {
                    _this.setCurrentPage(_this.getCurrentPage() + 1, replace);
                }
                else {
                    console.log("error: already on last page: ", _this.getCurrentPage(), _this.getTotalPages());
                }
            };
            this.hasMorePages = function () {
                return _this.getCurrentPage() < _this.getTotalPages();
            };
            this.hasLessPages = function () {
                return _this.getCurrentPage() > 1;
            };
        }
        Items.prototype.toArray = function () {
            return this.map(function (item) { return item; });
        };
        Items.prototype.filterItemsBy = function (items, attr, reverse) {
            var filter = function (item) { return item.parent && !!item.attr(attr); };
            return items.filter(function (item) { return reverse ? !filter(item) : filter(item); });
        };
        return Items;
    }(Array));
    Minute.Items = Items;
})(Minute || (Minute = {}));
