var User = function() {
    var User = require('../models/user').User;
    var constants = require('../libraries/constants');
    var nodeMailer = require('nodemailer');
    var path = require('path');
    var EmailTemplate = require('email-templates').EmailTemplate;
    var templatesDir = path.resolve(__dirname, '../..', 'public/templates/emailTemplates');


    this.config = require('../config/config.js');
    var self = this;

    this.transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        secure: true,
        port: 465,
        auth: {
            user: 'presley.cci@gmail.com',
            pass: 'Slaay1988cc'
        }
    });

    this.loginUser = function(req, res) {

        var username = req.body.username;
        var password = req.body.password;
        var token;
        //passport module

        User.findOne({ "username": username }, function(error, data) {
            if (error) {
                res.status(401).json({ message: constants.invalidUser });
            }
            if (!data) {
                res.status(401).json({ message: constants.invalidUser });
            } else if (password == data.password) { //generating token
                token = data.generateJwt();
                res.status(200).json({ token: token });
            } else { res.status(401).json({ message: constants.incorrectPassword }); }
        });

    };

    this.register = function(req, res) {

        var newUser = new User({
            username: req.body.username,
            password: req.body.password
        });

        User.findOne({ "username": req.body.username }, function(error, data) {
            if (error) {
                res.status(401).json({ message: error });
            }
            if (!data) { //insert new entry in database

                newUser.save(function(error, data) {
                    if (error)
                        console.log(error);
                    else {
                        console.log('Entry saved as: ', data);
                        res.status(200).json({ user: data });
                    }
                });

            } else {
                console.log("username exists");
                res.status(401).json({ message: constants.emailAlreadyTaken });
            }

        });
    };

    this.updateProfile = function(req, res) {

        User.findOne({ "username": req.body.username }, function(error, data) {
            if (error) {
                res.status(401).json({ message: error });
                console.log(error);
            }
            if (!data) {
                res.status(404).json({ message: constants.invalidUser });
                console.log("User not found");
            } else { //update one
                data.firstName = req.body.firstName;
                data.middleName = req.body.middleName;
                data.lastName = req.body.lastName;
                data.dateOfBirth = req.body.birthDate;
                data.dateOfJoining = req.body.joiningDate;
                data.designation = req.body.designation;
                data.team = req.body.team;
                data.skills = req.body.skills;
                data.save(function(error) {
                    if (error)
                        console.log(error);
                    else {
                        console.log("Updated");
                        res.status(200).json({ message: constants.userUpdated });
                    }
                });
            }
        });
    };

    this.profile = function(req, res) {
        if (!req.payload._id) {
            res.status(401).json({
                message: constants.unAuthorizedAccess
            });
        } else {
            //find user and send data
            User.findOne({ "username": req.payload.username }, function(error, data) {
                if (error)
                    console.log(error);
                else if (data)
                    res.status(200).json({ user: data });
                else
                    res.status(404).json({ message: constants.userNotFound });
            });
        }
    };

    this.forgotPassword = function(req, res) {
        User.findOne({ "username": req.body.username }, function(error, userInfo) {
            if (error) {
                console.log(error);
            }
            if (!userInfo) {
                return res.status(404).json({ message: constants.emailDoesntExist });
            }
            if (userInfo) {
                var token = userInfo.generateJwt();
                var mailOptions = {
                    username: userInfo.username,
                    name: {
                        first: userInfo.firstName,
                        last: userInfo.lastName
                    },
                    appHost: self.config.appHost,
                    token: token
                };

                var emailTemplate = new EmailTemplate(path.join(templatesDir, 'forgotPassword'));

                emailTemplate.render(mailOptions, function(error, results) {
                    if (error) return res.status(500).json({ message: constants.emailNotSent });
                    self.transporter.sendMail({
                        from: constants.fromEmailID, // sender address
                        to: mailOptions.username, // list of receivers
                        subject: constants.resetPasswordMessage,
                        html: results.html
                    }, function(error, responseStatus) {
                        if (error) res.status(500).json({ message: constants.emailNotSent });
                        res.status(200).json({ message: constants.emailSent });
                    })
                });
            }
        })
    };



    this.getUserByEmail = function(req, res) {
        User.findOne({ "username": req.params.email }, function(error, data) {
            if (error)
                console.log(error);
            else if (data)
                res.status(200).json({ user: data });
            else
                res.status(404).json({ message: constants.userNotFound });
        });
    };

    this.hello = function(req, res) {
        console.log("Hello from userController");
        res.send("UserController");
    };

    this.echo = function(req, res) {
        console.log("Hello from userController (echo)");
        res.status(200).json({ echo: "Hello" });
    };

}
module.exports.User = User;
