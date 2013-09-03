'use strict';

var path = require('path');

exports.routes = function() {

    var appPath = path.resolve(__dirname + '/public');

    return {

        'get' : {
            // get routes
            '/<%= _.slugify(appTitle) %>': function(req, res, next){
                res.send('<%= appTitle %>, Another WK ATG App.');
            }
        }

    };
};
