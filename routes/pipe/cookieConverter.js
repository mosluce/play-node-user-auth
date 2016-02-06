module.exports = function(req, res, next) {
    //從cookie抓取token值
    var token = req.cookies.token;

    if(token == null) return next();

    //用token在資料表中找出符合的user
    User.findOne({
        token: token
    }).exec().then(function(user) {
        //沒找到就不進行建立和寫入session的操作
        if(user == null) return next();

        //寫入session讓後續的middleware 可以使用
        req.session.isAuthenticated = true;
        req.session.user = user;

        next();
    });
};