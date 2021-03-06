# <%= edgeplate.title %>
       _____ ____   ____ _____ ____  _        _  _____ _____
      | ____|  _ \ / ___| ____|  _ \| |      / \|_   _| ____|
      |  _| | | | | |  _|  _| | |_) | |     / _ \ | | |  _|
      | |___| |_| | |_| | |___|  __/| |___ / ___ \| | | |___
      |_____|____/ \____|_____|_|   |_____/_/   \_\_| |_____|
      
      ====>>>>          Another EdgePlate App        <<<<====
      ====>>>>      Generated by Version  <%= edgeplate.version %>      <<<<====

## Development Cycle

#### Web - Working Locally
<% if (edgeplate.features.cordova) { %>
There are four environments to work within. Local, development, production and cordova.<% } else { %>
There are three environments to work within. Local, development, and production.<% } %>

    brew install node
    brew install imagemagick
    brew install pngcrush
    brew install png2ico

Setup local development high level programs: 

	npm install -g gulp
	npm install -g yo
	npm install -g protractor
	npm install -g bower<% if (edgeplate.features.cordova) { %>
    npm install -g cordova<% } %>

Then install the application dependencies.

    npm install
    bower install

Replace the `app/images/favicon/favicon-master.png` with a high resolution **square** version of what will become your favicons.  The `favicon.sh` script will create the .ico and .png files at multiple resolutions and place them in the `app` and `app/images/favicon/` directories respectively. To run the script:

    ./favicon.sh

