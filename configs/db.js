/**
 * Created by mosluce on 2016/1/25.
 */
var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

module.exports = function(req, res, next) {
    if(global.dbConnection) return next();

    //return res.send();
    //return res.render();
    //return next();

    var conn = mongoose.connection;

    conn.on('connected', function() {
        var user = require('./models/user');

        //use plugin
        user.plugin(timestamps);

        //register models
        global.User = conn.model('User', user);

        global.dbConnection = conn;

        return next();
    });

    conn.on('error', function(err) {
        return next(err);
    });

    mongoose.connect('mongodb://zero:zero1234@ds047335.mongolab.com:47335/zero-to-blog');
};