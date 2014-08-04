'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var EdgeplateGenerator = yeoman.generators.Base.extend({
    init: function init() {
        this.pkg = require('../package.json');
        this.edgeplate = this.config.getAll();
        this.currentYear = new Date().getFullYear();

        this.on('end', function () {
            if (this.edgeplate.created) {
                this.edgeplate.modified = Date.now();
            } else {
                this.edgeplate.version = this.pkg.version;
                this.edgeplate.created = Date.now();
            }
            this.config.defaults(this.edgeplate);
            if (!this.options['skip-install']) {
                // this.installDependencies();
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
            this.log([
                '',
                chalk.red('>>> WARNING <<<'),
                ('You are currently using Edgeplate ' + chalk.yellow('v' + this.pkg.version) + '.'),
                ('The original Edgeplate generator used for this project was ' + chalk.yellow('v' + this.edgeplate.version) + '.')
            ].join('\n'));

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

        var welcome = [
            chalk.gray('   _____ ____   ____ _____ ____  _        _  _____ _____   '),
            chalk.gray('  | ____|  _ \\ / ___| ____|  _ \\| |      / \\|_   _| ____|  '),
            chalk.gray('  |  _| | | | | |  _|  _| | |_) | |     / _ \\ | | |  _|    '),
            chalk.gray('  | |___| |_| | |_| | |___|  __/| |___ / ___ \\| | | |___   '),
            chalk.gray('  |_____|____/ \\____|_____|_|   |_____/_/   \\_\\_| |_____|  '),
            chalk.gray('                                                           '),
            '                     ' + chalk.green('Edgeplate v' + this.pkg.version) + '                    ',
            '                      ' + chalk.green('by Ron Edgecomb') + '                    ',
            '',
            '      Edgeplate is an opinionated way of building web',
            '       applications with Angular, Loopback and Node.',
            ''
        ].join('\n');
        this.log(welcome);

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

        this.log('\n', chalk.green('Please complete Edgeplate options for build and deploy scripts.'), '\n');

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
        if (!this.edgeplate.features.buildDeploy) {
            return;
        }
        this.src.copy('excludes', '.excludes');
        this.src.copy('deploy.sh', 'deploy.sh');
        this.src.copy('remote.sh', 'remote.sh');
        this.src.copy('tail-log.sh', 'tail-log.sh');
    },
    faviconFiles: function faviconFiles() {
        if (this.edgeplate.features.favicon) {
            return;
        }
        this.src.copy('favicon.sh', 'favicon.sh');
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
    }
});

module.exports = EdgeplateGenerator;
