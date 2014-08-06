'use strict';

var gulp = require('gulp');

var path = require('path');
var util = require('util');

var Q = require('q');
var openApp = require('open');
var shell = require('shelljs');
var nodemon = require('nodemon');
var strftime = require('strftime');

var $ = require('gulp-load-plugins')();

var gitRevision = shell.exec('git rev-parse --short HEAD', { silent:true }).output;

var environments = ['dev', 'www'<% if (edgeplate.features.cordova) { %>, 'cordova'<% } %>];

var config = {
    pkg: require('./package.json'),
    edgeplate: require('./.yo-rc.json')['generator-edgeplate'],
    clientDir: 'app',
    app: path.resolve('app'),
    serverDir: 'server',
    server: path.resolve('server'),
    serverJs: path.resolve('server', 'server.js'),
    commonDir: 'common',
    common: path.resolve('common'),
    dist: path.resolve('dist'),<% if (edgeplate.features.cordova) { %>
    cordova: path.resolve('cordova/www/'),<% } %>
    buildEnvironment: environments[0],
    temp: path.resolve('.tmp'),
    test: path.resolve('test'),
    hostname: 'localhost',
    port: 3000,
    baseUrl: '/',
    today: Date.now(),
    revision: (gitRevision.indexOf('fatal') > -1)?null:gitRevision.replace(/(\r\n|\n|\r)/gm, ''),
    version: require('./package.json').version
};

if (!config.revision) {
    $.util.log($.util.colors.yellow('Git repository missing.'), 'Consider running', $.util.colors.cyan('git init'));
}

