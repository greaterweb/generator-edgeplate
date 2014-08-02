'use strict';

var nodemailer = require('nodemailer');

//CHANGEME
var mailOptions = {
    from: 'error.generation.bot@example.com',
    to: 'error.report@example.com'
};

//CHANGEME
var smtpTransport = nodemailer.createTransport('SMTP', {
    host: 'mail.example.com',
    port: 587,
    auth: {
        user: 'error.generation.bot@example.com',
        pass: 'smtp-password'
    }
});

module.exports = function sendEmail (message, subject) {
    mailOptions.subject = subject;
    mailOptions.text = message;
    mailOptions.html = message.replace(/\n/g, '<br>').replace(/  /g, '&nbsp;&nbsp;');

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error) {
            console.log(error);
        }
        else{
            console.log('Email sent: ' + response.message);
        }
        smtpTransport.close(); // shut down the connection pool, no more messages
    });
};
