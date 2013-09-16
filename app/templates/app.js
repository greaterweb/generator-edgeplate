'use strict';

var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    nopt = require('nopt'),
    express = require('express'),
    ExpressHelpers = require('edgeplate-express-helpers');

var app = express(),
    server = http.createServer(app);

var expressHelper, socketio, baseURL;

var options = nopt({
    hostname: String,
    port: Number,
    baseurl: String
},{
    port: ['--port'],
    hostname: ['--hostname'],
    baseurl: ['--baseurl']
}, process.argv, 2);

var port = process.env.PORT || options.port || 3000,
    hostname = options.hostname || null,
    baseURL = options.baseurl || '/',
    appPath = path.resolve(__dirname + '/public');


socketio = require('socket.io').listen(server);
exports.expressHelper = expressHelper = new ExpressHelpers({ app: app, server: server, socketio: socketio });

// TODO: need to find a better way to do this...
expressHelper.registerConfig([baseURL, express.static(__dirname + '/../.tmp')], 30);

// development only
app.configure('development', function () {
    app.set('port', port);
    app.use(express.logger('dev'));
});

// production only
app.configure('production', function () {
    app.set('port', 80);
    app.use(express.compress());
});

expressHelper.registerConfig(express.favicon());
expressHelper.registerConfig(express.bodyParser());
expressHelper.registerConfig(express.methodOverride());
expressHelper.registerConfig(express.cookieParser('wk-cook-ftw'));
expressHelper.registerConfig(express.session());
expressHelper.registerConfig(app.router, 20);

// web sockets connection
socketio.sockets.on('connection', function (socket) {

});

expressHelper.registerConfig([baseURL, express.static(appPath)], 30);
expressHelper.registerConfig([baseURL, express.directory(appPath)], 30);

expressHelper.registerRoutesByFile(__dirname + '/routes.js', baseURL);

expressHelper.applyConfig();
expressHelper.applyRoutes();

// server.listen(port, hostname, function () {
// TODO: sort out how to make the hostname work both locally and with UI Express Server
if (hostname) {
    server.listen(port, hostname, function () {
        console.log('Express server started on port ' + port);
    });
} else {
    server.listen(port, function () {
        console.log('Express server started on port ' + port);
    });
}
