module.exports = function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes, instantFile) => {
      element.find('input')[0].focus();
    },
    controller: ['$scope', '$location', ($scope, $location) => {
      $scope.joinChannel = () => {
        $location.path($scope.channelName);
      };
    }]
  };
};