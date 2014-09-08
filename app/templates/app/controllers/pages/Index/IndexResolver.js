'use strict';

angular.module('edge.app.services').constant('IndexResolver', /* @ngInject */ {
    meta: function (edgePage) {
        edgePage.pageConfig({
            title: 'Edgeplate Project',
            bodyClass: 'edgePage-index'
        });
    }
});
