var passport = require('passport');
var Strategy = require('passport-google-oauth').OAuth2Strategy;
var CustomStragety = require('passport-custom').Strategy;
var session = require('express-session');

module.exports = function (app) {
    //Passport 設定流程
    //1. session
    app.use(session({
        secret: 'JKdslajdslsjljlckdjh;wchdscsdhljkcshd',
        resave: false,
        saveUninitialized: false
    }));

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        User.findById(id).exec().then(function (user) {
            done(null, user);
        }, done);
    });

    // passport setup
    passport.use(new Strategy({
        clientID: '81522733390-c5sndeijgc9pn913mh8vn438akcfklc7.apps.googleusercontent.com',
        clientSecret: 'Ojku53MTugJHCNrwlE9dduuQ',
        callbackURL: 'http://localhost:3000/users/google/callback'
    }, function (token, refreshToken, profile, done) {
        User.findOne({
            'google.id': profile.id
        }).exec().then(function (user) {
            //done(錯誤物件, 資料物件, 錯誤訊息)
            //有錯誤時，就不管資料的部分
            //有資料時，就不管錯誤訊息

            if (!user) {
                var newUser = new User();
                newUser.google.id = profile.id;
                newUser.google.token = token;
                newUser.google.name = profile.displayName;
                newUser.google.email = profile.emails[0].value;

                newUser.save().then(function (data) {
                    return done(null, data);
                }, done);
            } else {
                return done(null, user);
            }
        }, done)
    }));

    passport.use('login', new CustomStragety(function (req, done) {
        var data = req.body;

        User.findOne({
            account: data.account
        }).exec().then(function (user) {
            if (!user) {
                //req.flash('error', '帳號不存在');
                //return res.redirect('/users/login');
                return done(null, false, '帳號不存在');
            }

            if (user.password !== data.password) {
                //req.flash('error', '密碼錯誤');
                //return res.redirect('/users/login');
                return done(null, false, '密碼錯誤');
            }

            done(null, user);
        }, done);
    }));

    passport.use('token', new CustomStragety(function (req, done) {
        var token = req.cookies.token;

        User.findOne({
            token: token
        }).exec().then(function (user) {
            done(null, user);
        }, done);
    }));

    //2. passport.initialize()
    app.use(passport.initialize());

    //3. passport.sesssion();
    app.use(passport.session());
};