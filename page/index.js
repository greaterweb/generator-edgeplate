'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var PageGenerator = module.exports = function PageGenerator(args, options, config) {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);
    this.controllerName = this._.capitalize(this._.camelize(this._.slugify(this.name))) || 'Page';
    this.pkg = JSON.parse(this.readFileAsString(path.join(process.cwd(), '/package.json')));
    console.log(this.pkg);
    this.slug = this.pkg.name;
    this.appTitle = this.pkg.title;
};

util.inherits(PageGenerator, yeoman.generators.NamedBase);

PageGenerator.prototype.files = function files() {
    this.copy('_styles.scss', 'app/public/controllers/pages/' + this.controllerName + '/_' + this.controllerName + '.scss');
    this.copy('_view.jade', 'app/public/controllers/pages/' + this.controllerName + '/_' + this.controllerName + 'View.jade');
    this.copy('script.js', 'app/public/controllers/pages/' + this.controllerName + '/' + this.controllerName + 'Controller.js');
};
