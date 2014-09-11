module.exports = function(channel, peerConnection) {
  var listener = {
    channel: channel,
    peerConnection: peerConnection,
    status: 'disconnected',
    connectedAt: new Date()
  };

  _.each(channel.streams, function(stream) {
    listener.peerConnection.addStream(stream);
  });

  return listener;
};