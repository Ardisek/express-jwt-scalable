'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
class StatisticSchema {
    constructor() {
        let model = mongoose.model('Statistic', new Schema({
            name: {
                type: String
            },
            type: {
                type: Number,
                required: true
            },
            dateFrom: {
                type: Date,
                required: true
            },
            dateTo: {
                type: Date,
                required: true
            },
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            values: {
                type: Schema.Types.Mixed
            }
        }));

        return model;
    }
};

module.exports = new StatisticSchema();