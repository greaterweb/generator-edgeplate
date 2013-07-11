'use strict';

angular.module('edge.app.directives').directive('<%= name %>', function () {
    return {
        template: '<div></div>',
        restrict: 'E',
        replace: true,
        link: function postLink(scope, element, attrs) {
            element.addClass('<%= _.ltrim(_.dasherize(name), '-') %>-directive');
            element.text('<%= name %> - EdgePlate Directive');
        }
    };
});
