var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

module.exports = () => {
  var promise;

  return {
    getStream: options => {
      options = options || {audio: true, video: true};

      promise = promise || new Promise((resolve, reject) => getUserMedia.call(navigator, options, resolve, reject));

      return promise;
    }
  };
};