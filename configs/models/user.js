var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
    account: String,
    password: String,
    token: String,
    google: {
        id: String,
        token: String,
        name: String,
        email: String
    }
});
