'use strict';

angular.module('edge.app.services').service('edgeResolver', function ($rootScope) {
    var edgeResolver = this;

    // run once
    // NOTE: becuase appResolvers are run 1 time and done, they are not expected
    // to be injected as dependencies to a route controller
    var appResolversAdded = false;
    var appResolvers = { };

    // run with each route
    var commonResolversAdded = false;
    var commonResolvers = { };

    function removeAppResolvers(route) {
        if (appResolversAdded) {
            appResolversAdded = false;
            angular.forEach(appResolvers, function (resolver, key) {
                delete route.resolve[key];
            });
        }
    }

    edgeResolver.addAppResolver = function (key, resolver) {
        appResolvers[key] = resolver;
    };

    edgeResolver.addAppResolvers = function (resolvers) {
        appResolvers = angular.extend(resolvers, appResolvers);
    };

    edgeResolver.addCommonResolver = function (key, resolver) {
        commonResolvers[key] = resolver;
    };

    edgeResolver.addCommonResolvers = function (resolvers) {
        commonResolvers = angular.extend(resolvers, commonResolvers);
    };

    edgeResolver.removeAppResolver = function (key) {
        delete appResolvers[key];
    };

    edgeResolver.removeCommonResolver = function (key) {
        delete commonResolvers[key];
    };

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
        if (!fromState.name) {
            // add resolvers
            appResolversAdded = true;
            angular.forEach(appResolvers, function (resolver, key) {
                toState.resolve[key] = resolver;
            });
        }
        if (!commonResolversAdded) {
            angular.forEach(commonResolvers, function (resolver, key) {
                toState.resolve[key] = resolver;
            });
        }
    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        removeAppResolvers(toState);
    });
    $rootScope.$on('$stateNotFound', function (event, unfoundState) {
        removeAppResolvers(unfoundState);
    });
});
