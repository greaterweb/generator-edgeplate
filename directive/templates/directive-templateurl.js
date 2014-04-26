'use strict';

angular.module('edge.app.directives').directive('<%= camelName %>', function () {
    return {
        templateUrl: 'directives/<%= camelName %>/<%= camelName %>View.html',
        replace: true,
        restrict: 'E',
        link: function postLink(scope, element, attrs) {
            element.text('<%= name %> - EdgePlate Directive');
        }
    };
});
