import {Stream} from '../rtc/stream'; // get rid of this!

module.exports = function(channel, peer) {
  var listener = {
    channel: channel,
    peer: peer,
    status: 'disconnected',
    connectedAt: new Date()
  };

  _.each(channel.streams, function(stream) {
    listener.peer.forwardStream(new Stream(peer, stream));
  });

  return listener;
};