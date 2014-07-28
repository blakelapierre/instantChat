var _ = require('lodash');

module.exports = function(router, signalStats) {
  var roomList = signalStats.rooms.asList();

  router.get('/rooms', function(req, res) {
    res.json({
      rooms: _.map(roomList, function(room) {
        return {
          name: room._roomName,
          participants: _.map(room.asList(), function(socket) {
            return {
              id: socket.id,
              image: socket.image
            };
          })
        };
      }) // horrible inefficient!
    });
  });
};