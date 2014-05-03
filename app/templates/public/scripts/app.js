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
angular.module('edge.app', ['ui.router', 'ngSanitize', 'ngAnimate', 'edge.app.controllers', 'edge.app.filters', 'edge.app.services', 'edge.app.directives'])

    //.config(function ($locationProvider) {
    //    // disabling html5 mode until pre and post
    //    // config server options are implemented
    //    // $locationProvider.html5Mode(true);
    //    // $locationProvider.hashPrefix('!');
    //})

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'controllers/pages/Index/IndexView.html',
                controller: 'IndexController as index',
                resolve: {
                    app: ['$q', 'edgePage', function ($q, edgePage) {
                        edgePage.pageConfig({
                            title: 'Edgeplate Project',
                            bodyClass: 'edgePage-index'
                        });
                    }]
                }
            });
        $urlRouterProvider.otherwise('/');
    });
