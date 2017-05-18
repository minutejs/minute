///<reference path="../../_all.d.ts"/>

module Minute {
    export var Models = {};
    export var Loader: Function = () => {
    };

    export class Item {
        private lastSave = '{}';
        private _data = {serialized: {}, dump: {}};
        public metadata = {};

        constructor(public parent: Items<Item> = null, public attrs: Array<string> = []) {
        }

        attr = (name: string, value = void 0): Item => {
            if (value === void 0) {
                return this[name];
            } else if (this.attrs.indexOf(name) !== -1) {
                if (typeof value === 'string') {
                    if (/_json$/.test(name)) {
                        try {
                            value = value ? JSON.parse(value) : {};
                        } catch (e) {
                            console.log("Broken Json: ", value, e);
                            value = {};
                        }
                    } else if (/_at$/.test(name) && (isNaN(Date.parse(((value || '').replace(/-/g, '/') + 'Z'))) === false)) {
                        value = new Date(Date.parse(((value || '').replace(/-/g, '/') + 'Z')));
                    } else if (value === 'true' || value === 'false') {
                        value = value === 'true';
                    }
                }

                if (this[name] && /_json$/.test(name) && value !== null) { //if we already have value (we keep the reference)
                    Utils.copy(this[name], value);
                } else {
                    this[name] = value;
                }

                (new Delegator()).dispatch(MINUTE_ATTR_CHANGE, {parent: this});

                return this;
            } else {
                console.log("Warning: attr '%s' not found in %s", name, this);
            }
        };

        removeAttr = (name) => {
            delete(this[name]);
            return this;
        };

        getAttributes = () => {
            let result = {};

            for (let attr of this.attrs) {
                result[attr] = this[attr];
            }

            return result;
        };

        serialize = (ignoreUndefined = false, ignoreJoinKey = false): Object => {
            let serialized = {};
            let parent = this.parent;

            if (parent && !ignoreJoinKey) {
                let joinKey = parent.joinPk;
                let parentOfParent = parent.parent;

                if (joinKey && parentOfParent && !this.attr(joinKey)) {
                    let joinKeyVal = parentOfParent.attr(joinKey);

                    if (joinKeyVal) {
                        this.attr(joinKey, joinKeyVal);
                    } else {
                        throw new Error("Before calling serialized() on children, please call save() on the parent node first.");
                    }
                }
            }

            for (let key of this.attrs) {
                let value: any = this.attr(key);

                if ((value instanceof Items) || (value instanceof Item)) {
                    throw new Error("Item cannot have an attribute and child of same name: " + key);
                } else if (value instanceof Date && /_at$/.test(key)) {
                    value = value.toISOString().slice(0, 19).replace('T', ' ')
                } else if (typeof value !== 'string' && /_json$/.test(key)) {
                    value = JSON.stringify(value, (key, val) => /^[_$]/.test(key) ? undefined : val);
                } else if (value === true || value === false) {
                    value = value ? 'true' : 'false';
                }

                if (!ignoreUndefined || (value !== void 0)) {
                    serialized[key] = value;
                }
            }

            return Utils.copy(this._data.serialized, serialized);
        };

        load = (data: Object) => {
            let loaded = false;

            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    let val = data[key];

                    if (typeof val !== 'object') {
                        this.attr(key, val);
                        loaded = true;
                    } else if (this.hasOwnProperty(key)) {
                        if ((this[key] instanceof Items) || (this[key] instanceof Item)) {
                            this[key].load(val);
                        } else if (key === 'metadata') {
                            this.metadata = val;
                        }
                    }
                }
            }

            this.lastSave = JSON.stringify(this.serialize(true, true));

