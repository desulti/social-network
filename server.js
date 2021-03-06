﻿require('rootpath')();
var express = require('express');
var app = express();
var upload = require("express-fileupload");
var session = require('express-session');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var socket = require('socket.io');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: config.secret, resave: false, saveUninitialized: true }));
app.use(upload());
app.use(express.static(__dirname + '/public'));

// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({ path: ['/api/users/authenticate', '/api/users/register'] }));

// routes
app.use('/login', require('./controllers/login.controller'));
app.use('/register', require('./controllers/register.controller'));
app.use('/app', require('./controllers/app.controller'));
app.use('/api/users', require('./controllers/api/users.controller'));

// make '/app' default route
app.get('/', function (req, res) {
    return res.redirect('/app');
});

// start server
var server = app.listen((process.env.PORT || 3000), function () {
    console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

// start socket io
var io = socket.listen(server);
io.sockets.on('connection', function(socket) {
	// 'join event'
	socket.on('join', function(data) {
		socket.join(data.room);
		console.log('Room joined');
	});
	// catching the message event
	socket.on('message', function(message) {
		// emitting the 'new message' event to the clients in that room with id
		io.in(message.conversationId).emit('new message', message);
	});
	// Event when a client is typing
	socket.on('typing', function(data) {
		// Broadcasting to all the users except the one typing
		socket.broadcast.in(data.room).emit('typing', {data: data, isTyping: true});
	});
});