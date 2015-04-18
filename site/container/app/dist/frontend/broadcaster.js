(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/broadcaster";
var Peer = require('../util/rtc/peer').Peer,
    Signaler = require('../util/rtc/signaler')(),
    Broadcaster = require('../util/broadcaster/broadcaster')(),
    log = require('../util/log')(),
    emitter = require('../util/emitter')(),
    io = (window.io);
var socket = io('https://' + window.location.host + '/broadcaster'),
    signal = io('https://' + window.location.host + '/signal');
var emit = (function(event, data) {
  return socket.emit(event, data);
});
var signalerEmitter = emitter();
var signaler = Signaler({
  emit: (function(name, data) {
    return signal.emit('peer ' + name, data);
  }),
  on: signalerEmitter.on
});
var token = window.location.search.split('=')[1];
on(signal, {
  'peer offer': (function(offer) {
    return receiveOffer(offer);
  }),
  'peer answer': (function(answer) {
    return signalerEmitter.emit('answer', answer);
  }),
  'peer candidates': (function(candidates) {
    return signalerEmitter.emit('candidates', candidates);
  })
});
on(socket, {
  'connect': (function() {
    return connected();
  }),
  'your_id': (function(myID) {
    return recieveID(myID);
  }),
  'add source': (function(data) {
    return addSource(data);
  })
});
function on(obj, handlers) {
  _.each(handlers, (function(handler, name) {
    return obj.on(name, handler);
  }));
}
function receiveOffer(offer) {
  if (!signaler.managesPeer(offer.peerID)) {
    var peer = new Peer(offer.peerID);
    signaler.managePeer(peer);
    var firstChannel;
    for (var channel in Broadcaster.channels) {
      firstChannel = channel;
      break;
    }
    Broadcaster.addChannelListener(firstChannel, peer);
  }
  signalerEmitter.emit('offer', offer);
}
function connected() {
  log('connected!');
  emit('register', {token: token});
}
function recieveID(myID) {
  log('myID:', myID);
}
function addSource(data) {
  log('add source', data);
  var $__0 = data,
      channelName = $__0.channelName,
      peerID = $__0.peerID;
  var peer = new Peer(peerID);
  signaler.managePeer(peer);
  Broadcaster.addChannelSource(channelName, peer);
  peer.connect().then((function(peer) {
    setInterval((function() {
      peer.getStats().then((function(report) {
        var result = report.result();
        var final = _.reduce(result, (function(_r, r) {
          _r[r.id] = _.reduce(r.names(), (function(stat, name) {
            stat[name] = r.stat(name);
            return stat;
          }), {});
          return _r;
        }), {});
        socket.emit('stats', final);
      })).catch((function(error) {
        return log.error(error);
      }));
    }), 1000);
  })).catch((function(error) {
    return log.error(error);
  }));
  emit('source add', data);
}


},{"../util/broadcaster/broadcaster":2,"../util/emitter":5,"../util/log":6,"../util/rtc/peer":8,"../util/rtc/signaler":9}],2:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/broadcaster/broadcaster";
var Channel = require('./channel');
module.exports = function() {
  var broadcaster = {
    channels: {},
    channelCount: 0,
    addChannel: addChannel,
    addChannelSource: addChannelSource,
    removeChannelSource: removeChannelSource,
    addChannelListener: addChannelListener
  };
  return broadcaster;
  function addChannel(name) {
    var channel = getChannel(name);
    if (channel) {
      console.log('Tried to add channel that already exists!', name);
      return;
    }
    channel = broadcaster.channels[name] = Channel(name);
    return channel;
  }
  function addChannelSource(channelName, source) {
    var channel = getChannel(channelName) || addChannel(channelName);
    channel.addSource(source);
  }
  function removeChannelSource(channelName, source) {
    var channel = getChannel(channelName);
    if (!channel) {
      console.log('Tried to remove source from non-existent channel!', channelName, source);
    } else
      channel.removeSource(source);
  }
  function addChannelListener(channelName, listenerPeer) {
    var channel = getChannel(channelName);
    if (!channel) {
      console.log('Tried to listen to non-existent channel!', channelName);
    } else
      channel.addListener(listenerPeer);
  }
  function getChannel(name) {
    return broadcaster.channels[name];
  }
};


},{"./channel":3}],3:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/broadcaster/channel";
var Listener = require('./listener');
module.exports = (function(name) {
  var channel;
  var $__0 = channel = {
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
  },
      sources = $__0.sources,
      dataChannels = $__0.dataChannels,
      streams = $__0.streams,
      listeners = $__0.listeners;
  console.log(sources, dataChannels, streams, listeners);
  return channel;
  function addSource(source) {
    var id = source.id;
    sources[id] = source;
    channel.sourceCount++;
    _.each(source.remoteStreams, (function(stream) {
      streams.push(stream);
      _.each(listeners, (function(listener) {
        listener.peer.forwardStream(stream);
      }));
    }));
    source.on({
      'data_channel': dataChannelListener,
      'add_stream': addStreamListener,
      'remove_stream': removeStreamListener,
      'disconnected': removeSource
    });
  }
  function removeSource(source) {
    console.log('source disconnected');
    delete sources[source.id];
    _.each(channel.listeners, function(listener) {});
  }
  function dataChannelListener(event) {
    var dataChannel = event.dataChannel;
    var forwarder = {};
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
      _.each(channel.listeners, function(listener) {
        listener.peer.addStream(stream);
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
    listenerPeer.on('disconnect', (function() {
      console.log('listener disconnected');
      var index = channel.listeners.indexOf(listener);
      if (index != -1)
        channel.listeners.splice(index, 1);
    }));
    return listener;
  }
});


},{"./listener":4}],4:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/broadcaster/listener";
var Stream = require('../rtc/stream').Stream;
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


},{"../rtc/stream":10}],5:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/emitter";
module.exports = (function() {
  return (function(listenerInterceptor) {
    var events = {};
    return {
      emit: (function() {
        for (var args = [],
            $__0 = 0; $__0 < arguments.length; $__0++)
          args[$__0] = arguments[$__0];
        return emit.apply(null, $traceurRuntime.spread([events], args));
      }),
      on: (function() {
        for (var args = [],
            $__1 = 0; $__1 < arguments.length; $__1++)
          args[$__1] = arguments[$__1];
        return on.apply(null, $traceurRuntime.spread([events, listenerInterceptor], args));
      }),
      off: (function() {
        for (var args = [],
            $__2 = 0; $__2 < arguments.length; $__2++)
          args[$__2] = arguments[$__2];
        return off.apply(null, $traceurRuntime.spread([events], args));
      })
    };
  });
  function emit(events, event) {
    var listeners = events[event] || [],
        args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(null, args);
    }
  }
  function on(events, listenerInterceptor, event, listener) {
    if (typeof event == 'object') {
      var unregister = (function() {
        return _.each(unregister, (function(fn) {
          return fn();
        }));
      });
      return _.transform(event, (function(result, listener, eventName) {
        result[eventName] = on(events, listenerInterceptor, eventName, listener);
      }), unregister);
    }
    if (listenerInterceptor) {
      var ret = listenerInterceptor.attemptIntercept(event, listener);
      if (ret)
        return ret;
    }
    events[event] = events[event] || [];
    events[event].push(listener);
    return (function() {
      return off(events, event, listener);
    });
  }
  function off(events, event, listener) {
    if (typeof event == 'object') {
      for (var eventName in event)
        off(events, eventName, event[eventName]);
      return;
    }
    var listeners = events[event];
    if (listeners && listeners.length > 0) {
      removeListener(listeners, listener);
      if (listeners.length === 0)
        delete events[event];
    }
    function removeListener(listeners, listener) {
      for (var i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
        }
      }
      return listeners;
    }
  }
});


},{}],6:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/log";
var _ = (window._);
module.exports = (function() {
  var methods = {
    log: log,
    debug: debug,
    info: info,
    status: status,
    warn: warn,
    error: error
  };
  function log() {
    var $__7;
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    ($__7 = console).log.apply($__7, $traceurRuntime.toObject(args));
  }
  function debug() {
    var $__7;
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$__1] = arguments[$__1];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['DEBUG:'], args));
    send.apply(null, $traceurRuntime.spread(['debug', new Date()], args));
  }
  function info() {
    var $__7;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['INFO:'], args));
    send.apply(null, $traceurRuntime.spread(['info', new Date()], args));
  }
  function status() {
    var $__7;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['STATUS:'], args));
    send.apply(null, $traceurRuntime.spread(['status', new Date()], args));
  }
  function warn() {
    var $__7;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['WARN:'], args));
    send.apply(null, $traceurRuntime.spread(['warn', new Date()], args));
  }
  function error() {
    var $__7;
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['ERROR:'], args));
    send.apply(null, $traceurRuntime.spread(['error', new Date()], args));
  }
  function send(level) {
    for (var args = [],
        $__6 = 1; $__6 < arguments.length; $__6++)
      args[$__6 - 1] = arguments[$__6];
  }
  var debouncedSend = _.debounce((function() {
    Log.save({logs: buffer}, (function() {
      buffer.splice(0);
    }));
    buffer = [];
  }), 100, {maxWait: 500});
  return _.extend(methods.log, methods);
});


},{}],7:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/channel";
var Channel = function Channel(peer, channel, channelHandler) {
  this._channel = channel;
  this._peer = peer;
  this.attachHandler(channelHandler);
};
($traceurRuntime.createClass)(Channel, {
  send: function(data) {
    this._channel.send(data);
  },
  sendJSON: function(data) {
    this._channel.send(JSON.stringify(data));
  },
  get label() {
    return this._channel.label;
  },
  get channel() {
    return this._channel;
  },
  get peer() {
    return this._peer;
  },
  attachHandler: function(channelHandler) {
    if (typeof channelHandler === 'function')
      channelHandler = channelHandler(this._channel);
    this.on(channelHandler || {});
  },
  on: function(event, listener) {
    var $__0 = this;
    if (typeof event == 'object') {
      for (var eventName in event)
        this.on(eventName, event[eventName]);
      return;
    }
    this._channel.addEventListener(event, (function(event) {
      return listener($__0, event);
    }));
    return this;
  }
}, {});
;
module.exports = {
  get Channel() {
    return Channel;
  },
  __esModule: true
};


},{}],8:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/peer";
var Channel = require('./channel').Channel;
var Stream = require('./stream').Stream;
var _ = (window._),
    emitter = require('../emitter')();
var RTCPeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var RTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
var RTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
var CONNECTION_EVENTS = ['negotiation_needed', 'ice_candidate', 'signaling_state_change', 'add_stream', 'remove_stream', 'ice_connection_state_change', 'data_channel'];
var iceServers = {
  iceServers: [{
    url: 'stun:104.131.128.101:3478',
    urls: 'stun:104.131.128.101:3478'
  }, {
    url: 'turn:104.131.128.101:3478',
    urls: 'turn:104.131.128.101:3478',
    username: 'turn',
    credential: 'turn'
  }],
  iceTransports: 'all'
};
var Peer = function Peer(id, config) {
  var $__0 = this;
  this._id = id;
  this._config = config;
  this._remoteCandidates = [];
  this._localCandidates = [];
  this._remoteStreams = [];
  this._localStreams = [];
  this._channels = {};
  this._events = {};
  this._isConnectingPeer = false;
  this._connectPromise = null;
  this._connectCalled = false;
  this._connected = false;
  this._isReadyForIceCandidates = false;
  this._iceCandidatePromises = [];
  this._nextChannelID = 0;
  this._log = [];
  var connection = this._connection = new RTCPeerConnection(iceServers);
  var $__2 = emitter({attemptIntercept: (function(event, listener) {
      if (connection && CONNECTION_EVENTS.indexOf(event) != -1) {
        connection.addEventListener(event.replace(/_/g, ''), listener);
        return true;
      }
      return false;
    })}),
      emit = $__2.emit,
      on = $__2.on,
      off = $__2.off;
  this.fire = emit;
  this.on = on;
  this.off = off;
  this.on({
    'ice_candidate': (function(event) {
      return $__0._localCandidates.push(event.candidate);
    }),
    'data_channel': (function(event) {
      return $__0._addChannel(event.channel);
    }),
    'add_stream': (function(event) {
      return $__0._addRemoteStream(event.stream);
    })
  });
  this.on({'ice_connection_state_change': (function(event) {
      switch (connection.iceConnectionState) {
        case 'connected':
        case 'completed':
          $__0._connected = true;
          console.log('connected!');
          break;
        case 'failed':
        case 'disconnected':
        case 'closed':
          $__0._connected = false;
          $__0.fire('disconnected');
      }
    })});
};
($traceurRuntime.createClass)(Peer, {
  connect: function() {
    var $__0 = this;
    this._isConnectingPeer = true;
    this._connectPromise = this._connectPromise || new Promise((function(resolve, reject) {
      var connectWatcher = (function(event) {
        $__0._connectCalled = true;
        var connection = event.target;
        switch (connection.iceConnectionState) {
          case 'connected':
          case 'completed':
            $__0._connected = true;
            connection.removeEventListener('iceconnectionstatechange', connectWatcher);
            resolve($__0);
            break;
          case 'failed':
          case 'disconnected':
          case 'closed':
            connection.removeEventListener('iceconnectionstatechange', connectWatcher);
            reject({
              peer: $__0,
              event: event
            });
            break;
        }
      });
      $__0._connection.addEventListener('iceconnectionstatechange', connectWatcher);
      $__0.initiateOffer().then((function(offer) {
        return $__0.fire('offer ready', offer);
      })).catch((function(error) {
        return $__0.fire('offer error');
      }));
    }));
    return this._connectPromise;
  },
  initiateOffer: function(options) {
    var $__0 = this;
    options = options || {mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }};
    return new Promise((function(resolve, reject) {
      $__0._connection.createOffer((function(offer) {
        return $__0._connection.setLocalDescription(offer, (function() {
          return resolve($__0._connection.localDescription);
        }), (function(error) {
          return reject('peer error set_local_description', $__0, error, offer);
        }));
      }), (function(error) {
        return reject(error);
      }), options);
    }));
  },
  receiveOffer: function(offer) {
    var $__0 = this;
    return new Promise((function(resolve, reject) {
      $__0._connection.setRemoteDescription(new RTCSessionDescription(offer), (function() {
        $__0._resolveIceCandidatePromises();
        $__0._connection.createAnswer((function(answer) {
          $__0._connection.setLocalDescription(answer, (function() {
            return resolve($__0._connection.localDescription);
          }), (function(error) {
            return reject('peer error set_local_description', $__0, error, answer);
          }));
        }), (function(error) {
          return reject('peer error send answer', $__0, error, offer);
        }));
      }), (function(error) {
        return reject('peer error set_remote_description', $__0, error, offer);
      }));
    }));
  },
  receiveAnswer: function(answer) {
    var $__0 = this;
    return new Promise((function(resolve, reject) {
      return $__0._connection.setRemoteDescription(new RTCSessionDescription(answer), (function() {
        $__0._resolveIceCandidatePromises();
        resolve();
      }), reject);
    }));
  },
  addIceCandidates: function(candidates) {
    var $__0 = this;
    return new Promise((function(outerResolve, outerReject) {
      _.each(candidates, (function(candidate) {
        $__0._iceCandidatePromises.push((function() {
          return new Promise((function(resolve, reject) {
            $__0._connection.addIceCandidate(new RTCIceCandidate(candidate), (function() {
              $__0._remoteCandidates.push(candidate);
              resolve();
            }), (function(error) {
              reject(error);
            }));
          }));
        }));
      }));
      $__0._resolveIceCandidatePromises(outerResolve, outerReject);
    }));
  },
  addChannel: function(label, options, channelHandler) {
    label = label || ('data-channel-' + this._nextChannelID++);
    var channel = this._addChannel(this._connection.createDataChannel(label, options), channelHandler);
    return channel;
  },
  removeChannel: function(label) {
    var channel = this._channels[label];
    if (channel) {
      delete this._channels[label];
      this.fire('channel removed', channel);
    }
  },
  addLocalStream: function(stream) {
    var localStream = new Stream(this, stream);
    this._localStreams.push(localStream);
    this._addLocalStream(stream);
    return localStream;
  },
  removeStream: function(stream) {
    var index = this._localStreams.indexOf(stream);
    if (index != 1) {
      this._localStreams.splice(index, 1);
      this._connection.removeStream(stream.stream);
    }
  },
  forwardStream: function(stream) {
    this._localStreams.push(stream);
    this._addLocalStream(stream.stream);
  },
  close: function() {
    if (this._connection && this._connection.iceConnectionState != 'closed')
      this._connection.close();
  },
  getStats: function() {
    var $__0 = this;
    return new Promise((function(resolve, reject) {
      $__0._connection.getStats(resolve, reject);
    }));
  },
  get id() {
    return this._id;
  },
  get config() {
    return this._config;
  },
  get localStreams() {
    return this._localStreams;
  },
  get remoteStreams() {
    return this._remoteStreams;
  },
  get channels() {
    return this._channels;
  },
  get isConnectingPeer() {
    return this._isConnectingPeer;
  },
  get log() {
    return this._log;
  },
  channel: function(label) {
    var $__0 = this;
    var promises = this._channelPromises = this._channelPromises || {};
    var promise = promises[label] = promises[label] || new Promise((function(resolve, reject) {
      var channel = $__0._channels[label];
      if (channel)
        resolve(channel);
      else {
        var listener = (function(channel) {
          if (channel.label == label) {
            $__0.off('channel add', listener);
            resolve(channel);
          }
        });
        $__0.on('channel add', listener);
      }
    }));
    return promise;
  },
  stream: function(id) {
    return _.find(this._remoteStreams, {'id': id});
  },
  get connection() {
    return this._connection;
  },
  _addChannel: function(channel) {
    var $__0 = this;
    channel = new Channel(this, channel);
    channel.on({'close': (function() {
        return $__0.removeChannel(channel.label);
      })});
    this._channels[channel.label] = channel;
    this.fire('channel add', channel);
    return channel;
  },
  _addLocalStream: function(stream) {
    var $__0 = this;
    this._connection.addStream(stream);
    console.log('_adding local stream');
    if (this._connected) {
      this.initiateOffer().then((function(offer) {
        return $__0.fire('offer ready', offer);
      })).catch((function(error) {
        console.log(error);
        $__0.fire('offer error');
      }));
    }
    this.fire('localStream add', stream);
    return stream;
  },
  _addRemoteStream: function(stream) {
    console.log('add remote stream');
    stream = new Stream(this, stream);
    this._remoteStreams.push(stream);
    this.fire('remoteStream add', stream);
    return stream;
  },
  _resolveIceCandidatePromises: function(resolve, reject) {
    if (this._connection.signalingState != 'have-local-offer' && this._connection.remoteDescription) {
      Promise.all(_.map(this._iceCandidatePromises, (function(fn) {
        return fn();
      }))).then((function() {
        return resolve();
      })).catch(reject);
      this._iceCandidatePromises.splice(0);
    }
  },
  _log: function() {
    this._log.push({
      at: new Date(),
      args: $traceurRuntime.spread(arguments)
    });
  }
}, {});
;
module.exports = {
  get Peer() {
    return Peer;
  },
  __esModule: true
};


},{"../emitter":5,"./channel":7,"./stream":10}],9:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/signaler";
module.exports = (function(emitter) {
  if (!emitter)
    emitter = require('../emitter')();
  return (function(transport) {
    var $__0 = emitter(),
        emit = $__0.emit,
        on = $__0.on,
        off = $__0.off;
    var signaler = {
      peers: {},
      peerCount: 0,
      managePeer: managePeer,
      dropPeer: dropPeer,
      managesPeer: managesPeer
    };
    transport.on({
      'offer': (function(data) {
        return receiveOffer(data.peerID, data.offer);
      }),
      'answer': (function(data) {
        return receiveAnswer(data.peerID, data.answer);
      }),
      'candidates': (function(data) {
        return receiveIceCandidates(data.peerID, data.candidates);
      })
    });
    var peers = signaler.peers;
    var send = transport.emit;
    function managePeer(peer) {
      var peerID = peer.id,
          candidates = [];
      peers[peerID] = peer;
      signaler.peerCount++;
      peer.on({
        'offer ready': (function(offer) {
          console.log('offer ready');
          send('offer', {
            peerID: peerID,
            offer: offer
          });
          emit('send offer', peer, offer);
        }),
        ice_candidate: (function(event) {
          var candidate = event.candidate;
          if (candidate) {
            candidates.push(candidate);
            sendIceCandidates();
            emit('ice_candidate', peer, candidate);
          }
        })
      });
      var sendIceCandidates = _.throttle((function() {
        send('candidates', {
          peerID: peerID,
          candidates: candidates
        });
        candidates.splice(0);
      }), 0);
      return peer;
    }
    function dropPeer(peer) {
      var storedPeer = peers[peer.id];
      if (storedPeer) {
        storedPeer.off();
        delete peers[peer.id];
        signaler.peerCount--;
      }
      return peer;
    }
    function receiveOffer(peerID, offer) {
      var $__1;
      var peer = getPeer(peerID);
      emit('peer receive offer', peer, offer);
      ($__1 = peer.receiveOffer(offer)).then.apply($__1, $traceurRuntime.spread([(function(answer) {
        send('answer', {
          peerID: peerID,
          answer: answer
        });
        emit('send answer', peer, answer);
      })], (function(error) {
        return emit.apply(null, $traceurRuntime.spread(['error offer', peer, answer], error));
      })));
    }
    function receiveAnswer(peerID, answer) {
      var $__1;
      var peer = getPeer(peerID);
      emit('peer receive answer', peer, answer);
      ($__1 = peer.receiveAnswer(answer)).then.apply($__1, $traceurRuntime.spread([(function() {
        return emit('accepted answer', peer, answer);
      })], (function(error) {
        return emit.apply(null, $traceurRuntime.spread(['error answer', peer, answer], error));
      })));
    }
    function receiveIceCandidates(peerID, candidates) {
      var $__1;
      var peer = getPeer(peerID);
      emit('peer receive candidates', peer, candidates);
      ($__1 = peer.addIceCandidates(candidates)).then.apply($__1, $traceurRuntime.spread([(function() {
        return emit('accepted candidates', peer, candidates);
      })], (function(error) {
        return emit.apply(null, $traceurRuntime.spread(['error candidates', peer, candidates], error));
      })));
    }
    function getPeer(id) {
      var peer = peers[id];
      if (peer)
        return peer;
      throw 'Tried to get non-existent peer!';
    }
    function managesPeer(id) {
      return peers[id] != null;
    }
    return signaler;
  });
});


},{"../emitter":5}],10:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/stream";
var Stream = function Stream(peer, stream, streamListeners) {
  this._peer = peer;
  this._stream = stream;
  this._id = stream.id;
};
($traceurRuntime.createClass)(Stream, {
  get stream() {
    return this._stream;
  },
  get id() {
    return this._id;
  },
  get peer() {
    return this._peer;
  }
}, {});
;
module.exports = {
  get Stream() {
    return Stream;
  },
  __esModule: true
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2Jyb2FkY2FzdGVyLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvdXRpbC9icm9hZGNhc3Rlci9icm9hZGNhc3Rlci5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL3V0aWwvYnJvYWRjYXN0ZXIvY2hhbm5lbC5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL3V0aWwvYnJvYWRjYXN0ZXIvbGlzdGVuZXIuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL2VtaXR0ZXIuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL2xvZy5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL3V0aWwvcnRjL2NoYW5uZWwuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL3J0Yy9wZWVyLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvdXRpbC9ydGMvc2lnbmFsZXIuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL3J0Yy9zdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFBSSxDQUFKLEVBQUksQ0FB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QTs7O0FDeEhGOztZQUFBLFNBQU0sT0FBTSxDQUNFLElBQUksQ0FBRSxDQUFBLE1BQU0sQ0FBRSxDQUFBLGVBQWUsQ0FBRTtBQUN6QyxDQUFBLEtBQUksTUFBTSxFQUFHLEtBQUksQ0FBQztBQUNsQixDQUFBLEtBQUksUUFBUSxFQUFHLE9BQU0sQ0FBQztBQUN0QixDQUFBLEtBQUksSUFBSSxFQUFHLENBQUEsTUFBTSxHQUFHLENBQUM7Q0FHdEI7O0NBRUQsSUFBSSxPQUFNLEVBQUc7Q0FBRSxTQUFPLENBQUEsSUFBSSxRQUFRLENBQUM7R0FBRTtDQUNyQyxJQUFJLEdBQUUsRUFBRztDQUFFLFNBQU8sQ0FBQSxJQUFJLElBQUksQ0FBQztHQUFFO0NBQzdCLElBQUksS0FBSSxFQUFHO0NBQUUsU0FBTyxDQUFBLElBQUksTUFBTSxDQUFDO0dBQUU7Q0FBQTs7Ozs7Ozs7Q0FvQm5CIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQZWVyID0gcmVxdWlyZSgnLi4vdXRpbC9ydGMvcGVlcicpLlBlZXIsXG4gICAgU2lnbmFsZXIgPSByZXF1aXJlKCcuLi91dGlsL3J0Yy9zaWduYWxlcicpKCksXG4gICAgQnJvYWRjYXN0ZXIgPSByZXF1aXJlKCcuLi91dGlsL2Jyb2FkY2FzdGVyL2Jyb2FkY2FzdGVyJykoKSxcbiAgICBsb2cgPSByZXF1aXJlKCcuLi91dGlsL2xvZycpKCksXG4gICAgZW1pdHRlciA9IHJlcXVpcmUoJy4uL3V0aWwvZW1pdHRlcicpKCksXG4gICAgaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8nKTtcblxuXG52YXIgc29ja2V0ID0gaW8oJ2h0dHBzOi8vJyArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgJy9icm9hZGNhc3RlcicpLFxuICAgIHNpZ25hbCA9IGlvKCdodHRwczovLycgKyB3aW5kb3cubG9jYXRpb24uaG9zdCArICcvc2lnbmFsJyk7XG5cbnZhciBlbWl0ID0gKGV2ZW50LCBkYXRhKSA9PiBzb2NrZXQuZW1pdChldmVudCwgZGF0YSk7XG5cbnZhciBzaWduYWxlckVtaXR0ZXIgPSBlbWl0dGVyKCk7XG5cbnZhciBzaWduYWxlciA9IFNpZ25hbGVyKHtcbiAgZW1pdDogKG5hbWUsIGRhdGEpID0+IHNpZ25hbC5lbWl0KCdwZWVyICcgKyBuYW1lLCBkYXRhKSxcbiAgb246IHNpZ25hbGVyRW1pdHRlci5vblxufSk7XG5cbnZhciB0b2tlbiA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3BsaXQoJz0nKVsxXTtcblxub24oc2lnbmFsLCB7XG4gICdwZWVyIG9mZmVyJzogICAgICBvZmZlciAgICAgID0+IHJlY2VpdmVPZmZlcihvZmZlciksXG4gICdwZWVyIGFuc3dlcic6ICAgICBhbnN3ZXIgICAgID0+IHNpZ25hbGVyRW1pdHRlci5lbWl0KCdhbnN3ZXInLCBhbnN3ZXIpLFxuICAncGVlciBjYW5kaWRhdGVzJzogY2FuZGlkYXRlcyA9PiBzaWduYWxlckVtaXR0ZXIuZW1pdCgnY2FuZGlkYXRlcycsIGNhbmRpZGF0ZXMpXG59KTtcblxub24oc29ja2V0LCB7XG4gICdjb25uZWN0JzogICAgKCkgICA9PiBjb25uZWN0ZWQoKSxcbiAgJ3lvdXJfaWQnOiAgICBteUlEID0+IHJlY2lldmVJRChteUlEKSxcbiAgJ2FkZCBzb3VyY2UnOiBkYXRhID0+IGFkZFNvdXJjZShkYXRhKVxufSk7XG5cbmZ1bmN0aW9uIG9uKG9iaiwgaGFuZGxlcnMpIHtcbiAgXy5lYWNoKGhhbmRsZXJzLCAoaGFuZGxlciwgbmFtZSkgPT4gb2JqLm9uKG5hbWUsIGhhbmRsZXIpKTtcbn1cblxuZnVuY3Rpb24gcmVjZWl2ZU9mZmVyKG9mZmVyKSB7XG4gIGlmICghc2lnbmFsZXIubWFuYWdlc1BlZXIob2ZmZXIucGVlcklEKSkge1xuICAgIHZhciBwZWVyID0gbmV3IFBlZXIob2ZmZXIucGVlcklEKTtcblxuICAgIHNpZ25hbGVyLm1hbmFnZVBlZXIocGVlcik7IC8vIHRlcnJpYmxlIHBsYWNlbWVudCBoZXJlLCBidXQgaXQgZ2V0cyB0aGUgam9iIGRvbmUgZm9yIG5vd1xuXG4gICAgdmFyIGZpcnN0Q2hhbm5lbDtcbiAgICBmb3IgKHZhciBjaGFubmVsIGluIEJyb2FkY2FzdGVyLmNoYW5uZWxzKSB7XG4gICAgICBmaXJzdENoYW5uZWwgPSBjaGFubmVsO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIEJyb2FkY2FzdGVyLmFkZENoYW5uZWxMaXN0ZW5lcihmaXJzdENoYW5uZWwsIHBlZXIpO1xuICB9XG4gIHNpZ25hbGVyRW1pdHRlci5lbWl0KCdvZmZlcicsIG9mZmVyKTtcbn1cblxuXG5mdW5jdGlvbiBjb25uZWN0ZWQoKSB7XG4gIGxvZygnY29ubmVjdGVkIScpO1xuICBlbWl0KCdyZWdpc3RlcicsIHt0b2tlbjogdG9rZW59KTtcbn1cblxuZnVuY3Rpb24gcmVjaWV2ZUlEKG15SUQpIHtcbiAgbG9nKCdteUlEOicsIG15SUQpO1xufVxuXG5mdW5jdGlvbiBhZGRTb3VyY2UoZGF0YSkge1xuICBsb2coJ2FkZCBzb3VyY2UnLCBkYXRhKTtcblxuICB2YXIge2NoYW5uZWxOYW1lLCBwZWVySUR9ID0gZGF0YTtcblxuICB2YXIgcGVlciA9IG5ldyBQZWVyKHBlZXJJRCk7XG5cbiAgc2lnbmFsZXIubWFuYWdlUGVlcihwZWVyKTtcbiAgQnJvYWRjYXN0ZXIuYWRkQ2hhbm5lbFNvdXJjZShjaGFubmVsTmFtZSwgcGVlcik7XG5cbiAgcGVlclxuICAgIC5jb25uZWN0KClcbiAgICAgIC50aGVuKHBlZXIgPT4ge1xuICAgICAgICBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgcGVlci5nZXRTdGF0cygpLnRoZW4ocmVwb3J0ID0+IHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSByZXBvcnQucmVzdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciBmaW5hbCA9IF8ucmVkdWNlKHJlc3VsdCwgKF9yLCByKSA9PiB7XG4gICAgICAgICAgICAgIF9yW3IuaWRdID0gXy5yZWR1Y2Uoci5uYW1lcygpLCAoc3RhdCwgbmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIHN0YXRbbmFtZV0gPSByLnN0YXQobmFtZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXQ7XG4gICAgICAgICAgICAgIH0sIHt9KTtcbiAgICAgICAgICAgICAgcmV0dXJuIF9yO1xuICAgICAgICAgICAgfSwge30pO1xuXG4gICAgICAgICAgICBzb2NrZXQuZW1pdCgnc3RhdHMnLCBmaW5hbCk7XG4gICAgICAgICAgfSkuY2F0Y2goZXJyb3IgPT4gbG9nLmVycm9yKGVycm9yKSk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChlcnJvciA9PiBsb2cuZXJyb3IoZXJyb3IpKTtcblxuICBlbWl0KCdzb3VyY2UgYWRkJywgZGF0YSk7XG59IiwidmFyIENoYW5uZWwgPSByZXF1aXJlKCcuL2NoYW5uZWwnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcblxuICB2YXIgYnJvYWRjYXN0ZXIgPSB7XG4gICAgY2hhbm5lbHM6IHt9LFxuICAgIGNoYW5uZWxDb3VudDogMCxcblxuICAgIGFkZENoYW5uZWw6IGFkZENoYW5uZWwsXG4gICAgYWRkQ2hhbm5lbFNvdXJjZTogYWRkQ2hhbm5lbFNvdXJjZSxcbiAgICByZW1vdmVDaGFubmVsU291cmNlOiByZW1vdmVDaGFubmVsU291cmNlLFxuXG4gICAgYWRkQ2hhbm5lbExpc3RlbmVyOiBhZGRDaGFubmVsTGlzdGVuZXJcbiAgfTtcblxuICByZXR1cm4gYnJvYWRjYXN0ZXI7XG5cbiAgZnVuY3Rpb24gYWRkQ2hhbm5lbChuYW1lKSB7XG4gICAgdmFyIGNoYW5uZWwgPSBnZXRDaGFubmVsKG5hbWUpO1xuXG4gICAgaWYgKGNoYW5uZWwpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdUcmllZCB0byBhZGQgY2hhbm5lbCB0aGF0IGFscmVhZHkgZXhpc3RzIScsIG5hbWUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNoYW5uZWwgPSBicm9hZGNhc3Rlci5jaGFubmVsc1tuYW1lXSA9IENoYW5uZWwobmFtZSk7XG5cbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZENoYW5uZWxTb3VyY2UoY2hhbm5lbE5hbWUsIHNvdXJjZSkge1xuICAgIHZhciBjaGFubmVsID0gZ2V0Q2hhbm5lbChjaGFubmVsTmFtZSkgfHwgYWRkQ2hhbm5lbChjaGFubmVsTmFtZSk7XG5cbiAgICBjaGFubmVsLmFkZFNvdXJjZShzb3VyY2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQ2hhbm5lbFNvdXJjZShjaGFubmVsTmFtZSwgc291cmNlKSB7XG4gICAgdmFyIGNoYW5uZWwgPSBnZXRDaGFubmVsKGNoYW5uZWxOYW1lKTtcblxuICAgIGlmICghY2hhbm5lbCkge1xuICAgICAgY29uc29sZS5sb2coJ1RyaWVkIHRvIHJlbW92ZSBzb3VyY2UgZnJvbSBub24tZXhpc3RlbnQgY2hhbm5lbCEnLCBjaGFubmVsTmFtZSwgc291cmNlKTtcbiAgICB9XG4gICAgZWxzZSBjaGFubmVsLnJlbW92ZVNvdXJjZShzb3VyY2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQ2hhbm5lbExpc3RlbmVyKGNoYW5uZWxOYW1lLCBsaXN0ZW5lclBlZXIpIHtcbiAgICB2YXIgY2hhbm5lbCA9IGdldENoYW5uZWwoY2hhbm5lbE5hbWUpO1xuXG4gICAgaWYgKCFjaGFubmVsKSB7XG4gICAgICBjb25zb2xlLmxvZygnVHJpZWQgdG8gbGlzdGVuIHRvIG5vbi1leGlzdGVudCBjaGFubmVsIScsIGNoYW5uZWxOYW1lKTtcbiAgICB9XG4gICAgZWxzZSBjaGFubmVsLmFkZExpc3RlbmVyKGxpc3RlbmVyUGVlcik7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDaGFubmVsKG5hbWUpIHtcbiAgICByZXR1cm4gYnJvYWRjYXN0ZXIuY2hhbm5lbHNbbmFtZV07XG4gIH1cbn07IiwidmFyIExpc3RlbmVyID0gcmVxdWlyZSgnLi9saXN0ZW5lcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hbWUgPT4ge1xuICB2YXIgY2hhbm5lbDtcbiAgdmFyIHtcbiAgICBzb3VyY2VzLFxuICAgIGRhdGFDaGFubmVscyxcbiAgICBzdHJlYW1zLFxuICAgIGxpc3RlbmVyc1xuICB9ID0gY2hhbm5lbCA9e1xuICAgIG5hbWU6IG5hbWUsXG5cbiAgICBzb3VyY2VzOiB7fSxcbiAgICBzb3VyY2VDb3VudDogMCxcblxuICAgIGRhdGFDaGFubmVsczoge30sXG4gICAgZGF0YUNoYW5uZWxDb3VudDogMCxcblxuICAgIHN0cmVhbXM6IFtdLFxuICAgIGxpc3RlbmVyczogW10sXG5cbiAgICBhZGRTb3VyY2U6IGFkZFNvdXJjZSxcbiAgICByZW1vdmVTb3VyY2U6IHJlbW92ZVNvdXJjZSxcblxuICAgIGFkZExpc3RlbmVyOiBhZGRMaXN0ZW5lclxuICB9O1xuXG4gIGNvbnNvbGUubG9nKHNvdXJjZXMsIGRhdGFDaGFubmVscywgc3RyZWFtcywgbGlzdGVuZXJzKTtcblxuICByZXR1cm4gY2hhbm5lbDtcblxuICAvLyBzb3VyY2Ugc2hvdWxkIGJlIGEgUGVlclxuICBmdW5jdGlvbiBhZGRTb3VyY2Uoc291cmNlKSB7XG4gICAgdmFyIGlkID0gc291cmNlLmlkO1xuXG4gICAgc291cmNlc1tpZF0gPSBzb3VyY2U7XG4gICAgY2hhbm5lbC5zb3VyY2VDb3VudCsrO1xuXG4gICAgXy5lYWNoKHNvdXJjZS5yZW1vdGVTdHJlYW1zLCBzdHJlYW0gPT4ge1xuICAgICAgc3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgICBfLmVhY2gobGlzdGVuZXJzLCBsaXN0ZW5lciA9PiB7XG4gICAgICAgIGxpc3RlbmVyLnBlZXIuZm9yd2FyZFN0cmVhbShzdHJlYW0pO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBzb3VyY2Uub24oe1xuICAgICAgJ2RhdGFfY2hhbm5lbCc6ICBkYXRhQ2hhbm5lbExpc3RlbmVyLFxuICAgICAgJ2FkZF9zdHJlYW0nOiAgICBhZGRTdHJlYW1MaXN0ZW5lcixcbiAgICAgICdyZW1vdmVfc3RyZWFtJzogcmVtb3ZlU3RyZWFtTGlzdGVuZXIsXG4gICAgICAnZGlzY29ubmVjdGVkJzogIHJlbW92ZVNvdXJjZVxuICAgIH0pO1xuXG4gICAgLy8gbmVlZCB0byBoYW5kbGUgZGlzY29ubmVjdGVkIHNvdXJjZXNcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVNvdXJjZShzb3VyY2UpIHtcbiAgICBjb25zb2xlLmxvZygnc291cmNlIGRpc2Nvbm5lY3RlZCcpO1xuXG4gICAgZGVsZXRlIHNvdXJjZXNbc291cmNlLmlkXTtcblxuICAgIF8uZWFjaChjaGFubmVsLmxpc3RlbmVycywgZnVuY3Rpb24obGlzdGVuZXIpIHtcblxuICAgIH0pO1xuICB9XG5cbiAgLy8gTm90IGNvbXBsZXRlISFcbiAgZnVuY3Rpb24gZGF0YUNoYW5uZWxMaXN0ZW5lcihldmVudCkge1xuICAgIHZhciBkYXRhQ2hhbm5lbCA9IGV2ZW50LmRhdGFDaGFubmVsO1xuXG4gICAgdmFyIGZvcndhcmRlciA9IHtcblxuICAgIH07XG5cbiAgICBkYXRhQ2hhbm5lbHNbZGF0YUNoYW5uZWxdO1xuICAgIGRhdGFDaGFubmVsQ291bnQrKztcblxuICAgIF8uZWFjaChjaGFubmVsLmxpc3RlbmVycywgZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgIGxpc3RlbmVyLnBlZXIuYWRkRGF0YUNoYW5uZWwoZGF0YUNoYW5uZWwpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkU3RyZWFtTGlzdGVuZXIoZXZlbnQpIHtcbiAgICB2YXIgc3RyZWFtID0gZXZlbnQuc3RyZWFtO1xuXG4gICAgaWYgKHN0cmVhbSkge1xuICAgICAgY2hhbm5lbC5zdHJlYW1zLnB1c2goc3RyZWFtKTtcbiAgICAgIGNoYW5uZWwuc3RyZWFtQ291bnQrKztcblxuICAgICAgXy5lYWNoKGNoYW5uZWwubGlzdGVuZXJzLCBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgbGlzdGVuZXIucGVlci5hZGRTdHJlYW0oc3RyZWFtKTsgLy8gUHJvYmFibHkgbmVlZCBzb21ldGhpbmcgbW9yZSBjb21wbGV4IGhlcmUgOihcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVN0cmVhbUxpc3RlbmVyKGV2ZW50KSB7XG4gICAgdmFyIHN0cmVhbSA9IGV2ZW50LnN0cmVhbTtcblxuICAgIGlmIChzdHJlYW0pIHtcbiAgICAgIHZhciByZW1vdmVkID0gXy5yZW1vdmUoY2hhbm5lbC5zdHJlYW1zLCBzdHJlYW0pO1xuXG4gICAgICBjaGFubmVsLnN0cmVhbUNvdW50IC09IHJlbW92ZWQubGVuZ3RoO1xuXG4gICAgICBfLmVhY2goY2hhbm5lbC5saXN0ZW5lcnMsIGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgIF8uZWFjaChyZW1vdmVkLCBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgICBsaXN0ZW5lci5wZWVyLnJlbW92ZVN0cmVhbShzdHJlYW0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZExpc3RlbmVyKGxpc3RlbmVyUGVlcikge1xuICAgIHZhciBsaXN0ZW5lciA9IExpc3RlbmVyKGNoYW5uZWwsIGxpc3RlbmVyUGVlcik7XG4gICAgY2hhbm5lbC5saXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICBsaXN0ZW5lclBlZXIub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygnbGlzdGVuZXIgZGlzY29ubmVjdGVkJyk7XG4gICAgICB2YXIgaW5kZXggPSBjaGFubmVsLmxpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIGlmIChpbmRleCAhPSAtMSkgY2hhbm5lbC5saXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdGVuZXI7XG4gIH1cbn07IiwiaW1wb3J0IHtTdHJlYW19IGZyb20gJy4uL3J0Yy9zdHJlYW0nOyAvLyBnZXQgcmlkIG9mIHRoaXMhXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY2hhbm5lbCwgcGVlcikge1xuICB2YXIgbGlzdGVuZXIgPSB7XG4gICAgY2hhbm5lbDogY2hhbm5lbCxcbiAgICBwZWVyOiBwZWVyLFxuICAgIHN0YXR1czogJ2Rpc2Nvbm5lY3RlZCcsXG4gICAgY29ubmVjdGVkQXQ6IG5ldyBEYXRlKClcbiAgfTtcblxuICBfLmVhY2goY2hhbm5lbC5zdHJlYW1zLCBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICBsaXN0ZW5lci5wZWVyLmZvcndhcmRTdHJlYW0obmV3IFN0cmVhbShwZWVyLCBzdHJlYW0pKTtcbiAgfSk7XG5cbiAgcmV0dXJuIGxpc3RlbmVyO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgcmV0dXJuIGxpc3RlbmVySW50ZXJjZXB0b3IgPT4ge1xuICAgIHZhciBldmVudHMgPSB7fTtcblxuICAgIHJldHVybiB7XG4gICAgICBlbWl0OiAoLi4uYXJncykgPT4gZW1pdChldmVudHMsIC4uLmFyZ3MpLFxuICAgICAgb246ICguLi5hcmdzKSA9PiBvbihldmVudHMsIGxpc3RlbmVySW50ZXJjZXB0b3IsIC4uLmFyZ3MpLFxuICAgICAgb2ZmOiAoLi4uYXJncykgPT4gb2ZmKGV2ZW50cywgLi4uYXJncylcbiAgICB9O1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVtaXQoZXZlbnRzLCBldmVudCkge1xuICAgIHZhciBsaXN0ZW5lcnMgPSBldmVudHNbZXZlbnRdIHx8IFtdLFxuICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb24oZXZlbnRzLCBsaXN0ZW5lckludGVyY2VwdG9yLCBldmVudCwgbGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50ID09ICdvYmplY3QnKSB7XG4gICAgICB2YXIgdW5yZWdpc3RlciA9ICgpID0+IF8uZWFjaCh1bnJlZ2lzdGVyLCBmbiA9PiBmbigpKTtcbiAgICAgIHJldHVybiBfLnRyYW5zZm9ybShldmVudCwgKHJlc3VsdCwgbGlzdGVuZXIsIGV2ZW50TmFtZSkgPT4ge1xuICAgICAgICByZXN1bHRbZXZlbnROYW1lXSA9IG9uKGV2ZW50cywgbGlzdGVuZXJJbnRlcmNlcHRvciwgZXZlbnROYW1lLCBsaXN0ZW5lcik7XG4gICAgICB9LCB1bnJlZ2lzdGVyKTtcbiAgICB9XG5cbiAgICBpZiAobGlzdGVuZXJJbnRlcmNlcHRvcikge1xuICAgICAgdmFyIHJldCA9IGxpc3RlbmVySW50ZXJjZXB0b3IuYXR0ZW1wdEludGVyY2VwdChldmVudCwgbGlzdGVuZXIpO1xuICAgICAgaWYgKHJldCkgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBldmVudHNbZXZlbnRdID0gZXZlbnRzW2V2ZW50XSB8fCBbXTtcbiAgICBldmVudHNbZXZlbnRdLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuICgpID0+IG9mZihldmVudHMsIGV2ZW50LCBsaXN0ZW5lcik7XG4gIH1cblxuICBmdW5jdGlvbiBvZmYoZXZlbnRzLCBldmVudCwgbGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50ID09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBldmVudE5hbWUgaW4gZXZlbnQpIG9mZihldmVudHMsIGV2ZW50TmFtZSwgZXZlbnRbZXZlbnROYW1lXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVycyA9IGV2ZW50c1tldmVudF07XG4gICAgaWYgKGxpc3RlbmVycyAmJiBsaXN0ZW5lcnMubGVuZ3RoID4gMCkge1xuICAgICAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXJzLCBsaXN0ZW5lcik7XG4gICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gMCkgZGVsZXRlIGV2ZW50c1tldmVudF07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXJzLCBsaXN0ZW5lcikge1xuICAgICAgZm9yICh2YXIgaSA9IGxpc3RlbmVycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAobGlzdGVuZXJzW2ldID09PSBsaXN0ZW5lcikge1xuICAgICAgICAgIGxpc3RlbmVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBsaXN0ZW5lcnM7XG4gICAgfVxuICB9XG59OyIsInZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICB2YXIgbWV0aG9kcyA9IHtsb2csIGRlYnVnLCBpbmZvLCBzdGF0dXMsIHdhcm4sIGVycm9yfTtcblxuICBmdW5jdGlvbiBsb2coLi4uYXJncykge1xuICAgIGNvbnNvbGUubG9nKC4uLmFyZ3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVidWcoLi4uYXJncykge1xuICAgIGNvbnNvbGUubG9nKCdERUJVRzonLCAuLi5hcmdzKTtcbiAgICBzZW5kKCdkZWJ1ZycsIG5ldyBEYXRlKCksIC4uLmFyZ3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5mbyguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ0lORk86JywgLi4uYXJncyk7XG4gICAgc2VuZCgnaW5mbycsIG5ldyBEYXRlKCksIC4uLmFyZ3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzKC4uLmFyZ3MpIHtcbiAgICBjb25zb2xlLmxvZygnU1RBVFVTOicsIC4uLmFyZ3MpO1xuICAgIHNlbmQoJ3N0YXR1cycsIG5ldyBEYXRlKCksIC4uLmFyZ3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gd2FybiguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ1dBUk46JywgLi4uYXJncyk7XG4gICAgc2VuZCgnd2FybicsIG5ldyBEYXRlKCksIC4uLmFyZ3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXJyb3IoLi4uYXJncykge1xuICAgIGNvbnNvbGUubG9nKCdFUlJPUjonLCAuLi5hcmdzKTtcbiAgICBzZW5kKCdlcnJvcicsIG5ldyBEYXRlKCksIC4uLmFyZ3MpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VuZChsZXZlbCwgLi4uYXJncykge1xuICAgIC8vIGJ1ZmZlci5wdXNoKHtsZXZlbCwgYXJnc30pO1xuICAgIC8vIGRlYm91bmNlZFNlbmQoKTtcbiAgfVxuXG4gIHZhciBkZWJvdW5jZWRTZW5kID0gXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgTG9nLnNhdmUoe2xvZ3M6IGJ1ZmZlcn0sICgpID0+IHtcbiAgICAgIGJ1ZmZlci5zcGxpY2UoMCk7XG4gICAgfSk7XG5cbiAgICBidWZmZXIgPSBbXTtcbiAgfSwgMTAwLCB7bWF4V2FpdDogNTAwfSk7XG5cbiAgcmV0dXJuIF8uZXh0ZW5kKG1ldGhvZHMubG9nLCBtZXRob2RzKTtcbn07IiwiY2xhc3MgQ2hhbm5lbCB7XG4gIGNvbnN0cnVjdG9yKHBlZXIsIGNoYW5uZWwsIGNoYW5uZWxIYW5kbGVyKSB7XG4gICAgdGhpcy5fY2hhbm5lbCA9IGNoYW5uZWw7XG4gICAgdGhpcy5fcGVlciA9IHBlZXI7XG5cbiAgICB0aGlzLmF0dGFjaEhhbmRsZXIoY2hhbm5lbEhhbmRsZXIpO1xuICB9XG5cbiAgc2VuZChkYXRhKSB7IHRoaXMuX2NoYW5uZWwuc2VuZChkYXRhKTsgfVxuICBzZW5kSlNPTihkYXRhKSB7IHRoaXMuX2NoYW5uZWwuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7IH1cblxuICBnZXQgbGFiZWwoKSB7IHJldHVybiB0aGlzLl9jaGFubmVsLmxhYmVsOyB9XG4gIGdldCBjaGFubmVsKCkgeyByZXR1cm4gdGhpcy5fY2hhbm5lbDsgfVxuICBnZXQgcGVlcigpIHsgcmV0dXJuIHRoaXMuX3BlZXI7IH1cblxuICBhdHRhY2hIYW5kbGVyKGNoYW5uZWxIYW5kbGVyKSB7XG4gICAgaWYgKHR5cGVvZiBjaGFubmVsSGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykgY2hhbm5lbEhhbmRsZXIgPSBjaGFubmVsSGFuZGxlcih0aGlzLl9jaGFubmVsKTtcblxuICAgIHRoaXMub24oY2hhbm5lbEhhbmRsZXIgfHwge30pO1xuICB9XG5cbiAgLypcbiAgKyAgRXZlbnQgSGFuZGxpbmdcbiAgKi9cbiAgb24oZXZlbnQsIGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBldmVudCA9PSAnb2JqZWN0Jykge1xuICAgICAgZm9yICh2YXIgZXZlbnROYW1lIGluIGV2ZW50KSB0aGlzLm9uKGV2ZW50TmFtZSwgZXZlbnRbZXZlbnROYW1lXSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fY2hhbm5lbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudCA9PiBsaXN0ZW5lcih0aGlzLCBldmVudCkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgLypcbiAgLSAgRXZlbnQgSGFuZGxpbmdcbiAgKi9cbn1cblxuZXhwb3J0IHtDaGFubmVsfTsiLCJpbXBvcnQge0NoYW5uZWx9IGZyb20gJy4vY2hhbm5lbCc7XG5pbXBvcnQge1N0cmVhbX0gZnJvbSAnLi9zdHJlYW0nO1xuXG52YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpLFxuICAgIGVtaXR0ZXIgPSByZXF1aXJlKCcuLi9lbWl0dGVyJykoKTtcblxuXG52YXIgUlRDUGVlckNvbm5lY3Rpb24gPSAod2luZG93LlBlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy53ZWJraXRQZWVyQ29ubmVjdGlvbjAwIHx8IHdpbmRvdy53ZWJraXRSVENQZWVyQ29ubmVjdGlvbiB8fCB3aW5kb3cubW96UlRDUGVlckNvbm5lY3Rpb24pO1xudmFyIFJUQ1Nlc3Npb25EZXNjcmlwdGlvbiA9ICh3aW5kb3cubW96UlRDU2Vzc2lvbkRlc2NyaXB0aW9uIHx8IHdpbmRvdy5SVENTZXNzaW9uRGVzY3JpcHRpb24pO1xudmFyIFJUQ0ljZUNhbmRpZGF0ZSA9ICh3aW5kb3cubW96UlRDSWNlQ2FuZGlkYXRlIHx8IHdpbmRvdy5SVENJY2VDYW5kaWRhdGUpO1xuXG52YXIgQ09OTkVDVElPTl9FVkVOVFMgPSBbJ25lZ290aWF0aW9uX25lZWRlZCcsICdpY2VfY2FuZGlkYXRlJywgJ3NpZ25hbGluZ19zdGF0ZV9jaGFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICdhZGRfc3RyZWFtJywgJ3JlbW92ZV9zdHJlYW0nLCAnaWNlX2Nvbm5lY3Rpb25fc3RhdGVfY2hhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YV9jaGFubmVsJ107XG5cbnZhciBpY2VTZXJ2ZXJzID0ge1xuICBpY2VTZXJ2ZXJzOiBbXG4gICAge3VybDogJ3N0dW46MTA0LjEzMS4xMjguMTAxOjM0NzgnLCB1cmxzOiAnc3R1bjoxMDQuMTMxLjEyOC4xMDE6MzQ3OCd9LFxuICAgIHt1cmw6ICd0dXJuOjEwNC4xMzEuMTI4LjEwMTozNDc4JywgdXJsczogJ3R1cm46MTA0LjEzMS4xMjguMTAxOjM0NzgnLCB1c2VybmFtZTogJ3R1cm4nLCBjcmVkZW50aWFsOiAndHVybid9XG4gIF0sXG4gIGljZVRyYW5zcG9ydHM6ICdhbGwnXG59O1xuXG5jbGFzcyBQZWVyIHtcbiAgY29uc3RydWN0b3IoaWQsIGNvbmZpZykge1xuICAgIHRoaXMuX2lkID0gaWQ7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHRoaXMuX3JlbW90ZUNhbmRpZGF0ZXMgPSBbXTtcbiAgICB0aGlzLl9sb2NhbENhbmRpZGF0ZXMgPSBbXTtcbiAgICB0aGlzLl9yZW1vdGVTdHJlYW1zID0gW107XG4gICAgdGhpcy5fbG9jYWxTdHJlYW1zID0gW107XG4gICAgdGhpcy5fY2hhbm5lbHMgPSB7fTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAgIHRoaXMuX2lzQ29ubmVjdGluZ1BlZXIgPSBmYWxzZTtcbiAgICB0aGlzLl9jb25uZWN0UHJvbWlzZSA9IG51bGw7XG5cbiAgICB0aGlzLl9jb25uZWN0Q2FsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5fY29ubmVjdGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLl9pc1JlYWR5Rm9ySWNlQ2FuZGlkYXRlcyA9IGZhbHNlO1xuICAgIHRoaXMuX2ljZUNhbmRpZGF0ZVByb21pc2VzID0gW107XG5cbiAgICB0aGlzLl9uZXh0Q2hhbm5lbElEID0gMDtcblxuICAgIHRoaXMuX2xvZyA9IFtdO1xuXG4gICAgdmFyIGNvbm5lY3Rpb24gPSB0aGlzLl9jb25uZWN0aW9uID0gbmV3IFJUQ1BlZXJDb25uZWN0aW9uKGljZVNlcnZlcnMpO1xuXG4gICAgdmFyIHtlbWl0LCBvbiwgb2ZmfSA9IGVtaXR0ZXIoe1xuICAgICAgYXR0ZW1wdEludGVyY2VwdDogKGV2ZW50LCBsaXN0ZW5lcikgPT4ge1xuICAgICAgICBpZiAoY29ubmVjdGlvbiAmJiBDT05ORUNUSU9OX0VWRU5UUy5pbmRleE9mKGV2ZW50KSAhPSAtMSkge1xuICAgICAgICAgIGNvbm5lY3Rpb24uYWRkRXZlbnRMaXN0ZW5lcihldmVudC5yZXBsYWNlKC9fL2csICcnKSwgbGlzdGVuZXIpO1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZmlyZSA9IGVtaXQ7XG4gICAgdGhpcy5vbiA9IG9uO1xuICAgIHRoaXMub2ZmID0gb2ZmO1xuXG4gICAgdGhpcy5vbih7XG4gICAgICAnaWNlX2NhbmRpZGF0ZSc6ICBldmVudCA9PiB0aGlzLl9sb2NhbENhbmRpZGF0ZXMucHVzaChldmVudC5jYW5kaWRhdGUpLFxuICAgICAgJ2RhdGFfY2hhbm5lbCc6ICAgZXZlbnQgPT4gdGhpcy5fYWRkQ2hhbm5lbChldmVudC5jaGFubmVsKSxcbiAgICAgICdhZGRfc3RyZWFtJzogICAgIGV2ZW50ID0+IHRoaXMuX2FkZFJlbW90ZVN0cmVhbShldmVudC5zdHJlYW0pXG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKHtcbiAgICAgICdpY2VfY29ubmVjdGlvbl9zdGF0ZV9jaGFuZ2UnOiBldmVudCA9PiB7XG4gICAgICAgIHN3aXRjaCAoY29ubmVjdGlvbi5pY2VDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgICAgICBjYXNlICdjb25uZWN0ZWQnOlxuICAgICAgICAgIGNhc2UgJ2NvbXBsZXRlZCc6XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2Nvbm5lY3RlZCEnKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2ZhaWxlZCc6XG4gICAgICAgICAgY2FzZSAnZGlzY29ubmVjdGVkJzpcbiAgICAgICAgICBjYXNlICdjbG9zZWQnOlxuICAgICAgICAgICAgdGhpcy5fY29ubmVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmZpcmUoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIHRoaXMuX2lzQ29ubmVjdGluZ1BlZXIgPSB0cnVlO1xuXG4gICAgdGhpcy5fY29ubmVjdFByb21pc2UgPSB0aGlzLl9jb25uZWN0UHJvbWlzZSB8fCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgY29ubmVjdFdhdGNoZXIgPSBldmVudCA9PiB7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3RDYWxsZWQgPSB0cnVlO1xuXG4gICAgICAgIHZhciBjb25uZWN0aW9uID0gZXZlbnQudGFyZ2V0O1xuXG4gICAgICAgIHN3aXRjaCAoY29ubmVjdGlvbi5pY2VDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgICAgICBjYXNlICdjb25uZWN0ZWQnOlxuICAgICAgICAgIGNhc2UgJ2NvbXBsZXRlZCc6XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgY29ubmVjdGlvbi5yZW1vdmVFdmVudExpc3RlbmVyKCdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnLCBjb25uZWN0V2F0Y2hlcik7XG4gICAgICAgICAgICByZXNvbHZlKHRoaXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZmFpbGVkJzpcbiAgICAgICAgICBjYXNlICdkaXNjb25uZWN0ZWQnOlxuICAgICAgICAgIGNhc2UgJ2Nsb3NlZCc6XG4gICAgICAgICAgICBjb25uZWN0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScsIGNvbm5lY3RXYXRjaGVyKTtcbiAgICAgICAgICAgIHJlamVjdCh7cGVlcjogdGhpcywgZXZlbnQ6IGV2ZW50fSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5hZGRFdmVudExpc3RlbmVyKCdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnLCBjb25uZWN0V2F0Y2hlcik7XG5cbiAgICAgIHRoaXMuaW5pdGlhdGVPZmZlcigpXG4gICAgICAgIC50aGVuKG9mZmVyID0+IHRoaXMuZmlyZSgnb2ZmZXIgcmVhZHknLCBvZmZlcikpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiB0aGlzLmZpcmUoJ29mZmVyIGVycm9yJykpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3RQcm9taXNlO1xuICB9XG5cbiAgaW5pdGlhdGVPZmZlcihvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge21hbmRhdG9yeToge09mZmVyVG9SZWNlaXZlQXVkaW86IHRydWUsIE9mZmVyVG9SZWNlaXZlVmlkZW86IHRydWV9fTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5jcmVhdGVPZmZlcihcbiAgICAgICAgb2ZmZXIgPT5cbiAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uXG4gICAgICAgICAgICAgIC5zZXRMb2NhbERlc2NyaXB0aW9uKG9mZmVyLFxuICAgICAgICAgICAgICAgICgpID0+IHJlc29sdmUodGhpcy5fY29ubmVjdGlvbi5sb2NhbERlc2NyaXB0aW9uKSxcbiAgICAgICAgICAgICAgICBlcnJvciA9PiByZWplY3QoJ3BlZXIgZXJyb3Igc2V0X2xvY2FsX2Rlc2NyaXB0aW9uJywgdGhpcywgZXJyb3IsIG9mZmVyKSksXG4gICAgICAgIGVycm9yID0+IHJlamVjdChlcnJvciksXG4gICAgICAgIG9wdGlvbnMpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVjZWl2ZU9mZmVyKG9mZmVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihvZmZlciksXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLl9yZXNvbHZlSWNlQ2FuZGlkYXRlUHJvbWlzZXMoKTtcbiAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmNyZWF0ZUFuc3dlcihcbiAgICAgICAgICAgIGFuc3dlciA9PiB7XG4gICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uc2V0TG9jYWxEZXNjcmlwdGlvbihhbnN3ZXIsICgpID0+IHJlc29sdmUodGhpcy5fY29ubmVjdGlvbi5sb2NhbERlc2NyaXB0aW9uKSwgZXJyb3IgPT4gcmVqZWN0KCdwZWVyIGVycm9yIHNldF9sb2NhbF9kZXNjcmlwdGlvbicsIHRoaXMsIGVycm9yLCBhbnN3ZXIpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvciA9PiByZWplY3QoJ3BlZXIgZXJyb3Igc2VuZCBhbnN3ZXInLCB0aGlzLCBlcnJvciwgb2ZmZXIpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3IgPT4gcmVqZWN0KCdwZWVyIGVycm9yIHNldF9yZW1vdGVfZGVzY3JpcHRpb24nLCB0aGlzLCBlcnJvciwgb2ZmZXIpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlY2VpdmVBbnN3ZXIoYW5zd2VyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHRoaXMuX2Nvbm5lY3Rpb24uc2V0UmVtb3RlRGVzY3JpcHRpb24obmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihhbnN3ZXIpLCAoKSA9PiB7XG4gICAgICB0aGlzLl9yZXNvbHZlSWNlQ2FuZGlkYXRlUHJvbWlzZXMoKTtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9LCByZWplY3QpKTtcbiAgfVxuXG4gIGFkZEljZUNhbmRpZGF0ZXMoY2FuZGlkYXRlcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgob3V0ZXJSZXNvbHZlLCBvdXRlclJlamVjdCkgPT4ge1xuICAgICAgXy5lYWNoKGNhbmRpZGF0ZXMsIGNhbmRpZGF0ZSA9PiB7XG4gICAgICAgIHRoaXMuX2ljZUNhbmRpZGF0ZVByb21pc2VzLnB1c2goKCkgPT4ge1xuICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLmFkZEljZUNhbmRpZGF0ZShuZXcgUlRDSWNlQ2FuZGlkYXRlKGNhbmRpZGF0ZSksICgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fcmVtb3RlQ2FuZGlkYXRlcy5wdXNoKGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0sIGVycm9yID0+IHtcbiAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9yZXNvbHZlSWNlQ2FuZGlkYXRlUHJvbWlzZXMob3V0ZXJSZXNvbHZlLCBvdXRlclJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBhZGRDaGFubmVsKGxhYmVsLCBvcHRpb25zLCBjaGFubmVsSGFuZGxlcikge1xuICAgIGxhYmVsID0gbGFiZWwgfHwgKCdkYXRhLWNoYW5uZWwtJyArIHRoaXMuX25leHRDaGFubmVsSUQrKyk7XG4gICAgLy8gb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgLy8gb3B0aW9ucy5uZWdvdGlhdGVkID0gZmFsc2U7XG5cbiAgICB2YXIgY2hhbm5lbCA9IHRoaXMuX2FkZENoYW5uZWwodGhpcy5fY29ubmVjdGlvbi5jcmVhdGVEYXRhQ2hhbm5lbChsYWJlbCwgb3B0aW9ucyksIGNoYW5uZWxIYW5kbGVyKTtcblxuICAgIHJldHVybiBjaGFubmVsO1xuICB9XG5cbiAgcmVtb3ZlQ2hhbm5lbChsYWJlbCkge1xuICAgIHZhciBjaGFubmVsID0gdGhpcy5fY2hhbm5lbHNbbGFiZWxdO1xuICAgIGlmIChjaGFubmVsKSB7XG4gICAgICBkZWxldGUgdGhpcy5fY2hhbm5lbHNbbGFiZWxdO1xuICAgICAgdGhpcy5maXJlKCdjaGFubmVsIHJlbW92ZWQnLCBjaGFubmVsKTtcbiAgICB9XG4gIH1cblxuICBhZGRMb2NhbFN0cmVhbShzdHJlYW0pIHtcbiAgICB2YXIgbG9jYWxTdHJlYW0gPSBuZXcgU3RyZWFtKHRoaXMsIHN0cmVhbSk7XG5cbiAgICB0aGlzLl9sb2NhbFN0cmVhbXMucHVzaChsb2NhbFN0cmVhbSk7XG5cbiAgICB0aGlzLl9hZGRMb2NhbFN0cmVhbShzdHJlYW0pO1xuXG4gICAgcmV0dXJuIGxvY2FsU3RyZWFtO1xuICB9XG5cbiAgcmVtb3ZlU3RyZWFtKHN0cmVhbSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX2xvY2FsU3RyZWFtcy5pbmRleE9mKHN0cmVhbSk7XG4gICAgaWYgKGluZGV4ICE9IDEpIHtcbiAgICAgIHRoaXMuX2xvY2FsU3RyZWFtcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5yZW1vdmVTdHJlYW0oc3RyZWFtLnN0cmVhbSk7XG4gICAgfVxuICB9XG5cbiAgZm9yd2FyZFN0cmVhbShzdHJlYW0pIHtcbiAgICB0aGlzLl9sb2NhbFN0cmVhbXMucHVzaChzdHJlYW0pO1xuICAgIHRoaXMuX2FkZExvY2FsU3RyZWFtKHN0cmVhbS5zdHJlYW0pO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb24gJiYgdGhpcy5fY29ubmVjdGlvbi5pY2VDb25uZWN0aW9uU3RhdGUgIT0gJ2Nsb3NlZCcpIHRoaXMuX2Nvbm5lY3Rpb24uY2xvc2UoKTtcbiAgfVxuXG4gIGdldFN0YXRzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmdldFN0YXRzKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXQgaWQoKSB7IHJldHVybiB0aGlzLl9pZDsgfVxuICBnZXQgY29uZmlnKCkgeyByZXR1cm4gdGhpcy5fY29uZmlnOyB9XG4gIGdldCBsb2NhbFN0cmVhbXMoKSB7IHJldHVybiB0aGlzLl9sb2NhbFN0cmVhbXM7IH1cbiAgZ2V0IHJlbW90ZVN0cmVhbXMoKSB7IHJldHVybiB0aGlzLl9yZW1vdGVTdHJlYW1zOyB9XG4gIGdldCBjaGFubmVscygpIHsgcmV0dXJuIHRoaXMuX2NoYW5uZWxzOyB9XG4gIGdldCBpc0Nvbm5lY3RpbmdQZWVyKCkgeyByZXR1cm4gdGhpcy5faXNDb25uZWN0aW5nUGVlcjsgfVxuICBnZXQgbG9nKCkgeyByZXR1cm4gdGhpcy5fbG9nOyB9XG5cbiAgLy9jaGFubmVsKGxhYmVsKSB7IHJldHVybiB0aGlzLl9jaGFubmVsc1tsYWJlbF07IH1cblxuICBjaGFubmVsKGxhYmVsKSB7XG4gICAgdmFyIHByb21pc2VzID0gdGhpcy5fY2hhbm5lbFByb21pc2VzID0gdGhpcy5fY2hhbm5lbFByb21pc2VzIHx8IHt9O1xuXG4gICAgdmFyIHByb21pc2UgPSBwcm9taXNlc1tsYWJlbF0gPSBwcm9taXNlc1tsYWJlbF0gfHwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdmFyIGNoYW5uZWwgPSB0aGlzLl9jaGFubmVsc1tsYWJlbF07XG5cbiAgICAgIGlmIChjaGFubmVsKSByZXNvbHZlKGNoYW5uZWwpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBsaXN0ZW5lciA9IGNoYW5uZWwgPT4ge1xuICAgICAgICAgIGlmIChjaGFubmVsLmxhYmVsID09IGxhYmVsKSB7XG4gICAgICAgICAgICB0aGlzLm9mZignY2hhbm5lbCBhZGQnLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICByZXNvbHZlKGNoYW5uZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLm9uKCdjaGFubmVsIGFkZCcsIGxpc3RlbmVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgc3RyZWFtKGlkKSB7IHJldHVybiBfLmZpbmQodGhpcy5fcmVtb3RlU3RyZWFtcywgeydpZCc6IGlkfSk7IH1cblxuICAvLyBEbyB3ZSB3YW50IHRvIGV4cG9zZSB0aGlzPyFcbiAgZ2V0IGNvbm5lY3Rpb24oKSB7IHJldHVybiB0aGlzLl9jb25uZWN0aW9uOyB9XG5cbiAgX2FkZENoYW5uZWwoY2hhbm5lbCkge1xuICAgIGNoYW5uZWwgPSBuZXcgQ2hhbm5lbCh0aGlzLCBjaGFubmVsKTtcblxuICAgIGNoYW5uZWwub24oe1xuICAgICAgJ2Nsb3NlJzogKCkgPT4gdGhpcy5yZW1vdmVDaGFubmVsKGNoYW5uZWwubGFiZWwpXG4gICAgfSk7XG5cbiAgICB0aGlzLl9jaGFubmVsc1tjaGFubmVsLmxhYmVsXSA9IGNoYW5uZWw7XG5cbiAgICB0aGlzLmZpcmUoJ2NoYW5uZWwgYWRkJywgY2hhbm5lbCk7XG5cbiAgICByZXR1cm4gY2hhbm5lbDtcbiAgfVxuXG4gIF9hZGRMb2NhbFN0cmVhbShzdHJlYW0pIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uLmFkZFN0cmVhbShzdHJlYW0pO1xuICAgIGNvbnNvbGUubG9nKCdfYWRkaW5nIGxvY2FsIHN0cmVhbScpO1xuICAgIC8vIFRoaXMgbWlnaHQgbm90IGJlIGEgZ29vZCBpZGVhLiBXaGF0IGhhcHBlbnMgaWZcbiAgICAvLyBfYWRkTG9jYWxTdHJlYW0gaXMgY2FsbGVkIGFnYWluIGJlZm9yZSB0aGUgb2ZmZXIgaXMgZnVsbCByZXNvbHZlZD9cbiAgICBpZiAodGhpcy5fY29ubmVjdGVkKSB7XG4gICAgICB0aGlzLmluaXRpYXRlT2ZmZXIoKVxuICAgICAgICAudGhlbihvZmZlciA9PiB0aGlzLmZpcmUoJ29mZmVyIHJlYWR5Jywgb2ZmZXIpKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICB0aGlzLmZpcmUoJ29mZmVyIGVycm9yJyk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmZpcmUoJ2xvY2FsU3RyZWFtIGFkZCcsIHN0cmVhbSk7XG4gICAgcmV0dXJuIHN0cmVhbTtcbiAgfVxuXG4gIF9hZGRSZW1vdGVTdHJlYW0oc3RyZWFtKSB7XG4gICAgY29uc29sZS5sb2coJ2FkZCByZW1vdGUgc3RyZWFtJyk7XG4gICAgc3RyZWFtID0gbmV3IFN0cmVhbSh0aGlzLCBzdHJlYW0pO1xuICAgIHRoaXMuX3JlbW90ZVN0cmVhbXMucHVzaChzdHJlYW0pO1xuICAgIHRoaXMuZmlyZSgncmVtb3RlU3RyZWFtIGFkZCcsIHN0cmVhbSk7XG4gICAgcmV0dXJuIHN0cmVhbTtcbiAgfVxuXG4gIF9yZXNvbHZlSWNlQ2FuZGlkYXRlUHJvbWlzZXMocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb24uc2lnbmFsaW5nU3RhdGUgIT0gJ2hhdmUtbG9jYWwtb2ZmZXInICYmIHRoaXMuX2Nvbm5lY3Rpb24ucmVtb3RlRGVzY3JpcHRpb24pIHtcbiAgICAgIFByb21pc2VcbiAgICAgICAgLmFsbChfLm1hcCh0aGlzLl9pY2VDYW5kaWRhdGVQcm9taXNlcywgZm4gPT4ge3JldHVybiBmbigpO30pKVxuICAgICAgICAudGhlbigoKSA9PiByZXNvbHZlKCkpXG4gICAgICAgIC5jYXRjaChyZWplY3QpO1xuXG4gICAgICB0aGlzLl9pY2VDYW5kaWRhdGVQcm9taXNlcy5zcGxpY2UoMCk7XG4gICAgfVxuICB9XG5cbiAgX2xvZygpIHtcbiAgICB0aGlzLl9sb2cucHVzaCh7XG4gICAgICBhdDogbmV3IERhdGUoKSxcbiAgICAgIGFyZ3M6IFsuLi5hcmd1bWVudHNdXG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IHtQZWVyfTsiLCJtb2R1bGUuZXhwb3J0cyA9IGVtaXR0ZXIgPT4ge1xuICBpZiAoIWVtaXR0ZXIpIGVtaXR0ZXIgPSByZXF1aXJlKCcuLi9lbWl0dGVyJykoKTsgLy8gcGxlYXNlLCBwbGVhc2UsIHBsZWFzZSBnZXQgcmlkIG9mIHRoaXNcblxuICByZXR1cm4gdHJhbnNwb3J0ID0+IHtcbiAgICB2YXIge2VtaXQsIG9uLCBvZmZ9ID0gZW1pdHRlcigpO1xuXG4gICAgdmFyIHNpZ25hbGVyID0ge1xuICAgICAgcGVlcnM6IHt9LFxuICAgICAgcGVlckNvdW50OiAwLFxuXG4gICAgICBtYW5hZ2VQZWVyOiBtYW5hZ2VQZWVyLFxuICAgICAgZHJvcFBlZXI6IGRyb3BQZWVyLFxuXG4gICAgICBtYW5hZ2VzUGVlcjogbWFuYWdlc1BlZXJcbiAgICB9O1xuXG4gICAgdHJhbnNwb3J0Lm9uKHtcbiAgICAgICdvZmZlcic6ICAgICAgZGF0YSA9PiByZWNlaXZlT2ZmZXIoZGF0YS5wZWVySUQsIGRhdGEub2ZmZXIpLFxuICAgICAgJ2Fuc3dlcic6ICAgICBkYXRhID0+IHJlY2VpdmVBbnN3ZXIoZGF0YS5wZWVySUQsIGRhdGEuYW5zd2VyKSxcbiAgICAgICdjYW5kaWRhdGVzJzogZGF0YSA9PiByZWNlaXZlSWNlQ2FuZGlkYXRlcyhkYXRhLnBlZXJJRCwgZGF0YS5jYW5kaWRhdGVzKVxuICAgIH0pO1xuXG4gICAgdmFyIHtwZWVyc30gPSBzaWduYWxlcjtcbiAgICB2YXIge2VtaXQ6IHNlbmR9ID0gdHJhbnNwb3J0O1xuXG4gICAgZnVuY3Rpb24gbWFuYWdlUGVlcihwZWVyKSB7XG4gICAgICB2YXIgcGVlcklEID0gcGVlci5pZCxcbiAgICAgICAgICBjYW5kaWRhdGVzID0gW107XG5cbiAgICAgIHBlZXJzW3BlZXJJRF0gPSBwZWVyO1xuICAgICAgc2lnbmFsZXIucGVlckNvdW50Kys7XG5cbiAgICAgIHBlZXIub24oe1xuICAgICAgICAnb2ZmZXIgcmVhZHknOiBvZmZlciA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ29mZmVyIHJlYWR5Jyk7XG4gICAgICAgICAgc2VuZCgnb2ZmZXInLCB7cGVlcklELCBvZmZlcn0pO1xuICAgICAgICAgIGVtaXQoJ3NlbmQgb2ZmZXInLCBwZWVyLCBvZmZlcik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaWNlX2NhbmRpZGF0ZTogZXZlbnQgPT4ge1xuICAgICAgICAgIHZhciBjYW5kaWRhdGUgPSBldmVudC5jYW5kaWRhdGU7XG5cbiAgICAgICAgICBpZiAoY2FuZGlkYXRlKSB7XG4gICAgICAgICAgICBjYW5kaWRhdGVzLnB1c2goY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIHNlbmRJY2VDYW5kaWRhdGVzKCk7XG4gICAgICAgICAgICBlbWl0KCdpY2VfY2FuZGlkYXRlJywgcGVlciwgY2FuZGlkYXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgLy8gSXMgdGhpcyB0aGUgYmVzdCB3YXkgdG8gZG8gdGhpcz9cbiAgICAgIHZhciBzZW5kSWNlQ2FuZGlkYXRlcyA9IF8udGhyb3R0bGUoKCkgPT4ge1xuICAgICAgICBzZW5kKCdjYW5kaWRhdGVzJywge3BlZXJJRCwgY2FuZGlkYXRlc30pO1xuICAgICAgICBjYW5kaWRhdGVzLnNwbGljZSgwKTtcbiAgICAgIH0sIDApO1xuXG4gICAgICByZXR1cm4gcGVlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcm9wUGVlcihwZWVyKSB7XG4gICAgICB2YXIgc3RvcmVkUGVlciA9IHBlZXJzW3BlZXIuaWRdO1xuICAgICAgaWYgKHN0b3JlZFBlZXIpIHtcbiAgICAgICAgc3RvcmVkUGVlci5vZmYoKTtcbiAgICAgICAgZGVsZXRlIHBlZXJzW3BlZXIuaWRdO1xuICAgICAgICBzaWduYWxlci5wZWVyQ291bnQtLTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBlZXI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVjZWl2ZU9mZmVyKHBlZXJJRCwgb2ZmZXIpIHtcbiAgICAgIHZhciBwZWVyID0gZ2V0UGVlcihwZWVySUQpO1xuXG4gICAgICBlbWl0KCdwZWVyIHJlY2VpdmUgb2ZmZXInLCBwZWVyLCBvZmZlcik7XG4gICAgICBwZWVyXG4gICAgICAgIC5yZWNlaXZlT2ZmZXIob2ZmZXIpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgIGFuc3dlciA9PiB7XG4gICAgICAgICAgICBzZW5kKCdhbnN3ZXInLCB7cGVlcklELCBhbnN3ZXJ9KTtcbiAgICAgICAgICAgIGVtaXQoJ3NlbmQgYW5zd2VyJywgcGVlciwgYW5zd2VyKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIC4uLmVycm9yID0+IGVtaXQoJ2Vycm9yIG9mZmVyJywgcGVlciwgYW5zd2VyLCAuLi5lcnJvcikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlY2VpdmVBbnN3ZXIocGVlcklELCBhbnN3ZXIpIHtcbiAgICAgIHZhciBwZWVyID0gZ2V0UGVlcihwZWVySUQpO1xuXG4gICAgICBlbWl0KCdwZWVyIHJlY2VpdmUgYW5zd2VyJywgcGVlciwgYW5zd2VyKTtcbiAgICAgIHBlZXJcbiAgICAgICAgLnJlY2VpdmVBbnN3ZXIoYW5zd2VyKVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAoKSA9PiAgICAgICBlbWl0KCdhY2NlcHRlZCBhbnN3ZXInLCBwZWVyLCBhbnN3ZXIpLFxuICAgICAgICAgIC4uLmVycm9yID0+IGVtaXQoJ2Vycm9yIGFuc3dlcicsIHBlZXIsIGFuc3dlciwgLi4uZXJyb3IpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWNlaXZlSWNlQ2FuZGlkYXRlcyhwZWVySUQsIGNhbmRpZGF0ZXMpIHtcbiAgICAgIHZhciBwZWVyID0gZ2V0UGVlcihwZWVySUQpO1xuXG4gICAgICBlbWl0KCdwZWVyIHJlY2VpdmUgY2FuZGlkYXRlcycsIHBlZXIsIGNhbmRpZGF0ZXMpO1xuICAgICAgcGVlclxuICAgICAgICAuYWRkSWNlQ2FuZGlkYXRlcyhjYW5kaWRhdGVzKVxuICAgICAgICAudGhlbihcbiAgICAgICAgICAoKSA9PiAgICAgICBlbWl0KCdhY2NlcHRlZCBjYW5kaWRhdGVzJywgcGVlciwgY2FuZGlkYXRlcyksXG4gICAgICAgICAgLi4uZXJyb3IgPT4gZW1pdCgnZXJyb3IgY2FuZGlkYXRlcycsIHBlZXIsIGNhbmRpZGF0ZXMsIC4uLmVycm9yKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UGVlcihpZCkge1xuICAgICAgdmFyIHBlZXIgPSBwZWVyc1tpZF07XG5cbiAgICAgIGlmIChwZWVyKSByZXR1cm4gcGVlcjtcblxuICAgICAgdGhyb3cgJ1RyaWVkIHRvIGdldCBub24tZXhpc3RlbnQgcGVlciEnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hbmFnZXNQZWVyKGlkKSB7XG4gICAgICByZXR1cm4gcGVlcnNbaWRdICE9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpZ25hbGVyO1xuICB9O1xufTsiLCJjbGFzcyBTdHJlYW0ge1xuICBjb25zdHJ1Y3RvcihwZWVyLCBzdHJlYW0sIHN0cmVhbUxpc3RlbmVycykge1xuICAgIHRoaXMuX3BlZXIgPSBwZWVyO1xuICAgIHRoaXMuX3N0cmVhbSA9IHN0cmVhbTtcbiAgICB0aGlzLl9pZCA9IHN0cmVhbS5pZDtcblxuICAgIC8vIHRoaXMub24oc3RyZWFtTGlzdGVuZXJzKTtcbiAgfVxuXG4gIGdldCBzdHJlYW0oKSB7IHJldHVybiB0aGlzLl9zdHJlYW07IH1cbiAgZ2V0IGlkKCkgeyByZXR1cm4gdGhpcy5faWQ7IH1cbiAgZ2V0IHBlZXIoKSB7IHJldHVybiB0aGlzLl9wZWVyOyB9XG5cbiAgLy8gLypcbiAgLy8gKyAgRXZlbnQgSGFuZGxpbmdcbiAgLy8gKi9cbiAgLy8gb24oZXZlbnQsIGxpc3RlbmVyKSB7XG4gIC8vICAgaWYgKHR5cGVvZiBldmVudCA9PSAnb2JqZWN0Jykge1xuICAvLyAgICAgZm9yICh2YXIgZXZlbnROYW1lIGluIGV2ZW50KSB0aGlzLm9uKGV2ZW50TmFtZSwgZXZlbnRbZXZlbnROYW1lXSk7XG4gIC8vICAgICByZXR1cm47XG4gIC8vICAgfVxuXG4gIC8vICAgdGhpcy5zdHJlYW0uYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnQgPT4gbGlzdGVuZXIodGhpcywgZXZlbnQpKTtcblxuICAvLyAgIHJldHVybiB0aGlzO1xuICAvLyB9XG4gIC8vIC8qXG4gIC8vIC0gIEV2ZW50IEhhbmRsaW5nXG4gIC8vICovXG59XG5cbmV4cG9ydCB7U3RyZWFtfTsiXX0=
