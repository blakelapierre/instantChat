var Listener = require('./listener');

module.exports = name => {
  var channel;
  var {
    sources,
    dataChannels,
    streams,
    listeners
  } = channel ={
    name: name,

    sources: {},
    sourceCount: 0,

    dataChannels: {},
    dataChannelCount: 0,

    streams: [],
    listeners: [],

    addSource: addSource,
    removeSource: removeSource,

    addListener: addListener
  };

  console.log(sources, dataChannels, streams, listeners);

  return channel;

  // source should be a Peer
  function addSource(source) {
    var id = source.id;

    sources[id] = source;
    channel.sourceCount++;

    _.each(source.remoteStreams, stream => {
      streams.push(stream);
      _.each(listeners, listener => {
        listener.peer.forwardStream(stream);
      });
    });

    source.on({
      'data_channel':  dataChannelListener,
      'add_stream':    addStreamListener,
      'remove_stream': removeStreamListener
    });

    // need to handle disconnected sources
  }

  function removeSource(source) {
    var index = sources.indexOf(source);

    if (index == -1) return;

    source.splice(index, 1);
  }

  // Not complete!!
  function dataChannelListener(event) {
    var dataChannel = event.dataChannel;

    var forwarder = {

    };

    dataChannels[dataChannel];
    dataChannelCount++;

    _.each(channel.listeners, function(listener) {
      listener.peerConnection.addDataChannel(dataChannel);
    });
  }

  function addStreamListener(event) {
    var stream = event.stream;

    if (stream) {
      channel.streams.push(stream);
      channel.streamCount++;

      _.each(channel.listeners, function (listener) {
        listener.peerConnection.addStream(stream); // Probably need something more complex here :(
      });
    }
  }

  function removeStreamListener(event) {
    var stream = event.stream;

    if (stream) {
      var removed = _.remove(channel.streams, stream);

      channel.streamCount -= removed.length;

      _.each(channel.listeners, function(listener) {
        _.each(removed, function(stream) {
          listener.peerConnection.removeStream(stream);
        });
      });
    }
  }

  function addListener(listenerPeer) {
    var listener = Listener(channel, listenerPeer);
    channel.listeners.push(listener);
    return listener;
  }
};