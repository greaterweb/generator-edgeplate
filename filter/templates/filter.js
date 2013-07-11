'use strict';

angular.module('edge.app.filters').filter('<%= name %>', function () {
    return function reverse(string) {
        return string.split("").reverse().join("");
    };
});
