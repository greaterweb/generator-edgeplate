'use strict';

/*
    Daily Raisin LLC
    2013 - 2014
*/
//do this right away in the head so that when styles are loaded they’ll done immediately too (vs. doing this in angular where you’d wait for angular to bootstrap)
//add ie10 class to <html>
/* jshint ignore:start */
if(Function('/*@cc_on return document.documentMode===10@*/')()){
    document.documentElement.className += ' ie10 ie';
}
/* jshint ignore:end */

window.firefox = 'not-firefox';
window.OSName = 'unknown-os';

if(navigator.appVersion.indexOf('Win') !== -1) {
    window.OSName = 'windows';
}
else if(navigator.appVersion.indexOf('Mac') !== -1) {
    window.OSName = 'mac';
}
else if(navigator.appVersion.indexOf('Linux') !== -1) {
    window.OSName = 'linux';
}
else if(navigator.appVersion.indexOf('X11') !== -1) {
    window.OSName = 'unix';
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

    window.firefox = browserString;
}

document.documentElement.className = document.documentElement.className + ' ' +  window.OSName + ' ' + window.firefox;
