var _ = require('lodash');

var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var getMediaDevices = navigator.getMediaDevices || (MediaStreamTrack && MediaStreamTrack.getSources ? (MediaStreamTrack.getSources) : () => { return []; });


module.exports = ['$q', '$timeout', ($q, $timeout) => {
  var promises = {};

  return {
    getStream: options => {
      options = options || {audio: true, video: true};

      var key = '';
      if (options.audio) key += 'audio';
      else if (options.audio && options.audio.optional) key += _.reduce(options.audio.optional, (key, source) => key + source.sourceId, key);
      if (options.video) key += 'video';
      else if (options.video && options.video.optional) key += _.reduce(options.video.optional, (key, source) => key + source.sourceId, key);

      console.log('#####stream key:', key);

      var createPromise = () => {
        console.log('creating promise', key);
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, options, stream => {
            promise.waitForEnd = new Promise((waitResolve, waitReject) => {
              var ended = () => {
                console.log('deleting promise', key);
                delete promises[key];
                waitResolve();
              };

              // Doesn't exist in FF 30.0 Linux
              if (stream.addEventListener) stream.addEventListener('ended', ended);
              else stream.onended = ended;

              console.log('got stream', stream);

              stream.__doneWithStream = _.once(() => {
                console.log('done with stream');
                promise.stopTimeout = $timeout(() => {
                  console.log('timedout');
                  promise.stopTimeout = null;
                  stream.stop();
                  promise.stopped = true;
                }, 1000);
              });

              resolve(stream);
            });
          }, reject);
        });
      };

      var promise = promises[key];

      if (promise) {
        if (promise.stopTimeout) {
          $timeout.cancel(promise.stopTimeout);
          delete promise.stopTimeout;
          return promise;
        }
        if (promise.stopped) {
          return promise.waitForEnd.then(() => promises[key] = createPromise());
        }
      }
      else {
        promise = createPromise();
        promises[key] = promise;
      }

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
}];