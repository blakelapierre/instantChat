module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', '$resource', ($scope, $resource) => {
      var Rooms = $resource('/rooms');

      console.log(rooms, {'get': {method: 'get', isArray: true}});

      var rooms = Rooms.get(null, function() {
        $scope.rooms = rooms.rooms;
        console.log('got rooms');
        console.log(rooms);
      });
    }]
  };
};