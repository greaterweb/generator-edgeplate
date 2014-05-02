'use strict';

angular.module('edge.app.controllers').controller('<%= controllerName %>Controller', function () {
    var <%= controllerName.toLowerCase() %> = this;
    <%= controllerName.toLowerCase() %>.info = '<%= appTitle %> - <%= _.capitalize(name) %>';
});
