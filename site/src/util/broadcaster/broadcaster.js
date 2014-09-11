var Channel = require('./channel');

module.exports = function() {

  var broadcaster = {
    channels: {},
    channelCount: 0,

    addChannel: addChannel,
    addChannelSource: addChannelSource,
    removeChannelSource: removeChannelSource,

    addListener: addListener
  };

  return broadcaster;

  function addChannel(name) {
    var channel = broadcaster.channels[name];

    if (channel) {
      console.log('Tried to add channel that already exists!', name);
      return;
    }

    channel = broadcaster.channels[name] = Channel(name);

    return channel;
  }

  function addChannelSource(channelName, source) {
    var channel = getChannel(name) || addChannel(channelName);

    channel.addSource(source);
  }

  function removeChannelSource(channelName, source) {
    var channel = getChannel(name);

    if (!channel) {
      console.log('Tried to remove source from non-existent channel!', channelName, source);
    }
    else channel.removeSource(source);
  }

  function addListener(channelName, listenerPeer) {
    var channel = getChannel(channelName);

    if (!channel) {
      console.log('Tried to listen to non-existent channel!', channelName);
    }
    else channel.addListener(listenerPeer);
  }

  function getChannel(name) {
    return broadcaster.channels[name];
  }
};