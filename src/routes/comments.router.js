const express = require('express');
const { checkAuthenticated, checkCommentOwnership } = require('../middleware/auth');
const router = express.Router({
    mergeParams: true
});
const Post = require('../models/posts.model');
const Comment = require('../models/comments.model');

router.post('/', checkAuthenticated, (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if (err || !post) {
            req.flash('error', '댓글 생성 중 에러가 발생했습니다.');
            res.redirect('back');
        } else {
            Comment.create(req.body, (err, comment) => {
                if (err) {
                    req.flash('error', '댓글 생성 중 에러가 발생했습니다.');
                    res.redirect('back');
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();

                    post.comments.push(comment);
                    post.save();
                    req.flash('success', '댓글이 생성되었습니다.');
                    res.redirect('back');
                }
            })
        }
    })
})


router.delete("/:commentId", checkCommentOwnership, (req, res) => {
    Comment.findByIdAndDelete(req.params.commentId, (err, _) => {
        if (err) {
            req.flash('error', '댓글 삭제 중 에러가 발생했습니다.');
        } else {
            req.flash('success', '댓글을 삭제했습니다.');
        }
        res.redirect('back');
    })
})

router.get("/:commentId/edit", checkCommentOwnership, (req, res) => {
    Post.findById(req.params.id, (err, post) => {
        if (err || !post) {
            req.flash('error', '댓글에 해당하는 게시글이 없거나 에러가 발생했습니다.');
            res.redirect('back');
        } else {
            res.render('comments/edit', {
                post: post,
                comment: req.comment,
            })
        }
    })
})

router.put("/:commentId", checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.commentId,
        req.body,
        (err, _) => {
            if (err) {
                req.flash('error', '댓글을 수정하는데 에러가 났습니다.');
                res.redirect('back');
            } else {
                req.flash('success', '댓글을 수정했습니다.');
                res.redirect('/posts');
            }
        })
})




module.exports = router;