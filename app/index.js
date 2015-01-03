'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var EdgeplateGenerator = yeoman.generators.Base.extend({
    init: function init() {
        this.pkg = require('../package.json');
        this.edgeplate = this.config.getAll();
        this.currentYear = new Date().getFullYear();
        if (this.edgeplate.created) {
            this.edgeplate.modified = Date.now();
        } else {
            this.edgeplate.version = this.pkg.version;
            this.edgeplate.created = Date.now();
            this.edgeplate.pages = {
                Index: {
                    state: this._.slugify('Index')
                }
            };
        }

        this.on('end', function () {
            this.config.defaults(this.edgeplate);
            if (!this.options['skip-install']) {
                this.installDependencies({
                    callback: function () {
                        var sourceRoot = process.cwd();
                        var fontSrc = path.join(sourceRoot, '/app/bower_lib/bootstrap-sass/assets/fonts/bootstrap');
                        var fontDest = path.join(sourceRoot, 'app/styles/fonts');
                        var file = require('yeoman-generator').file;

                        file.recurse(fontSrc, function callback(abspath, rootdir, subdir, filename) {
                            file.copy(fontSrc + '/' + filename, fontDest + '/' + filename);
                        });

                        var motionSrc = path.join(sourceRoot, '/app/bower_lib/angular-motion/dist/angular-motion.css');

                        file.copy(motionSrc, path.join(sourceRoot, 'app/styles/_angular-motion.scss'));

                        if (this.edgeplate.features.cordova) {
                            this.log
                                .write()
                                .write()
                                .info(chalk.yellow('Action required to complete Cordova support'))
                                .write()
                                .info('Enter the cordova directory')
                                .info(chalk.grey('$'), chalk.cyan('cd cordova'))
                                .write()
                                .info('Add platforms to support')
                                .info(chalk.grey('$'), chalk.cyan('cordova platform add ios'))
                                .write()
                                .info('Add required plugins')
                                .info(chalk.grey('$'), chalk.cyan('cordova plugin add org.apache.cordova.console'))
                                .info(chalk.grey('$'), chalk.cyan('cordova plugin add org.apache.cordova.device'))
                                .info(chalk.grey('$'), chalk.cyan('cordova plugin add org.apache.cordova.statusbar'))
                                .write();
                        }
                    }.bind(this)
                });
            }
        });
    },
    isProject: function isProject() {
        // TODO: Move to a library item so it is accessible for sub generators
        if (this.edgeplate.version) {
            this.isEdgeplate = true;
            var thisVersion = this.pkg.version.split('.');
            var thatVersion = this.edgeplate.version.split('.');
            if (thisVersion[0] !== thatVersion[0] || thisVersion[1] !== thatVersion[1]) {
                // only look at major and minor version
                this.hasConflict = true;
            } else {
                this.hasConflict = false;
            }
        } else {
            this.isEdgeplate = false;
        }

        if (this.hasConflict) {
            this.log
                .write()
                .info(chalk.yellow('WARNING - Generator Mismatch'))
                .info('You are currently using Edgeplate ' + chalk.yellow('v' + this.pkg.version) + '.')
                .info('The original Edgeplate generator used for this project was ' + chalk.yellow('v' + this.edgeplate.version) + '.')
                .write();

            var done = this.async();

            var prompts = [{
                type: 'confirm',
                name: 'continue',
                message: 'Do you wish to continue?',
                default: false
            }];

            this.prompt(prompts, function (props) {
                if (!props.continue) {
                    process.exit(1);
                }
                done();
            }.bind(this));
        }
    },
    welcome: function welcome() {
        var done = this.async();

        var message = [
            chalk.gray('   _____ ____   ____ _____ ____  _        _  _____ _____   '),
            chalk.gray('  | ____|  _ \\ / ___| ____|  _ \\| |      / \\|_   _| ____|  '),
            chalk.gray('  |  _| | | | | |  _|  _| | |_) | |     / _ \\ | | |  _|    '),
            chalk.gray('  | |___| |_| | |_| | |___|  __/| |___ / ___ \\| | | |___   '),
            chalk.gray('  |_____|____/ \\____|_____|_|   |_____/_/   \\_\\_| |_____|  '),
            chalk.gray('                                                           '),
            '                     ' + chalk.green('Edgeplate v' + this.pkg.version) + '                    ',
            '               ' + chalk.green('by Ron Edgecomb and Joe Kovach') + '            ',
            '',
            '      Edgeplate is an opinionated way of building web',
            '       applications with Angular, Loopback and Node.',
            ''
        ].join('\n');
        this.log(message);

        var prompts = [{
            name: 'title',
            message: 'What is the display title of your app?',
            default: 'Edge Project'
        }];

        this.prompt(prompts, function (props) {
            this.edgeplate.title = props.title;
            done();
        }.bind(this));
    },
    projectSlug: function projectSlug() {
        var done = this.async();
        var prompts = [{
            name: 'slug',
            message: 'Enter slug to use with project',
            default: this._.slugify(this.edgeplate.title),
            validate: function (slug) {
                if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(slug)) {
                    return 'Please use a valid slug format';
                } else {
                    return true;
                }
            }
        }];
        this.prompt(prompts, function (props) {
            this.edgeplate.slug = props.slug;
            done();
        }.bind(this));
    },
    features: function features() {
        var done = this.async();
        var prompts = [{
            type: 'checkbox',
            name: 'features',
            message: 'What features would you like supported?',
            choices: [{
                name: 'Cordova',
                value: 'cordova'
            },
            {
                name: 'Loopback',
                value: 'loopback'
            },
            {
                name: 'Socket.io',
                value: 'socketio'
            },
            {
                name: 'Build and Deploy',
                value: 'buildDeploy'
            },
            {
                name: 'Favicon Builder',
                value: 'favicon'
            }],
            default: ['cordova', 'loopback', 'socketio', 'buildDeploy', 'favicon']
        }];
        this.prompt(prompts, function (props) {
            this.edgeplate.features = {};
            props.features.forEach(function (feature) {
                this.edgeplate.features[feature] = true;
            }.bind(this));
            done();
        }.bind(this));
    },
    buildAndDeploy: function buildAndDeploy() {
        if (!this.edgeplate.features.buildDeploy) {
            return;
        }

        this.log
            .write()
            .write()
            .info(chalk.green('Please complete Edgeplate options for build and deploy scripts.'))
            .write();

        var done = this.async();

        var prompts = [{
            name: 'hostDomain',
            message: 'Where is your project hosted (server name)?',
            default: 'host.edgeplate.com'
        },
        {
            name: 'baseDomain',
            message: 'What is your base domain for this project?',
            default: 'project.edgeplate.com'
        },
        {
            name: 'wwwPort',
            message: 'What port will your express production service run on?',
            default: '80'
        },
        {
            name: 'devPort',
            message: 'What port will your express development service run on?',
            default: '8000'
        },
        {
            name: 'sshPort',
            message: 'What port will you use for ssh?',
            default: '22'
        }];

        this.prompt(prompts, function (props) {
            this.edgeplate.hostDomain = props.hostDomain;
            this.edgeplate.baseDomain = props.baseDomain;
            this.edgeplate.devPort = props.devPort;
            this.edgeplate.wwwPort = props.wwwPort;
            this.edgeplate.sshPort = props.sshPort;
            done();
        }.bind(this));
    },
    buildDeployFiles: function buildDeployFiles() {
        if (this.edgeplate.features.buildDeploy) {
            this.src.copy('excludes', '.excludes');
            this.src.copy('deploy.sh', 'deploy.sh');
            this.src.copy('remote.sh', 'remote.sh');
            this.src.copy('tail-log.sh', 'tail-log.sh');
        }
    },
    faviconFiles: function faviconFiles() {
        if (this.edgeplate.features.favicon) {
            this.src.copy('favicon.sh', 'favicon.sh');
        }
    },
    rootFiles: function rootFiles() {
        this.template('_gulpfile.js', 'gulpfile.js');
        this.template('README.md', 'README.md');
        this.template('_bower.json', 'bower.json');
        this.template('_package.json', 'package.json');
        this.src.copy('bowerrc', '.bowerrc');
        this.src.copy('editorconfig', '.editorconfig');
        this.src.copy('jshintrc', '.jshintrc');
        this.src.copy('gitignore', '.gitignore');
        this.src.copy('scss-lint.yml', '.scss-lint.yml');
    },
    layoutFiles: function layoutFiles() {
        this.template('app/index.jade', 'app/index.jade');
        this.template('app/layout/_global.jade', 'app/layout/_global.jade');
        this.src.copy('app/layout/_touchIcons.jade', 'app/layout/_touchIcons.jade');
        this.src.copy('app/layout/_browserWarnings.jade', 'app/layout/_browserWarnings.jade');
    },
    componentFiles: function componentFiles() {
        this.src.copy('app/components/navbar/_navbar.scss', 'app/components/navbar/_navbar.scss');
        this.template('app/components/navbar/navbar.jade', 'app/components/navbar/navbar.jade');
    },
    directiveFiles: function directiveFiles() {
        this.dest.mkdir('app/directives');
    },
    imageFiles: function imageFiles() {
        this.directory('app/images/favicon/', 'app/images/favicon/');
        this.src.copy('app/favicon.ico', 'app/favicon.ico');
    },
    filterFiles: function filterFiles() {
        this.dest.mkdir('app/scripts/filters');
    },
    serviceFiles: function serviceFiles() {
        this.src.copy('app/scripts/services/edgePage.js', 'app/scripts/services/edgePage.js');
        this.src.copy('app/scripts/services/edgeResolver.js', 'app/scripts/services/edgeResolver.js');
        this.src.copy('app/scripts/services/NProgress.js', 'app/scripts/services/NProgress.js');
    },
    scriptFiles: function scriptFiles() {
        this.template('app/scripts/app.js', 'app/scripts/app.js');
        this.src.copy('app/scripts/helper.js', 'app/scripts/helper.js');
        this.src.copy('app/scripts/foot-init.js', 'app/scripts/foot-init.js');
        this.src.copy('app/scripts/head-init.js', 'app/scripts/head-init.js');
    },
    styleFiles: function styleFiles() {
        this.dest.mkdir('app/styles');
        this.src.copy('app/styles/_animate.scss', 'app/styles/_animate.scss');
        this.src.copy('app/styles/_mixins.scss', 'app/styles/_mixins.scss');
        this.src.copy('app/styles/_nprogress.scss', 'app/styles/_nprogress.scss');
        this.src.copy('app/styles/_styles.scss', 'app/styles/_styles.scss');
        this.src.copy('app/styles/_variables.scss', 'app/styles/_variables.scss');
        this.src.copy('app/styles/app.scss', 'app/styles/app.scss');
    },
    controllerFiles: function controllerFiles() {
        this.template('app/controllers/App/AppController.js', 'app/controllers/App/AppController.js');
        this.src.copy('app/controllers/pages/Index/_Index.scss', 'app/controllers/pages/Index/_Index.scss');
        this.src.copy('app/controllers/pages/Index/IndexController.js', 'app/controllers/pages/Index/IndexController.js');
        this.src.copy('app/controllers/pages/Index/IndexResolver.js', 'app/controllers/pages/Index/IndexResolver.js');
        this.template('app/controllers/pages/Index/IndexView.jade', 'app/controllers/pages/Index/IndexView.jade');
    },
    cordovaFiles: function cordovaFiles() {
        if (this.edgeplate.features.cordova) {
            this.template('cordova/hooks/README.md', 'cordova/hooks/README.md');
            this.dest.mkdir('cordova/merges');
            this.dest.mkdir('cordova/platforms');
            this.dest.mkdir('cordova/plugins');
            this.dest.mkdir('cordova/www');
            this.template('cordova/config.xml', 'cordova/config.xml');
            this.src.copy('app/scripts/edge.cordova.js', 'app/scripts/edge.cordova.js');
        }
    },
    loopbackFiles: function loopbackFiles() {
        if (this.edgeplate.features.loopback) {
            this.src.copy('app/scripts/loopback.js', 'app/scripts/loopback.js');
            this.directory('server/', 'server/');
        }
    },
    commonFiles: function commonFiles() {
        this.directory('common/', 'common/');
    },
    socketioFiles: function commonFiles() {
        if (this.edgeplate.features.socketio) {
            this.src.copy('app/scripts/services/socketio.js', 'app/scripts/services/socketio.js');
        }
    }
});

module.exports = EdgeplateGenerator;
