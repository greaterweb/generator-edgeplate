'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('../util.js');

var PageGenerator = module.exports = function PageGenerator(args, options, config) {
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
    this.copy('_styles.scss', 'app/public/controllers/pages/' + this.controllerName + '/_' + this.controllerName + '.scss');
    this.copy('_view.jade', 'app/public/controllers/pages/' + this.controllerName + '/' + this.controllerName + 'View.jade');
    this.copy('script.js', 'app/public/controllers/pages/' + this.controllerName + '/' + this.controllerName + 'Controller.js');

    // add route to app.js
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/scripts/app.js',
        needle: '.otherwise',
        splicable: [
            '.when(\'/' + this._.slugify(this.name) + '\', {',
            '    templateUrl: \'controllers/pages/' + this.controllerName + '/' + this.controllerName + 'View.html\',',
            '    controller: \'' + this.controllerName + 'Controller as ' + this.controllerName.toLowerCase() + '\',',
            '    resolve: {',
            '        app: [\'$q\', \'wkPage\', function ($q, edgePage) {',
            '            var defer = $q.defer();',
            '            edgePage.setPageTitle(\''+ this._.capitalize(this.name) + ' &raquo; ' + this.appTitle + '\');',
            '            edgePage.setBodyClass(\'wkPage-'+ this._.ltrim(this._.dasherize(this.controllerName), '-') + '\');',
            '            defer.resolve();',
            '            return defer.promise;',
            '        }]',
            '    }',
            '})'
        ]
    });

    // add script tag to index.jade
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/index.jade',
        needle: '//- page controllers',
        spliceAfter: true,
        splicable: [
            'script(src="controllers/pages/' + this.controllerName + '/' + this.controllerName + 'Controller.js")'
        ]
    });

    // add stylesheet reference to app.scss
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/styles/app.scss',
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
            file: '/app/public/components/navbar/navbar.jade',
            needle: '//- angular pages',
            spliceAfter: true,
            splicable: [
                'li',
                '  a(href="#/' + this.name + '") ' + this._.titleize(this.name)
            ]
        });
    }

};
