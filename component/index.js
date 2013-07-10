'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');

var ComponentGenerator = module.exports = function ComponentGenerator(args, options, config) {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);
    this.componentName = (this._.camelize(this._.slugify(this.name))).toLowerCase() || 'edge';
};

util.inherits(ComponentGenerator, yeoman.generators.NamedBase);

ComponentGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [{
        type: 'confirm',
        name: 'hasSCSS',
        message: 'Do you wish to include a SCSS file with your component?',
        default: true
    },{
        type: 'confirm',
        name: 'hasJS',
        message: 'Do you wish to include a JavaScript file with your component?',
        default: true
    }];

    this.prompt(prompts, function (props) {
        this.hasSCSS = props.hasSCSS;
        this.hasJS = props.hasJS;

        cb();
    }.bind(this));
};

ComponentGenerator.prototype.files = function files() {
    this.copy('_view.jade', 'app/public/components/' + this.componentName + '/_' + this.componentName + '.jade');
    if (this.hasSCSS) {
        this.copy('_styles.scss', 'app/public/components/' + this.componentName + '/_' + this.componentName + '.scss');
    }
    if (this.hasJS) {
        this.copy('script.js', 'app/public/components/' + this.componentName + '/' + this.componentName + '.js');
    }
};
