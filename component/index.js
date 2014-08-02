'use strict';
var util = require('util'),
    yeoman = require('yeoman-generator'),
    angularUtils = require('../util.js');

var ComponentGenerator = module.exports = function ComponentGenerator() {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);
    this.componentName = this._.camelize(this._.slugify(this.name)) || 'edge';
};

util.inherits(ComponentGenerator, yeoman.generators.NamedBase);

ComponentGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [{
        type: 'checkbox',
        name: 'features',
        message: 'Select the supporting files your component needs:',
        choices: [{
            name: 'SCSS File',
            value: 'hasSCSS',
            checked: true
        }, {
            name: 'JS File',
            value: 'hasJS',
            checked: true
        }]
    }];

    this.prompt(prompts, function (answers) {
        var features = answers.features;

        function hasFeature(feat) { return features.indexOf(feat) !== -1; }

        this.hasSCSS = hasFeature('hasSCSS');
        this.hasJS = hasFeature('hasJS');

        cb();
    }.bind(this));
};

ComponentGenerator.prototype.files = function files() {
    this.copy('_view.jade', 'app/components/' + this.componentName + '/' + this.componentName + '.jade');
    if (this.hasSCSS) {
        this.copy('_styles.scss', 'app/components/' + this.componentName + '/_' + this.componentName + '.scss');
        // add stylesheet reference to app.scss
        angularUtils.rewriteFile({
            path: process.cwd(),
            file: '/app/styles/app.scss',
            needle: '// Application Component Styles',
            spliceAfter: true,
            splicable: [
                '@import "../components/' + this.componentName + '/_' + this.componentName + '";'
            ]
        });
    }
    if (this.hasJS) {
        this.copy('script.js', 'app/components/' + this.componentName + '/' + this.componentName + '.js');
        // add script tag to index.jade
        angularUtils.rewriteFile({
            path: process.cwd(),
            file: '/app/index.jade',
            needle: '//- application components',
            spliceAfter: true,
            splicable: [
                'script(src="components/' + this.componentName + '/' + this.componentName + '.js")'
            ]
        });
    }
};
