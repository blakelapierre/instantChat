"use strict";
module.exports = (function(sockets) {
  return {
    'peer offer': buildForwardFn('offer'),
    'peer answer': buildForwardFn('answer'),
    'peer candidates': buildForwardFn('candidates')
  };
  function buildForwardFn(name) {
    var messageName = 'peer ' + name;
    return (function(socket, data) {
      var peerSocket = sockets.getByID(data.peerID);
      if (peerSocket) {
        var forwardedMessage = {peerID: socket.id};
        forwardedMessage[name] = data[name];
        peerSocket.emit(messageName, forwardedMessage);
      }
    });
  }
});
