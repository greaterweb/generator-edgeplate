'use strict';
var util = require('util'),
    path = require('path'),
    fs = require('fs.extra'),
    yeoman = require('yeoman-generator'),
    chalk = require('chalk');

var EdgeplateGenerator = module.exports = function EdgeplateGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.argument('slug', { type: String, required: false });
    this.appSlug = this.slug || path.basename(process.cwd());
    this.currentYear = new Date().getFullYear();
    this.version = require('../package.json').version;

    this.on('end', function () {
        this.installDependencies({
            callback: function () {
                if (!options['skip-install']) {
                    var sourceRoot = process.cwd(),
                        fontSrc = path.join(sourceRoot, '/app/public/bower_lib/bootstrap-sass/vendor/assets/fonts/bootstrap'),
                        fontDest = path.join(sourceRoot, 'app/public/styles/fonts');

                    // copy the bootstrap glyphicon fonts into the styles directory
                    fs.copyRecursive(fontSrc, fontDest, function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                }
            }.bind(this),
            skipInstall: options['skip-install']
        });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(EdgeplateGenerator, yeoman.generators.Base);

EdgeplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    // welcome message
    var welcome =[
        chalk.gray('   _____ ____   ____ _____ ____  _        _  _____ _____   '),
        chalk.gray('  | ____|  _ \\ / ___| ____|  _ \\| |      / \\|_   _| ____|  '),
        chalk.gray('  |  _| | | | | |  _|  _| | |_) | |     / _ \\ | | |  _|    '),
        chalk.gray('  | |___| |_| | |_| | |___|  __/| |___ / ___ \\| | | |___   '),
        chalk.gray('  |_____|____/ \\____|_____|_|   |_____/_/   \\_\\_| |_____|  '),
        chalk.gray('                                                           '),
        chalk.gray('  ====>>>>    ') + chalk.green('Angular Application Boilerplate') + chalk.gray('    <<<<===='),
        chalk.gray('  ====>>>>            ') + chalk.green('by Ron Edgecomb') + chalk.gray('            <<<<===='),
        chalk.gray('                                                           ')
    ].join('\n');

    console.log(welcome);

    var prompts = [{
        name: 'appTitle',
        message: 'What is the display title of your app?',
        default: 'Edge Project'
    },{
        type: 'confirm',
        name: 'useCordova',
        message: 'Would you like to enable Cordova support?',
        default: true
    },{
        name: 'hostDomain',
        message: 'Where is your project hosted (server name)?',
        default: 'host.example.com'
    },{
        name: 'baseDomain',
        message: 'What is your base domain for this project?',
        default: 'project.example.com'
    },{
        name: 'wwwPort',
        message: 'What port will your express production service run on?',
        default: '80'
    },{
        name: 'devPort',
        message: 'What port will your express development service run on?',
        default: '8000'
    },{
        name: 'sshPort',
        message: 'What port will you use for ssh?',
        default: '22'
    }];

    this.prompt(prompts, function (props) {
        this.appTitle = props.appTitle;
        this.useCordova = props.useCordova;
        this.hostDomain = props.hostDomain;
        this.baseDomain = props.baseDomain;
        this.devPort = props.devPort;
        this.wwwPort = props.wwwPort;
        this.sshPort = props.sshPort;

        cb();
    }.bind(this));
};

EdgeplateGenerator.prototype.app = function app() {

    this.copy('public/index.jade', 'app/public/index.jade');

    this.mkdir('app/models');

    this.directory('views/', 'app/views/');

    this.copy('app.js', 'app/app.js');

    this.copy('_gulpfile.js', 'gulpfile.js');

    this.copy('README.md', 'README.md');

    this.copy('_package.json', 'package.json');
    this.copy('bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
    this.copy('excludes', '.excludes');

    this.copy('datasources.json', 'datasources.json');
    this.copy('models.json', 'models.json');

    this.copy('deploy.sh', 'deploy.sh');
    this.copy('favicon.sh', 'favicon.sh');
    this.copy('remote.sh', 'remote.sh');
    this.copy('tail-log.sh', 'tail-log.sh');
};

EdgeplateGenerator.prototype.layout = function layoutFiles() {
    this.copy('public/layout/_global.jade', 'app/public/layout/_global.jade');
    this.copy('public/layout/_touchIcons.jade', 'app/public/layout/_touchIcons.jade');
    this.copy('public/layout/_browserWarnings.jade', 'app/public/layout/_browserWarnings.jade');
};

EdgeplateGenerator.prototype.components = function componentFiles() {
    this.copy('public/components/navbar/_navbar.scss', 'app/public/components/navbar/_navbar.scss');
    this.copy('public/components/navbar/navbar.jade', 'app/public/components/navbar/navbar.jade');
};

EdgeplateGenerator.prototype.directives = function directiveFiles() {
    this.mkdir('app/public/directives');
};

EdgeplateGenerator.prototype.images = function imageFiles() {
    this.directory('public/images/favicon/', 'app/public/images/favicon/');
    this.copy('public/favicon.ico', 'app/public/favicon.ico');
};

EdgeplateGenerator.prototype.filters = function filterFiles() {
    this.mkdir('app/public/scripts/filters');
};

EdgeplateGenerator.prototype.services = function serviceFiles() {
    this.copy('public/scripts/services/lbServices.js', 'app/public/scripts/services/lbServices.js');
    this.copy('public/scripts/services/edgePage.js', 'app/public/scripts/services/edgePage.js');
    this.copy('public/scripts/services/edgeResolver.js', 'app/public/scripts/services/edgeResolver.js');
    this.copy('public/scripts/services/NProgress.js', 'app/public/scripts/services/NProgress.js');
};

EdgeplateGenerator.prototype.scripts = function scriptFiles() {
    this.copy('public/scripts/app.js', 'app/public/scripts/app.js');
    this.copy('public/scripts/helper.js', 'app/public/scripts/helper.js');
    this.copy('public/scripts/foot-init.js', 'app/public/scripts/foot-init.js');
    this.copy('public/scripts/head-init.js', 'app/public/scripts/head-init.js');
};

EdgeplateGenerator.prototype.styles = function styleFiles() {
    this.mkdir('app/public/styles');
    this.copy('public/styles/_animate.scss', 'app/public/styles/_animate.scss');
    this.copy('public/styles/_mixins.scss', 'app/public/styles/_mixins.scss');
    this.copy('public/styles/_styles.scss', 'app/public/styles/_styles.scss');
    this.copy('public/styles/_variables.scss', 'app/public/styles/_variables.scss');
    this.copy('public/styles/app.scss', 'app/public/styles/app.scss');
};

EdgeplateGenerator.prototype.controllers = function controllerFiles() {
    this.copy('public/controllers/App/AppController.js', 'app/public/controllers/App/AppController.js');

    this.copy('public/controllers/pages/Index/_Index.scss', 'app/public/controllers/pages/Index/_Index.scss');
    this.copy('public/controllers/pages/Index/IndexController.js', 'app/public/controllers/pages/Index/IndexController.js');
    this.copy('public/controllers/pages/Index/IndexResolver.js', 'app/public/controllers/pages/Index/IndexResolver.js');
    this.copy('public/controllers/pages/Index/IndexView.jade', 'app/public/controllers/pages/Index/IndexView.jade');
};

EdgeplateGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.copy('gitignore', '.gitignore');
};
