var _ = require('lodash'),
    HashList = require('./../../util/hashList');

module.exports = (rooms, log, broadcastController) => {
  return {
    'room join': joinRoom,
    'room leave': leaveRoom,
    'room admin': adminRoom,
    'disconnect': disconnect
  };

  function joinRoom(socket, roomName) {
    var room = rooms.getByID(roomName);

    if (room === null) {
      room = new HashList('id');

      _.extend(room, {
        '_roomName': roomName,
        '_creator': socket.id,
        '_createdAt': new Date(),
        '_admin': socket.id
      });

      rooms.push(room);
    }

    if (room._broadcaster) {
      socket.emit('peer list', {roomName, peerIDs: [room._broadcaster.id]});
    }
    else {
      room.forEach(peerSocket => peerSocket.emit('peer join', {room: roomName, id: socket.id}));

      socket.emit('peer list', {
        roomName: roomName,
        peerIDs: _.pluck(room.asList(), 'id')
      });
    }

    room.push(socket);

    socket.rooms.push(roomName);
    log('join', roomName, socket.id);
  }

  function leaveRoom(socket, roomName) {
    log('leave', roomName, socket.id);
    var room = rooms.getByID(roomName);

    if (room == null) {
      log.warn('Tried to leave non-existent room', roomName);
      return;
    }

    room.removeObject(socket);

    socket.rooms.removeByID(roomName);

    room.forEach(peerSocket => peerSocket.emit('peer leave', {room: roomName, id: socket.id}));

    if (room.length() === 0) rooms.removeByID(roomName);
    else if (room._admin == socket.id) {
      var newAdmin = room.at(0);
      room._admin = newAdmin ? newAdmin.id : undefined;
    }
  }

  function adminRoom(socket, data) {
    console.log('got admin request', data);
    var roomName = data.roomName,
        room = rooms.getByID(roomName);

    if (room == null) {
      log.warn('Tried to admin non-existent room', roomName, socket.id);
      return;
    }

    if (socket.id != room._admin) {
      log.warn('Tried to admin room where not admin', roomName, socket.id, data);
      return;
    }

    switch (data.command) {
      case 'broadcast':
        broadcastController
          .broadcastSource({channelName: roomName, peerID: socket.id})
          .then(broadcaster => {
            room._broadcaster = broadcaster;
            socket.emit('broadcast ready', {broadcasterID: broadcaster.id});
          })
          .catch(error => {
            log.warn('broadcastSource error', error);
            new Error(error);
            socket.emit('broadcast error', {msg: 'Failed to attach to broadcaster'});
          });
        break;
    }
  }

  function disconnect(socket) {
    log.debug('disconnect', arguments);
    socket.rooms.forEach(roomName => leaveRoom(socket, roomName));
  }
};