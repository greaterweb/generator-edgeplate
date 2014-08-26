'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('../util.js');

var PageGenerator = module.exports = function PageGenerator() {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);
    this.controllerName = this._.capitalize(this._.camelize(this._.slugify(this.name))) || 'Page';
    this.pkg = JSON.parse(this.readFileAsString(path.join(process.cwd(), '/package.json')));
    this.appTitle = this.pkg.title;
};

util.inherits(PageGenerator, yeoman.generators.NamedBase);

PageGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [{
        type: 'confirm',
        name: 'addToNav',
        message: 'Do you wish to add a link to the navbar template?',
        default: true
    }];

    this.prompt(prompts, function (props) {
        this.addToNav = props.addToNav;

        cb();
    }.bind(this));
};

PageGenerator.prototype.files = function files() {
    this.copy('_styles.scss', 'app/controllers/pages/' + this.controllerName + '/_' + this.controllerName + '.scss');
    this.copy('_view.jade', 'app/controllers/pages/' + this.controllerName + '/' + this.controllerName + 'View.jade');
    this.copy('script.js', 'app/controllers/pages/' + this.controllerName + '/' + this.controllerName + 'Controller.js');
    this.copy('resolver.js', 'app/controllers/pages/' + this.controllerName + '/' + this.controllerName + 'Resolver.js');

    // add route to app.js
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/scripts/app.js',
        needle: '$stateProvider',
        spliceAfter: true,
        splicable: [
            '    .state(\'' + this._.slugify(this.name) + '\', {',
            '        url: \'/' + this._.slugify(this.name) + '\',',
            '        templateUrl: \'controllers/pages/' + this.controllerName + '/' + this.controllerName + 'View.html\',',
            '        controller: \'' + this.controllerName + 'Controller as ' + this.controllerName.toLowerCase() + '\',',
            '        resolve: $injector.get(\'' + this.controllerName + 'Resolver\')',
            '    })'
        ]
    });

    // add controller script tag to index.jade
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/index.jade',
        needle: '//- page controllers',
        spliceAfter: true,
        splicable: [
            'script(src="controllers/pages/' + this.controllerName + '/' + this.controllerName + 'Controller.js")'
        ]
    });

    // add resolver script tag to index.jade
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/index.jade',
        needle: '//- page resolvers',
        spliceAfter: true,
        splicable: [
            'script(src="controllers/pages/' + this.controllerName + '/' + this.controllerName + 'Resolver.js")'
        ]
    });

    // add stylesheet reference to app.scss
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/styles/app.scss',
        needle: '// Angular Controller Styles',
        spliceAfter: true,
        splicable: [
            '@import "../controllers/pages/' + this.controllerName + '/_' + this.controllerName + '";'
        ]
    });

    if (this.addToNav) {
        // add navigation item to navbar.jade
        angularUtils.rewriteFile({
            path: process.cwd(),
            file: '/app/components/navbar/navbar.jade',
            needle: '//- angular pages',
            spliceAfter: true,
            splicable: [
                'li(ui-sref-active="active"): a(ui-sref="' + this._.slugify(this.name) + '") ' + this.name
            ]
        });
    }

};
