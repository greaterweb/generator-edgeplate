'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var angularUtils = require('../util.js');

var DirectiveGenerator = module.exports = function DirectiveGenerator(args, options, config) {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);

    // name needs to be in all lowercase for custom element support in browser
    this.name = (this._.slugify(this.name)).toLowerCase() || 'edgeDirective';
    this.camelName = this._.camelize(this.name);
};

util.inherits(DirectiveGenerator, yeoman.generators.NamedBase);

DirectiveGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [{
        type: 'confirm',
        name: 'useTemplateURL',
        message: 'Do you want to use an external template?',
        default: true
    }];

    this.prompt(prompts, function (props) {
        this.useTemplateURL = props.useTemplateURL;

        cb();
    }.bind(this));
};

DirectiveGenerator.prototype.files = function files() {

    if (this.useTemplateURL) {
        this.copy('directive-templateurl.js', 'app/public/directives/' + this.camelName + '/' + this.camelName + 'Directive.js');
        this.copy('_view.jade', 'app/public/directives/' + this.camelName + '/' + this.camelName + 'View.jade');
    } else {
        this.copy('directive.js', 'app/public/directives/' + this.camelName + '/' + this.camelName + 'Directive.js');
    }

    this.copy('_styles.scss', 'app/public/directives/' + this.camelName + '/_' + this.camelName + '.scss');

    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/styles/app.scss',
        needle: '// Angular Directive Styles',
        spliceAfter: true,
        splicable: [
            '@import "../directives/' + this.camelName + '/_' + this.camelName + '";'
        ]
    });

    // add script tag to index.jade
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/index.jade',
        needle: '//- angular directives',
        spliceAfter: true,
        splicable: [
            'script(src="directives/' + this.camelName + '/' + this.camelName + 'Directive.js")'
        ]
    });
};
