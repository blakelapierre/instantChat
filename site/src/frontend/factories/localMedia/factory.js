var _ = require('lodash');

var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

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
    getSources: () => {
      var deferred = $q.defer();

      MediaStreamTrack.getSources(sources => {
        var ret = {audio:[], video: []};
        _.each(sources, source => {
          if (source.kind == 'audio') ret.audio.push(source);
          else if (source.kind == 'video') ret.video.push(source);
        });
        deferred.resolve(ret);
      });

      return deferred.promise;
    }
  };
};