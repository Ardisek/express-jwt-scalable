var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users */
router.get('/user', function(req, res, next) {
    User.find(function(err, users) {
        if (err) {
            console.log(err);
        }
        res.json(users);
    });
});

/* POST user */
router.post('/user', function(req, res, next) {
    var user = new User(req.body);

    user.save(function(err) {
        if (err) {
            res.status(422).json({
                success: false,
                message: err.toString()
            });
        }

        res.json({
            success: true
        });
    });
});


module.exports = router;