var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

module.exports = ($q) => {
  var promise;

  return {
    getStream: options => {
      options = options || {audio: true, video: true};

      promise = promise || new Promise((resolve, reject) => getUserMedia.call(navigator, options, resolve, reject));

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