            return this;
        };

        dirty = (): boolean => {
            return JSON.stringify(this.serialize(true, true)) != this.lastSave;
        };

        clone = (): Item => {
            var data = JSON.parse(JSON.stringify(this.serialize()));

            ['created_at', this.parent.pk].forEach(function (key) {
                delete(data[key]);
            });

            return this.parent.create(data);
        };

        save = (successMsg: string = void 0, failureMsg: string = void 0): Promise<Object> => {
            let parent = this.getParentOrDie('save');

            return parent.saveAll(successMsg, failureMsg, this);
        };

        remove = (successMsg: string = void 0, failureMsg: string = void 0): Promise<Object> => {
            let parent = this.getParentOrDie('remove');

            return parent.removeAll(successMsg, failureMsg, this);
        };

        removeConfirm = (confirmTitle: string = void 0, confirmText: string = void 0, successMsg: string = void 0, failureMsg: string = void 0) => {
            let parent = this.getParentOrDie('removeConfirm');

            return parent.removeConfirmAll(confirmTitle, confirmText, successMsg, failureMsg, this);
        };

        reload = (): Promise<Object> => {
            let parent = this.getParentOrDie('reload');

            return parent.reloadAll(true, this);
        };

        dump = () => {
            var result: any = this.serialize(true, true);

            for (var i in this) {
                if (this.hasOwnProperty(i) && (i != 'parent') && ((this[i] instanceof Item) || (this[i] instanceof Items))) {
                    let iter: any = this[i];
                    result[i] = iter.dump();
                }
            }

            return Utils.copy(this._data.dump, result);
        };

        private getParentOrDie = (caller: string): Items<Item> => {
            if (!this.parent) {
                throw new Error('Item must have a parent for ' + caller);
            }

            return this.parent;
        };
    }

    export class Items<T extends Item> extends Array<T> {
        public metadata: Metadata = {offset: 0, total: 0, limit: 0};

        constructor(protected itemType: { new (parent: Items<T>): T; }, public parent: Item = null, public alias: string = '',
                    public modelClass: string = '', public pk: string = '', public joinPk: string = '') {
            super();
        }

        create = (data = {}): T => {
            let item: T = new this.itemType(this);

            this.push(item);
            item.load(data);

            return item;
        };

        load = (data: { metadata: Metadata, items: Array<Object> }) => {
            if (data) {
                this.setMetadata(data.metadata || {}, false);

                for (let item of data.items || []) {
                    this.create().load(item);
                }
            }

            return this;
        };

        cloneItem = (item: T): T => {
            let copy = item.clone();
            let newItem = this.create(copy.serialize(true, true));

            delete(newItem[this.joinPk]);

            return newItem;
        };

        saveAll = (successMsg: string = void 0, failureMsg: string = void 0, selection: T | Array<T>): Promise<Object> => {
            let items = <Array<T>> (!selection ? this.toArray() : (selection instanceof Item ? [selection] : selection));
            let unsaved = this.filterItemsBy(items, this.pk, true);
            let delegate = new Delegator();
            let deferred = delegate.defer();
            let promise = delegate.dispatch(MINUTE_SAVE, {successMsg: successMsg, failureMsg: failureMsg, parent: this, items: items});

            promise.then(
                (result) => {
                    let updates = result.data;

                    if (updates.hasOwnProperty('items')) {
                        updates = updates.items;

                        if (updates.length === items.length) {
                            for (let i = 0; i < items.length; i++) {
                                items[i].load(updates[i]);
                            }
                        } else {
                            throw new Error("Update length should always match item length");
                        }
                    }

                    for (var item of unsaved || []) {
                        item.reload();
                        this.metadata.total++;
                    }

                    deferred.resolve({self: this, item: items[0], updates: updates, successMsg: successMsg});
                },
                (error) => {
                    deferred.reject({self: this, failureMsg: failureMsg, error: error});
                });

            return deferred.promise;
        };

        removeAll = (successMsg: string = void 0, failureMsg: string = void 0, selection: T | Array<T>): Promise<Object> => {
            let items = <Array<T>> (!selection ? this.toArray() : (selection instanceof Item ? [selection] : selection));
            let saved = this.filterItemsBy(items, this.pk, false);

            let delegate = new Delegator();
            let deferred = delegate.defer();
            let promise = delegate.dispatch(MINUTE_REMOVE, {successMsg: successMsg, failureMsg: failureMsg, parent: this, items: saved});

            promise.then(
                (result) => {
                    let updates = result.data.items;

                    if (updates.length === saved.length) { //this means operation was successful, so we can remove all items now!
                        for (let i = items.length - 1; i >= 0; i--) {
                            this.splice(this.indexOf(items[i]), 1);
                        }
                    } else {
                        throw new Error("Update length should always match item length");
                    }

                    deferred.resolve({self: this, item: items[0], updates: updates, successMsg: successMsg});
                },
                (error) => {
                    deferred.reject({self: this, failureMsg: failureMsg, error: error});
                });

            return deferred.promise;
        };

        removeConfirmAll = (successMsg: string = void 0, failureMsg: string = void 0, confirmTitle: string = void 0, confirmText: string = void 0, selection: T | Array<T>): Promise<Object> => {
            let items = <Array<T>> (!selection ? this.toArray() : (selection instanceof Item ? [selection] : selection));
            let delegate = new Delegator();
            let deferred = delegate.defer();
            let promise = delegate.dispatch(MINUTE_REMOVE_CONFIRM, {parent: this, confirmTitle: confirmTitle, confirmText: confirmText});

            promise.then(() => this.removeAll(successMsg, failureMsg, items).then(deferred.resolve, deferred.reject), () => deferred.reject({self: this}));

            return deferred.promise;
        };

        reloadAll = (replace: boolean, singleItem: Item = null): Promise<Object> => {
            let start = singleItem || this.parent;
            let metadataChain = Utils.keyValue(this.alias, this.metadata);

            while (start && start.parent) {
                metadataChain[start.parent.alias] = {pk: start.attr(start.parent.pk)};
                start = start.parent.parent;
            }

            let delegate = new Delegator();
            let deferred = delegate.defer();
            let promise = delegate.dispatch(MINUTE_RELOAD, {parent: this, metadata: metadataChain});

            promise.then(
                (result) => {
                    let updates = result.data;

                    if (singleItem) {
                        if (updates.hasOwnProperty('items')) { //hack
                            singleItem.load(updates.items[0]);
                        } else if (updates.length > 0) {
                            singleItem.load(updates[0]);
                        }
                    } else if (updates.hasOwnProperty('items')) {
                        if (replace === true) { //replace current page otherwise results are appended to page
                            this.splice(0, this.length);
                        }

                        this.load(updates);
                    }

                    deferred.resolve({self: this, item: singleItem, updates: updates});
                },
                (error) => {
                    deferred.reject({self: this, error: error});
                });

            return deferred.promise;
        };

        getOffset = (): number => {
            return this.metadata.offset || 0;
        };

        getTotalItems = (): number => {
            return this.metadata.total || 0;
        };

        getItemsPerPage = (): number => {
            return this.metadata.limit || 1;
        };

        getCurrentPage = (): number => {
            return 1 + Math.floor(this.getOffset() / this.getItemsPerPage());
        };

        getTotalPages = (): number => {
            return Math.ceil(this.getTotalItems() / this.getItemsPerPage());
        };

        getOrder = (): string => {
            return (this.metadata.order || '').toLowerCase();
        };

        getSearch = (): Search => {
            return this.metadata.search || null;
        };

        setItemsPerPage = (limit, reload: boolean = true) => {
            return this.setMetadata({limit: parseInt(limit)}, reload);
        };

        setCurrentPage = (num, reload: boolean = true) => {
            let offset = Math.min(this.getTotalItems(), Math.max(0, (parseInt(num) - 1)) * this.getItemsPerPage());
            return this.setMetadata({offset: offset}, reload);
        };

        setOrder = (order: string, reload: boolean = true) => {
            return this.setMetadata({order: order}, reload);
        };

        toggleOrder = (reload: boolean = true) => {
            let matches = /(\w+)\s*(asc|desc)?/i.exec(this.getOrder() || this.pk);
            let newOrder = (matches[1] || this.pk) + ' ' + (/desc/i.test(matches[2]) ? 'asc' : 'desc');

            return this.setOrder(newOrder, reload);
        };

        setSearch = (search: Search, reload: boolean = true) => { //operator also supports IN NATURAL LANGUAGE MODE op
            return this.setMetadata({offset: 0, search: search}, reload);
        };

        setMetadata = (metadata: Metadata, reload: boolean) => {
            let lastMetaData = JSON.stringify(this.metadata);
            let newMetaData = JSON.stringify(Utils.extend(this.metadata, metadata));
            let delegate = new Delegator();
            let deferred = delegate.defer();

            if (reload && (lastMetaData !== newMetaData)) {
                this.reloadAll(true).then((result) => deferred.resolve(result));
            } else {
                deferred.resolve({});
            }

            return deferred.promise;
        };

        dump = () => {
            return this.map((item) => item.dump());
        };

        loadPrevPage = (replace: boolean = true) => {
            if (this.hasLessPages()) {
                this.setCurrentPage(this.getCurrentPage() - 1, replace);
            } else {
                console.log("error: already on first page");
            }
        };

        loadNextPage = (replace: boolean = true) => {
            if (this.hasMorePages()) {
                this.setCurrentPage(this.getCurrentPage() + 1, replace);
            } else {
                console.log("error: already on last page: ", this.getCurrentPage(), this.getTotalPages());
            }
        };

        hasMorePages = (): boolean => {
            return this.getCurrentPage() < this.getTotalPages();
        };

        hasLessPages = (): boolean => {
            return this.getCurrentPage() > 1;
        };

        private toArray(): Array<Item> { //javascript converts our class into object even though it "extends" an Array :(
            return this.map((item) => item);
        }

        private filterItemsBy(items: Array<Item>, attr: string, reverse: boolean): Array<Item> {
            let filter = (item) => item.parent && !!item.attr(attr);
            return items.filter((item) => reverse ? !filter(item) : filter(item));
        }

        /*private findChildrenBy(attr:string, value:any) {
         return value ? this.toArray().filter((item) => item.attr(attr) === value) : null;
         }*/
    }

}