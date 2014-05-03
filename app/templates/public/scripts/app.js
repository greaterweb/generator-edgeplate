'use strict';
// Declare controllers module
angular.module('edge.app.controllers', []);

// Declare filters module
angular.module('edge.app.filters', []);

// Declare services module
angular.module('edge.app.services', ['ngResource']);

// Declare directives module
angular.module('edge.app.directives', []);

// Declare app level module which depends on filters, and services
angular.module('edge.app', ['ngRoute', 'ngSanitize', 'ngAnimate', 'edge.app.controllers', 'edge.app.filters', 'edge.app.services', 'edge.app.directives'])

    //.config(function ($locationProvider) {
    //    // disabling html5 mode until pre and post
    //    // config server options are implemented
    //    // $locationProvider.html5Mode(true);
    //    // $locationProvider.hashPrefix('!');
    //})

    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'controllers/pages/Index/IndexView.html',
                controller: 'IndexController as index',
                resolve: {
                    app: ['$q', 'edgePage', function ($q, edgePage) {
                        var defer = $q.defer();
                        edgePage.pageConfig({
                            title: 'Edgeplate Project',
                            bodyClass: 'edgePage-index'
                        });
                        defer.resolve();
                        return defer.promise;
                    }]
                }
            })
            .otherwise({redirectTo: '/'});
    });
