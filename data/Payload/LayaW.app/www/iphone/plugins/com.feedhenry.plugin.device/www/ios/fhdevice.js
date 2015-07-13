cordova.define("com.feedhenry.plugin.device.fhdevice", function(require, exports, module) { var channel = require('cordova/channel'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    cordova = require('cordova');

/**
 * This provides additional device info that is not provided by the default cordova device object
 *  - cuidMap : an object containing a set of device ids (ios only)
 *  - uuid: an alternative uuid using either mac address hashing (below ios 6) or advertiserId (above ios 6)
 */
function FHDevice() {
    this.cuidMap = false;
    this.uuid = null;
    this.available = false;

    var me = this;

    channel.onCordovaReady.subscribe(function() {
        me.getInfo(function(info) {
           me.available = true;
           me.cuidMap = info.cuidMap;
           me.uuid = info.uuid;
           //keep backward compatible
           if(window.device){
             window.device.cordova_uuid = window.device.uuid;
             window.device.uuid = me.uuid;
             window.device.cuidMap = me.cuidMap;
           }
        },function(e) {
            me.available = false;
            utils.alert("[ERROR] Error initializing FHDevice: " + e);
        });
    });
}

/**
 * Get device info
 *
 * @param {Function} successCallback The function to call when the heading data is available
 * @param {Function} errorCallback The function to call when there is an error getting the heading data. (OPTIONAL)
 */
FHDevice.prototype.getInfo = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, "FHDevice", "getFHDeviceInfo", []);
};

module.exports = new FHDevice();
});
