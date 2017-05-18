///<reference path="../../_all.d.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Minute;
(function (Minute) {
    var Blogs = (function (_super) {
        __extends(Blogs, _super);
        function Blogs(parent) {
            _super.call(this, Blog, parent, 'blog', 'Blog', 'blog_id');
        }
        return Blogs;
    }(Minute.Items));
    Minute.Blogs = Blogs;
    var Blog = (function (_super) {
        __extends(Blog, _super);
        function Blog(parent) {
            _super.call(this, parent, ['blog_id', 'blog_name', 'created_at', 'blog_data_json']);
            this.post = (new Posts(this)).create();
        }
        return Blog;
    }(Minute.Item));
    Minute.Blog = Blog;
    var Posts = (function (_super) {
        __extends(Posts, _super);
        function Posts(parent) {
            _super.call(this, Post, parent, 'post', 'Post', 'post_id');
        }
        return Posts;
    }(Minute.Items));
    Minute.Posts = Posts;
    var Post = (function (_super) {
        __extends(Post, _super);
        function Post(parent) {
            _super.call(this, parent, ['post_id', 'post_name']);
            this.comments = new Comments(this);
        }
        return Post;
    }(Minute.Item));
    Minute.Post = Post;
    var Comments = (function (_super) {
        __extends(Comments, _super);
        function Comments(parent) {
            _super.call(this, Comment, parent, 'comment', 'Comment', 'comment_id', 'post_id');
        }
        return Comments;
    }(Minute.Items));
    Minute.Comments = Comments;
    var Comment = (function (_super) {
        __extends(Comment, _super);
        function Comment(parent) {
            _super.call(this, parent, ['comment_id', 'comment_name', 'post_id']);
        }
        return Comment;
    }(Minute.Item));
    Minute.Comment = Comment;
})(Minute || (Minute = {}));
