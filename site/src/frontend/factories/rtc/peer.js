import {Channel} from './channel';
import {Stream} from './stream';

var _ = require('lodash');


var RTCPeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);

var iceServers = [{url: 'stun:stun.l.google.com:19302'}];

var CONNECTION_EVENTS = ['negotiation_needed', 'ice_candidate', 'signaling_state_change', 
                         'add_stream', 'remove_stream', 'ice_connection_state_change',
                         'data_channel'];

class Peer {
  constructor(id, config, connectionListeners, sendOffer) {
    this._id = id;
    this._config = config;
    this._channels = [];
    this._historicalChannels = [];
    this._localStreams = [];
    this._remoteStreams = [];
    this._events = {};
    this._connectionListeners = connectionListeners;

    this.sendOffer = sendOffer;

    this._nextChannelID = 0;
  }

  connect(onConnect) {
    var connection = this._connection = new RTCPeerConnection({
      iceServers: navigator.mozGetUserMedia ? [{url: 'stun:23.21.150.121'}] : [{url: 'stun:stun.l.google.com:19302'}]
    }, {
      optional: [{
        DtlsSrtpKeyAgreement: true
      }]
    });

    this.on(this._connectionListeners);
    // _.each(this._connectionListeners, 
    //   (listener, eventName) => connection.addEventListener(eventName.replace(/\_/g, ''), listener));

    this.on({
      'data_channel': event => this._addChannel(new Channel(this, event.channel, { })),
      'add_stream':   event => this._addRemoteStream(new Stream(this, 'remote **change me to real id**', event.stream))
    });
  
    if (onConnect) {
      var connectWatcher = event => {
        if (connection.iceConnectionState == 'connected' 
          || connection.iceConnectionState == 'completed') {
          onConnect(this);
          connection.removeEventListener('iceconnectionstatechange', connectWatcher);
        }
      };

      connection.addEventListener('iceconnectionstatechange', connectWatcher);
    }

    if (this._localStreams.length > 0) _.each(this._localStreams, localStream => this._addLocalStream(localStream.stream));
  }

  addChannel(label, options, channelListeners) {
    label = label || ('data-channel-' + this._nextChannelID++);

    var channel = this._addChannel(new Channel(this, this.connection.createDataChannel(label, options), channelListeners));

    if (this._channels.length > 0 && window.mozRTCPeerConnection) {
      this.sendOffer(this._connection);
    }

    return channel;
  }

  removeChannel(label) {
    var removed = _.remove(this._channels, function(c) { return c.label === label; })
    if (removed.length > 0) _.each(removed, (channel) => {
      this._historicalChannels.push(channel);
      this.fire('channel removed', channel);
    });
  }

  addLocalStream(id, stream) {
    var localStream = new Stream(this, id, stream);
    
    this._localStreams.push(localStream);

    if (this._connection) this._addLocalStream(stream);
  
    return localStream;
  }

  close() {
    if (this.connection) this.connection.close();
  }

  get id() { return this._id; }
  get config() { return this._config; }
  get localStreams() { return this._localStreams; }
  get channels() { return this._channels; }

  channel(label) { return _.find(this._channels, {'label': label}); }

  get historicalChannels() { return this._historicalChannels; }

  // Do we want to expose this?!
  get connection() { return this._connection; }

  _addChannel(channel) {
    channel.on({
      'close': () => this.removeChannel(channel.label)
    });

    this._channels.push(channel);

    this.fire('channel added', channel);

    return channel;
  }

  _addLocalStream(stream) {
    this._connection.addStream(stream);
    this.fire('localStream added', stream);
    return stream;
  }

  _addRemoteStream(stream) {
    this._remoteStreams.push(stream);
    this.fire('remoteStream added', stream);
    return stream;
  }

  /*
  +  Event Handling
  */
  on(event, listener) {
    var events = this._events;

    if (typeof event == 'object') {
      for (var eventName in event) this.on(eventName, event[eventName]);
      return;
    }

    if (this._connection && CONNECTION_EVENTS.indexOf(event) != -1) {
      this._connection.addEventListener(event.replace(/_/g, ''), listener);
      return;
    }

    events[event] = events[event] || [];
    events[event].push(listener);

    this._events = events;
  }

  off(event, listener) {
    var events = this._events;

    if (typeof event == 'object') {
      for (var eventName in event) off(eventName, event[eventName]);
      return;
    }

    var listeners = events[event];
    if (listeners && listeners.length > 0) {
      for (var i = listeners.length - 1; i >= 0; i++) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
        }
      }
      if (listeners.length == 0) delete events[event];
    }
  }

  fire(event) {
    var events = this._events = this._events || {};

    var listeners = events[event] || [],
        args = Array.prototype.slice.call(arguments, 1);

    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(null, args);
    }
  }
  /*
  -  Event Handling
  */
}

export {Peer};