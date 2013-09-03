'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var angularUtils = require('../util.js');

var ServiceGenerator = module.exports = function ServiceGenerator(args, options, config) {
    // By calling `NamedBase` here, we get the argument to the subgenerator call
    // as `this.name`.
    yeoman.generators.NamedBase.apply(this, arguments);

    this.name = this._.ltrim(this._.camelize(this._.slugify(this.name)), '-') || 'edgeService';
};

util.inherits(ServiceGenerator, yeoman.generators.NamedBase);

ServiceGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    var prompts = [{
        type: 'confirm',
        name: 'isResourceService',
        message: 'Is this a resource based service?',
        default: true
    }];

    this.prompt(prompts, function (props) {
        this.isResourceService = props.isResourceService;

        cb();
    }.bind(this));
};

ServiceGenerator.prototype.getEndpoint = function askFor() {
    if (this.isResourceService) {
        var cb = this.async();

        var prompts = [{
            name: 'endpoint',
            message: 'What is your service endpoint?',
            default: 'services/edge-service'
        }];

        this.prompt(prompts, function (props) {
            this.endpoint = props.endpoint;

            cb();
        }.bind(this));
    }
};

ServiceGenerator.prototype.files = function files() {
    if (this.isResourceService) {
        this.copy('resource-service.js', 'app/public/scripts/services/' + this.name + '.js');
        if (this.endpoint.indexOf('http://') == -1) {
            angularUtils.rewriteFile({
                path: process.cwd(),
                file: '/app/routes.js',
                needle: '// get routes',
                spliceAfter: true,
                splicable: [
                    '\'' + this.endpoint + '\': function (req, res) {',
                    '    res.json({',
                    '        wkatg: \'Wolters Kluwer Advanced Technology Group\'',
                    '    });',
                    '},'
                ]
            });
        }
    } else {
        this.copy('service.js', 'app/public/scripts/services/' + this.name + '.js');
    }

    // add script tag to index.jade
    angularUtils.rewriteFile({
        path: process.cwd(),
        file: '/app/public/index.jade',
        needle: '//- angular services',
        spliceAfter: true,
        splicable: [
            'script(src="scripts/services/' + this.name + '.js")'
        ]
    });
};
