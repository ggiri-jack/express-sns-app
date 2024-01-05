const express = require('express');
const multer = require('multer');
const { checkAuthenticated, checkPostOwnerShip } = require('../middleware/auth');
const router = express.Router();
const Post = require('../models/posts.model');
const path = require('path');

const storageEngine = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../public/assets/images'));
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
})

const upload = multer({ storage: storageEngine }).single('image');

router.post('/', checkAuthenticated, upload, (req, res, next) => {
    let desc = req.body.desc;
    let image = req.file ? req.file.filename : "";

    Post.create({
        image: image,
        description: desc,
        author: {
            id: req.user._id,
            username: req.user.username
        },
    }, (err, _) => {
        if (err) {
            req.flash('error', '포스트를 생성하는데 에러가 발생했습니다.');
            res.redirect("back");

        } else {
            req.flash('success', '포스트를 생성했습니다.');
            res.redirect("back");
        }
    })

})


router.get('/', checkAuthenticated, (req, res) => {
    Post.find()
        .populate('comments')
        .sort({ createdAt: -1 })
        .exec((err, posts) => {
            if (err) {
                console.log(err);
            } else {
                res.render('posts', {
                    posts: posts,
                });
            }
        })
})

router.get('/:id/edit', checkPostOwnerShip, (req, res) => {
    res.render('posts/edit', {
        post: req.post
    })
})

router.put('/:id', checkPostOwnerShip, (req, res) => {
    Post.findByIdAndUpdate(req.params.id, req.body, (err, _) => {
        if (err) {
            req.flash('error', '게시물을 수정하는데 오류가 발생했습니다.');
            res.redirect('/posts');
        } else {
            req.flash('success', '게시물 수정했습니다.');
            res.redirect('/posts');
        }
    })
})

router.delete('/:id', checkPostOwnerShip, (req, res) => {
    Post.findByIdAndDelete(req.params.id, (err, _) => {
        if (err) {
            req.flash('error', '게시물을 지우는데 실패했습니다.');
        } else {
            req.flash('success', '게시물을 삭제했습니다.');
        }
        res.redirect('/posts');
    })
})

module.exports = router;