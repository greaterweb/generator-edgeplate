/*global describe, beforeEach, it */
'use strict';
var path = require('path');
var helpers = require('yeoman-generator').test;
var assert = require('yeoman-generator').assert;

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
        // build and deploy
        '.excludes',
        'deploy.sh',
        'remote.sh',
        'tail-log.sh',
        // favicon
        'favicon.sh',
        // rootFiles
        'gulpfile.js',
        'README.md',
        'bower.json',
        'package.json',
        '.bowerrc',
        '.editorconfig',
        '.jshintrc',
        '.gitignore',
        // layoutFiles
        'app/index.jade',
        'app/layout/_global.jade',
        'app/layout/_touchIcons.jade',
        'app/layout/_browserWarnings.jade',
        // componentFiles
        'app/components/navbar/_navbar.scss',
        'app/components/navbar/navbar.jade',
        // directiveFiles
        'app/directives',
        // imageFiles
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
        'app/favicon.ico',
        // filterFiles
        'app/scripts/filters',
        // serviceFiles
        'app/scripts/services/edgePage.js',
        'app/scripts/services/edgeResolver.js',
        'app/scripts/services/NProgress.js',
        // scriptFiles
        'app/scripts/app.js',
        'app/scripts/helper.js',
        'app/scripts/foot-init.js',
        'app/scripts/head-init.js',
        // styleFiles
        'app/styles/_animate.scss',
        'app/styles/_mixins.scss',
        'app/styles/_styles.scss',
        'app/styles/_variables.scss',
        'app/styles/app.scss',
        // controllerFiles
        'app/controllers/App/AppController.js',
        'app/controllers/pages/Index/_Index.scss',
        'app/controllers/pages/Index/IndexController.js',
        'app/controllers/pages/Index/IndexResolver.js',
        'app/controllers/pages/Index/IndexView.jade',
        // cordovaFiles
        'cordova/hooks/README.md',
        'cordova/merges',
        'cordova/platforms',
        'cordova/plugins',
        'cordova/www',
        'cordova/config.xml',
        'app/scripts/edge.cordova.js',
        // loopbackFiles
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
        'server/server.js',
        // commonFiles
        'common/views/_errGlobal.jade',
        'common/views/error404.jade',
        'common/views/error500.jade',
        'common/views/robots-allow.txt',
        'common/views/robots-disallow.txt'
    ];

    helpers.mockPrompt(this.app, {
      title: 'Edgeplate Project',
      slug: 'edgeplate-project',
      features: ['cordova','loopback','socketio','buildDeploy','favicon'],
      hostDomain: 'host.edgeplate.com',
      baseDomain: 'project.edgeplate.com',
      wwwPort: 80,
      devPort: 8000,
      sshPort: 22
    });
    this.app.options['skip-install'] = true;
    this.app.run({}, function () {
      assert.file(expected);
      done();
    });
  });
});

