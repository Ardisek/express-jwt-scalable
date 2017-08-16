let config = require('config');
var mongoose = require('mongoose');
var _ = require('lodash');
var dbConfig = config.get('dbConfig');

var connection;

var GetConnection = function() {
    if (_.isEmpty(connection)) {
    	mongoose.Promise = global.Promise;
        connection = mongoose.connect('mongodb://' + dbConfig.DB_HOST + '/' + dbConfig.DB_NAME);
    }
    return mongoose.connection;
};

GetConnection().on('error', console.error.bind(console, 'connection error:'));
GetConnection().once('open', function() {
	console.log('connection opened');
    // connection opened
});
GetConnection(); 