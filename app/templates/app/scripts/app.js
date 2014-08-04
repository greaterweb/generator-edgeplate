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
angular.module('edge.app', ['ui.router', 'ngSanitize', 'ngAnimate', 'edge.app.controllers', 'edge.app.filters', 'edge.app.services', 'edge.app.directives'<% if (edgeplate.features.cordova) { %>, 'edge.cordova'<% } %>])
    .config(function ($locationProvider, $stateProvider, $urlRouterProvider, $injector) {
        if(angular.element('html').hasClass('hashchange') && angular.element('html').hasClass('history')<% if (edgeplate.features.cordova) { %> && window.ENV !== 'cordova'<% } %>) {
            $locationProvider.html5Mode(true);
        }

        $stateProvider
            .state('index', {
                url: '/',
                templateUrl: 'controllers/pages/Index/IndexView.html',
                controller: 'IndexController as index',
                resolve: $injector.get('IndexResolver')
            });
        $urlRouterProvider.otherwise('/');
    })<% if (edgeplate.features.cordova) { %>
    .run(function ($rootScope, $window) {
        $rootScope.$on('cordova.deviceready', function () {
            if ($window.StatusBar) {
                $window.StatusBar.overlaysWebView(false);
            }
        });
    })<% } %>;
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
    // });

