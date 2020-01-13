var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('conversations');

var service = {};

service.getById = getById;
service.getId = getId;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function getById(_id) {
    var deferred = Q.defer();

    db.conversations.findById(_id, function (err, conversation) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (conversation) {
            // return conversation
            deferred.resolve(conversation);
        } else {
            // conversation not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getId() {
	var deferred = Q.defer();
	var id = mongo.ObjectID().toHexString();
	
	deferred.resolve(id);
	return deferred.promise;
}

function create(conversationParam) {
    var deferred = Q.defer();
	var conversation = conversationParam;

    // insert conversation object
	conversation._id = mongo.helper.toObjectID(conversation._id);
    db.conversations.insert(
        conversation,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function update(_id, conversationParam) {
    var deferred = Q.defer();
	var set = {
		name: conversationParam.name,
		avatar: conversationParam.avatar,
		background: conversationParam.background,
		isUnread: conversationParam.isUnread,
		lastmessage: conversationParam.lastmessage,
		members: conversationParam.members
	};

    // update conversation object
    db.conversations.update(
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

    db.conversations.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}