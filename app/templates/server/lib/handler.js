'use strict';
var sendEmail = require('./mail');

// 404 app.use comes last as it’s the catch all
exports.fourOhFour = function fourOhFour () {
    return function fourOhFour (req, res) {
        res.status(404);
        res.render('error404', {title: 'Not Found'});
    };
};

// error logger
exports.logErrors = function logErrors () {
    return function logErrors (err, req, res, next) {
        console.log(err.stack);
        next(err);
    };
};

//error in ajax
exports.clientErrorHandler = function clientErrorHandler () {
    return function clientErrorHandler (err, req, res, next) {
        if(req.xhr || req.accepts('application/json')) {
            res.send(500, {
                xhr: req.xhr,
                accepts: req.accepts('application/json'),
                error: 'Something blew up!'
            });
        } else {
            next(err);
        }
    };
};

//email me on other errors
exports.emailError = function emailError () {
    return function emailError (err, req, res, next) {
        console.log('send email');
        sendEmail(err.stack, err.split('\n')[0]);
        next(err);
    };
};

exports.displayError = function displayError () {
    return function displayError (err, req, res) {
        res.status(500);
        res.render('error500', {
            title:'500: Internal Server Error',
            error: err
        });
    };
};
