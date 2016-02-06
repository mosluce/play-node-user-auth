var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var pipe = require('./pipe');

router.use('/users', require('./users'));
router.use('/roles', require('./roles'));

/* GET home page. */
router.get('/', pipe.cookieConverter, pipe.basic, function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;
