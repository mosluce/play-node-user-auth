var express = require('express');
var router = express.Router();
var pipe = require('./pipe');

router.get('/', pipe.basic, function(req, res) {

});

module.exports = router;