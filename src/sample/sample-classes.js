///<reference path="../../_all.d.ts"/>
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Minute;
(function (Minute) {
    var Blogs = (function (_super) {
        __extends(Blogs, _super);
        function Blogs(parent) {
            return _super.call(this, Blog, parent, 'blog', 'Blog', 'blog_id') || this;
        }
        return Blogs;
    }(Minute.Items));
    Minute.Blogs = Blogs;
    var Blog = (function (_super) {
        __extends(Blog, _super);
        function Blog(parent) {
            var _this = _super.call(this, parent, ['blog_id', 'blog_name', 'created_at', 'blog_data_json']) || this;
            _this.post = (new Posts(_this)).create();
            return _this;
        }
        return Blog;
    }(Minute.Item));
    Minute.Blog = Blog;
    var Posts = (function (_super) {
        __extends(Posts, _super);
        function Posts(parent) {
            return _super.call(this, Post, parent, 'post', 'Post', 'post_id') || this;
        }
        return Posts;
    }(Minute.Items));
    Minute.Posts = Posts;
    var Post = (function (_super) {
        __extends(Post, _super);
        function Post(parent) {
            var _this = _super.call(this, parent, ['post_id', 'post_name']) || this;
            _this.comments = new Comments(_this);
            return _this;
        }
        return Post;
    }(Minute.Item));
    Minute.Post = Post;
    var Comments = (function (_super) {
        __extends(Comments, _super);
        function Comments(parent) {
            return _super.call(this, Comment, parent, 'comment', 'Comment', 'comment_id', 'post_id') || this;
        }
        return Comments;
    }(Minute.Items));
    Minute.Comments = Comments;
    var Comment = (function (_super) {
        __extends(Comment, _super);
        function Comment(parent) {
            return _super.call(this, parent, ['comment_id', 'comment_name', 'post_id']) || this;
        }
        return Comment;
    }(Minute.Item));
    Minute.Comment = Comment;
})(Minute || (Minute = {}));
