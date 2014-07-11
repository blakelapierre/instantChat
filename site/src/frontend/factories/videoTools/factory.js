module.exports = () => {
  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
  return {
    captureFrame: (video, options) => {
      options = options || {};

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

      context.drawImage(video, 0, 0, options.width, options.height);

      return canvas.toDataURL();
    }
  };
};