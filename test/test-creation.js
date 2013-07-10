/*global describe, beforeEach, it*/
'use strict';

var path    = require('path');
var helpers = require('yeoman-generator').test;

describe('edgeplate generator', function () {
    beforeEach(function (done) {
        helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
            if (err) {
                return done(err);
            }

            this.app = helpers.createGenerator('edgeplate:app', [
                '../../app'
            ]);
            done();
        }.bind(this));
    });

    it('creates expected files', function (done) {
        var expected = [
            // add files you expect to exist here.
            // layout
            'app/public/layout/_global.jade',
            'app/public/layout/_page.jade',
            // components
            'app/public/components/navbar/navbar.jade',
            // controllers
            'app/public/controllers/App/AppController.js',
            'app/public/controllers/Body/BodyController.js',
            'app/public/controllers/pages/Dashboard/_Dashboard.scss',
            'app/public/controllers/pages/Dashboard/DashboardController.js',
            'app/public/controllers/pages/Dashboard/DashboardView.jade',
            // scripts
            'app/public/scripts/app.js',
            'app/public/scripts/helper.js',
            // styles
            'app/public/styles/_mixins.scss',
            'app/public/styles/_styles.scss',
            'app/public/styles/_variables.scss',
            'app/public/styles/app.scss',
            // index
            'app/public/index.jade',
            // express config
            'app/app.js',
            // misc app files
            '.bowerrc',
            'bower.json',
            'package.json',
            '.jshintrc',
            '.editorconfig',
            '.gitignore',
            'Gruntfile.js',
            'README.md'
        ];

        helpers.mockPrompt(this.app, {
            'appTitle': 'Edge App'
        });

        this.app.options['skip-install'] = true;

        this.app.run({}, function () {
            helpers.assertFiles(expected);
            done();
        });

    });
});
