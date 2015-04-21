module.exports = () => {
  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');

  function captureFrame(video, options, callback, iterations) {
    options = options || {};
    iterations = iterations || 0;

    canvas.width = video.videoSurfaceWidth;
    canvas.height = video.videoSurfaceHeight;

    if (options.width && !options.height) {
      options.height = options.width * (canvas.height / canvas.width);
    }
    else if (!options.width && options.height) {
      options.width = options.height * (canvas.width / canvas.width);
    }

    options.width = options.width || canvas.width;
    options.height = options.height || canvas.height;

    canvas.width = options.width;
    canvas.height = options.height;

    try {
      context.drawImage(video, 0, 0, options.width, options.height);
      callback(canvas.toDataURL());
    }
    catch (e) {
      // There is a FF bug that causes this to fail intermitently. Workaround is to just retry later...
      if (e.name == 'NS_ERROR_NOT_AVAILABLE' && iterations < 5) {
        setTimeout(captureFrame, 100, video, options, callback, iterations + 1);
      }
      else throw e;
    }
  }

  return {
    captureFrame: captureFrame
  };
};