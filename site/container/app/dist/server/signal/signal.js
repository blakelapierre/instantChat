"use strict";
var _ = require('lodash'),
    HashList = require('./../../util/hashList'),
    peerHandlers = require('./peerHandlers'),
    roomHandlers = require('./roomHandlers');
module.exports = (function(log, io, broadcastController) {
  var rooms = new HashList('_roomName'),
      sockets = new HashList('id');
  io.of('/signal').on('connection', addSocket);
  function addSocket(socket) {
    log.debug('New socket');
    sockets.push(socket);
    on(socket, peerHandlers(sockets));
    on(socket, roomHandlers(rooms, log, broadcastController));
    socket.on('disconnect', (function() {
      log.debug('disconnect', socket.id);
      sockets.removeObject(socket);
    }));
    socket.rooms = new HashList('_self');
    socket.emit('your_id', socket.id);
  }
  function on(socket, handlers) {
    log.debug(handlers);
    _.each(handlers, (function(handler, name) {
      socket.on(name, (function(data) {
        return handler(socket, data);
      }));
    }));
  }
  return {
    rooms: rooms,
    sockets: sockets
  };
});
