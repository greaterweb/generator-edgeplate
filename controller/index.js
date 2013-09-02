'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var angularUtils = require('../util.js');


var ControllerGenerator = module.exports = function ControllerGenerator(args, options, config) {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);
    this.controllerName = this._.capitalize(this._.camelize(this._.slugify(this.name))) || 'EdgePlate';
};

util.inherits(ControllerGenerator, yeoman.generators.NamedBase);

ControllerGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [{
        type: 'checkbox',
        name: 'features',
        message: 'Select the supporting files your controller needs:',
        choices: [{
            name: 'SCSS File',
            value: 'hasSCSS',
            checked: true
        }, {
            name: 'Jade File',
            value: 'hasView',
            checked: true
        }]
    }];

    this.prompt(prompts, function (answers) {
        var features = answers.features;

        function hasFeature(feat) { return features.indexOf(feat) !== -1; }

        this.hasSCSS = hasFeature('hasSCSS');
        this.hasView = hasFeature('hasView');

        cb();
    }.bind(this));
};

ControllerGenerator.prototype.files = function files() {
    if (this.hasSCSS) {
        this.copy('_styles.scss', 'app/public/controllers/' + this.controllerName + '/_' + this.controllerName + '.scss');
        // add stylesheet reference to app.scss
        angularUtils.rewriteFile({
            path: process.cwd(),
            file: '/app/public/styles/app.scss',
            needle: '// Angular Controller Styles',
            spliceAfter: true,
            splicable: [
                '@import "../controllers/' + this.controllerName + '/_' + this.controllerName + '";'
            ]
        });
    }

    if (this.hasView) {
        this.copy('_view.jade', 'app/public/controllers/' + this.controllerName + '/' + this.controllerName + 'View.jade');
    }

    this.copy('script.js', 'app/public/controllers/' + this.controllerName + '/' + this.controllerName + 'Controller.js');
    // add script tag to index.jade
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/index.jade',
        needle: '//- angular controllers',
        spliceAfter: true,
        splicable: [
            'script(src="controllers/' + this.controllerName + '/' + this.controllerName + 'Controller.js")'
        ]
    });

};
