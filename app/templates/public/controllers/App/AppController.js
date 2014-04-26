'use strict';

angular.module('edge.app.controllers').controller('AppController', function (edgePage, $scope) {
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
});
