// based off of webrtc.io
var _ = require('lodash'),
    HashList = require('./../../util/hashList'),
    peerHandlers = require('./peerHandlers'),
    roomHandlers = require('./roomHandlers');

module.exports = (log, io, broadcastController) => {
  var rooms = new HashList('_roomName'),
      sockets = new HashList('id');

  io.of('/signal').on('connection', addSocket);

  function addSocket(socket) {
    log.debug('New socket');
    sockets.push(socket);

    on(socket, peerHandlers(sockets));
    on(socket, roomHandlers(rooms, log, broadcastController));

    socket.on('disconnect', () => {
      log.debug('disconnect', socket.id);
      sockets.removeObject(socket);
    });

    socket.rooms = new HashList('_self');

    socket.emit('your_id', socket.id);
  }

  function on(socket, handlers) {
    log.debug(handlers);
    _.each(handlers, (handler, name) => {
      socket.on(name, data => handler(socket, data));
    });
  }

  return {
    rooms: rooms,
    sockets: sockets
  };
};