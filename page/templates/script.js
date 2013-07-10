'use strict';

angular.module('edge.app.controllers').controller('<%= controllerName %>Controller', function (edgePage) {
    edgePage.setPageTitle('<%= appTitle %> &raquo; <%= _.capitalize(name) %>');
    edgePage.setBodyClass('page-<%= _.ltrim(_.dasherize(controllerName), '-') %>');
});
