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
            // server
            'server/boot/authentication.js',
            'server/boot/config.js',
            'server/boot/explorer.js',
            'server/boot/rest-api.js',
            'server/boot/root.js',
            'server/lib/handler.js',
            'server/lib/mail.js',
            'server/datasources.json',
            'server/model-config.json',
            'server/server.js',
            // common
            'common/views/_errGlobal.jade',
            'common/views/error404.jade',
            'common/views/error500.jade',
            'common/views/error404.jade',
            'common/views/robots-allow.txt',
            'common/views/robots-disallow.txt',
            // layout
            'app/layout/_global.jade',
            'app/layout/_touchIcons.jade',
            // components
            'app/components/navbar/_navbar.scss',
            'app/components/navbar/navbar.jade',
            // controllers
            'app/controllers/App/AppController.js',
            'app/controllers/pages/Index/_Index.scss',
            'app/controllers/pages/Index/IndexController.js',
            'app/controllers/pages/Index/IndexResolver.js',
            'app/controllers/pages/Index/IndexView.jade',
            // services
            'app/scripts/services/lbServices.js',
            'app/scripts/services/edgePage.js',
            'app/scripts/services/edgeResolver.js',
            'app/scripts/services/NProgress.js',
            // scripts
            'app/scripts/app.js',
            'app/scripts/helper.js',
            'app/scripts/foot-init.js',
            'app/scripts/head-init.js',
            // styles
            'app/styles/_mixins.scss',
            'app/styles/_styles.scss',
            'app/styles/_variables.scss',
            'app/styles/app.scss',
            // images
            // TODO: list image paths
            'app/images/favicon/favicon-master.png',
            // index
            'app/index.jade',
            // misc app files
            '.bowerrc',
            'bower.json',
            'package.json',
            '.jshintrc',
            '.editorconfig',
            '.gitignore',
            'gulpfile.js',
            'README.md',
            'deploy.sh',
            'favicon.sh',
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