// task names with underscore (_) prefix will be treated as private
// they will not be exposed as gulp tasks a user can directly run
var tasks = {
    clean: function (isBuild) {
        var glob = [config.temp];
        if (isBuild) {
            glob.push(path.join(config.dist, config.buildEnvironment));
        }
        $.util.log('Cleaning ', $.util.colors.magenta(glob));
        return gulp.src(glob, { read: false })
            .pipe($.rimraf({ force: true }));
    },<% if (edgeplate.features.cordova) { %>
    _cleanCordova: function () {
        var glob = path.join(config.cordova, '*');
        $.util.log('Cleaning ', $.util.colors.magenta(glob));
        return gulp.src(glob, { read: false })
            .pipe($.rimraf({ force: true }));
    },<% } %>
    jshint: function () {
        $.util.log('Linting javascript files...');
        var glob = [
            'gulpfile.js',
            path.join(config.server, '**/*.js'),
            path.join(config.common, '**/*.js'),
            path.join(config.app, 'components/**/*.js'),
            path.join(config.app, 'controllers/**/*.js'),
            path.join(config.app, 'directives/**/*.js'),
            path.join(config.app, 'scripts/**/*.js'),
            // exclude loopback services file, it fails miserably
            '!' + path.join(config.app, 'scripts/loopback.js')
        ];
        return gulp.src(glob)
            .pipe($.jshint('.jshintrc'))
            .pipe($.jshint.reporter('jshint-stylish'));
    },
    jsonlint: function () {
        $.util.log('Linting JSON files...');
        var glob = [
            '*.json'
        ];
        return gulp.src(glob)
            .pipe($.jsonlint())
            .pipe($.jsonlint.reporter());
    },
    sass: function (isBuild) {
        $.util.log('Compiling SASS files...');
        var glob = path.join(config.app, 'styles/app.scss');
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.clientDir, 'styles'):path.join(config.temp, 'styles');
        return gulp.src(glob)
            // as the css is not 1-to-1, this doesn't work as expected
            // .pipe($.changed(dest, { extension: '.css' }))
            .pipe($.rubySass({
                sourcemap: true,
                style: (isBuild && config.buildEnvironment !== 'dev')?'compressed':'expanded',
                precision: 10,
                lineNumbers: (isBuild)?false:true,
                debugInfo: (isBuild)?false:true
            }))
            .pipe(gulp.dest(dest));
    },
    jade: function (isBuild) {
        $.util.log('Compiling Jade files...');
        var glob = [path.join(config.app, '**/*.jade'), path.join('!', config.app, '**/_*.jade')];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.clientDir):config.temp;
        var LOCALS = {
            DEBUG: (isBuild)?false:true,
            LOCAL: (isBuild)?false:true,
            ENV: (isBuild)?config.buildEnvironment:'local',<% if (edgeplate.features.cordova) { %>
            CORDOVA: (config.buildEnvironment === 'cordova')?true:false,<% } %>
            GIT_REVISION: config.revision,
            VERSION: 'v' + config.pkg.version,
            DATE_STAMP: strftime('%B %d, %Y %H:%M:%S', new Date(config.today)),
            YEAR: new Date(config.today).getFullYear()
        };
        return gulp.src(glob)
            // as the jade files are not 1-to-1 this doesn't work as expected
            // .pipe($.changed(dest, { extension: '.html' }))
            .pipe($.jade({
                locals: LOCALS,
                pretty: (isBuild === 'dist' && config.buildEnvironment !== 'dev')?false:true
            }))
            .pipe(gulp.dest(dest));
    },
    image: function (isBuild) {
        $.util.log('Minifing image files...');
        var glob = [
            path.join(config.app, 'images/**/*.{png,jpg,jpeg}'),
            path.join(config.app, 'styles/images/**/*.{png,jpg,jpeg}'),
        ];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.clientDir):config.temp;
        return gulp.src(glob, { base: config.app })
            .pipe($.imagemin())
            .pipe(gulp.dest(dest));
    },
    _usemin: function (isBuild) {
        $.util.log('Processing usemin js blocks in HTML files...');
        var glob = path.join(config.dist, config.buildEnvironment, config.clientDir, '*.html');
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.clientDir):config.temp;
        return gulp.src(glob)
            .pipe($.usemin({
                css: ['concat', $.rev()],
                angularJs: ['concat', $.ngAnnotate(), $.uglify(), $.rev()],
                js: ['concat', $.uglify(), $.rev()]
            }))
            .pipe(gulp.dest(dest));
    },
    _copyAssets: function (isBuild) {
        $.util.log('Copying front end assets into build destination...');
        // copy all assets relative to config.app
        var glob = [
            // copy gif files manually as they are not compressed
            path.join(config.app, 'images/**/*.gif'),
            path.join(config.app, 'styles/**/*.gif'),
            path.join(config.app, 'styles/fonts/**/*'),
            path.join(config.app, 'favicon.ico')
        ];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.clientDir):config.temp;
        return gulp.src(glob, { base: config.app })
            .pipe(gulp.dest(dest));
    },
    _copyServer: function (isBuild) {
        $.util.log('Copying node server assets into build destination...');
        // copy all assets relative to config.server
        var glob = [
            path.join(config.server, '**/*')
        ];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.serverDir):config.temp;
        return gulp.src(glob)
            .pipe(gulp.dest(dest));
    },
    _copyCommon: function (isBuild) {
        $.util.log('Copying common assets into build destination...');
        // copy all assets relative to config.common
        var glob = [
            path.join(config.common, '**/*')
        ];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.commonDir):config.temp;
        return gulp.src(glob)
            .pipe(gulp.dest(dest));
    },
    _copyPackage: function (isBuild) {
        $.util.log('Copying package.json into build destination...');
        // copy all assets relative to root
        var glob = 'package.json';
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment):config.temp;
        return gulp.src(glob)
            .pipe(gulp.dest(dest));
    },<% if (edgeplate.features.cordova) { %>
    _copyCordova: function () {
        $.util.log('Copying Cordova build to destination...');
        // copy all assets relative to root
        var glob = path.join(config.dist, config.buildEnvironment, config.clientDir, '**/*');
        var dest = config.cordova;
        return gulp.src(glob)
            .pipe(gulp.dest(dest));
    },<% } %>
    _addBanner: function (isBuild) {
        $.util.log('Add debug header to files...');
        var glob = [
            path.join(config.dist, config.buildEnvironment, config.clientDir, '**/*.css'),
            path.join(config.dist, config.buildEnvironment, config.clientDir, '**/*.js')
        ];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.clientDir):config.temp;
        var banner = [
            '/**',
            ' * <%%= pkg.title %> - <%%= pkg.description %>',
            ' * @version v<%%= pkg.version %>',
            ' * @link <%%= pkg.homepage %>',
            ' * @license <%%= pkg.license %>',
            ' * @revision <%%= revision %>',
            ' * @build <%%= build %>',
            ' */',
            ''
        ].join('\n');

        return gulp.src(glob)
            .pipe($.header(banner, {
                pkg : config.pkg,
                revision: config.revision,
                build: strftime('%B %d, %Y %H:%M:%S', new Date(config.today))
            }))
            .pipe(gulp.dest(dest));
    }
};

// taskify individual build and server tasks
var taskList = Object.keys(tasks);

taskList.forEach(function (taskName) {
    if (taskName.indexOf('_') === 0) {
        return;
    }
    gulp.task(taskName, function() {
        return tasks[taskName]();
    });
    environments.forEach(function (environment) {
        gulp.task(taskName + ':' + environment, function() {
            config.buildEnvironment = environment;
            return tasks[taskName](true);
        });
    });
});

function queItUp (taskList, isBuild) {
    var deferred = Q.defer();
    var queue = new Q();
    taskList.forEach(function (task) {
        queue = queue.then(function () {
            // cheap conversion of task stream to promise
            var taskDeferred = Q.defer();
            // call the task name with the task type dist|server
            tasks[task](isBuild)
                // not sure if I'm using buffer correctly but it does the trick
                .pipe($.util.buffer(function () {
                    taskDeferred.resolve();
                }));
            return taskDeferred.promise;
        });
    });
    queue = queue.then(function explode() {
        deferred.resolve();
    });
    return deferred.promise;
}

