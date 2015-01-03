'use strict';
(function (window, document, navigator) {
    /*
        Daily Raisin LLC
        2013 - 2015
    */

    //do this right away in the head so that when styles are loaded they’ll done immediately too (vs. doing this in angular where you’d wait for angular to bootstrap)

    /* jshint evil:true */
    if(Function('/*@cc_on return document.documentMode===10@*/')()){
        //add ie10 class to <html>
        document.documentElement.className += ' ie10 ie';
    }
    /* jshint evil:false */

    var firefox = 'not-firefox';
    var OSName = 'unknown-os';

    if(navigator.appVersion.indexOf('Win') !== -1) {
        OSName = 'windows';
    }
    else if(navigator.appVersion.indexOf('Mac') !== -1) {
        OSName = 'mac';
    }
    else if(navigator.appVersion.indexOf('Linux') !== -1) {
        OSName = 'linux';
    }
    else if(navigator.appVersion.indexOf('X11') !== -1) {
        OSName = 'unix';
    }

    if((navigator.userAgent.indexOf('Firefox')) !== -1) {
        var browserString = 'firefox';
        var match = navigator.userAgent.match(/Firefox\/(\d+)(\.\d+(\.\d+)?)?/);
        if(match !== null) {
            var version = match[1];
            browserString += ' firefox' + version;
            if(version < 4) {
                browserString += ' firefoxlt4';
            }
            else {
                browserString += ' firefoxgte4';
            }
        }

        firefox = browserString;
    }

    document.documentElement.className = document.documentElement.className + ' ' +  OSName + ' ' + firefox;

}(window, document, navigator));
