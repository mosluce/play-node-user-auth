var express = require('express');
var router = express.Router();
var recaptcha = require('express-recaptcha');


recaptcha.init('6LemPhYTAAAAAItz59UIkgXLwBn0PthN0B6Q5OyQ', '6LemPhYTAAAAAP4u5eUwe-h7QNYfbbqA6zVtnHSf');

router.get('/register', function (req, res) {
    res.render('users/register', {
        title: '使用者註冊',
        captcha: recaptcha.render(),
        error: req.flash('error')
    });
});

router.post('/register', function (req, res, next) {
    recaptcha.verify(req, function(error){
        if(error) {
            req.flash('error', 'reCaptcha 驗證失敗');
            return res.redirect('/users/register');
        }

        var data = req.body;

        User.count({
            account: data.account
        }).exec().then(function(count) {
            if(count == 0) {
                User.create(data).then(function(user) {
                    return res.redirect('/users/login');
                });
            } else {
                req.flash('error', '帳號已存在');
                return res.redirect('/users/register');
            }
        }, next);
    });
});

router.get('/login', function(req, res) {
    res.render('users/login', {
        title: '使用者登入',
        error: req.flash('error')
    });
});

router.post('/login', function(req, res, next) {
    var data = req.body;

    User.findOne({
        account: data.account
    }).exec().then(function(user) {
        if(!user) {
            req.flash('error', '帳號不存在');
            return res.redirect('/users/login');
        }

        if(user.password !== data.password) {
            req.flash('error', '密碼錯誤');
            return res.redirect('/users/login');
        }

        req.session.isAuthenticated = true;
        req.session.user = user;

        return res.redirect('/');
    });
});

router.get('/logout', function(req, res) {
    req.session.destroy(function() {
        res.redirect('/users/login');
    });
});

module.exports = router;
