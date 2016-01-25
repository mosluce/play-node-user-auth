module.exports = function (req, res, next) {
    console.log(req.session.isAuthenticated);

    if (req.session.isAuthenticated) return next();

    res.redirect('/users/login');
};