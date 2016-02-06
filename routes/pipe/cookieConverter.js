var passport = require('passport');

module.exports = function (req, res, next) {
    //從cookie抓取token值
    var token = req.cookies.token;

    if (token == null) return next();

    //用token在資料表中找出符合的user
    passport.authenticate('token', function (err, user) {
        if (err) return next(err);

        if (user) {
            req.logIn(user, function (err) {
                if (err) return next(err);
                next();
            });
        } else {
            next();
        }
    })(req, res, next);
};