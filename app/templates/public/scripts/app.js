'use strict';
// Declare controllers module
angular.module('edge.app.controllers', []);

// Declare filters module
angular.module('edge.app.filters', []);

// Declare services module
angular.module('edge.app.services', ['ngResource', 'lbServices']);

// Declare directives module
angular.module('edge.app.directives', []);

// Declare app level module which depends on filters, and services
angular.module('edge.app', ['ui.router', 'ngSanitize', 'ngAnimate', 'edge.app.controllers', 'edge.app.filters', 'edge.app.services', 'edge.app.directives'])

    //.config(function ($locationProvider) {
    //    // disabling html5 mode until pre and post
    //    // config server options are implemented
    //    // $locationProvider.html5Mode(true);
    //    // $locationProvider.hashPrefix('!');
    //})

    // .run(function (edgeResolver) {
    //     // example adding app resolvers (runs once start of first state chane)
    //     edgeResolver.addAppResolvers({
    //         delay: ['$q', '$timeout', function ($q, $timeout) {
    //             var defer = $q.defer();
    //             $timeout(function() {
    //                 defer.resolve();
    //             }, 500);
    //             return defer.promise;
    //         }]
    //     });
    //     // example adding common resolvers (runs every state change)
    //     edgeResolver.addCommonResolvers({
    //         delay: ['$q', '$timeout', function ($q, $timeout) {
    //             var defer = $q.defer();
    //             $timeout(function() {
    //                 defer.resolve();
    //             }, 500);
    //             return defer.promise;
    //         }]
    //     });
    // })

    .config(function ($stateProvider, $urlRouterProvider, $injector) {
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'controllers/pages/Index/IndexView.html',
                controller: 'IndexController as index',
                resolve: $injector.get('IndexResolver')
            });
        $urlRouterProvider.otherwise('/');
    });
