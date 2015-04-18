"use strict";
var _ = require('lodash');
module.exports = (function(log, router, signalStats) {
  var roomList = signalStats.rooms.asList();
  log('Mounting /rooms');
  router.get('/rooms', (function(req, res) {
    res.json({rooms: _.map(roomList, (function(room) {
        return {
          name: room._roomName,
          participants: _.map(room.asList(), (function(socket) {
            return {
              id: socket.id,
              image: socket.image
            };
          }))
        };
      }))});
  }));
});
