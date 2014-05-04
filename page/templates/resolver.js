'use strict';

angular.module('edge.app.services').constant('<%= controllerName %>Resolver', {
    meta: ['edgePage', function (edgePage) {
        edgePage.pageConfig({
            title: '<%= _.capitalize(name) %> &raquo; <%= appTitle %>',
            bodyClass: 'edgePage-<%= _.ltrim(_.dasherize(controllerName), '-') %>'
        });
    }]
});
