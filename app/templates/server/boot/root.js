'use strict';

var path = require('path');
var util = require('util');
var ua = require('ua-parser');

module.exports = function(server) {
    var router = server.loopback.Router();
    var isLocal = server.get('isLocal');

    //possibly redirect if IE 9 - also get the path
    server.use(function detection(req, res, next) {
        res.locals._urlParts = null;
        res.locals._urlParts = req.path.match(/^\/(DEFAULT-ROUTE|SOME-ROUTE|ANOTHER-ROUTE)/); //these are the angular routes you want to maintain when adding them in angular
        res.locals._ua = ua.parse(req.headers['user-agent']);
        res.locals._ie9 = false;

        if(res.locals._ua.ua.family === 'IE' && res.locals._ua.ua.major === 9) {
            res.locals._ie9 = true;
        }
        next();
    });

    //if you want angular’s default route to not be '/', but something like '/DEFAULT-ROUTE', then use this function. Equivalent to the otherwise() of $routeProvider
    //server.use(function rootRedirect(req, res, next) {
    //    if(req.path === '/' && !res.locals['_ie9']) { //if going to '/', redirect to '/DEFAULT-ROUTE'
    //        res.redirect(302, util.format('%s://%s/DEFAULT-ROUTE', req.protocol, req.get('Host')));
    //    }
    //    else {
    //        next();
    //    }
    //});

    //if going to something like '/SOME-ROUTE' and that’s an angular route being handled by a certain HTML file, serve that HTML page (which has the angular app that knows what to do with that route)
    server.use(function rewritten(req, res, next) {
        if(res.locals._urlParts !== null) {
            //if it looks like an absolute path for the angular app
            if(res.locals._ie9) {
                //if IE 9, redirect to the # version of this URL
                res.redirect(302, util.format('%s://%s/#/%s', req.protocol, req.get('Host'), res.locals._urlParts[1]));
            } else if(isLocal) {
                //if local, this serves from .tmp
                res.sendfile(path.resolve(__dirname + '../.tmp/index.html'));
            } else {
                //if hosted on dev or production, this is a static file
                res.sendfile(path.resolve(__dirname + '/public/index.html'));
            }
        }
        else {
            next();
        }
    });

    //cache policy - comes after redirects - okay to modify headers at this point
    server.use(function cacheHeaders(req, res, next) {
        if(/\.html$/.test(req.url)) {
            res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.header('Pragma', 'no-cache');
            res.header('Expires', 0);
        } else if(/\.(js|css|png|jpe?g|gif|ico|eot|svg|ttf|woff)$/.test(req.url)) {
            res.header('Cache-Control', 'public');
            res.header('Expires', 60*60*24*3);
        }
        next();
    });

    server.use(router);
};
