'use strict';

angular.module('edge.app.directives').directive('<%= camelName %>', function () {
    return {
        template: '<div></div>',
        restrict: 'E',
        replace: true,
        link: function postLink(scope, element, attrs) {
            element.addClass('<%= name %>-directive');
            element.text('<%= camelName %> - EdgePlate Directive');
        }
    };
});
