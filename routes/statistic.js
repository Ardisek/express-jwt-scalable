'use strict'
let express = require('express');
let router = express.Router();

let StatisticQueue = require('../models/statistic_queue');

router.post('/statistic-queue', function(req, res, next) {
    let stat = new StatisticQueue(req.body);

    stat.save(function(err) {
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