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
            // views
            // TODO: list view paths
            // layout
            'app/public/layout/_global.jade',
            'app/public/layout/_touchIcons.jade',
            // components
            'app/public/components/navbar/_navbar.scss',
            'app/public/components/navbar/navbar.jade',
            // controllers
            'app/public/controllers/App/AppController.js',
            'app/public/controllers/pages/Dashboard/_Dashboard.scss',
            'app/public/controllers/pages/Dashboard/DashboardController.js',
            'app/public/controllers/pages/Dashboard/DashboardView.jade',
            // scripts
            'app/public/scripts/app.js',
            'app/public/scripts/helper.js',
            'app/public/scripts/foot-init.js',
            'app/public/scripts/head-init.js',
            // styles
            'app/public/styles/_mixins.scss',
            'app/public/styles/_styles.scss',
            'app/public/styles/_variables.scss',
            'app/public/styles/app.scss',
            // images
            // TODO: list image paths
            // index
            'app/public/index.jade',
            // express config
            'app/app.js',
            'app/routes.js',
            // misc app files
            '.bowerrc',
            'bower.json',
            'favicon-master.png',
            'package.json',
            '.jshintrc',
            '.editorconfig',
            '.gitignore',
            'Gruntfile.js',
            'README.md',
            'deploy.sh',
            'favicon.sh',
            'node-ctrl.sh',
            'remote.sh',
            'tail-log.sh'
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
