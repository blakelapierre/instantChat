module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ($scope, localMedia) => {
      localMedia
        .getDevices()
        .then(devices => {
          $scope.sources = devices;
        });
    }
  };
};