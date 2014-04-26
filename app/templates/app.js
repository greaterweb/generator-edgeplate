'use strict';

var myPort = 3000;
var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    nopt = require('nopt'),
    express = require('express'),
    nodemailer = require('nodemailer');

var app = express(),
    server = http.createServer(app);

//var socketio;
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
    baseURL = options.baseurl || '/',
    appPath = path.resolve(__dirname + '/public');

var interfaces = 'localhost';
var localDevelopment = false;
var robotsView = '';
var jadeEnvironment; // local || dev || www - this string available to jade templates on the server side
var mailOptions = {
    from: 'error.generation.bot@example.com',
    to: 'error.report@example.com'
};

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

//server side jade (for error pages now)
app.set('views', __dirname + '/views');
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

app.use(express.logger('dev')); //as long as proxied through apache, apache handles the log files for analytics, so we can use express's dev logging for debugging
app.use(express.compress()); //gzip, equivalent to apache's mod_deflate
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('cookies-rock'));
app.use(express.session());

//remove this header that I don’t like
app.use(function removePoweredBy(req, res, next) {
    res.removeHeader("X-Powered-By");
    next();
});

//robots.txt
app.get('/robots.txt', function(req, res) {
    //automatically does text/plain content-type
    res.sendfile(__dirname + '/views/' + robotsView);
});

//cache policy
app.use(function cacheHeaders(req, res, next) {
    if(/\.html$/.test(req.url)) {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
    }
    else if(/\.(js|css|png|jpe?g|gif|ico|eot|svg|ttf|woff)$/.test(req.url)) {
        res.header("Cache-Control", "public");
        res.header("Expires", 60*60*24*3);
    }
    next();
});

app.use(app.router);
app.use(express.static(appPath));

//only /.tmp directory on local development
if(localDevelopment) {
    app.use(express.static(__dirname + '/../.tmp'));
}

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
    if(req.xhr) {
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

//socketio = require('socket.io').listen(server);

// web sockets connection
//socketio.sockets.on('connection', function (socket) {
//});

//listen on localhost only as apache will proxy when hosted or in local development mode which is localhost anyway!
server.listen(port, interfaces, function () {
    console.log('Express server started.');
    console.log('Port: ' + port);
    console.log('Env: ' + app.get('env'));
});
