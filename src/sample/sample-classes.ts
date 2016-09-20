///<reference path="../../_all.d.ts"/>

module Minute {
    export class Blogs extends Items<Blog> {
        constructor(parent) {
            super(Blog, parent, 'blog', 'Blog', 'blog_id');
        }
    }

    export class Blog extends Item {
        public post;

        constructor(parent) {
            super(parent, ['blog_id', 'blog_name', 'created_at', 'blog_data_json']);
            this.post = (new Posts(this)).create();
        }
    }

    export class Posts extends Items<Post> {
        constructor(parent) {
            super(Post, parent, 'post', 'Post', 'post_id');
        }
    }

    export class Post extends Item {
        public comments;

        constructor(parent) {
            super(parent, ['post_id', 'post_name']);
            this.comments = new Comments(this);
        }
    }

    export class Comments extends Items<Comment> {
        constructor(parent) {
            super(Comment, parent, 'comment', 'Comment', 'comment_id', 'post_id');
        }
    }

    export class Comment extends Item {
        constructor(parent) {
            super(parent, ['comment_id', 'comment_name', 'post_id']);
        }
    }
}
