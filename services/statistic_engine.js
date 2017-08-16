'use strict'
let child_process = require('child_process');
let StatisticQueue = require('../models/statistic_queue');
let _ = require('lodash');

class StatisticEngine {
    calculateStatistics() {
        setInterval(function() {
            StatisticQueue.find({
                calculated: false
            }).exec(function(err, statistics) {
                if (err) {
                    console.log(err);
                }
                _.each(statistics, function(stat) {
                    let worker_process = child_process.fork('services/statistic_worker.js', [stat._id]);

                    worker_process.on('close', function(code) {
                        console.log('child process - statistic worker - exited with code ' + code);
                    });
                });
            });
        }, 5000);
    }
}

module.exports = StatisticEngine;