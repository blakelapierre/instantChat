"use strict";
var hashList = require('./../util/hashList'),
    emitter = require('./../util/emitter')(),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');
var logPath = path.join('logs', 'broadcasters');
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath);
}
module.exports = (function(log, io) {
  var $__0 = $traceurRuntime.assertObject(emitter()),
      emit = $__0.emit,
      on = $__0.on,
      off = $__0.off;
  var validTokens = [],
      channels = {},
      broadcasters = {},
      broadcasterCount = 0,
      idleBroadcasters = {},
      idleBroadcasterCount = 0;
  log('Mounting /broadcaster');
  io.of('/broadcaster').on('connection', (function(socket) {
    _.each({
      'register': (function(data) {
        return register(socket, data.token);
      }),
      'stats': (function(data) {
        return receiveStats(socket, data);
      }),
      'source add': (function(data) {
        return sourceAdded(socket, data.channelName, data.peerID);
      }),
      'channel close': (function(data) {
        return channelClosed(socket, data.channelName);
      }),
      'disconnect': (function(data) {
        return removeBroadcaster(socket);
      })
    }, (function(handler, eventName) {
      socket.on(eventName, handler);
    }));
  }));
  return {
    validTokens: validTokens,
    broadcasters: broadcasters,
    broadcastSource: broadcastSource,
    on: on,
    off: off
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
      emit: (function(name, data) {
        return socket.emit(name, data);
      }),
      log: new Promise((function(resolve, reject) {
        fs.open(path.join('logs', 'broadcasters', socket.id), 'a', (function(err, fd) {
          if (err)
            reject(err);
          else
            resolve(fd);
        }));
      }))
    };
    broadcasterCount++;
    idleBroadcasterCount++;
    socket.emit('your_id', socket.id);
    emit('broadcaster add', {id: socket.id});
  }
  function removeBroadcaster(socket) {
    var id = socket.id,
        broadcaster = broadcasters[id];
    if (!broadcaster)
      return;
    delete broadcasters[id];
    broadcasterCount--;
    var idleBroadcaster = idleBroadcasters[id];
    if (idleBroadcaster) {
      delete idleBroadcasters[id];
      idleBroadcasterCount++;
    }
    log('disconnecting broadcaster', id);
    _.each(broadcaster.pendingSources, (function(channel) {
      _.each(channel, (function(fns) {
        if (!fns || !fns.reject) {
          log.warn('Pending source fns missing', broadcaster.pendingSources, fns);
          return;
        }
        fns.reject('Broadcaster Disconnected');
      }));
    }));
    _.each(broadcaster.channels, (function(channel) {
      return channel.primaryBroadcaster = getBestBroadcaster(channel);
    }));
    emit('broadcaster remove', {id: id});
  }
  function receiveStats(socket, data) {
    var broadcaster = broadcasters[socket.id];
    if (!broadcaster) {
      log.warn('Tried to access non-existent broadcaster!');
      return;
    }
    broadcaster.log.then((function(fd) {
      var buffer = new Buffer(JSON.stringify(data));
      fs.write(fd, buffer, 0, buffer.length, null, (function(err, written, buffer) {
        if (err)
          log.error(err);
        log(written);
      }));
    })).catch((function(error) {
      return log.error(error);
    }));
    _.extend(broadcaster.stats, data);
  }
  function sourceAdded(socket, channelName, peerID) {
    console.log(socket, channelName, peerID);
    var pendingChannelSources = socket.broadcaster.pendingSources[channelName];
    if (!pendingChannelSources) {
      log.warn('Adding source with no pending record', channelName, peerID);
      return;
    }
    var fns = pendingChannelSources[peerID];
    delete pendingChannelSources[peerID];
    fns.resolve(socket.broadcaster);
  }
  function channelClosed(socket) {}
  function broadcastSource(source) {
    log('broadcasting source');
    return new Promise((function(resolve, reject) {
      log.info('Adding source', source);
      var $__0 = $traceurRuntime.assertObject(source),
          channelName = $__0.channelName,
          peerID = $__0.peerID,
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
      pending[peerID] = {
        resolve: resolve,
        reject: reject
      };
      log('notifying broadcaster', broadcaster.id);
      broadcaster.emit('add source', source);
    }));
  }
  function getBroadcaster(channelName) {
    var channel = channels[channelName];
    if (!channel) {
      channel = {name: channelName};
      channels[channelName] = channel;
    }
    if (!channel.primaryBroadcaster) {
      var broadcaster = getBestBroadcaster(channel);
      channel.primaryBroadcaster = broadcaster;
      broadcaster.channels[channelName] = channel;
    }
    return channel.primaryBroadcaster;
  }
  function getBestBroadcaster(channel) {
    console.log('getting best broadcaster');
    var broadcaster = _.sample(idleBroadcasters);
    if (broadcaster) {
      delete idleBroadcasters[broadcaster.id];
      idleBroadcasterCount--;
      return broadcaster;
    } else
      log('no broadcaster found!');
  }
});
