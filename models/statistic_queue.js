'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// create a schema
class StatisticQueueSchema {
    constructor() {
        let model = mongoose.model('StatisticQueue', new Schema({
            statistic: {
                type: Schema.Types.ObjectId,
                ref: 'Statistic'
            },
            calculated: {
                type: Boolean,
                required: true
            }
        }));

        return model;
    }
};

module.exports = new StatisticQueueSchema();