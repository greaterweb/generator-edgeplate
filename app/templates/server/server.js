'use strict';

var path = require('path');
var loopback = require('loopback');
var boot = require('loopback-boot');
var nopt = require('nopt');
var edgeHandler = require('./lib/handler');

var options = nopt({
    env: String
}, { }, process.argv, 2);

process.env.NODE_ENV = process.env.NODE_ENV || options.env || 'development';

var app = module.exports = loopback();

// Disable X-Powered-By response header
app.disable('x-powered-by');

// Set up the /favicon.ico
app.use(loopback.favicon());

// request pre-processing middleware
app.use(loopback.compress());


// boot scripts mount components like REST API
boot(app, __dirname);

app.set('appPath', path.resolve(__dirname + '/../app'));
var appPath = app.get('appPath');

// value comes from config.json
var baseUrl = app.get('baseUrl');

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
//   app.use(loopback.static(path.resolve(__dirname', '../client')));

//robots.txt
app.get(baseUrl + 'robots.txt', function(req, res) {
    var robotsView = [
        'robots-',
        (app.get('env') === 'production')?'allow':'disallow',
        '.txt'
    ].join('');
    //automatically does text/plain content-type
    res.sendfile(path.resolve(__dirname + '/../common/views/', robotsView));
});

if (app.get('env') === 'local') {
    // Look in .tmp before appPath
    app.use(baseUrl, loopback.static(path.resolve(__dirname + '/../.tmp')));
    app.use(baseUrl, loopback.static(appPath));
    // for directory browsing
    // npm install --save serve-index
    // app.use(baseUrl, loopback.directory(appPath));

    // Requests that get this far won't be handled
    // by any middleware. Convert them into a 404 error
    // that will be handled later down the chain.
    app.use(loopback.urlNotFound());

    // The ultimate error handler.
    app.use(loopback.errorHandler());
} else {
    app.use(baseUrl, loopback.static(appPath));

    //server side jade (for error pages now)
    app.set('views', path.resolve(__dirname + '/../common/views'));
    app.engine('jade', require('jade').__express);
    app.set('view engine', 'jade');

    // 404 app.use comes last as it’s the catch all
    app.use(edgeHandler.fourOhFour());

    // error logger
    app.use(edgeHandler.logErrors());

    // error in ajax
    app.use(edgeHandler.clientErrorHandler());

    // email me on other errors
    app.use(edgeHandler.emailError());

    app.use(edgeHandler.displayError());
}

app.start = function() {
    // start the web server
    var server = app.listen(function() {
        app.emit('started');
        console.log('Web server listening at: %s', app.get('url'));
    });<% if (edgeplate.features.socketio) { %>
    // basic socket io implementation
    var io = require('socket.io')(server);
    io.on('connection', function (socket) {
        socket.emit('msg', { connected: true });
    });<% } %>
    return server;
};

// start the server if `$ node server.js`
if (require.main === module) {
    app.start();
}
