// based off of webrtc.io
var _ = require('lodash'),
    HashList = require('./hashList');

module.exports = function(io) {
  var rooms = new HashList('_roomName'),
      sockets = new HashList('id');

  io.sockets.on('connection', function(socket) {
    socket.emit('your_id', socket.id);

    socket.rooms = new HashList('_self');

    sockets.push(socket);

    socket.on('ice_candidate', function(data) {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer ice_candidate', {
          label: data.label,
          candidate: data.candidate,
          peerID: socket.id
        });
      }
    });

    socket.on('peer offer', function(data) {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer offer', {
          offer: data.offer,
          peerID: socket.id
        });
      }
    });

    socket.on('peer answer', function(data) {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer answer', {
          answer: data.answer,
          peerID: socket.id
        });
      }
    });

    socket.on('room join', function(roomName) { joinRoom(socket, roomName); });

    socket.on('room leave', function(roomName) { leaveRoom(socket, roomName); });

    socket.on('disconnect', function() {
      console.log('disconnect', socket.id);

      socket.rooms.forEach(function(roomName) { leaveRoom(socket, roomName); });

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

    room.forEach(function(peerSocket) { peerSocket.emit('peer join', socket.id); });

    socket.emit('peer list', {
      roomName: roomName,
      peerIDs: _.pluck(room.asList(), 'id')
    });

    room.push(socket);

    socket.rooms.push(roomName);
    console.log('join', roomName, socket.id);
  }

  function leaveRoom(socket, roomName) {
    console.log('leave', roomName, socket.id);
    var room = rooms.getByID(roomName);

    if (room === null) {
      console.log('Tried to leave non-existent room', roomName);
      return;
    }

    room.removeObject(socket);

    socket.rooms.removeByID(roomName);

    room.forEach(function(peerSocket) { peerSocket.emit('peer leave', socket.id); });

    if (room.length() === 0) rooms.removeByID(roomName);
  }

  return {
    rooms: rooms,
    sockets: sockets
  };
};