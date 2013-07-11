'use strict';

angular.module('edge.app.services').factory('edgePage', function ($document, $rootScope) {
    var edgePage = {};

    edgePage.getTitle = function () {
        return ($rootScope.page && $rootScope.page.title) ? $rootScope.page.title : $document.title;
    };

    edgePage.setPageTitle = function (title) {
        $rootScope.page = $rootScope.page || {};
        $rootScope.page.title = title;
        return title;
    };

    edgePage.getBodyClass = function () {
        return ($rootScope.page && $rootScope.page.bodyClass) ? $rootScope.page.bodyClass : '';
    };

    edgePage.setBodyClass = function (className) {
        $rootScope.page = $rootScope.page || {};
        $rootScope.page.bodyClass = className;
        return className;
    };

    return edgePage;
});
