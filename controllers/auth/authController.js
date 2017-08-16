let jwt = require('jsonwebtoken');
let config = require('config');

let User = require('../../models/user');

var superSecret = config.get('superSecret');

/*
    Sample auth response on test user

    {
        "success": true,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5OTRhZDY0NTJlMDAxMTdkNGZmY2I3NiIsImVtYWlsIjoidGVzdEB0ZXN0LnBsIiwiaWF0IjoxNTAyOTE1OTc3LCJleHAiOjE1MDI5MTk1Nzd9.WfxzHPRch-P9Mr_P6a3IRw3WtzTtFvPS_m8pSe6FIq0",
        "user": {
            "_id": "5994ad6452e00117d4ffcb76",
            "email": "test@test.pl",
            "password": "$2a$10$VCzqNlRQKuV6cmIudSV1w.b4AnoK/B4mm/mK46NzxIvZa5ILC1DAu",
            "name": "Test User",
            "foreignId": 1,
            "__v": 0
        }
    }
*/

function authenticate(req, res, next) {

    let email = req.body.email;
    let password = req.body.password;

    User.findOne({
        email
    }).exec((err, user) => {
        if (err) {
            return res.status(422).json({
                success: false,
                message: err.toString()
            });
        }

        if (!user) {
            return res.json({
                success: false,
                message: err
            });
        }

        // check if password matches
        user.comparePassword(password, function(err, isMatch) {

            if (err) {
                return res.status(422).json({
                    success: false,
                    message: 'Authentication failed.' + err.toString()
                });
            };

            if (isMatch) {
                var token = jwt.sign({
                    id: user._id,
                    email: user.email
                }, superSecret, {
                    expiresIn: 3600 // expires in 1 hour
                });

                return res.json({
                    success: true,
                    token,
                    user
                });

            } else {
                return res.json({
                    success: false,
                    message: 'Authentication failed.'
                });
            }
        });
    });
}

module.exports = {
    authenticate
};
