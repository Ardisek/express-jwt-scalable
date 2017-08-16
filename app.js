'use strict'
global.Promise = require('bluebird');

const routes = {
    authenticate: require('./routes/authenticate'),
    order: require('./routes/order'),
    statistic: require('./routes/statistic'),
    user: require('./routes/user')
};

let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
var helmet = require('helmet');
let jwt = require('jsonwebtoken');
let _ = require('lodash');
let cluster = require('cluster');
var Promise = require("bluebird");

let app = express();

if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length > 4 ? 4 : require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    require('./database/connection');

    console.log('Starting a new NodeJS worker server ' + cluster.worker.id);
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');

    app.use(helmet())
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

    // enable cross domain request
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, x-access-token');

        if ('OPTIONS' == req.method) {
            res.send(200);
        } else {
            next();
        }
    });

    var server = app.listen(3000, function() {
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    });

    _.each(routes, function(item) {
        app.use('/', item);
    });

    initilizeErrorHandling(app);
}

function initilizeErrorHandling(app) {
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('error');
    });
}

module.exports = app;
