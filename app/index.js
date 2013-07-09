'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var EdgeplateGenerator = module.exports = function EdgeplateGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.argument('slug', { type: String, required: false });
    this.appSlug = this.slug || path.basename(process.cwd());

    this.on('end', function () {
        this.installDependencies({ skipInstall: options['skip-install'] });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(EdgeplateGenerator, yeoman.generators.Base);

EdgeplateGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    // welcome message
    var welcome =
    '\n     _-----_' +
    '\n    |       |' +
    '\n    |' + '--(o)--'.red + '|   .--------------------------.' +
    '\n   `---------´  |    ' + 'Welcome to Yeoman,'.yellow.bold + '    |' +
    '\n    ' + '( '.yellow + '_' + '´U`'.yellow + '_' + ' )'.yellow + '   |   ' + 'ladies and gentlemen!'.yellow.bold + '  |' +
    '\n    /___A___\\   \'__________________________\'' +
    '\n     |  ~  |'.yellow +
    '\n   __' + '\'.___.\''.yellow + '__' +
    '\n ´   ' + '`  |'.red + '° ' + '´ Y'.red + ' `\n';

    console.log(welcome);

    var prompts = [{
        name: 'appTitle',
        message: 'What is the display title of your app?',
        default: 'Edge Project'
    }];

    this.prompt(prompts, function (err, props) {
        if (err) {
            return this.emit('error', err);
        }

        this.appTitle = props.appTitle;

        cb();
    }.bind(this));
};

EdgeplateGenerator.prototype.app = function app() {

    this.copy('public/index.jade', 'app/public/index.jade');

    this.mkdir('app/services/models');

    this.copy('app.js', 'app/app.js');

    this.copy('_Gruntfile.js', 'Gruntfile.js');

    this.copy('README.md', 'README.md');

    this.copy('_package.json', 'package.json');
    this.copy('bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
};

EdgeplateGenerator.prototype.layout = function layoutFiles() {
    this.copy('public/layout/_global.jade', 'app/public/layout/_global.jade');
    this.copy('public/layout/_page.jade', 'app/public/layout/_page.jade');
};

EdgeplateGenerator.prototype.components = function componentFiles() {
    this.copy('public/components/navBar/navBar.jade', 'app/public/components/navBar/navBar.jade');
};

EdgeplateGenerator.prototype.directives = function directiveFiles() {
    this.mkdir('app/public/directives');
};

EdgeplateGenerator.prototype.images = function imageFiles() {
    this.mkdir('app/public/images');
};

EdgeplateGenerator.prototype.filters = function filterFiles() {
    this.mkdir('app/public/scripts/filters');
};

EdgeplateGenerator.prototype.services = function serviceFiles() {
    this.copy('public/scripts/services/edgePage.js', 'app/public/scripts/services/edgePage.js');
};

EdgeplateGenerator.prototype.scripts = function scriptFiles() {
    this.copy('public/scripts/app.js', 'app/public/scripts/app.js');
    this.copy('public/scripts/helper.js', 'app/public/scripts/helper.js');
};

EdgeplateGenerator.prototype.styles = function styleFiles() {
    this.mkdir('app/public/styles');
    this.copy('public/styles/_mixins.scss', 'app/public/styles/_mixins.scss');
    this.copy('public/styles/_styles.scss', 'app/public/styles/_styles.scss');
    this.copy('public/styles/_variables.scss', 'app/public/styles/_variables.scss');
    this.copy('public/styles/app.scss', 'app/public/styles/app.scss');
};

EdgeplateGenerator.prototype.controllers = function controllerFiles() {
    this.copy('public/controllers/App/AppController.js', 'app/public/controllers/App/AppController.js');
    this.copy('public/controllers/Body/BodyController.js', 'app/public/controllers/Body/BodyController.js');

    this.copy('public/controllers/pages/Dashboard/_Dashboard.scss', 'app/public/controllers/pages/Dashboard/_Dashboard.scss');
    this.copy('public/controllers/pages/Dashboard/DashboardController.js', 'app/public/controllers/pages/Dashboard/DashboardController.js');
    this.copy('public/controllers/pages/Dashboard/DashboardView.jade', 'app/public/controllers/pages/Dashboard/DashboardView.jade');
};

EdgeplateGenerator.prototype.projectfiles = function projectfiles() {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.copy('gitignore', '.gitignore');
};
