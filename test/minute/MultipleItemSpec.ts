///<reference path="../../_all.d.ts"/>
///<reference path="../../src/sample/sample-classes.ts"/>

module Minute {
    describe("Create new item", () => {
        let blogs:Blogs, blog:Blog, posts:Posts, post1:Post, post2:Post,
            comments1:Comments, comments2:Comments, comment11:Comment, comment12:Comment, comment13:Comment,
            comment21:Comment, comment22:Comment, comment23:Comment, events:Emitter;

        beforeEach(()=> {
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
        });

        afterEach(()=> {
            events.off(MINUTE_SAVE).off(MINUTE_REMOVE).off(MINUTE_RELOAD);
        });

        it("should be able to load nested items", () => {
            let comment1 = {comment_id: 1, comment_name: 'comment update #1'};
            let comment2 = {comment_id: 2, comment_name: 'comment update #2'};
            let comments = {metadata: {offset: 2, total: 25}, items: [comment1, comment2]};
            let data = {blog_id: 1, blog_name: 'foo blog', 'post': {post_id: 1, post_name: 'bar post', comments: comments}};

            var blogz = new Blogs(null);
            blogz.load({metadata: null, items: [data]});

            expect(blogz[0].attr('blog_name')).toBe('foo blog');
            expect(blogz[0].post.attr('post_name')).toBe('bar post');
            expect(blogz[0].post.comments.length).toBe(2);
            expect(blogz[0].post.comments[1].attr('comment_name')).toBe('comment update #2');
        });

        it("should create a save request with ALL items", (done) => {
            let item1 = {comment_id: 1, comment_name: 'comment update #1'};
            let item2 = {comment_id: 2, comment_name: 'comment update #2'};
            let item3 = {comment_id: 3, comment_name: 'comment update #3'};

            let mock = jasmine.createSpy('save all mock').and.callFake((emitter:EmitterEx, args:any)=> {
                let items = args[0].items;

                emitter.dispatch(MINUTE_SAVE_PASS, {items: [item1, item2, item3]});
            });

            let spy1 = spyOn(comment11, 'load');
            let spy2 = spyOn(comment12, 'load');
            let spy3 = spyOn(comment13, 'load');

            let reload1 = spyOn(comment11, 'reload');
            let reload2 = spyOn(comment12, 'reload');

            let resolve = jasmine.createSpy('promise resolve');
            let reject = jasmine.createSpy('promise reject');

            events.on(MINUTE_SAVE, mock);

            comments1.saveAll('save', 'error').then(resolve, reject).then(()=> {
                expect(resolve).toHaveBeenCalledWith({self: comments1, updates: [item1, item2, item3], successMsg: 'save'});
                expect(reject).not.toHaveBeenCalled();
                done();
            });

            expect(mock).toHaveBeenCalled();
            let arg = mock.calls.mostRecent().args[1][0];
            expect(arg.items).toEqual([comment11, comment12, comment13]);

            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
            expect(spy3).toHaveBeenCalled();

            expect(reload1).not.toHaveBeenCalled();
            expect(reload2).toHaveBeenCalled();
        });

        it("should create a remove request with only SAVED items", () => {
            let item1 = {comment_id: 1};
            let item3 = {comment_id: 3};

            let mock = jasmine.createSpy('remove all mock').and.callFake((emitter:EmitterEx, args:any)=> {
                let items = args[0].items;

                emitter.dispatch(MINUTE_REMOVE_PASS, {items: [item1, item3]});
            });

            events.on(MINUTE_REMOVE, mock);

            expect(comments1.length).toBe(3);

            comments1.removeAll('remove', 'error');

            expect(comments1.length).toBe(0);
            expect(mock).toHaveBeenCalled();

            let arg = mock.calls.mostRecent().args[1][0];
            expect(arg.items).toEqual([comment11, comment13]);
        });

        it("should remove selected items only", () => {
            let mock = jasmine.createSpy('remove all mock').and.callFake((emitter:EmitterEx, args:any)=> {
                let items = args[0].items;
                let item3 = {comment_id: 3};

                expect(items.length).toBe(1); //saved items only
                emitter.dispatch(MINUTE_REMOVE_PASS, {items: [item3]});
            });

            events.on(MINUTE_REMOVE, mock);

            expect(comments1.length).toBe(3);
            comments1.removeAll('remove', 'error', comment11, comment12);

            expect(comments1.length).toBe(1);
            expect(comments1.indexOf(comment11)).toBe(-1);
            expect(comments1.indexOf(comment12)).toBe(-1);
            expect(comments1.indexOf(comment13)).toBe(0);
        });

        it("should be able to removed unsaved item only", () => {
            let mock = jasmine.createSpy('remove all mock').and.callFake((emitter:EmitterEx, args:any)=> {
                let items = args[0].items;

                expect(items.length).toBe(0); //there are no saved items!
                emitter.dispatch(MINUTE_REMOVE_PASS, {items: []});
            });

            events.on(MINUTE_REMOVE, mock);

            expect(comments1.length).toBe(3);
            comments1.removeAll('remove', 'error', comment12);

            expect(comments1.length).toBe(2);
            expect(comments1.indexOf(comment11)).toBe(0);
            expect(comments1.indexOf(comment12)).toBe(-1);
            expect(comments1.indexOf(comment13)).toBe(1);
        });

        it("should create a reload request correct PK chain", (done) => {
            let metadataChain = {"comment": {offset: 0, total: 31, limit: 0}, "post": {pk: 1}, "blog": {pk: 1}};

            let item1 = {comment_id: 1, comment_name: 'comment update #1'};
            let item2 = {comment_id: 2, comment_name: 'comment update #2'};

            let mock = jasmine.createSpy('reload all mock').and.callFake((emitter:EmitterEx, args:any)=> {
                let items = args[0].items;

                emitter.dispatch(MINUTE_RELOAD_PASS, {items: [item1, item2], metadata: {total: 31}});
            });
            let resolve = jasmine.createSpy('promise resolve');
            let reject = jasmine.createSpy('promise reject');

            events.on(MINUTE_RELOAD, mock);

            comments1.reloadAll(true).then(resolve, reject).then(()=> {
                expect(resolve).toHaveBeenCalled();
                expect(reject).not.toHaveBeenCalled();
                expect(comments1.length).toBe(2);
                expect(comments1[0].attr('comment_name')).toBe('comment update #1');
                expect(comments1[1].attr('comment_name')).toBe('comment update #2');
                expect(comments1.metadata.total).toBe(31);

                done();
            });

            expect(mock).toHaveBeenCalled();

            let arg = mock.calls.mostRecent().args[1][0];
            expect(arg.metadata).toEqual(metadataChain);
        });

        it("should create a reload request with just one item", (done) => {
            let item1 = {comment_id: 1, comment_name: 'comment update #1'};

            let mock = jasmine.createSpy('reload all mock').and.callFake((emitter:EmitterEx, args:any)=> {
                let items = args[0];

                emitter.dispatch(MINUTE_RELOAD_PASS, [item1]);
            });
            let resolve = jasmine.createSpy('promise resolve');
            let reject = jasmine.createSpy('promise reject');

            events.on(MINUTE_RELOAD, mock);

            comments1.reloadAll(false, comment11).then(resolve, reject).then(()=> {
                expect(resolve).toHaveBeenCalled();
                expect(reject).not.toHaveBeenCalled();
                expect(comments1.length).toBe(3);
                expect(comment11.attr('comment_name')).toBe('comment update #1');
                expect(comments1[0] === comment11).toBeTruthy();

                done();
            });

            expect(mock).toHaveBeenCalled();

            let arg = mock.calls.mostRecent().args[1][0];
            expect(arg.metadata).toEqual({comment: {pk: 1}, post: {pk: 1}, blog: {pk: 1}});
        });

        it("should use joinKey when saving children", () => {
            var postz = new Posts(null);
            postz.load({metadata: null, items: [{post_id: 1, post_name: 'bar post', comments: {items: [{comment_id: 1, comment_name: 'comment update #1'}]}}]});
            var serialized = postz[0].comments[0].serialize();
            expect(serialized.post_id).toBe(1);

            postz[0].removeAttr('post_id');
            postz[0].comments[0].removeAttr('post_id');
            expect(postz[0].comments[0].serialize).toThrowError(/please call save/);
        });

        it("should dump item and children", () => {
            var blogz = new Blogs(null);
            blogz.load({metadata: null, items: [{blog_id: 1, blog_name: 'foo blog', 'post': {post_id: 1, post_name: 'bar post'}}]});
            expect(blogz.dump()).toEqual([{"blog_id": 1, "blog_name": "foo blog", "post": {"post_id": 1, "post_name": "bar post", "comments": []}}]);
        });

        it("should get / set correct metadata", () => {
            blogs.metadata = {offset: 3, total: 20, limit: 2, order: 'blog_id DESC', search: {columns: 'blog_id', operator: '=', value: '3'}};

            expect(blogs.getOffset()).toBe(3);
            expect(blogs.getItemsPerPage()).toBe(2);
            expect(blogs.getTotalItems()).toBe(20);

            expect(blogs.getCurrentPage()).toBe(2);
            expect(blogs.getTotalPages()).toBe(10);
            expect(blogs.getOrder()).toBe('blog_id desc');
            expect(blogs.getSearch()).toEqual({columns: 'blog_id', operator: '=', value: '3'});

            blogs.setItemsPerPage(4, false);
            expect(blogs.getTotalPages()).toBe(5);

            blogs.setCurrentPage(2);
            expect(blogs.getOffset()).toBe(4);

            blogs.toggleOrder(false);
            expect(blogs.getOrder()).toBe('blog_id asc');

            blogs.setSearch({columns: 'blog_id', operator: '=', value: '4'}, false);
        });
    });
}