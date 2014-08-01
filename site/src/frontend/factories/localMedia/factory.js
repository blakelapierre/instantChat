var _ = require('lodash');

var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var getMediaDevices = navigator.getMediaDevices || (MediaStreamTrack && MediaStreamTrack.getSources ? (MediaStreamTrack.getSources) : () => { return []; });


module.exports = ($q) => {
  var promise;

  return {
    getStream: options => {
      options = options || {audio: true, video: true};

      promise = promise || new Promise((resolve, reject) => {
        getUserMedia.call(navigator, options, stream => {
          if (stream.addEventListener) { // Doesn't exist in FF 30.0 Linux
            stream.addEventListener('ended', () => promise = null);
          }
          else {
            stream.onended = () => promise = null;
          }
          resolve(stream);
        }, reject);
      });

      return promise;
    },
    getDevices: () => {
      var deferred = $q.defer();

      getMediaDevices(devices => {
        var ret = {audio:[], video: []};
        _.each(devices, device => {
          if (device.kind == 'audio') ret.audio.push(device);
          else if (device.kind == 'video') ret.video.push(device);
        });
        deferred.resolve(ret);
      });

      return deferred.promise;
    }
  };
};