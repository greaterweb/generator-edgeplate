'use strict';
// Declare controllers module
angular.module('edge.app.controllers', []);

// Declare filters module
angular.module('edge.app.filters', []);

// Declare services module
angular.module('edge.app.services', ['ngResource','ngSanitize']);

// Declare directives module
angular.module('edge.app.directives', []);

// Declare app level module which depends on filters, and services
angular.module('edge.app', ['edge.app.controllers', 'edge.app.filters', 'edge.app.services', 'edge.app.directives'])

    .config(function ($locationProvider) {
        // disabling html5 mode until pre and post
        // config server options are implemented
        // $locationProvider.html5Mode(true);
        // $locationProvider.hashPrefix('!');
    })

    .config(function ($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: 'controllers/pages/Dashboard/DashboardView.html',
                controller: 'DashboardController as dashboard',
                resolve: {
                    app: ['$q', 'edgePage', function ($q, edgePage) {
                        var defer = $q.defer();
                        edgePage.setPageTitle('Dashboard &raquo; <%= appTitle %>');
                        edgePage.setBodyClass('edgePage-dashboard');
                        defer.resolve();
                        return defer.promise;
                    }]
                }
            })
            .otherwise({redirectTo: '/dashboard/'});
    });
