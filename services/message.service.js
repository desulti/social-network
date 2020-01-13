var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('messages');

var service = {};

service.getById = getById;
service.getAllByConversationId = getAllByConversationId;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function getById(_id) {
    var deferred = Q.defer();

    db.messages.findById(_id, function (err, message) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (message) {
            // return message
            deferred.resolve(message);
        } else {
            // message not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAllByConversationId(conversationId) {
	var deferred = Q.defer();
	
	db.messages.find({ conversationId: conversationId}).sort({time: -1}).toArray(function (err, result) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		
		if (result) {
			// return messages
			deferred.resolve(result);
		} else {
			deferred.resolve()
		}
	});
	
	return deferred.promise;
}

function create(messageParam) {
    var deferred = Q.defer();
	var message = messageParam;

    // insert message object
    db.messages.insert(
        message,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function update(_id, messageParam) {
    var deferred = Q.defer();
	var set = {
		
	};

    // update message object
    db.messages.update(
        { _id: mongo.helper.toObjectID(_id) },
		{ $set: set },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.messages.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}