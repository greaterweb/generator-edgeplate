'use strict';

angular.module('edge.app.directives').directive('<%= name %>', function () {
    return {
        templateUrl: 'directives/<%= name %>/<%= name %>-view',
        replace: true,
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
            element.text('<%= name %> - EdgePlate Directive');
        }
    };
});
