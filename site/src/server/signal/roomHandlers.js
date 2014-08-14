var _ = require('lodash'),
    HashList = require('./../hashList');

module.exports = (rooms, log) => {
  return {
    'room join': joinRoom,
    'room leave': leaveRoom,
    'disconnect': disconnect
  };

  function joinRoom(socket, roomName) {
    var room = rooms.getByID(roomName);

    if (room === null) {
      room = new HashList('id');
      room._roomName = roomName;
      rooms.push(room);
    }

    room.forEach(peerSocket => peerSocket.emit('peer join', socket.id));

    socket.emit('peer list', {
      roomName: roomName,
      peerIDs: _.pluck(room.asList(), 'id')
    });

    room.push(socket);

    socket.rooms.push(roomName);
    log('join', roomName, socket.id);
  }

  function leaveRoom(socket, roomName) {
    log('leave', roomName, socket.id);
    var room = rooms.getByID(roomName);

    if (room === null) {
      log('Tried to leave non-existent room', roomName);
      return;
    }

    room.removeObject(socket);

    socket.rooms.removeByID(roomName);

    room.forEach(peerSocket => peerSocket.emit('peer leave', socket.id));

    if (room.length() === 0) rooms.removeByID(roomName);
  }

  function disconnect(socket) {
    console.log(arguments);
    socket.rooms.forEach(roomName => leaveRoom(socket, roomName));
  }
};