'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var angularUtils = require('../util.js');

var FilterGenerator = module.exports = function FilterGenerator(args, options, config) {
  // By calling `NamedBase` here, we get the argument to the subgenerator call
  // as `this.name`.
  yeoman.generators.NamedBase.apply(this, arguments);

  this.name = this._.ltrim(this._.camelize(this._.slugify(this.name)), '-') || 'edgeit';
};

util.inherits(FilterGenerator, yeoman.generators.NamedBase);

FilterGenerator.prototype.files = function files() {
    this.copy('filter.js', 'app/public/scripts/filters/' + this.name + '.js');

    // add script tag to index.jade
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/index.jade',
        needle: '//- angular filters',
        spliceAfter: true,
        splicable: [
            'script(src="scripts/filters/' + this.name + '.js")'
        ]
    });
};
