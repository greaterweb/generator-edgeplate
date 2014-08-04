'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var EdgeplateGenerator = yeoman.generators.Base.extend({
    init: function () {
        this.pkg = require('../package.json');
        this.edgeplate = this.config.getAll();

        this.on('end', function () {
            this.edgeplate.version = this.pkg.version;
            this.config.defaults(this.edgeplate);
            if (!this.options['skip-install']) {
                // this.installDependencies();
            }
        });
    },

    isProject: function () {
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

    welcome: function () {
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
        },
        {
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
            this.edgeplate.title = props.title;
            this.edgeplate.features = props.features;
            done();
        }.bind(this));
    },

    buildAndDeploy: function () {
        if (this.edgeplate.features.indexOf('buildDeploy') === -1) {
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
    buildDeployFiles: function () {
        if (this.edgeplate.features.indexOf('buildDeploy') === -1) {
            return;
        }
        this.src.copy('excludes', '.excludes');
        this.src.copy('deploy.sh', 'deploy.sh');
        this.src.copy('remote.sh', 'remote.sh');
        this.src.copy('tail-log.sh', 'tail-log.sh');
    },
    faviconFiles: function () {
        if (this.edgeplate.features.indexOf('favicon') === -1) {
            return;
        }
        this.src.copy('favicon.sh', 'favicon.sh');
    }
});

module.exports = EdgeplateGenerator;
