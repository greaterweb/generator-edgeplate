'use strict';

angular.module('edge.app.controllers')
    .controller('DashboardController', function (edgePage) {
        edgePage.setPageTitle('<%= appTitle %> &raquo; Dashboard');
        edgePage.setBodyClass('edge_page-dashboard');
    });
