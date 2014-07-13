'use strict';

angular.module('edge.cordova', [])
    .run(function ($document, $rootScope) {
        var events = [
            'deviceready',
            'pause',
            'resume',
            'backbutton',
            'menubutton',
            'searchbutton',
            'startcallbutton',
            'endcallbutton',
            'volumedownbutton',
            'volumeupbutton'
        ];
        events.forEach(function (eventName) {
            $document[0].addEventListener(eventName, function (e) {
                $rootScope.$broadcast('cordova.' + eventName, e);
            }, false);
        });
    });
