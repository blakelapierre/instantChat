module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', 'instantChat', ($scope, instantChat) => {
      $scope.status = instantChat.status;

      instantChat.on('statusChange', status => {
        $scope.$apply(() => {
          $scope.status = status;
        });
      });
    }]
  };
};