var express = require('express');
var router = express.Router();
var recaptcha = require('express-recaptcha');
var uuid = require('uuid');
var passport = require('passport'); //node_modules 的 passport

recaptcha.init('6LemPhYTAAAAAItz59UIkgXLwBn0PthN0B6Q5OyQ', '6LemPhYTAAAAAP4u5eUwe-h7QNYfbbqA6zVtnHSf');

router.get('/register', function (req, res) {
    res.render('users/register', {
        title: '使用者註冊',
        captcha: recaptcha.render(),
        error: req.flash('error')
    });
});

router.post('/register', function (req, res, next) {
    recaptcha.verify(req, function (error) {
        if (error) {
            req.flash('error', 'reCaptcha 驗證失敗');
            return res.redirect('/users/register');
        }

        var data = req.body;

        User.count({
            account: data.account
        }).exec().then(function (count) {
            if (count == 0) {
                User.create(data).then(function (user) {
                    return res.redirect('/users/login');
                });
            } else {
                req.flash('error', '帳號已存在');
                return res.redirect('/users/register');
            }
        }, next);
    });
});

router.get('/login', function (req, res) {
    res.render('users/login', {
        title: '使用者登入',
        error: req.flash('error')
    });
});

router.get('/google/login', passport.authenticate('google', { scope : ['profile', 'email'] }));
router.get('/google/callback', function(req, res, next) {
    passport.authenticate('google', function(err, user, failureMsg) {
        if(err) return next(err);

        if(user) {
            var token = new Buffer(uuid.v4()).toString('base64');
            user.token = token;

            user.save().then(function () {
                //設定cookie過期時間，過期後cookie會被自動刪除
                var expires = new Date();
                expires.setHours(expires.getHours() + 24);

                //把cookie回應給瀏覽器
                res.cookie('token', token, {
                    expires: expires
                });

                req.login(user, function(err) {
                    if(err) return next(err);

                    res.redirect('/');
                });
            }, next);
        } else {
            req.flash('error', failureMsg);
            res.redirect('/users/login');
        }
    })(req, res, next);
});

router.post('/login', function (req, res, next) {
    passport.authenticate('login', function(err, user, failure) {
        if(err) return next(err);
        if(!user) {
            req.flash('error', failure);
            return res.redirect('/users/login');
        }

        //0000-0000-0000-0000
        var token = new Buffer(uuid.v4()).toString('base64');

        user.token = token;
        user.save().then(function () {
            //設定cookie過期時間，過期後cookie會被自動刪除
            var expires = new Date();
            expires.setHours(expires.getHours() + 24);

            //把cookie回應給瀏覽器
            res.cookie('token', token, {
                expires: expires
            });

            req.login(user, function(err) {
                if(err) return next(err);

                res.redirect('/');
            });
        });
    })(req, res, next);
});

//router.post('/login', function (req, res, next) {
//    var data = req.body;
//
//    User.findOne({
//        account: data.account
//    }).exec().then(function (user) {
//        if (!user) {
//            req.flash('error', '帳號不存在');
//            return res.redirect('/users/login');
//        }
//
//        if (user.password !== data.password) {
//            req.flash('error', '密碼錯誤');
//            return res.redirect('/users/login');
//        }
//
//        //0000-0000-0000-0000
//        var token = new Buffer(uuid.v4()).toString('base64');
//
//        user.token = token;
//        user.save().then(function () {
//            req.session.isAuthenticated = true;
//            req.session.user = user;
//
//            //設定cookie過期時間，過期後cookie會被自動刪除
//            var expires = new Date();
//            expires.setHours(expires.getHours() + 24);
//
//            //把cookie回應給瀏覽器
//            res.cookie('token', token, {
//                expires: expires
//            });
//
//            return res.redirect('/');
//        }, next);
//    });
//});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/users/login');
});

module.exports = router;
