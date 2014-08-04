'use strict';

angular.module('edge.app.services').constant('IndexResolver', {
    meta: ['edgePage', function (edgePage) {
        edgePage.pageConfig({
            title: 'Edgeplate Project',
            bodyClass: 'edgePage-index'
        });
    }]
});
