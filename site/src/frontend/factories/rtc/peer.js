import {Channel} from './channel';
import {Stream} from './stream';

var _ = require('lodash');


var RTCPeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var RTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
var RTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);

var iceServers = [{url: 'stun:stun.l.google.com:19302'}];

var CONNECTION_EVENTS = ['negotiation_needed', 'ice_candidate', 'signaling_state_change', 
                         'add_stream', 'remove_stream', 'ice_connection_state_change',
                         'data_channel'];

var iceServers = {iceServers: navigator.mozGetUserMedia ? [{url: 'stun:23.21.150.121'}] : [{url: 'stun:stun.l.google.com:19302'}]};

class Peer {
  constructor(id, config, connectionListeners, sendOffer) {
    this._id = id;
    this._config = config;
    this._localCandidates = [];
    this._remoteCandidates = [];
    this._channels = [];
    this._localStreams = [];
    this._remoteStreams = [];
    this._events = {};
    this._connectionListeners = connectionListeners;

    this._isReadyForIceCandidates = false;

    this.sendOffer = sendOffer;

    this._nextChannelID = 0;

    this._log = [];

    var connection = this._connection = new RTCPeerConnection(iceServers);

    this.on(this._connectionListeners);

    this.on({
      'ice_candidate':  event => this._localCandidates.push(event.candidate),
      'data_channel':   event => this._addChannel(new Channel(this, event.channel)),
      'add_stream':     event => this._addRemoteStream(new Stream(this, event.stream)) 
    });

    this.on({
      'ice_connection_state_change': event => {
        switch (connection.iceConnectionState) {
          case 'failed':
          case 'disconnected':
          case 'close':
            this.fire('disconnected');
        }
      },
      'signaling_state_change': event => {
        switch (connection.signallingState) {
          case 'have-local-offer':
          case 'have-remote-offer':
            this._readyForIceCandidates();
        }
      }
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      var connectWatcher = event => {
        if (this._connection.iceConnectionState == 'connected') {
          resolve(this);
          this._connection.removeEventListener('iceconnectionstatechange', connectWatcher);
        }
        else if (true) {
          //handle failures here
        }
      };

      this._connection.addEventListener('iceconnectionstatechange', connectWatcher);
    });
  }

  initiateOffer() {
    return new Promise((resolve, reject) => {
      this._connection.createOffer(
        offer => {
          this._connection.setLocalDescription(offer, () => resolve(offer), error => reject('peer error set_local_description', this, error, offer));
        }, 
        error => reject('peer error create offer', this, error));
    });
  }

  receiveOffer(offer) {
    return new Promise((resolve, reject) => {
      this._connection.setRemoteDescription(new RTCSessionDescription(offer), 
        () => {
          this._connection.createAnswer(
            answer => {
              this._connection.setLocalDescription(answer, () => resolve(answer), error => reject('peer error set_local_description', this, error, answer));
            },
            error => reject('peer error send answer', this, error, offer));
        },
        error => reject('peer error set_remote_description', this, error, offer));
    });
  }

  receiveAnswer(answer) {
    return new Promise((resolve, reject) => this._connection.setRemoteDescription(new RTCSessionDescription(answer), resolve, reject));
  }

  addIceCandidate(candidate) {
    console.log('received candidate', candidate);
    
    return new Promise((resolve, reject) => {
      this._connection.addIceCandidate(new RTCIceCandidate(candidate), () => {
        this._remoteCandidates.push(candidate);
        resolve();
      }, reject);
    });
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
    var removed = _.remove(this._channels, function(c) { return c.label === label; });
    _.each(removed, channel => this.fire('channel removed', channel));
  }

  addLocalStream(id, stream) {
    var localStream = new Stream(this, id, stream);
    
    this._localStreams.push(localStream);

    this._addLocalStream(stream);
  
    return localStream;
  }

  close() {
    this._connection.close();
  }

  get id() { return this._id; }
  get config() { return this._config; }
  get localStreams() { return this._localStreams; }
  get remoteStreams() { return this._remoteStreams; }
  get channels() { return this._channels; }
  get log() { return this._log; }

  channel(label) { return _.find(this._channels, {'label': label}); }

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
    if (navigator.mozGetUserMedia && this._config.isExistingPeer) this.sendOffer();
    this.fire('localStream added', stream);
    return stream;
  }

  _addRemoteStream(stream) {
    this._remoteStreams.push(stream);
    this.fire('remoteStream added', stream);
    return stream;
  }

  _log() {
    this._log.push({
      at: new Date(), 
      args: [...arguments]
    });
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