module.exports = sockets => {
  return {
    'peer candidates': (socket, data) => {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer candidates', {
          candidates: data.candidates,
          peerID: socket.id
        });
      }
    },
    'peer offer': (socket, data) => {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer offer', {
          offer: data.offer,
          peerID: socket.id
        });
      }
    },
    'peer answer': (socket, data) => {
      var peerSocket = sockets.getByID(data.peerID);

      if (peerSocket) {
        peerSocket.emit('peer answer', {
          answer: data.answer,
          peerID: socket.id
        });
      }
    }
  };
};