'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');

var ControllerGenerator = module.exports = function ControllerGenerator(args, options, config) {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);
    this.controllerName = this._.capitalize(this._.camelize(this._.slugify(this.name))) || 'EdgePlate';
};

util.inherits(ControllerGenerator, yeoman.generators.NamedBase);

ControllerGenerator.prototype.files = function files() {
    this.copy('_styles.scss', 'app/public/controllers/' + this.controllerName + '/_' + this.controllerName + '.scss');
    this.copy('_view.jade', 'app/public/controllers/' + this.controllerName + '/_' + this.controllerName + 'View.jade');
    this.copy('script.js', 'app/public/controllers/' + this.controllerName + '/' + this.controllerName + 'Controller.js');
};
