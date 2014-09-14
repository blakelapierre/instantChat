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
      'remove_stream': removeStreamListener,
      'disconnected':  removeSource
    });

    // need to handle disconnected sources
  }

  function removeSource(source) {
    console.log('source disconnected');

    delete sources[source.id];

    _.each(channel.listeners, function(listener) {

    });
  }

  // Not complete!!
  function dataChannelListener(event) {
    var dataChannel = event.dataChannel;

    var forwarder = {

    };

    dataChannels[dataChannel];
    dataChannelCount++;

    _.each(channel.listeners, function(listener) {
      listener.peer.addDataChannel(dataChannel);
    });
  }

  function addStreamListener(event) {
    var stream = event.stream;

    if (stream) {
      channel.streams.push(stream);
      channel.streamCount++;

      _.each(channel.listeners, function (listener) {
        listener.peer.addStream(stream); // Probably need something more complex here :(
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
          listener.peer.removeStream(stream);
        });
      });
    }
  }

  function addListener(listenerPeer) {
    var listener = Listener(channel, listenerPeer);
    channel.listeners.push(listener);

    listenerPeer.on('disconnect', () => {
      console.log('listener disconnected');
      var index = channel.listeners.indexOf(listener);
      if (index != -1) channel.listeners.splice(index, 1);
    });
    return listener;
  }
};