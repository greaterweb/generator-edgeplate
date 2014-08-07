'use strict';

angular.module('edge.app.services').service('NProgress', function ($window) {
    var nprogress = this;
    nprogress = angular.extend(nprogress, $window.NProgress);
});
