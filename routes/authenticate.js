'use strict'
let config = require('config');

let express = require('express');
let router = express.Router();
let jwt = require('jsonwebtoken');

//controllers
let authController = require('../controllers/auth/authController');

const superSecret = config.get('superSecret');

/* POST authenticate. */
router.post('/authenticate', authController.authenticate);

router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, superSecret, function(err, user) {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.user = user;
                return next();
            }
        });

    } else {
        // only for testing purposes to create new user for authentication
        if (req.originalUrl.includes('user')) {
            return next();
        }

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

module.exports = router;
