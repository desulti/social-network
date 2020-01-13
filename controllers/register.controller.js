var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
    res.render('register');
});

router.post('/', function (req, res) {
    var user = req.body;
	var avatar = 'no_avatar.png';
	
	// avatar processing part
	if (req.files){
		var file = req.files.avatar;
        var name = file.name;
        var hauTo = file.name.length - 1;
        for(index = name.length - 1; index > 0; index --){
            if(name[index] == '.'){
                break;
            }
        }
        hauTo = name.substring(index, name.length);
        avatar = Date.now() + hauTo;
        file.mv("./public/photo/" + avatar, function(err){
            if(err){
                console.log(err)
            }else{
            }
        });
	}
	else {}
    user.avatar = avatar;
	
    // register using api to maintain clean separation between layers
    request.post({
		url: config.apiUrl + '/users/register',
		form: user,
		json: true
	}, function (error, response, body) {
        if (error) {
            return res.render('register', { error: 'An error occurred' });
        }

        if (response.statusCode !== 200) {
            return res.render('register', {
                error: response.body,
                name: req.body.name,
                username: req.body.username,
                age: req.body.age,
                address: req.body.address,
                phoneNumber: req.body.phoneNumber,
                email: req.body.email,
            });
        }

        // return to login page with success message
        req.session.success = 'Registration successful';
        return res.redirect('/login');
    });
});

module.exports = router;