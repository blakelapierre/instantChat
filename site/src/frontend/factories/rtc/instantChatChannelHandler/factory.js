module.exports = () => {
  return $scope => {
    return channel => {

      function message(channel, event) {
        var message = JSON.parse(event.data);
      }

      function open(channel) {

      }

      function close(channel) {

      }

      function error(channel, error) {

      }

      return {
        'message': message,
        'open': open,
        'close': close,
        'error': error
      };
    };
  };
};