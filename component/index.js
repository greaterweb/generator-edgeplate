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

ComponentGenerator.prototype.files = function files() {
    this.copy('_styles.scss', 'app/public/components/' + this.componentName + '/_' + this.componentName + '.scss');
    this.copy('_view.jade', 'app/public/components/' + this.componentName + '/_' + this.componentName + '.jade');
    this.copy('script.js', 'app/public/components/' + this.componentName + '/' + this.componentName + '.js');
};
