'use strict';

// sample express server configuration
var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    app = express(),
    server = http.createServer(app),
    socketio = require('socket.io').listen(server),
    nopt = require('nopt');

var options = nopt({
    hostname: String,
    port: Number,
    baseurl: String
},{
    port: ['--port'],
    hostname: ['--hostname'],
    baseurl: ['--baseurl']
}, process.argv, 2);

var port = options.port || 3000,
    hostname = options.hostname || 'localhost',
    baseURL = options.baseurl || '/',
    appPath = path.resolve(__dirname + '/public');

app.set('port', port);
app.use(express.favicon());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.errorHandler());
app.use(express.logger('dev'));

app.use(function renderCompiledJade (req, res, next) {
    if (req.url.split('.').length === 1) {
        var name = req.url,
            view = appPath + name.replace(baseURL, '/');

        if (fs.existsSync(view + '.jade') || fs.existsSync(view + '.html')) {
            // for local grunt express server we server temp and public as static
            // it will attempt to find view + '.html' in both of these directories
            //
            // for production it will look only in public
            req.url += '.html';
        }
    }
    next();
});

app.use(baseURL, express.static(path.resolve(__dirname + '/../.tmp')));
app.use(baseURL, express.static(appPath));

socketio.sockets.on('connection', function (socket) {
    console.log('yo mama');
});

server.listen(port, hostname, function () {
    console.log('Express server started on port ' + port);
});
