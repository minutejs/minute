///<reference path="../../_all.d.ts"/>
///<reference path="../../src/sample/sample-classes.ts"/>
var Minute;
(function (Minute) {
    describe("Create new item", function () {
        var blogs, blog, posts, post, comments, comment, events;
        beforeEach(function () {
            blogs = new Minute.Blogs(null);
            blog = blogs.create({ blog_id: 1, blog_name: 'blog #1' });
            posts = new Minute.Posts(blog);
            post = posts.create({ post_id: 1, post_name: 'post #1' });
            comments = new Minute.Comments(post);
            comment = comments.create({ comment_id: 1, comment_name: 'comment #1' });
            events = Minute.getEventEmitter();
        });
        it("should create new item and load sample data", function () {
            expect(blogs.length).toBe(1);
            expect(blog.attr('blog_id')).toBe(1);
            expect(blog.attr('blog_name')).toBe('blog #1');
        });
        it("should convert date to Date object", function () {
            var value = '2006-01-01 00:00:00';
            blog.attr('created_at', value);
            var date = blog.attr('created_at');
            expect(date instanceof Date).toBeTruthy();
            expect(date.toUTCString()).toBe('Sun, 01 Jan 2006 00:00:00 GMT');
        });
        it("should convert json objects", function () {
            blog.attr('blog_data_json', '{"foo": "bar"}');
            var data = blog.attr('blog_data_json');
            expect(data).toEqual({ "foo": "bar" });
        });
        it("should convert boolean objects", function () {
            blog.attr('blog_name', 'true');
            var data = blog.attr('blog_name');
            expect(data === true).toBeTruthy();
        });
        it("should serialize properly", function () {
            var serialized;
            serialized = blog.serialize(true);
            expect(serialized).toEqual({ blog_id: 1, blog_name: 'blog #1' });
            serialized = blog.serialize(false);
            expect(serialized).toEqual({ blog_id: 1, blog_name: 'blog #1', created_at: undefined, blog_data_json: undefined });
            blog.removeAttr('blog_id');
            serialized = blog.serialize(true);
            expect(serialized).toEqual({ blog_name: 'blog #1' });
        });
        it("should set object as dirty on change", function () {
            expect(blog.dirty()).toBeFalsy();
            blog.attr('blog_name', 'san');
            expect(blog.dirty()).toBeTruthy();
        });
        it("should clone object attributes and push in parent", function () {
            blog.attr('created_at', '2006-01-01 00:00:00');
            blog.attr('blog_data_json', '{"foo": "bar"}');
            var copy = blog.clone();
            expect(blogs.indexOf(copy) !== -1).toBeTruthy();
            expect(copy.attr('blog_data_json')).toEqual({ "foo": "bar" });
            expect(copy.attr('blog_data_json') === blog.attr('blog_data_json')).toBeFalsy();
        });
        it("should should call saveAll on parent and emit save event with ALL items", function () {
            var mock = jasmine.createSpy('mock method #1');
            events.on(Minute.MINUTE_SAVE, mock);
            blog.save('ok', 'error');
            expect(mock).toHaveBeenCalled();
            var arg = (mock.calls.mostRecent().args[1])[0];
            expect(arg.successMsg).toEqual('ok');
            expect(arg.failureMsg).toEqual('error');
            expect(arg.items[0]).toEqual(blog);
        });
        it("should should call removeAll on parent and emit remove event with only SAVED items", function () {
            var blogUnsaved = blogs.create({ blog_name: 'unsaved item' });
            var mock = jasmine.createSpy('mock method #1');
            var arg;
            events.on(Minute.MINUTE_REMOVE, mock);
            expect(blogs.length).toBe(2);
            blogUnsaved.remove();
            expect(mock).toHaveBeenCalled();
            arg = (mock.calls.mostRecent().args[1])[0];
            expect(arg.items).toEqual([]);
            blog.remove();
            arg = (mock.calls.mostRecent().args[1])[0];
            expect(arg.items).toEqual([blog]);
        });
        it("should confirm first and then call removeAll with SAVED items", function () {
            var removeAllMock = spyOn(blogs, 'removeAll').and.returnValue(new Promise(function (resolve, reject) { return null; }));
            var mock = jasmine.createSpy('remove confirm').and.callFake(function (emitter, args) {
                emitter.dispatch(Minute.MINUTE_REMOVE_CONFIRM_PASS);
            });
            events.on(Minute.MINUTE_REMOVE_CONFIRM, mock);
            blog.removeConfirm('sure?', 'pakka', 'removed', 'error');
            expect(removeAllMock).toHaveBeenCalled();
            var args = removeAllMock.calls.mostRecent().args;
            expect(args).toEqual(['removed', 'error', blog]);
        });
        it("should reload the item by forming the correct pk chain from itself to the top", function () {
            var args;
            var mock = jasmine.createSpy('reload request');
            events.on(Minute.MINUTE_RELOAD, mock);
            blog.reload();
            args = mock.calls.mostRecent().args[1][0];
            expect(args).toEqual({ "metadata": { blog: { pk: 1 } } });
            comment.reload();
            args = mock.calls.mostRecent().args[1][0];
            expect(args).toEqual({ "metadata": { comment: { pk: 1 }, post: { pk: 1 }, blog: { pk: 1 } } });
            expect(mock).toHaveBeenCalledTimes(2);
        });
    });
})(Minute || (Minute = {}));
//# sourceMappingURL=SingleItemSpec.js.map