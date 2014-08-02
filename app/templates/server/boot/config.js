'use strict';
module.exports = function config (server) {
    // Express configuration before routes
    //
    // as long as proxied through apache, apache handles the log files for analytics, so we can use express's dev logging for debugging
    //
    // npm install --save morgan
    // server.use(server.loopback.logger('dev'));
    //
    // npm install --save cookie-parser
    // server.use(server.loopback.cookieParser('cookies-rock'));
    //
    // npm install --save method-override
    // server.use(server.loopback.methodOverride());
    server.use(server.loopback.compress()); //gzip, equivalent to apache's mod_deflate
};
