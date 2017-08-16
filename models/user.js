'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt');
let Statistic = require('../models/statistic');
let _ = require('lodash');


/*  Sample JSON for creating new test user
    {
        "email": "test@test.pl",
        "password": "ourTestPassword",
        "name": "Test User",
        "foreignId": 1
    }
*/

// create a schema
let UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    foreignId: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: Boolean
});

// hash password before save user
UserSchema.pre('save', function(next) {
    var user = this;

    // check if password is modified
    if (!user.isModified('password')) return next();

    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

let User = mongoose.model('User', UserSchema);

module.exports = User;