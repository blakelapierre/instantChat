module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {},
    controller: ['$scope', '$interval', 'stats', ($scope, $interval, stats) => {
      stats.attach($scope);

      $scope.stats = {};

      $interval(updateStats, stats_update_delay);

      stats.get({}, stats => {
        $scope.stats.connected = stats.connected;
        console.log('stats', stats);
      });
    }]
  };
};