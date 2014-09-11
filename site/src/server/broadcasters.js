// Attaches itself to a socket.io namespace to handle orechestration
// of the broadcasters

var hashList = require('./../util/hashList'),
    emitter = require('./../util/emitter')(),
    _ = require('lodash');

module.exports = (log, io) => {
  var {emit, on, off} = emitter();

  var validTokens = [],
      channels = {},
      broadcasters = {},
      broadcasterCount = 0,
      idleBroadcasters = {},
      idleBroadcasterCount = 0;


  log('Mounting /broadcaster');
  io.of('/broadcaster').on('connection', socket => {

    _.each({
      'register':      data => register(socket, data.token),
      'stats':         data => receiveStats(socket, data),
      'source add':    data => sourceAdded(socket, data.channelName, data.peerID),
      'channel close': data => channelClosed(socket, data.channelName), // what is this supposed to be?
      'disconnect':    data => removeBroadcaster(socket)
    }, (handler, eventName) => {
      socket.on(eventName, handler);
    });

  });

  return {
    validTokens: validTokens, // Will be populated by someone else?
    broadcasters: broadcasters, // Do not modify externally!

    broadcastSource: broadcastSource,

    on,
    off
  };

  function register(socket, token) {
    if (!validate(token)) {
      socket.disconnect();
      return;
    }

    log('Validated Broadcaster', socket.id);

    addBroadcaster(socket);
  }

  function validate(token) {
    return _.contains(validTokens, token);
  }

  function addBroadcaster(socket) {
    socket.broadcaster = idleBroadcasters[socket.id] = broadcasters[socket.id] = {
      id: socket.id,
      socket: socket,
      channels: {},
      stats: {},
      pendingSources: {},
      emit: (name, data) => socket.emit(name, data)
    };

    broadcasterCount++;
    idleBroadcasterCount++;

    socket.emit('your_id', socket.id);

    emit('broadcaster add', {id: socket.id});
  }

  function removeBroadcaster(socket) {
    var id = socket.id,
        broadcaster = broadcasters[id];

    if (!broadcaster) return;

    delete broadcasters[id];
    broadcasterCount--;

    var idleBroadcaster = idleBroadcasters[id];
    if (idleBroadcaster) {
      delete idleBroadcasters[id];
      idleBroadcasterCount++;
    }

    log('disconnecting broadcaster', id);

    _.each(broadcaster.pendingSources, fns => {
      if (!fns || !fns.reject) {
        log.warn('Pending source fns missing', broadcaster.pendingSources, fns);
        return;
      }
      fns.reject('Broadcaster Disconnected');
    });
    _.each(broadcaster.channels, channel => channel.primaryBroadcaster = getBestBroadcaster(channel)); // this doesn't seem right

    emit('broadcaster remove', {id: id});
  }

  function recieveStats(socket, data) {
    var broadcaster = broadcasters[socket.id];

    if (!broadcaster) {
      log.warn('Tried to access non-existent broadcaster!');
      return;
    }

    _.extend(broadcaster.stats, data);
  }

  function sourceAdded(socket, channelName, peerID) {
    console.log(socket, channelName, peerID);
    var pendingChannelSources = socket.broadcaster.pendingSources[channelName];

    if (!pendingChannelSources) {
      log.warn('Adding source with no pending record', channelName, peerID);
      return;
    }
console.log(pendingChannelSources);
    var fns = pendingChannelSources[peerID];

    delete pendingChannelSources[peerID];
console.log('resolving', peerID, fns);
    fns.resolve(socket.broadcaster);
  }

  function channelClosed(socket) {

  }

  function broadcastSource(source) {
    log('broadcasting source');
    return new Promise((resolve, reject) => {
      log.info('Adding source', source);
      var {channelName, peerID} = source,
          broadcaster = getBroadcaster(channelName);

      if (!broadcaster) {
        reject('Couldn\'t find a broadcaster!');
        return;
      }

      log('getting pending', broadcaster.id, channelName);
      var pending = broadcaster.pendingSources[channelName] = broadcaster.pendingSources[channelName] || {};
      log('pending', pending);
      if (pending[peerID] !== undefined) {
        reject('Pending request');
        return;
      }

      pending[peerID] = {resolve, reject};

      log('notifying broadcaster', broadcaster.id);
      broadcaster.emit('add source', source); //Careful...we are passing a "user" passed variable straight out to our broadcaster...
    });
  }

  function getBroadcaster(channelName) {
    var channel = channels[channelName];

    if (!channel) {
      channel = {
        name: channelName
      };
      channels[channelName] = channel;
    }

    if (!channel.primaryBroadcaster) {
      var broadcaster = getBestBroadcaster(channel);
      channel.primaryBroadcaster = broadcaster;

      broadcaster.channels[channelName] = channel;
    }

    return channel.primaryBroadcaster; // Clean this up?
  }

  function getBestBroadcaster(channel) {
    console.log('getting best broadcaster');
    // For now, just grab one at random
    var broadcaster =_.sample(idleBroadcasters);

    if (broadcaster) {
      delete idleBroadcasters[broadcaster.id];
      idleBroadcasterCount--;
      return broadcaster;
    }
  }
};