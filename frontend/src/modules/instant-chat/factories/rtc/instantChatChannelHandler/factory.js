module.exports = () => {
  return $scope => {
    return channel => {
      return {
        message,
        open,
        close,
        error
      };


      function message(channel, event) {
        const msg = JSON.parse(event.data);
      }

      function open(channel) {

      }

      function close(channel) {

      }

      function error(channel, err) {

      }
    };
  };
};