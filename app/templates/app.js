'use strict';

var myPort = 3000;
var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    nopt = require('nopt'),
    _ = require('underscore'),
    ua = require('ua-parser'),
    loopback = require('loopback'),
    nodemailer = require('nodemailer');

var app = module.exports = loopback();

var baseURL;

//FIXME
var options = nopt({
    hostname: String,
    port: Number,
    baseurl: String
},{
    port: ['--port'],
    hostname: ['--hostname'],
    baseurl: ['--baseurl']
}, process.argv, 2);

var port = process.env.PORT || options.port || myPort,
    hostname = options.hostname || null,
    baseUrl = options.baseurl || '/',
    appPath = path.resolve(__dirname + '/public');

var interfaces = 'localhost';
var localDevelopment = false;
var robotsView = '';
var jadeEnvironment; // local || dev || www - this string available to jade templates on the server side

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


var sendEmail = function(err) {
    mailOptions.subject = err.split('\n')[0]; //first line of error
    mailOptions.text = err;
    mailOptions.html = err.replace(/\n/g, '<br>').replace(/  /g, '&nbsp;&nbsp;');

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

//find package.json
var packageJson = __dirname + '/package.json'; //on the remote server it’s in the same dir as this file
if(!fs.existsSync(packageJson)) { //when developing locally package.json is in the directory above
    packageJson = './package.json';
    localDevelopment = true;
}

//read package.json for configuration parameters
var wwwConfigPort = JSON.parse(fs.readFileSync(packageJson)).ports.www;

//if current port === www's port then env is production
if(port === +wwwConfigPort) {
    app.set('env', 'production');
    robotsView = 'robots-allow.txt';
    jadeEnvironment = 'www';
}
else { //else env is development
    app.set('env', 'development');
    robotsView = 'robots-disallow.txt';
    jadeEnvironment = 'dev';
}

//if local development, then 0.0.0.0 so I can share between other virtual machines and emulators for testing
if(localDevelopment) {
    interfaces = '0.0.0.0';
    jadeEnvironment = 'local';
}

/*
 * Configure LoopBack models and datasources
 *
 * Read more at http://apidocs.strongloop.com/loopback#appbootoptions
 */
app.boot(__dirname + '/');

//server side jade (for error pages now)
app.set('views', __dirname + '/views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

app.use(loopback.logger('dev')); //as long as proxied through apache, apache handles the log files for analytics, so we can use express's dev logging for debugging
app.use(loopback.compress()); //gzip, equivalent to apache's mod_deflate
app.use(loopback.cookieParser('cookies-rock'));
app.use(loopback.token({model: app.models.accessToken}));
app.use(loopback.bodyParser());
app.use(loopback.methodOverride());

// LoopBack REST interface
app.use(baseUrl + 'api', loopback.rest());

//remove this header that I don’t like
app.use(function removePoweredBy(req, res, next) {
    res.removeHeader('X-Powered-By');
    next();
});

//---- all redirects come before other stuff that adds headers ----

//possibly redirect if IE 9 - also get the path
app.use(function detection(req, res, next) {
    res.locals['_urlParts'] = null;
    res.locals['_urlParts'] = req.path.match(/^\/(DEFAULT-ROUTE|SOME-ROUTE|ANOTHER-ROUTE)/); //these are the angular routes you want to maintain when adding them in angular
    res.locals['_ua'] = ua.parse(req.headers['user-agent']);
    res.locals['_ie9'] = false;

    if(res.locals['_ua'].ua.family === 'IE' && res.locals['_ua'].ua.major == 9) {
        res.locals['_ie9'] = true;
    }
    next();
});

//if you want angular’s default route to not be '/', but something like '/DEFAULT-ROUTE', then use this function. Equivalent to the otherwise() of $routeProvider
//app.use(function rootRedirect(req, res, next) {
//    if(req.path === '/' && !res.locals['_ie9']) { //if going to '/', redirect to '/DEFAULT-ROUTE'
//        res.redirect(302, sprintf('%s://%s/DEFAULT-ROUTE', req.protocol, req.get('Host')));
//    }
//    else {
//        next();
//    }
//});

//if going to something like '/SOME-ROUTE' and that’s an angular route being handled by a certain HTML file, serve that HTML page (which has the angular app that knows what to do with that route)
app.use(function rewritten(req, res, next) {

    //if it looks like an absolute path for the angular app
    if(!_.isNull(res.locals['_urlParts'])) {

        //if IE 9, redirect to the # version of this URL
        if(res.locals['_ie9']) {
            res.redirect(302, sprintf('%s://%s/#/%s', req.protocol, req.get('Host'), res.locals['_urlParts'][1]));
        }
        else if(localDevelopment) { //if local, this serves from .tmp
            res.sendfile(path.resolve(__dirname + '/../.tmp/index.html'));
        }
        else { //if hosted on dev or production, this is a static file
            res.sendfile(path.resolve(__dirname + '/public/index.html'));
        }
    }
    else {
        next();
    }
});



//cache policy - comes after redirects - okay to modify headers at this point
app.use(function cacheHeaders(req, res, next) {
    if(/\.html$/.test(req.url)) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
    }
    else if(/\.(js|css|png|jpe?g|gif|ico|eot|svg|ttf|woff)$/.test(req.url)) {
        res.header('Cache-Control', 'public');
        res.header('Expires', 60*60*24*3);
    }
    next();
});

//robots.txt
app.get('/robots.txt', function(req, res) {
    //automatically does text/plain content-type
    res.sendfile(__dirname + '/views/' + robotsView);
});


app.use(app.router);

//only /.tmp directory on local development
if(localDevelopment) {
    // Look in .tmp before appPath
    app.use(baseUrl, loopback.static(__dirname + '/../.tmp'));
    // Loopback Explorer
    var explorer = require('loopback-explorer')(app);
    app.use(baseUrl + 'explorer', explorer);
    app.once('started', function(url) {
        console.log('Browse your REST API at %s%s', url, explorer.route);
    });
}

app.use(baseUrl, loopback.static(appPath));

// Enable access control and token based authentication.
// not really sure though what swaggerRemote is...
var swaggerRemote = app.remotes().exports.swagger;
if (swaggerRemote) {
    swaggerRemote.requireToken = false;
}
app.enableAuth();

//404 app.use comes last as it’s the catch all
app.use(function fourOhFour(req, res) {
    res.status(404);
    res.render('error404', {title: 'Not Found'});
});

//error logger
app.use(function logErrors(err, req, res, next) {
    console.log(err.stack);
    next(err);
});

//error in ajax
app.use(function clientErrorHandler(err, req, res, next) {
    if(req.xhr || req.accepts('application/json')) {
        res.send(500, { error: 'Something blew up!' });
    }
    else {
        next(err);
    }
});

//email me on other errors
app.use(function emailError(err, req, res, next) {
    if(jadeEnvironment === 'www') {
        sendEmail(err.stack);
    }

    next(err);
});

app.use(function displayError(err, req, res, next) {
    res.status(500);
    res.render('error500', {title:'500: Internal Server Error', error: err});
});

/*
 * 7. Optionally start the server
 *
 * (only if this module is the main module)
 */

app.start = function() {
    //var socketio = require('socket.io').listen(server);
    // web sockets connection
    //socketio.sockets.on('connection', function (socket) {
    //});

    //listen on localhost only as apache will proxy when hosted or in local development mode which is localhost anyway!
    return app.listen(port, interfaces, function () {
        console.log('Express server started.');
        console.log('Port: ' + port);
        console.log('Env: ' + app.get('env'));
    });
};

if(require.main === module) {
    app.start();
}
