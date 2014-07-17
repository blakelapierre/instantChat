module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', '$resource', '$interval', ($scope, $resource, $interval) => {
      var Rooms = $resource('/rooms');

      function getRooms() {
        Rooms.get(null, rooms => $scope.rooms = rooms.rooms);
      }

      $interval(getRooms, 30000);
      getRooms();
    }]
  };
};