Local development environment [localhost:3000](http://localhost:3000)

    gulp server [-debug]

#### Web - Deployment

Remote development environment [dev.<%= edgeplate.baseDomain %>](http://dev.<%= edgeplate.baseDomain %>/)

	gulp build:dev
    ./deploy.sh dev [--debug]

Production environment [<%= edgeplate.baseDomain %>](http://<%= edgeplate.baseDomain %>/)

	gulp build:www
    ./deploy.sh www [--debug]<% if (edgeplate.features.cordova) { %>

Cordova environment

    gulp build:cordova
    gulp deploy:cordova<% } %>

#### Debugging 
The build time and git revision are available in `index.html` as `<meta>` tags:

    <meta name="build">
    <meta name="revision">
    <meta name="environment">

#### IE Development

##### Virtual Box

To test on Windows through Virtualbox, find the IP address of the host OS (your Mac’s local network IP), and use that as the address in IE. E.g. `http://192.168.1.1:3000` Without the `http://` IE does a web search. 

##### Trailing Commas

Jshint won’t check for this `[1,2,3,]` but older versions of IE will die on this. So look out!

#### Web - Remote Debugging

Environments live within `/www/<%= edgeplate.slug %>/{dev|www}`. The following command is built into `deploy.sh` and `remote.sh` but can be called manually on the remote host. 

If you start a service with port 8000 the Express dev log will be in `/var/tmp/server.js-8000.out`. The log file is continually appended. 

Remotely hosted Express servers are proxied through Apache, so Apache handles their official *combined* format (a.k.a *extended*) logs.

##### Starting and Stopping Express Manually
To start and stop a node service (express) manually use `remote.sh`:

    ./remote.sh {dev|www} {start|stop} [--debug]

##### Tail
Either type of log file can be `tail`'d remotely. 

    ./tail-log.sh {dev|www} {apache|express}

Check the `/var/tmp/` directory on the remote host for express logs per [node-ctrl](https://github.com/dailyraisin/node-ctrl).

##### Node DEBUG mode Remotely

Deploy with `--debug` and run `tail-log.sh`.

##### Top
When using `top` to debug node processes some helpful hints:

* Type `z` to turn on colors
* Type `u` then "unixuser" to filter just that user
* Type `c` to show full command strings
* Type `f` to toggle which fields are present
* Type `F` then `X` to sort by process name
      
## File Structure

- `dist/` distributed version of project, built by `gulp build`
- `app/` front end assets
	- `locales/` text translations
    - `bower_lib/` front end dependencies managed through Bower
    - `components/` front end component assets grouped by directory which includes all js, scss and images
    - `controllers/` angularjs controller assets grouped by directory which includes all js, scss and images
        - `pages/` front end page controller assets grouped by directory which includes all jade, js, scss and images
    - `directives/` angularjs directive assets grouped by directory which includes all js, scss and images
    - `images/` shared front end image assets
    - `layout/` Jade templates used for the main page layout
    - `scripts/` project javascript files
        - `filters/` angularjs filter assets
        - `services/` angularjs service assets<% if (edgeplate.features.cordova) { %>
        - `edge.cordova.js` cordova angularjs project declarations<% } %>
        - `app.js` main angularjs project declarations
        - `helper.js` global helper functions and feature poloyfils
    - `styles/` project stylesheets, both SASS and CSS
        - `fonts/` custom fonts used with stylesheets
        - `_mixins.scss` project SASS mixins
        - `_styles.scss` global/shared project styles
        - `_variables.scss` project SASS variables
        - `app.scss` SASS file used to include all project stylesheets
    - `index.jade` project index file
- `common/` common server assets, maintains this structure to be compatibile with `yo loopback`
    - `models/` - custom loopback data models
    - `views/` - server side jade views and misc static files<% if (edgeplate.features.cordova) { %>
- `cordova/` - cordova assets, standard structure. all `cordova` commands should be run from this directory
    - `hooks/`
    - `merges/`
    - `platforms/`
    - `plugins/`
    - `www/`
    - `config.xml` - cordova configuration<% } %>
- `server/` node server assets
    - `boot/` loopback scripts to be executed by `boot()`
        - `authentication.js` enables loopback authentication
        - `config.js` express configuraiton to be run before routes are defined
        - `explorer.js` loopback explorer
        - `rest-api.js` loopback rest api generator
        - `root.js` server redirect logic for angular routes and loopback router
    - `lib/` separation of some server logic into custom modules
        - `handler.js` custom error handler middleware
        - `mail.js` basic module wrapper for nodemailer integration
    - `datasources.json` - loopback datasources config
    - `model-config.json` - loopback data model config
    - `server.js` - node server with loopback integration
- `.tmp/` directory dedicated to temporary storage of development assets, contents not included in repository
- `package.json` Node dependencies
- `bower.json` Bower dependencies - see `app/bower_lib`
- `.bowerrc` Bower configuration - see `app/bower_lib`
- `.jshintrc` JS Hint configuration
- `gulpfile.js` Automates tasks for working locally and deploying. 
- `deploy.sh` Script to upload project to the remote host and restart the service. See **Deployment** section. 
- `.excludes` *deploy.sh* will ignore these files when rsync'ing to the remote host.
- `node-ctrl.sh` *deploy.sh* calles this script that runs on a Linux remote host which starts and stops node servers.
- `remote.sh` Tool to start and stop an express server manually and remotely.


## Coding Style

An EditorConfig file is provided to help maintain consistency of basic coding styles by all contributors. If your editor does not support `.editorconfig` files, please review the file and adjust your editor configuration manually.

## Code Annotations

Throughout the source code various code annotations are provided which identify TODO, BUG and NOTE items. These are typically included in code comment blocks for the contributors to review. Code Annotations should not span more than one line.

### TODO Items

TODOs are actionable work items and which identify missing or partially implemented work which requires completion.

__TODO Example__

    TODO: Add service call to Dropbox API`

### BUG Items

BUGs identify know bugs in the code base. A Git Issue may be created and referenced in the BUG declaration if required.

__BUG Example__

    BUG: Form validation broken, see Git Issue #123

### NOTE Items

NOTEs are brief messages within the source code to assist other contributors in understanding specific code or code usage. NOTEs may serve to compliment documentation and DocBlocks but should not replace them.

__NOTE Example__

    NOTE: Modules should only be included in module containers
