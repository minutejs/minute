///<reference path="../../_all.d.ts"/>
///<reference path="../../src/sample/sample-classes.ts"/>

module Minute {
    let module = angular.mock.module;
    let inject = angular.mock.inject;

    describe("Create new item", () => {
        let blogs:Blogs, blog:Blog, posts:Posts, post1:Post, post2:Post,
            comments1:Comments, comments2:Comments, comment11:Comment, comment12:Comment, comment13:Comment,
            comment21:Comment, comment22:Comment, comment23:Comment, events:Emitter;
        let resolve, reject;

        beforeEach(()=> {
            module('MinuteConfig');
            module('MinuteFramework');

            blogs = new Blogs(null);
            blog = blogs.create({blog_id: 1, blog_name: 'blog #1'});

            posts = new Posts(blog);
            post1 = posts.create({post_id: 1, post_name: 'post #1'});
            post2 = posts.create({post_id: 2, post_name: 'post #2'});

            comments1 = new Comments(post1);
            comment11 = comments1.create({comment_id: 1, comment_name: 'comment #1'});
            comment12 = comments1.create({comment_name: 'comment #2'});
            comment13 = comments1.create({comment_id: 3, comment_name: 'comment #3'});

            comments2 = new Comments(post2);
            comment21 = comments2.create({comment_id: 4, comment_name: 'comment #1'});
            comment22 = comments2.create({comment_name: 'comment #2'});
            comment23 = comments2.create({comment_id: 6, comment_name: 'comment #3'});

            events = getEventEmitter();
            resolve = jasmine.createSpy('promise resolved');
            reject = jasmine.createSpy('promise rejected');
        });

        afterEach(()=> {
            events.off(MINUTE_SAVE).off(MINUTE_REMOVE).off(MINUTE_RELOAD);
        });

        it("should handle the save request of one item and resolve promise", (done) => {
            inject(($http, $minute, $ui) => {
                let spy = spyOn($minute, 'save').and.callThrough();
                let toast = spyOn($ui, 'toast');
                let post = spyOn($http, 'post').and.callFake((url, data) => {
                    expect(url).toBe('');
                    expect(data).toEqual({"cmd": "save", model: 'Blog', alias: 'blog', "items": [{"blog_id": 1, "blog_name": "blog #1"}]});

                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 1, {data: {"items": [{"blog_id": 1, "blog_name": "blog saved #1"}]}});
                    });
                });


                $minute.init();

                blog.save('saved', 'error').then(resolve, reject).then(()=> {
                    expect(blog.attr('blog_name')).toBe('blog saved #1');
                    expect(toast).toHaveBeenCalledWith('saved', 'success');
                    done();
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].items).toEqual([blog]);
            });
        });

        it("should handle the save request of all items and resolve promise", (done) => {
            inject(($http, $minute) => {
                let spy = spyOn($minute, 'save').and.callThrough();
                let serialized = {
                    "items": [{"comment_id": 1, "comment_name": "comment #1", post_id: 1}, {"comment_name": "comment #2", post_id: 1}, {
                        "comment_id": 3,
                        "comment_name": "comment #3",
                        post_id: 1
                    }]
                };
                let post = spyOn($http, 'post').and.callFake((url, data) => {
                    expect(url).toBe('');
                    expect(data).toEqual(Utils.extend({"cmd": "save", model: 'Comment', alias: 'comment'}, serialized));

                    return new Promise((resolve, reject) => {
                        var copy = Utils.extend({}, serialized);
                        serialized.items[1]['comment_id'] = 2;
                        serialized.items[1]['comment_name'] = 'comment updated #2';
                        setTimeout(resolve, 1, {data: copy});
                    });
                });
                let reload = spyOn(comment12, 'reload');

                $minute.init();

                comments1.saveAll().then(resolve, reject).then(()=> {
                    expect(comment12.serialize()).toEqual({comment_name: 'comment updated #2', comment_id: 2, post_id: 1});
                    expect(reload).toHaveBeenCalled();
                    expect(comments1.metadata.total).toBe(1);
                    done();
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].items).toEqual([comment11, comment12, comment13]);
            });
        });

        it("should handle the save request and resolve promise even where there is nothing to be saved", (done) => {
            inject(($http, $minute) => {
                let spy = spyOn($minute, 'save').and.callThrough();
                let post = spyOn($http, 'post');

                $minute.init();

                let comments = new Comments(null);
                comments.saveAll().then(resolve, reject).then(()=> {
                    expect(resolve).toHaveBeenCalled();
                    expect(reject).not.toHaveBeenCalled();
                    done()
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].items).toEqual([]);
                expect(post).not.toHaveBeenCalled();
            });
        });

        it("should handle the remove request of one item and resolve promise", (done)=> {
            inject(($http, $minute, $ui) => {
                let spy = spyOn($minute, 'remove').and.callThrough();
                let toast = spyOn($ui, 'toast');
                let post = spyOn($http, 'post').and.callFake((url, data) => {
                    expect(url).toBe('');
                    expect(data).toEqual({"cmd": "remove", model: 'Blog', alias: 'blog', "items": [{"blog_id": 1}]});

                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 1, {data: {"items": [{"blog_id": 1}]}});
                    });
                });

                $minute.init();

                expect(blogs.indexOf(blog)).toBe(0);

                blog.remove('removed', 'error').then(resolve, reject).then(()=> {
                    expect(blogs.indexOf(blog)).toBe(-1);
                    expect(toast).toHaveBeenCalledWith('removed', 'success');
                    done();
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].items).toEqual([blog]);
            });
        });

        it("should handle the remove request of all items and resolve promise", (done)=> {
            inject(($http, $minute, $ui) => {
                let spy = spyOn($minute, 'remove').and.callThrough();
                let toast = spyOn($ui, 'toast');
                let post = spyOn($http, 'post').and.callFake((url, data) => {
                    expect(url).toBe('');
                    expect(data).toEqual({"cmd": "remove", model: 'Comment', alias: 'comment', "items": [{comment_id: 1}, {comment_id: 3}]});

                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 1, {data: {"items": [{comment_id: 1}, {comment_id: 3}]}});
                    });
                });

                $minute.init();

                expect(comments1.length).toBe(3);

                comments1.removeAll().then(resolve, reject).then(()=> {
                    expect(comments1.length).toBe(0);
                    expect(toast).not.toHaveBeenCalled();
                    done();
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].items).toEqual([comment11, comment13]);
            });
        });

        it("should handle the remove request and resolve promise even where there is nothing to be removed", (done) => {
            inject(($http, $minute) => {
                let spy = spyOn($minute, 'remove').and.callThrough();
                let post = spyOn($http, 'post');

                $minute.init();

                let comments = new Comments(null);
                expect(comments.length).toBe(0);

                comments.removeAll().then(resolve, reject).then(()=> {
                    expect(comments.length).toBe(0);
                    expect(resolve).toHaveBeenCalled();
                    expect(reject).not.toHaveBeenCalled();
                    done()
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].items).toEqual([]);
                expect(post).not.toHaveBeenCalled();
            });
        });

        it("should handle single item reload", (done) => {
            inject(($http, $minute) => {
                let metadataChain = {"comment": {pk: 1}, "post": {pk: 1}, "blog": {pk: 1}};
                let spy = spyOn($minute, 'reload').and.callThrough();
                let post = spyOn($http, 'get').and.callFake((url, data) => {
                    expect(url).toBe('');
                    expect(data).toEqual({params: {"cmd": "reload", model: 'Comment', alias: 'comment', metadata: metadataChain}});

                    return new Promise((resolve, reject) => {
                        setTimeout(resolve, 1, {data: [{comment_id: 1, comment_name: 'comment updated #2'}]});
                    });
                });

                $minute.init();

                expect(comment11.attr('comment_id')).toBe(1);
                expect(comment11.attr('comment_name')).toBe('comment #1');

                comment11.reload().then(resolve, reject).then(()=> {
                    expect(comment11.attr('comment_name')).toBe('comment updated #2');
                    expect(resolve).toHaveBeenCalled();
                    expect(reject).not.toHaveBeenCalled();
                    done()
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].metadata).toEqual(metadataChain);
            });
        });

        it("should handle bulk reload of ItemArray", (done) => {
            inject(($http, $minute) => {
                let metadataChain = {"post": {pk: 1}, "blog": {pk: 1}, "comment": {offset: 0, total: 0, limit: 0}};
                let spy = spyOn($minute, 'reload').and.callThrough();
                let post = spyOn($http, 'get').and.callFake((url, data) => {
                    expect(url).toBe('');
                    expect(data).toEqual({params: {"cmd": "reload", model: 'Comment', alias: 'comment', metadata: metadataChain}});

                    return new Promise((resolve, reject) => {
                        let comment1 = {comment_id: 1, comment_name: 'comment updated #1'};
                        let comment2 = {comment_id: 2, comment_name: 'comment updated #2'};
                        let comment3 = {comment_id: 3, comment_name: 'comment updated #3'};

                        setTimeout(resolve, 1, {data: {"items": [comment1, comment2, comment3]}});
                    });
                });

                $minute.init();

                expect(comments1[0].attr('comment_id')).toBe(1);
                expect(comments1[0].attr('comment_name')).toBe('comment #1');
                expect(comments1[1].attr('comment_id')).toBe(undefined);
                expect(comments1[1].attr('comment_name')).toBe('comment #2');

                comments1.reloadAll(true).then(resolve, reject).then(()=> {
                    expect(comments1[0].attr('comment_id')).toBe(1);
                    expect(comments1[0].attr('comment_name')).toBe('comment updated #1');
                    expect(comments1[1].attr('comment_id')).toBe(2);
                    expect(comments1[1].attr('comment_name')).toBe('comment updated #2');
                    expect(resolve).toHaveBeenCalled();
                    expect(reject).not.toHaveBeenCalled();
                    done()
                });

                expect(spy).toHaveBeenCalledTimes(1);

                let args = spy.calls.mostRecent().args;
                expect(args[0] instanceof EmitterEx).toBeTruthy();
                expect(args[1][0].metadata).toEqual(metadataChain);
            });
        });

        it("should confirm before removing an item", (done) => {
            inject(($http, $minute, $ui) => {
                let mock = spyOn(comments1, 'removeAll').and.callFake((successMsg, errorMsg, items)=> {
                    expect(successMsg).toBe('deleted');
                    expect(errorMsg).toBe('error');
                    expect(items).toEqual(comment11);

                    return new Promise((resolve, reject) => setTimeout(resolve, 1));
                });

                let spy = spyOn($ui, 'confirm').and.callFake((title, text)=> {
                    expect(title).toBe('sure?');
                    expect(text).toBe('pakka');

                    return new Promise((resolve, reject) => setTimeout(resolve, 1));
                });

                comment11.removeConfirm('sure?', 'pakka', 'deleted', 'error').then(resolve, reject).then(()=> {
                    expect(resolve).toHaveBeenCalled();
                    expect(reject).not.toHaveBeenCalled();
                    done();
                });
            });
        });

    });
}
