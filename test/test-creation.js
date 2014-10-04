/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;

describe('edgeplate generator', function () {
    var edgeplate;
    var mockPrompts = {
        title: 'Edgeplate Project',
        slug: 'edgeplate-project',
        features: ['cordova','loopback','socketio','buildDeploy','favicon'],
        hostDomain: 'host.edgeplate.com',
        baseDomain: 'project.edgeplate.com',
        wwwPort: 80,
        devPort: 8000,
        sshPort: 22
    };
    var genOptions = {
        'skip-install': true
    };

    beforeEach(function (done) {
        helpers.testDirectory(path.join(__dirname, 'temp'), function (err) {
            if (err) {
                return done(err);
            }
            edgeplate = helpers.createGenerator(
                'edgeplate:app',
                [
                    '../../app'
                ],
                false,
                genOptions
            );
            helpers.mockPrompt(edgeplate, mockPrompts);
            done();
        });
    });

    describe('app files', function () {
        it('copies all app files', function (done) {
            edgeplate.run({}, function () {
                // creates build and deploy files
                assert.file([
                    '.excludes',
                    'deploy.sh',
                    'remote.sh',
                    'tail-log.sh'
                ]);
                // creates favicon files
                assert.file([
                    'favicon.sh',
                    'app/images/favicon/favicon-114.png',
                    'app/images/favicon/favicon-120.png',
                    'app/images/favicon/favicon-128.png',
                    'app/images/favicon/favicon-144.png',
                    'app/images/favicon/favicon-152.png',
                    'app/images/favicon/favicon-16.png',
                    'app/images/favicon/favicon-195.png',
                    'app/images/favicon/favicon-228.png',
                    'app/images/favicon/favicon-32.png',
                    'app/images/favicon/favicon-57.png',
                    'app/images/favicon/favicon-72.png',
                    'app/images/favicon/favicon-96.png',
                    'app/images/favicon/favicon-master.png',
                    'app/favicon.ico'
                ]);
                // creates root files
                assert.file([
                    'gulpfile.js',
                    'README.md',
                    'bower.json',
                    'package.json',
                    '.bowerrc',
                    '.editorconfig',
                    '.jshintrc',
                    '.gitignore'
                ]);
                // creates layout files
                assert.file([
                    'app/index.jade',
                    'app/layout/_global.jade',
                    'app/layout/_touchIcons.jade',
                    'app/layout/_browserWarnings.jade'
                ]);
                // creates component files
                assert.file([
                    'app/components/navbar/_navbar.scss',
                    'app/components/navbar/navbar.jade'
                ]);
                // creates directives directory
                assert.file([
                    'app/directives'
                ]);
                // creates directives directory
                assert.file([
                    'app/directives'
                ]);
                // creates filters directory
                assert.file([
                    'app/scripts/filters'
                ]);
                // creates services files {
                assert.file([
                    'app/scripts/services/edgePage.js',
                    'app/scripts/services/edgeResolver.js',
                    'app/scripts/services/NProgress.js'
                ]);
                // creates script files
                assert.file([
                    'app/scripts/app.js',
                    'app/scripts/helper.js',
                    'app/scripts/foot-init.js',
                    'app/scripts/head-init.js'
                ]);
                // creates styles files
                assert.file([
                    'app/styles/_animate.scss',
                    'app/styles/_mixins.scss',
                    'app/styles/_nprogress.scss',
                    'app/styles/_styles.scss',
                    'app/styles/_variables.scss',
                    'app/styles/app.scss'
                ]);
                // creates controller files
                assert.file([
                    'app/controllers/App/AppController.js',
                    'app/controllers/pages/Index/_Index.scss',
                    'app/controllers/pages/Index/IndexController.js',
                    'app/controllers/pages/Index/IndexResolver.js',
                    'app/controllers/pages/Index/IndexView.jade'
                ]);
                // creates cordova files
                assert.file([
                    'cordova/hooks/README.md',
                    'cordova/merges',
                    'cordova/platforms',
                    'cordova/plugins',
                    'cordova/www',
                    'cordova/config.xml',
                    'app/scripts/edge.cordova.js',
                ]);
                // creates loopback files
                assert.file([
                    'app/scripts/loopback.js',
                    'server/boot/authentication.js',
                    'server/boot/config.js',
                    'server/boot/explorer.js',
                    'server/boot/rest-api.js',
                    'server/boot/root.js',
                    'server/lib/handler.js',
                    'server/lib/mail.js',
                    'server/datasources.json',
                    'server/model-config.json',
                    'server/server.js'
                ]);
                // creates common files
                assert.file([
                    'common/models/account.js',
                    'common/models/account.json',
                    'common/views/_errGlobal.jade',
                    'common/views/error404.jade',
                    'common/views/error500.jade',
                    'common/views/robots-allow.txt',
                    'common/views/robots-disallow.txt'
                ]);
                // socketio files
                assert.file([
                    'app/scripts/services/socketio.js'
                ]);
                done();
            });
        });
    });
});

