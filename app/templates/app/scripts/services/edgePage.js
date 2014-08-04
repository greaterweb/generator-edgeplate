'use strict';

angular.module('edge.app.services').service('edgePage', function ($document) {
    var edgePage = this;

    edgePage.pageConfig = function (config) {
        var defaults = {
            title: $document.title,
            htmlClass: '',
            bodyClass: '',
            navbarVisible: true,
            footerVisible: true
        };
        config = angular.extend(defaults, config);
        angular.forEach(defaults, function (value, item) {
            edgePage[item] = config[item];
        });
    };

    edgePage.title = $document.title;
    edgePage.getPageTitle = function () {
        return edgePage.title;
    };

    edgePage.setPageTitle = function (title) {
        edgePage.title = title;
        return edgePage.title;
    };

    edgePage.htmlClass = '';
    edgePage.getHtmlClass = function () {
        return edgePage.HtmlClass;
    };

    edgePage.setHtmlClass = function (className) {
        edgePage.htmlClass = className;
        return edgePage.htmlClass;
    };

    edgePage.addHtmlClass = function (className) {
        var htmlClass = (edgePage.htmlClass).split(' ');
        if (htmlClass.indexOf(className) === -1) {
            htmlClass.push(className);
        }
        edgePage.htmlClass = htmlClass.join(' ');
        return edgePage.htmlClass;
    };

    edgePage.removeHtmlClass = function (className) {
        var htmlClass = edgePage.htmlClass.split(' ');
        while (htmlClass.indexOf(className) > -1) {
            htmlClass.splice(htmlClass.indexOf(className), 1);
        }
        edgePage.htmlClass = htmlClass.join(' ');
        return edgePage.htmlClass;
    };

    edgePage.toggleHtmlClass = function (className) {
        var htmlClass = edgePage.htmlClass.split(' ');
        if (htmlClass.indexOf(className) > -1) {
            return edgePage.removeHtmlClass(className);
        } else {
            return edgePage.addHtmlClass(className);
        }
    };

    edgePage.bodyClass = '';
    edgePage.getBodyClass = function () {
        return edgePage.bodyClass;
    };

    edgePage.setBodyClass = function (className) {
        edgePage.bodyClass = className;
        return edgePage.bodyClass;
    };
    edgePage.addBodyClass = function (className) {
        var bodyClass = (edgePage.bodyClass).split(' ');
        if (bodyClass.indexOf(className) === -1) {
            bodyClass.push(className);
        }
        edgePage.bodyClass = bodyClass.join(' ');
        return edgePage.bodyClass;
    };

    edgePage.removeBodyClass = function (className) {
        var bodyClass = edgePage.bodyClass.split(' ');
        while (bodyClass.indexOf(className) > -1) {
            bodyClass.splice(bodyClass.indexOf(className), 1);
        }
        edgePage.bodyClass = bodyClass.join(' ');
        return edgePage.bodyClass;
    };

    edgePage.toggleBodyClass = function (className) {
        var bodyClass = edgePage.bodyClass.split(' ');
        if (bodyClass.indexOf(className) > -1) {
            return edgePage.removeBodyClass(className);
        } else {
            return edgePage.addBodyClass(className);
        }
    };

    edgePage.navbarVisible = false;
    edgePage.isNavbarVisible = function() {
        return edgePage.navbarVisible;
    };

    edgePage.showNavbar = function () {
        edgePage.navbarVisible = true;
    };

    edgePage.hideNavbar = function () {
        edgePage.navbarVisible = false;
    };

    edgePage.toggleNavbar = function () {
        edgePage.navbarVisible = !edgePage.navbarVisible;
    };

    edgePage.footerVisible = false;
    edgePage.isFooterVisible = function() {
        return edgePage.footerVisible;
    };

    edgePage.showFooter = function () {
        edgePage.footerVisible = true;
    };

    edgePage.hideFooter = function () {
        edgePage.footerVisible = false;
    };

    edgePage.toggleFooter = function () {
        edgePage.footerVisible = !edgePage.footerVisible;
    };
});
