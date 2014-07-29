// based off of webrtc.io
var _ = require('lodash'),
    HashList = require('./hashList');

module.exports = ['log', 'io', (log, io) => {
  var rooms = new HashList('_roomName'),
      sockets = new HashList('id');

  io.sockets.on('connection', socket => {
    log('New socket');

    socket.emit('your_id', socket.id);

    socket.rooms = new HashList('_self');

    sockets.push(socket);

    socket.on('peer candidates', data => {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer candidates', {
          candidates: data.candidates,
          peerID: socket.id
        });
      }
    });

    socket.on('peer offer', data => {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer offer', {
          offer: data.offer,
          peerID: socket.id
        });
      }
    });

    socket.on('peer answer', data => {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer answer', {
          answer: data.answer,
          peerID: socket.id
        });
      }
    });

    socket.on('room join', roomName => joinRoom(socket, roomName));

    socket.on('room leave', roomName => leaveRoom(socket, roomName));

    socket.on('disconnect', () => {
      log('disconnect', socket.id);

      socket.rooms.forEach(roomName => leaveRoom(socket, roomName));

      sockets.removeObject(socket);
    });
  });

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

  return {
    rooms: rooms,
    sockets: sockets
  };
}];