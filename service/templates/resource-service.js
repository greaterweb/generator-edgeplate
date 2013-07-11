'use strict';

angular.module('edge.app.services').factory('<%= name %>', function ($resource) {
    return $resource('<%= endpoint %>');
});
