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

var environments = ['dev', 'www'];

var config = {
    pub: 'public',
    pkg: require('./package.json'),
    src: path.resolve('app'),
    app: path.resolve('app', 'public'),
    models: path.resolve('app', 'models'),
    dist: path.resolve('dist'),
    cordova: path.resolve('cordova/www/'),
    buildEnvironment: environments[0],
    temp: path.resolve('.tmp'),
    test: path.resolve('test'),
    server: path.resolve('app', 'app.js'),
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
    },
    jshint: function () {
        $.util.log('Linting javascript files...');
        var glob = [
            'gulpfile.js',
            path.join(config.src, 'app.js'),
            path.join(config.src, 'routes.js'),
            path.join(config.models, '**/*.js'),
            path.join(config.app, 'components/**/*.js'),
            path.join(config.app, 'controllers/**/*.js'),
            path.join(config.app, 'directives/**/*.js'),
            path.join(config.app, 'scripts/**/*.js'),
            // exclude loopback services file, it fails miserably
            '!' + path.join(config.app, 'scripts/services/lbServices.js')
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
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.pub, 'styles'):path.join(config.temp, 'styles');
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
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.pub):config.temp;
        var LOCALS = {
            DEBUG: (isBuild)?false:true,
            LOCAL: (isBuild)?false:true,
            ENV: (isBuild)?config.buildEnvironment:'local',
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
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.pub):config.temp;
        return gulp.src(glob, { base: config.app })
            .pipe($.imagemin())
            .pipe(gulp.dest(dest));
    },
    _usemin: function (isBuild) {
        $.util.log('Processing usemin js blocks in HTML files...');
        var glob = path.join(config.dist, config.buildEnvironment, config.pub, '*.html');
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.pub):config.temp;
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
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.pub):config.temp;
        return gulp.src(glob, { base: config.app })
            .pipe(gulp.dest(dest));
    },
    _copyServer: function (isBuild) {
        $.util.log('Copying node assets into build destination...');
        // copy all assets relative to config.src
        var glob = [
            path.join(config.models, '**/*'),
            path.join(config.src, 'app.js'),
            path.join(config.src, 'app.json'),
            path.join(config.src, 'datasources.json'),
            path.join(config.src, 'models.json'),
            path.join(config.src, 'views/**/*')
        ];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment):config.temp;
        return gulp.src(glob, { base: config.src })
            .pipe(gulp.dest(dest));
    },
    _copyPackage: function (isBuild) {
        $.util.log('Copying package.json into build destination...');
        // copy all assets relative to root
        var glob = 'package.json';
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment):config.temp;
        return gulp.src(glob)
            .pipe(gulp.dest(dest));
    },
    _addBanner: function (isBuild) {
        $.util.log('Add debug header to files...');
        var glob = [
            path.join(config.dist, config.buildEnvironment, config.pub, '**/*.css'),
            path.join(config.dist, config.buildEnvironment, config.pub, '**/*.js')
        ];
        var dest = (isBuild)?path.join(config.dist, config.buildEnvironment, config.pub):config.temp;
        var banner = [
            '/**',
            ' * <%= pkg.title %> - <%= pkg.description %>',
            ' * @version v<%= pkg.version %>',
            ' * @link <%= pkg.homepage %>',
            ' * @license <%= pkg.license %>',
            ' * @revision <%= revision %>',
            ' * @build <%= build %>',
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

function buildProject () {
    var deferred = Q.defer();
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
        '_copyPackage',
        '_addBanner'
    ];
    var queue = new Q();
    taskList.forEach(function (task) {
        queue = queue.then(function () {
            // cheap conversion of task stream to promise
            var taskDeferred = Q.defer();
            // call the task name with the task type dist|server
            tasks[task](true)
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


function startServer () {
    var deferred = Q.defer();
    // List of build task function names
    var taskList = [
        'clean',
        'jshint',
        'jsonlint',
        'sass',
        'jade'
    ];
    var queue = new Q();
    taskList.forEach(function (task) {
        queue = queue.then(function () {
            // cheap conversion of task stream to promise
            var taskDeferred = Q.defer();
            // call the task name with the task type dist|server
            tasks[task]()
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
            script: config.server,
            args: [
                '--port=' + config.port,
                '--hostname=' + config.hostname,
                '--baseurl=' + config.baseUrl,
                '--local'
            ],
            stdout: false,
            watch: [
                config.server,
                config.models
            ]
        })
            .once('start', function () {
                // delay a second, express is not always immediately ready
                setTimeout(function() {
                    openApp('http://' + config.hostname + ':' + config.port + config.baseUrl);
                }, 1000);
            })
            .once('exit', function () {
                deferred.resolve();
            })
            .on('stdout', function (msg) {
                $.util.log('Server:', $.util.colors.magenta(msg));
            });
    });
    return deferred.promise;
});

gulp.task('config.sh', function () {
    var deferred = Q.defer();
    //make .config.sh from package.json for deploy.sh, remote.sh and tail-log.sh
    var fs = require('fs');
    var configFile = [
        '#Auto-generated by grunt build from values in package.json',
        util.format('BASEDOMAIN="%s";', config.pkg.edgeplate.domain),
        util.format('HOST="%s";', config.pkg.edgeplate.host),
        util.format('SSH_PORT="%d";', config.pkg.edgeplate.ports.ssh),
        util.format('DEV_PORT="%d";', config.pkg.edgeplate.ports.dev),
        util.format('WWW_PORT="%d";', config.pkg.edgeplate.ports.www),
        util.format('DIR="%s";', config.pkg.name)
    ].join('\n');
    fs.writeFile('config.sh', configFile, function (err) {
        if(err) {
            $.util.beep();
            $.util.log($.util.colors.yellow('Config file creation failed.', err));
        } else {
            $.util.log($.util.colors.cyan('Config file created successfully.'));
        }
        deferred.resolve();
    });
    return deferred.promise;
});