function buildProject () {
    // List of build task function names
    var taskList = [
        'clean',
        'jshint',
        'jsonlint',
        'sass',
        'jade',
        'image',
        '_usemin',
        '_copyAssets',
        '_copyServer',
        '_copyCommon',
        '_copyPackage',
        '_addBanner'
    ];
    return queItUp(taskList, true);
}<% if (edgeplate.features.cordova) { %>

function deployCordova () {
    // List of build task function names
    var taskList = [
        '_cleanCordova',
        '_copyCordova'
    ];
    return queItUp(taskList);
}<% } %>

function startServer () {
    // List of build task function names
    var taskList = [
        'clean',
        'jshint',
        'jsonlint',
        'sass',
        'jade'
    ];
    return queItUp(taskList);
}

// Gulp Tasks

// use first environment as default build alias, should be dev
gulp.task('build', ['build:' + environments[0]]);
environments.forEach(function (environment) {
    gulp.task('build:' + environment, function() {
        config.buildEnvironment = environment;
        return buildProject(environment);
    });
});

// serve alias for server
gulp.task('serve', ['server']);
gulp.task('server', function() {
    var deferred = Q.defer();
    startServer().then(function () {
        var server = $.livereload();
        $.util.log('Starting local server...');
        gulp.watch(path.join(config.app, '**/*.{scss,sass}'), function (file) {
            $.util.log('File updated', $.util.colors.magenta(file.path));
            tasks.sass()
                // not sure if I'm using buffer correctly but it does the trick
                .pipe($.util.buffer(function () {
                    server.changed(file.path);
                }));

        });
        gulp.watch(path.join(config.app, '**/*.jade'), function (file) {
            $.util.log('File updated', $.util.colors.magenta(file.path));
            tasks.jade()
                // not sure if I'm using buffer correctly but it does the trick
                .pipe($.util.buffer(function () {
                    server.changed(file.path);
                }));
        });

        var livereloadGlob = [
            path.join(config.app, 'images/**/*.{gif,png,jpg,jpeg}'),
            path.join(config.app, 'styles/images/**/*.{gif,png,jpg,jpeg}'),
            path.join(config.app, 'components/**/*.js'),
            path.join(config.app, 'controllers/**/*.js'),
            path.join(config.app, 'directives/**/*.js'),
            path.join(config.app, 'scripts/**/*.js')
        ];
        gulp.watch(livereloadGlob, function (file) {
            $.util.log('File updated', $.util.colors.magenta(file.path));
            server.changed(file.path);
        });

        nodemon({
            script: config.serverJs,
            args: [
                '-port=' + config.port,
                '-host=' + config.hostname,
                '-baseurl=' + config.baseUrl,
                '-local'
            ],
            stdout: false,
            watch: [
                config.server,
                config.common
            ]
        })
            .once('start', function () {
                // delay a second, express is not always immediately ready
                setTimeout(function() {
                    openApp('http://' + config.hostname + ':' + config.port + config.baseUrl);
                }, 1000);
            })
            .on('exit', function () {
                deferred.resolve();
            })
            .on('stdout', function (msg) {
                $.util.log('Server:', $.util.colors.magenta(msg));
            });
    });
    return deferred.promise;
});<% if (edgeplate.features.buildDeploy) { %>

gulp.task('config.sh', function () {
    var deferred = Q.defer();
    //make .config.sh from package.json for deploy.sh, remote.sh and tail-log.sh
    var fs = require('fs');
    var configFile = [
        '#Auto-generated by grunt build from values in package.json',
        util.format('BASEDOMAIN="%s";', config.edgeplate.baseDomain),
        util.format('HOST="%s";', config.edgeplate.hostDomain),
        util.format('SSH_PORT="%d";', config.edgeplate.sshPort),
        util.format('DEV_PORT="%d";', config.edgeplate.devPort),
        util.format('WWW_PORT="%d";', config.edgeplate.wwwPort),
        util.format('DIR="%s";', config.edgeplate.slug)
    ].join('\n');
    fs.writeFile('.config.sh', configFile, function (err) {
        if(err) {
            $.util.beep();
            $.util.log($.util.colors.yellow('Config file creation failed:'), err);
        } else {
            $.util.log($.util.colors.cyan('Config file created successfully.'));
        }
        deferred.resolve();
    });
    return deferred.promise;
});<% } if (edgeplate.features.cordova) { %>

gulp.task('deploy:cordova', ['build:cordova'], function () {
    var deferred = Q.defer();
    config.buildEnvironment = 'cordova';
    $.util.log('Deploying Cordova build...');
    deployCordova(config.buildEnvironment).then(function () {
        process.chdir('cordova');
        var cordovaPrepare = shell.exec('cordova prepare', { silent:true }).output;
        if (cordovaPrepare.length) {
            // successfuly cordova prepare has no output, if we have output there was a problem
            $.util.beep();
            $.util.log($.util.colors.yellow('Cordova prepare failed:'), cordovaPrepare);
        }
        $.util.log($.util.colors.cyan('Cordova deployed successfully.'));
        process.chdir('../');
        deferred.resolve();
    });
    return deferred.promise;
});<% } %>
