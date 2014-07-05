'use strict';

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();

var nodemon = require('nodemon');
var openApp = require('open');

var path = require('path');
var Q = require('q');
var strftime = require('strftime');

var shell = require('shelljs');

var gitRevision = shell.exec('git rev-parse --short HEAD', { silent:true }).output;

var config = {
    pub: 'public',
    pkg: require('./package.json'),
    src: path.resolve('app'),
    app: path.resolve('app', 'public'),
    models: path.resolve('app', 'models'),
    dist: path.resolve('dist'),
    cordova: path.resolve('cordova/www/'),
    buildTarget: 'dev', // ['dev', 'www', 'pub']
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

var tasks = {
    clean: function (taskTarget) {
        var glob = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget):config.temp;
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
    sass: function (taskTarget) {
        $.util.log('Compiling SASS files...');
        var glob = path.join(config.app, 'styles/app.scss');
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget, config.pub, 'styles'):path.join(config.temp, 'styles');
        return gulp.src(glob)
            // as the css is not 1-to-1, this doesn't work as expected
            // .pipe($.changed(dest, { extension: '.css' }))
            .pipe($.rubySass({
                sourcemap: true,
                style: (taskTarget === 'dist')?'compressed':'expanded',
                precision: 10,
                lineNumbers: (taskTarget === 'dist')?false:true
            }))
            .pipe(gulp.dest(dest));
    },
    jade: function (taskTarget) {
        $.util.log('Compiling Jade files...');
        var glob = [path.join(config.app, '**/*.jade'), path.join('!', config.app, '**/_*.jade')];
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget, config.pub):config.temp;
        var LOCALS = {
            DEBUG: (taskTarget === 'dist')?false:true,
            LOCAL: (taskTarget === 'dist')?false:true
        };
        return gulp.src(glob)
            // as the jade files are not 1-to-1 this doesn't work as expected
            // .pipe($.changed(dest, { extension: '.html' }))
            .pipe($.jade({
                locals: LOCALS,
                pretty: (taskTarget === 'dist')?false:true
            }))
            .pipe(gulp.dest(dest));
    },
    image: function (taskTarget) {
        $.util.log('Minifing image files...');
        var glob = [
            path.join(config.app, 'images/**/*.{png,jpg,jpeg}'),
            path.join(config.app, 'styles/images/**/*.{png,jpg,jpeg}'),
        ];
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget, config.pub):config.temp;
        return gulp.src(glob, { base: config.app })
            .pipe($.imagemin())
            .pipe(gulp.dest(dest));
    },
    usemin: function (taskTarget) {
        $.util.log('Processing usemin js blocks in HTML files...');
        var glob = path.join(config.dist, config.buildTarget, config.pub, '*.html');
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget, config.pub):config.temp;
        return gulp.src(glob)
            .pipe($.usemin({
                css: ['concat', $.rev()],
                angularJs: ['concat', $.ngAnnotate(), $.uglify(), $.rev()],
                js: ['concat', $.uglify(), $.rev()]
            }))
            .pipe(gulp.dest(dest));
    },
    copyAssets: function (taskTarget) {
        $.util.log('Copying front end assets into build destination...');
        // copy all assets relative to config.app
        var glob = [
            // copy gif files manually as they are not compressed
            path.join(config.app, 'images/**/*.gif'),
            path.join(config.app, 'styles/**/*.gif'),
            path.join(config.app, 'styles/fonts/**/*')
        ];
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget, config.pub):config.temp;
        return gulp.src(glob, { base: config.app })
            .pipe(gulp.dest(dest));
    },
    copyServer: function (taskTarget) {
        $.util.log('Copying node assets into build destination...');
        // copy all assets relative to config.src
        var glob = [
            path.join(config.models, '**/*'),
            path.join(config.src, 'app.js'),
            path.join(config.src, 'app.json'),
            path.join(config.src, 'datasources.json'),
            path.join(config.src, 'models.json')
        ];
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget):config.temp;
        return gulp.src(glob, { base: config.src })
            .pipe(gulp.dest(dest));
    },
    copyPackage: function (taskTarget) {
        $.util.log('Copying package.json into build destination...');
        // copy all assets relative to root
        var glob = 'package.json';
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget):config.temp;
        return gulp.src(glob)
            .pipe(gulp.dest(dest));
    },
    addBanner: function (taskTarget) {
        $.util.log('Add debug header to files...');
        var glob = [
            path.join(config.dist, config.buildTarget, config.pub, '**/*.css'),
            path.join(config.dist, config.buildTarget, config.pub, '**/*.js')
        ];
        var dest = (taskTarget === 'dist')?path.join(config.dist, config.buildTarget, config.pub):config.temp;
        var banner = [
            '/**',
            ' * <%= pkg.name %> - <%= pkg.description %>',
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

// make individual tasks available
gulp.task('jshint', tasks.jshint);

// taskify individual build and server tasks
var taskList = Object.keys(tasks);

taskList.forEach(function (taskName) {
    gulp.task(taskName, [taskName + ':dev']);
    gulp.task(taskName + ':dev', function() {
        config.buildTarget = 'dev';
        return tasks[taskName]('dist');
    });
    gulp.task(taskName + ':www', function() {
        config.buildTarget = 'www';
        return tasks[taskName]('dist');
    });
    gulp.task(taskName + ':pub', function() {
        config.buildTarget = 'pub';
        return tasks[taskName]('dist');
    });
    gulp.task(taskName + ':tmp', function() {
        return tasks[taskName]('tmp');
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
        'usemin',
        'copyAssets',
        'copyServer',
        'copyPackage',
        'addBanner'
    ];
    var queue = new Q();
    taskList.forEach(function (task) {
        queue = queue.then(function () {
            // cheap conversion of task stream to promise
            var taskDeferred = Q.defer();
            // call the task name with the task type dist|server
            tasks[task]('dist')
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
            tasks[task]('server')
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

// allias for build:dev task
gulp.task('build', ['build:dev']);

gulp.task('build:dev', function() {
    config.buildTarget = 'dev';
    return buildProject('dev');
});

gulp.task('build:www', function() {
    config.buildTarget = 'www';
    return buildProject('www');
});

gulp.task('build:prod', function() {
    config.buildTarget = 'prod';
    return buildProject('prod');
});

gulp.task('server', function() {
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
                config.src,
                '!' + config.app
            ]
        })
            .once('start', function () {
                // delay a second, express is not always immediately ready
                setTimeout(function() {
                    openApp('http://' + config.hostname + ':' + config.port + config.baseUrl);
                }, 1000);
            })
            .on('stdout', function (msg) {
                $.util.log('Server:', $.util.colors.magenta(msg));
            });
    });
});
