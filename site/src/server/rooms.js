var _ = require('lodash');

module.exports = (router, signalStats) => {
  var roomList = signalStats.rooms.asList();

  router.get('/rooms', (req, res) => {
    res.json({
      rooms: _.map(roomList, room => {
        return {
          name: room._roomName,
          participants: _.map(room.asList(), socket => {
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