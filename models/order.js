'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Statistic = require('../models/statistic');
let StatisticQueue = require('../models/statistic_queue');
let statTypes = require('../models/stat_types');
let User = require('../models/user');
let _ = require('lodash');
let moment = require('moment');
let async = require('async');

// create recipient schema
class RecipientSchema {
    constructor() {
        return new Schema({
            _id: {
                type: Number,
                required: true
            },
            name: String,
            groupId: Number,
            groupName: String
        });
    }
};

// create creator schema
class CreatorSchema {
    constructor() {
        return new Schema({
             _id: {
                type: Number,
                required: true
            },
            name: String
        });
    }
}

// create recipient schema
class ProductSchema {
    constructor() {
        return new Schema({
             _id: {
                type: Number,
                required: true
            },
            name: String,
            priceNetto: Number,
            priceBrutto: Number,
            quantity: Number,
            groupId: Number,
            groupName: String
        });
    }
}

// create recipient schema
class OrderSchema {
    constructor() {
        let th = this;
        let schema = new Schema({
            creator: new CreatorSchema(),
            recipient: new RecipientSchema(),
            date: {
                type: Date,
                required: true
            },
            priceNetto: {
                type: Number,
                required: true
            },
            priceBrutto: {
                type: Number,
                required: true
            },
            products: [new ProductSchema()]
        });

        schema.post('save', function(order, next) {
            let dateFrom = moment(order.date).startOf('month');
            let dateTo = moment(order.date).endOf('month');

            User.findOne({
                foreignId: order.creator._id
            }).exec(function(err, user) {
                async.eachSeries(statTypes, function iterator(item, callback) {
                    Statistic.findOne({
                        type: item.type,
                        dateFrom: dateFrom,
                        dateTo: dateTo,
                        user: user._id
                    }).exec(function(err, statistic) {
                        // no statistic for user
                        if (!statistic) {
                            let stat = new Statistic({
                                type: item.type,
                                dateFrom: dateFrom,
                                dateTo: dateTo,
                                user: user._id
                            });

                            stat.save(function(err) {
                                if (err) {
                                    callback(err);
                                }
                                callback();
                            });
                        } else {
                            callback();
                        }
                    });
                }, function(err) {
                    if (err) {
                        console.log(err);
                        return err;
                    }
                    next();
                });
            });
        });

        return mongoose.model('Order', schema);
    }
}

module.exports = new OrderSchema();