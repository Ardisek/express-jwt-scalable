'use strict'
let Statistic = require('../models/statistic');
let StatisticQueue = require('../models/statistic_queue');
let Order = require('../models/order');
let connection = require('../database/connection');
let _ = require('lodash');

class StatisticWorker {
    constructor(process) {
        let th = this;
        th.queueId = process.argv[2];
        th.process = process;

        StatisticQueue.findByIdAndUpdate(th.queueId, {
            $set: {
                calculated: true
            }
        }, function(err, statistic) {
            if (err) {
                return th.handleError(err);
            }

            Statistic.findOne({
                _id: statistic.statistic
            }, function(err, stat) {
                if (err) {
                    return th.handleError(err);
                }

                th.statistic = stat;

                User.findOne({
                    _id: stat.user
                }).exec(function(err, user) {
                    if (err) {
                        return th.handleError(err);
                    }
                    th[`calculate_${th.statistic.type}`](user);
                });
            })
        });
    }

    // get values of orders group by date
    calculate_1(user) {
        var th = this;
        Order.aggregate([{
                $match: {
                    "creator._id": user.foreignId,
                    "date": {
                        $gt: this.statistic.dateFrom,
                        $lt: this.statistic.dateTo
                    }
                }
            }, {
                $project: {
                    priceNetto: 1,
                    date: 1
                }
            }, {
                $group: {
                    _id: {
                        year: {
                            $year: "$date"
                        },
                        month: {
                            $month: "$date"
                        },
                        day: {
                            $dayOfMonth: "$date"
                        },
                    },
                    total: {
                        $sum: "$priceNetto"
                    }
                }
            }, {
                $sort: {
                    "_id.day": 1
                }
            }],
            function(err, result) {
                if (err) {
                    return th.handleError(err);
                }

                let finalresults = [];
                _.each(result, function(item) {
                    finalresults.push({
                        date: item._id.year + "-" + item._id.month + "-" + item._id.day,
                        total: item.total
                    });
                });

                th.saveStatisticResults(finalresults);
            });
    }

    // get sum of orders for client groups
    calculate_2(user) {
        var th = this;
        Order.aggregate([{
                $match: {
                    "creator._id": user.foreignId,
                    "date": {
                        $gt: this.statistic.dateFrom,
                        $lt: this.statistic.dateTo
                    }
                }
            }, {
                $project: {
                    "recipient.groupId": 1,
                    "recipient.groupName": 1,
                    "priceBrutto": 1
                }
            }, {
                $group: {
                    _id: "$recipient.groupId",
                    total: {
                        $sum: "$priceBrutto"
                    },
                    name: {
                        $addToSet: "$recipient.groupName"
                    }
                }
            }],
            function(err, result) {
                if (err) {
                    return th.handleError(err);
                }

                let finalresults = [];
                _.each(result, function(item) {
                    finalresults.push({
                        id: item._id,
                        total: item.total,
                        groupName: item.name[0]
                    });
                });

                th.saveStatisticResults(finalresults);
            });
    }

    saveStatisticResults(results) {
        var th = this;
        Statistic.findByIdAndUpdate(this.statistic._id, {
            $set: {
                values: results
            }
        }, function(err, stat) {
            if (err) {
                return th.handleError(err);
            }
            th.handleFinish();
        });
    }

    calculate_3(user) {
        this.handleFinish();
    }

    calculate_4(user) {
        this.handleFinish();
    }
    calculate_5(user) {
        this.handleFinish();
    }
    calculate_6(user) {
        this.handleFinish();
    }

    handleError(err) {
        let th = this;
        StatisticQueue.findByIdAndUpdate(th.queueId, {
            $set: {
                calculated: false
            }
        }, function(err, stat) {
            if (err) {
                console.log(err);
                th.process.exit();
            }
            th.process.exit();
        });
    }

    handleFinish() {
        let th = this;
        StatisticQueue.remove({
            _id: th.queueId
        }, function(err) {
            if (err) {
                return th.handleError();
            }
            th.process.exit();
        });

    }
}

return new StatisticWorker(process);