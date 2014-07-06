'use strict';

angular.module('edge.app.controllers').controller('AppController', function (edgePage, $scope, $timeout, NProgress) {
    var app = this;
    app.edgePage = edgePage;

    $scope.$watch(function() {
        app.showNavbar = edgePage.isNavbarVisible();
        if (app.showNavbar) {
            edgePage.addHtmlClass('has-app-header');
        } else {
            edgePage.removeHtmlClass('has-app-header');
        }

        app.showFooter = edgePage.isFooterVisible();
        if (app.showFooter) {
            edgePage.addHtmlClass('has-app-footer');
        } else {
            edgePage.removeHtmlClass('has-app-footer');
        }
    });

    app.collapseNavbar = true;
    app.toggleNavbar = function () {
        app.collapseNavbar = !app.collapseNavbar;
    };

    var loaderTimeout;
    $scope.$on('$stateChangeStart', function () {
        if(loaderTimeout) {
            $timeout.cancel(loaderTimeout);
        }
        loaderTimeout = $timeout(function() {
            NProgress.start();
            NProgress.inc();
        }, 250);
    });
    $scope.$on('$stateChangeSuccess', function () {
        $timeout.cancel(loaderTimeout);
        NProgress.done();
    });
    $scope.$on('$stateNotFound', function () {
        $timeout.cancel(loaderTimeout);
        NProgress.done();
    });
});
