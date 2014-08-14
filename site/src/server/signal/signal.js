// based off of webrtc.io
var _ = require('lodash'),
    HashList = require('./../hashList'),
    peerHandlers = require('./peerHandlers'),
    roomHandlers = require('./roomHandlers');

module.exports = (log, io) => {
  var rooms = new HashList('_roomName'),
      sockets = new HashList('id');

  io.sockets.on('connection', addSocket);

  function addSocket(socket) {
    log('New socket');
    sockets.push(socket);

    socket.emit('your_id', socket.id);

    socket.rooms = new HashList('_self');

    on(socket, peerHandlers(sockets));
    on(socket, roomHandlers(rooms, log));

    socket.on('disconnect', () => {
      log('disconnect', socket.id);
      sockets.removeObject(socket);
    });
  }

  function on(socket, handlers) {
    console.log(handlers);
    _.each(handlers, (handler, name) => {
      socket.on(name, data => handler(socket, data));
    });
  }

  return {
    rooms: rooms,
    sockets: sockets
  };
};