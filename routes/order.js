'use strict'

let express = require('express');
let router = express.Router();
let Order = require('../models/order');
let Statistic = require('../models/statistic');
let StatisticQueue = require('../models/statistic_queue');

let moment = require('moment');
let _ = require('lodash');
let async = require('async');

/* Function for changing flag for calculating example statistic */
let putStatisticInQueue = function(user) {
    Statistic.find().exec(function(err, statistics) {
        _.each(statistics, function(item) {
            let stat = new StatisticQueue({
                statistic: item._id,
                calculated: false
            });

            stat.save(function(err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    });
};

/* Creating new order */
router.post('/order', function(req, res, next) {
    let order = new Order(req.body);

    order.save(function(err) {
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

/* Function for generating example orders for calculating statistics */
/* function need POST body with foreignUserId */
/* 
    {
        "creator": {
            "_id": "1"
        }
    }
*/

router.post('/order-generate', function(req, res, next) {

    let products = [{
        _id: 1,
        name: "Product 1",
        priceNetto: 50,
        priceBrutto: 61,
        groupId: 1,
        groupName: "Product Group 1"
    }, {
        _id: 2,
        name: "Product 2",
        priceNetto: 30,
        priceBrutto: 36,
        groupId: 1,
        groupName: "Product Group 1"
    }, {
        _id: 3,
        name: "Product 3",
        priceNetto: 120,
        priceBrutto: 161,
        groupId: 2,
        groupName: "Product Group 2"
    }, {
        _id: 4,
        name: "Product 4",
        priceNetto: 150,
        priceBrutto: 170,
        groupId: 3,
        groupName: "Product Group 3"
    }];

    let recipients = [{
        _id: 1,
        name: "Customer 1",
        groupId: 1,
        groupName: "Customer Group 1"
    }, {
        _id: 2,
        name: "Customer 2",
        groupId: 2,
        groupName: "Customer Group 2"
    }, {
        _id: 3,
        name: "Customer 3",
        groupId: 1,
        groupName: "Customer Group 1"
    }, {
        _id: 4,
        name: "Customer 4",
        groupId: 3,
        groupName: "Customer Group 3"
    }];

    let arr = [];
    for (let i = 0; i < 100; i++) {
        arr.push(i);
    }

    async.eachSeries(arr, function iterator(item, callback) {
        let date = moment("2016-01-01").add(randomInt(1, 30), 'day').format("YYYY-MM-DD");

        let sumNetto = 0;
        let sumBrutto = 0;
        _.each(products, function(product) {
            product.quantity = randomInt(1, 15);
            sumNetto += (product.quantity * product.priceNetto);
            sumBrutto += (product.quantity * product.priceBrutto);
        });

        var order = new Order({
            creator: req.body.creator,
            recipient: recipients[randomInt(0, 4)],
            date: date,
            products: products
        });

        order.priceNetto = sumNetto;
        order.priceBrutto = sumBrutto;

        order.save(function(err) {
            if (err) {
                callback(err);
            }
            callback();
        });
    }, function(err) {
        if (err) {
            res.status(422).json({
                success: false,
                message: err.toString()
            });
        }

        putStatisticInQueue();
        res.json({
            success: true
        });
    });
});

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

module.exports = router;