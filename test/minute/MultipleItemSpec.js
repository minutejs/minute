///<reference path="../../_all.d.ts"/>
///<reference path="../../src/sample/sample-classes.ts"/>
var Minute;
(function (Minute) {
    describe("Create new item", function () {
        var blogs, blog, posts, post1, post2, comments1, comments2, comment11, comment12, comment13, comment21, comment22, comment23, events;
        beforeEach(function () {
            blogs = new Minute.Blogs(null);
            blog = blogs.create({ blog_id: 1, blog_name: 'blog #1' });
            posts = new Minute.Posts(blog);
            post1 = posts.create({ post_id: 1, post_name: 'post #1' });
            post2 = posts.create({ post_id: 2, post_name: 'post #2' });
            comments1 = new Minute.Comments(post1);
            comment11 = comments1.create({ comment_id: 1, comment_name: 'comment #1' });
            comment12 = comments1.create({ comment_name: 'comment #2' });
            comment13 = comments1.create({ comment_id: 3, comment_name: 'comment #3' });
            comments2 = new Minute.Comments(post2);
            comment21 = comments2.create({ comment_id: 4, comment_name: 'comment #1' });
            comment22 = comments2.create({ comment_name: 'comment #2' });
            comment23 = comments2.create({ comment_id: 6, comment_name: 'comment #3' });
            events = Minute.getEventEmitter();
        });
        afterEach(function () {
            events.off(Minute.MINUTE_SAVE).off(Minute.MINUTE_REMOVE).off(Minute.MINUTE_RELOAD);
        });
        it("should be able to load nested items", function () {
            var comment1 = { comment_id: 1, comment_name: 'comment update #1' };
            var comment2 = { comment_id: 2, comment_name: 'comment update #2' };
            var comments = { metadata: { offset: 2, total: 25 }, items: [comment1, comment2] };
            var data = { blog_id: 1, blog_name: 'foo blog', 'post': { post_id: 1, post_name: 'bar post', comments: comments } };
            var blogz = new Minute.Blogs(null);
            blogz.load({ metadata: null, items: [data] });
            expect(blogz[0].attr('blog_name')).toBe('foo blog');
            expect(blogz[0].post.attr('post_name')).toBe('bar post');
            expect(blogz[0].post.comments.length).toBe(2);
            expect(blogz[0].post.comments[1].attr('comment_name')).toBe('comment update #2');
        });
        it("should create a save request with ALL items", function (done) {
            var item1 = { comment_id: 1, comment_name: 'comment update #1' };
            var item2 = { comment_id: 2, comment_name: 'comment update #2' };
            var item3 = { comment_id: 3, comment_name: 'comment update #3' };
            var mock = jasmine.createSpy('save all mock').and.callFake(function (emitter, args) {
                var items = args[0].items;
                emitter.dispatch(Minute.MINUTE_SAVE_PASS, { items: [item1, item2, item3] });
            });
            var spy1 = spyOn(comment11, 'load');
            var spy2 = spyOn(comment12, 'load');
            var spy3 = spyOn(comment13, 'load');
            var reload1 = spyOn(comment11, 'reload');
            var reload2 = spyOn(comment12, 'reload');
            var resolve = jasmine.createSpy('promise resolve');
            var reject = jasmine.createSpy('promise reject');
            events.on(Minute.MINUTE_SAVE, mock);
            comments1.saveAll('save', 'error').then(resolve, reject).then(function () {
                expect(resolve).toHaveBeenCalledWith({ self: comments1, updates: [item1, item2, item3], successMsg: 'save' });
                expect(reject).not.toHaveBeenCalled();
                done();
            });
            expect(mock).toHaveBeenCalled();
            var arg = mock.calls.mostRecent().args[1][0];
            expect(arg.items).toEqual([comment11, comment12, comment13]);
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
            expect(spy3).toHaveBeenCalled();
            expect(reload1).not.toHaveBeenCalled();
            expect(reload2).toHaveBeenCalled();
        });
        it("should create a remove request with only SAVED items", function () {
            var item1 = { comment_id: 1 };
            var item3 = { comment_id: 3 };
            var mock = jasmine.createSpy('remove all mock').and.callFake(function (emitter, args) {
                var items = args[0].items;
                emitter.dispatch(Minute.MINUTE_REMOVE_PASS, { items: [item1, item3] });
            });
            events.on(Minute.MINUTE_REMOVE, mock);
            expect(comments1.length).toBe(3);
            comments1.removeAll('remove', 'error');
            expect(comments1.length).toBe(0);
            expect(mock).toHaveBeenCalled();
            var arg = mock.calls.mostRecent().args[1][0];
            expect(arg.items).toEqual([comment11, comment13]);
        });
        it("should remove selected items only", function () {
            var mock = jasmine.createSpy('remove all mock').and.callFake(function (emitter, args) {
                var items = args[0].items;
                var item3 = { comment_id: 3 };
                expect(items.length).toBe(1); //saved items only
                emitter.dispatch(Minute.MINUTE_REMOVE_PASS, { items: [item3] });
            });
            events.on(Minute.MINUTE_REMOVE, mock);
            expect(comments1.length).toBe(3);
            comments1.removeAll('remove', 'error', comment11, comment12);
            expect(comments1.length).toBe(1);
            expect(comments1.indexOf(comment11)).toBe(-1);
            expect(comments1.indexOf(comment12)).toBe(-1);
            expect(comments1.indexOf(comment13)).toBe(0);
        });
        it("should be able to removed unsaved item only", function () {
            var mock = jasmine.createSpy('remove all mock').and.callFake(function (emitter, args) {
                var items = args[0].items;
                expect(items.length).toBe(0); //there are no saved items!
                emitter.dispatch(Minute.MINUTE_REMOVE_PASS, { items: [] });
            });
            events.on(Minute.MINUTE_REMOVE, mock);
            expect(comments1.length).toBe(3);
            comments1.removeAll('remove', 'error', comment12);
            expect(comments1.length).toBe(2);
            expect(comments1.indexOf(comment11)).toBe(0);
            expect(comments1.indexOf(comment12)).toBe(-1);
            expect(comments1.indexOf(comment13)).toBe(1);
        });
        it("should create a reload request correct PK chain", function (done) {
            var metadataChain = { "comment": { offset: 0, total: 31, limit: 0 }, "post": { pk: 1 }, "blog": { pk: 1 } };
            var item1 = { comment_id: 1, comment_name: 'comment update #1' };
            var item2 = { comment_id: 2, comment_name: 'comment update #2' };
            var mock = jasmine.createSpy('reload all mock').and.callFake(function (emitter, args) {
                var items = args[0].items;
                emitter.dispatch(Minute.MINUTE_RELOAD_PASS, { items: [item1, item2], metadata: { total: 31 } });
            });
            var resolve = jasmine.createSpy('promise resolve');
            var reject = jasmine.createSpy('promise reject');
            events.on(Minute.MINUTE_RELOAD, mock);
            comments1.reloadAll(true).then(resolve, reject).then(function () {
                expect(resolve).toHaveBeenCalled();
                expect(reject).not.toHaveBeenCalled();
                expect(comments1.length).toBe(2);
                expect(comments1[0].attr('comment_name')).toBe('comment update #1');
                expect(comments1[1].attr('comment_name')).toBe('comment update #2');
                expect(comments1.metadata.total).toBe(31);
                done();
            });
            expect(mock).toHaveBeenCalled();
            var arg = mock.calls.mostRecent().args[1][0];
            expect(arg.metadata).toEqual(metadataChain);
        });
        it("should create a reload request with just one item", function (done) {
            var item1 = { comment_id: 1, comment_name: 'comment update #1' };
            var mock = jasmine.createSpy('reload all mock').and.callFake(function (emitter, args) {
                var items = args[0];
                emitter.dispatch(Minute.MINUTE_RELOAD_PASS, [item1]);
            });
            var resolve = jasmine.createSpy('promise resolve');
            var reject = jasmine.createSpy('promise reject');
            events.on(Minute.MINUTE_RELOAD, mock);
            comments1.reloadAll(false, comment11).then(resolve, reject).then(function () {
                expect(resolve).toHaveBeenCalled();
                expect(reject).not.toHaveBeenCalled();
                expect(comments1.length).toBe(3);
                expect(comment11.attr('comment_name')).toBe('comment update #1');
                expect(comments1[0] === comment11).toBeTruthy();
                done();
            });
            expect(mock).toHaveBeenCalled();
            var arg = mock.calls.mostRecent().args[1][0];
            expect(arg.metadata).toEqual({ comment: { pk: 1 }, post: { pk: 1 }, blog: { pk: 1 } });
        });
        it("should use joinKey when saving children", function () {
            var postz = new Minute.Posts(null);
            postz.load({ metadata: null, items: [{ post_id: 1, post_name: 'bar post', comments: { items: [{ comment_id: 1, comment_name: 'comment update #1' }] } }] });
            var serialized = postz[0].comments[0].serialize();
            expect(serialized.post_id).toBe(1);
            postz[0].removeAttr('post_id');
            postz[0].comments[0].removeAttr('post_id');
            expect(postz[0].comments[0].serialize).toThrowError(/please call save/);
        });
        it("should dump item and children", function () {
            var blogz = new Minute.Blogs(null);
            blogz.load({ metadata: null, items: [{ blog_id: 1, blog_name: 'foo blog', 'post': { post_id: 1, post_name: 'bar post' } }] });
            expect(blogz.dump()).toEqual([{ "blog_id": 1, "blog_name": "foo blog", "post": { "post_id": 1, "post_name": "bar post", "comments": [] } }]);
        });
        it("should get / set correct metadata", function () {
            blogs.metadata = { offset: 3, total: 20, limit: 2, order: 'blog_id DESC', search: { columns: 'blog_id', operator: '=', value: '3' } };
            expect(blogs.getOffset()).toBe(3);
            expect(blogs.getItemsPerPage()).toBe(2);
            expect(blogs.getTotalItems()).toBe(20);
            expect(blogs.getCurrentPage()).toBe(2);
            expect(blogs.getTotalPages()).toBe(10);
            expect(blogs.getOrder()).toBe('blog_id desc');
            expect(blogs.getSearch()).toEqual({ columns: 'blog_id', operator: '=', value: '3' });
            blogs.setItemsPerPage(4, false);
            expect(blogs.getTotalPages()).toBe(5);
            blogs.setCurrentPage(2);
            expect(blogs.getOffset()).toBe(4);
            blogs.toggleOrder(false);
            expect(blogs.getOrder()).toBe('blog_id asc');
            blogs.setSearch({ columns: 'blog_id', operator: '=', value: '4' }, false);
        });
    });
})(Minute || (Minute = {}));
//# sourceMappingURL=MultipleItemSpec.js.map