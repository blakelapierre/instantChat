var _ = require('lodash');

module.exports = (log, router, signalStats) => {
  var roomList = signalStats.rooms.asList();

  log('Mounting /rooms');
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