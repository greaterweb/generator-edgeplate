'use strict';

angular.module('edge.app.services').service('edgePage', function ($document, $rootScope) {
    this.title = $document.title;
    this.bodyClass = '';

    this.getPageTitle = function () {
        return this.title;
    };

    this.setPageTitle = function (title) {
        this.title = title;
        return this.title;
    };

    this.getBodyClass = function () {
        return this.bodyClass;
    };

    this.setBodyClass = function (className) {
        this.bodyClass = className;
        return this.bodyClass;
    };

    this.addBodyClass = function (className) {
        var bodyClass = (this.bodyClass).split(' ');
        bodyClass.push(className);
        this.bodyClass = bodyClass.join(' ');
        return this.bodyClass;
    };

    this.removeBodyClass = function (className) {
        var bodyClass = this.bodyClass.split(' ');
        while (bodyClass.indexOf(className) > -1) {
            bodyClass.splice(bodyClass.indexOf(className), 1);
        }
        this.bodyClass = bodyClass.join(' ');
        return this.bodyClass;
    };
});

