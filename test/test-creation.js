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
            'app/public/layout/_global.jade',
            'app/public/layout/_touchIcons.jade',
            // components
            'app/public/components/navbar/_navbar.scss',
            'app/public/components/navbar/navbar.jade',
            // controllers
            'app/public/controllers/App/AppController.js',
            'app/public/controllers/pages/Index/_Index.scss',
            'app/public/controllers/pages/Index/IndexController.js',
            'app/public/controllers/pages/Index/IndexResolver.js',
            'app/public/controllers/pages/Index/IndexView.jade',
            // services
            'app/public/scripts/services/lbServices.js',
            'app/public/scripts/services/edgePage.js',
            'app/public/scripts/services/edgeResolver.js',
            'app/public/scripts/services/NProgress.js',
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
            'app/public/images/favicon/favicon-master.png',
            // index
            'app/public/index.jade',
            // express config
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
