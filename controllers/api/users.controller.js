var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var conversationService = require('services/conversation.service');
var messageService = require('services/message.service');

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.get('/conversationId', getConversationId);
router.post('/createConversation', createConversation);
router.post('/createMessage', createMessage);
router.post('/:_id', updateUser);
router.delete('/:_id', deleteUser);
router.get('/:_id', getOtherUser);
router.get('/search/:key/:value', searchSingleField);
router.get('/conversation/:_id', getConversation);
router.post('/conversation/:_id', updateConversation);
router.delete('/conversation/:_id', deleteConvarsation);
router.get('/message/:_id', getMessage);
router.get('/conversationMessages/:_id', getConversationMessages);
router.post('/message/:_id', updateMessage);
router.delete('message/:_id', deleteMessage);

module.exports = router;

function authenticateUser(req, res) {
    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token });
            } else {
                // authentication failed
                res.status(401).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        // return res.status(401).send('You can only update your own account');
		userId = req.params._id;
    }
	// avatar processing part
	var user = JSON.parse(req.body.user);
	
	if (req.files){
		var file = req.files.avatar;
		var name = file.name;
		var hauTo = file.name.length - 1;
		for (index = name.length - 1; index > 0; index--){
			if (name[index] == '.'){
				break;
			}
		}
		hauTo = name.substring(index, name.length);
		var avatar = Date.now() + hauTo;
		file.mv("./public/photo/" + avatar, function (err){
			if (err) {
				console.log(err)
			}
			else {}
		});
		user.avatar = avatar;
	}
	else {}

    userService.update(userId, user)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getOtherUser(req, res) {
    userService.getById(req.params._id)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function searchSingleField(req, res) {
	if (req.params.key == 'name') {
		var query = { name: req.params.value };
	} else if (req.params.key == 'username') {
		var query = { username: req.params.value };
	} else if (req.params.key == 'phoneNumber') {
		var query = { phoneNumber: req.params.value };
	} else if (req.params.key == 'email') {
		var query = { email: req.params.value };
	} else {
		console.log(req.params);
		return res.status(401).send('Wrong field');
	}
	
	userService.searchByQuery(query)
		.then(function (result) {
			if (result) {
				res.send(result);
			} else {
				res.sendStatus(404);
			}
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function getConversation(req, res) {
	conversationService.getById(req.params._id)
		.then(function (conversation) {
			if (conversation) {
				res.send(conversation);
			} else {
				res.sendStatus(404);
			}
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function getConversationId(req, res) {
	conversationService.getId()
		.then(function (id) {
			res.send(id);
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function createConversation(req, res) {
	conversationService.create(req.body)
		.then(function () {
			res.sendStatus(200);
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function updateConversation(req, res) {
	var conversation = JSON.parse(req.body.conversation);
	
	conversationService.update(req.params._id, conversation)
		.then(function () {
			res.sendStatus(200);
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function deleteConvarsation(req, res) {
	conversationService.delete(req.params._id)
		.then(function () {
			res.sendStatus(200);
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function getMessage(req, res) {
	messageService.getById(req.params._id)
		.then(function (message) {
			if (message) {
				res.send(message);
			} else {
				res.sendStatus(404);
			}
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function getConversationMessages(req, res) {
	messageService.getAllByConversationId(req.params._id)
		.then(function (result) {
			if (result) {
				res.send(result);
			} else {
				res.sendStatus(404);
			}
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function createMessage(req, res) {
	var message = JSON.parse(req.body.message);
	
	messageService.create(message)
		.then(function () {
			res.sendStatus(200);
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function updateMessage(req, res) {
	var message = JSON.parse(req.body.message);
	
	messageService.update(req.params._id, message)
		.then(function () {
			res.sendStatus(200);
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}

function deleteMessage(req, res) {
	messageService.delete(req.params._id)
		.then(function () {
			res.sendStatus(200);
		})
		.catch(function (err) {
			res.status(400).send(err);
		});
}