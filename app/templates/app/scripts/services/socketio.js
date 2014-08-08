'use strict';

angular.module('edge.app.services').service('socketio', function ($window) {
    var socketio = this;
    socketio.socket = $window.io.connect();
    socketio.socket.on('msg', function (data) {
        console.log('socketio', data);
    });
});
