// Coordinates your peers. Sets up connections, streams, and channels.
// Based on webrtc.io

import {Peer} from './peer';

var _ = require('lodash'),
    io = require('socket.io');

var RTCPeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

/*
+  Event Handling
*/
var events = {};
function on(event, listener) {
  if (typeof event == 'object') {
    for (var eventName in event) on(eventName, event[eventName]);
    return;
  }

  events[event] = events[event] || [];
  events[event].push(listener);
};

function off(event, listener) {
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
};

function fire(event) {
  var listeners = events[event] || [],
      args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < listeners.length; i++) {
    listeners[i].apply(null, args);
  }
};
/*
-  Event Handling
*/

function createPeer(peerID, config, emit, fire) {
  var peer = new Peer(peerID, config, {
    negotiation_needed: (e) => {
      sendOffer(e.target);
      fire('peer negotiation_needed', peer, e);
    },
    ice_candidate: (e) => {
      var candidate = e.candidate;

      if (candidate) {
        emit('ice_candidate', {
          peerID,
          label: candidate.sdpMLineIndex,
          candidate: candidate.candidate
        });

        fire('peer ice_candidate', peer, candidate);
      }
    },
    signaling_state_change: (e) => {
      fire('peer signaling_state_change', peer, e);
    },
    ice_connection_state_change: (e) => fire('peer ice_connection_state_change', peer, e),
    add_stream: (e) => fire('peer add_stream', peer, e),
    remove_stream: (e) => fire('peer remove_stream', peer, e),
    data_channel: (e) => {
      var channel = e.channel;

      fire('peer data_channel connected', peer, channel);
    }
  }, sendOffer);


  function sendOffer() {
    peer
      .initiateOffer()
      .then(
        offer => {
          console.log('!!!!!! got offer');
          emit('peer offer', {peerID, offer});
          fire('peer send offer', peer, offer);
        },
        ...error => fire(...error));
  };

  return peer;
};

/*
+  Signalling
*/
function connectToSignal(server, onReady) {
  console.log('connecting to', server);
  var socket = io(server);

  socket.rooms = [];

  function emit(event, data) { console.log('emitting', event, data); socket.emit(event, data); };

  socket.on('error', function() {
    console.log('error', arguments);
  });

  socket.on('connect', function() {
    socket.on('your_id', function(myID) {
      console.log('your_id');
      var peers = [],
          peersHash = {};

      signal.myID = myID;

      function getPeer(id) {
        return peersHash[id];
      };

      function addPeer(id, config) {
        config = config || {isExistingPeer: false};

        var peer = createPeer(id, config, emit, fire);
        peers.push(peer);
        peersHash[id] = peer;
        
        fire('peer added', peer);
      };

      function removePeerByID(id) {
        var peer = getPeer(id);
        if (peer) {
          peer.close();
          _.remove(peers, function(peer) { return peer.id === id; });
          delete peersHash[id];
          fire('peer removed', peer);
        }
      };

      function addIceCandidate(peerID, candidate) {
        var peer = getPeer(peerID);

        peer
          .addIceCandidate(candidate)
          .then(
            () => fire('peer ice_candidate accepted', peer, candidate),
            () => fire('peer error ice_candidate', peer, err, candidate));
      };

      function receiveAnswer(peerID, answer) {
        var peer = getPeer(peerID);

        peer
          .receiveAnswer(answer)
          .then(
            () => fire('peer receive answer', peer, answer),
            () => fire('peer error answer', peer, answer));
      };

      function sendAnswer(peerID, offer) {
        var peer = getPeer(peerID);

        peer
          .receiveOffer(offer)
          .then(
            answer => {
              emit('peer answer', {peerID, answer});
              fire('peer send answer', peer, answer);
            },
            ...args => fire(...args)
          );     
        
        fire('peer receive offer', peer, offer);
      };

      _.each({
        'peer list': data => _.each(data.peerIDs, peerID => addPeer(peerID, {isExistingPeer: true})),
        'peer join': id => addPeer(id),
        'peer leave': id => removePeerByID(id),
        'peer ice_candidate': data => addIceCandidate(data.peerID, data),
        'peer offer': data => sendAnswer(data.peerID, data.offer),
        'peer answer': data => receiveAnswer(data.peerID, data.answer)
      }, (handler, name) => socket.on(name, function() {
        handler.apply(this, arguments);
        fire(name, ...arguments);
      }));

      signal.ready = true;
      fire('ready', myID);
    });
  });

  function joinRoom(roomName) {
    socket.rooms.push(roomName);
    emit('room join', roomName);
  };

  function leaveRoom(roomName) {
    _.remove(socket.rooms, roomName);
    emit('room leave', roomName);
  };

  function leaveRooms() {
    _.each(socket.rooms, leaveRoom);
  }

  var signal = {
    on: on,
    off: off,
    joinRoom: joinRoom,
    leaveRoom: leaveRoom,
    leaveRooms: leaveRooms,
    currentRooms: socket.rooms
  };

  return signal;
};
/*
-  Signalling
*/

module.exports = function() {
  var signal;

  return {
    connectToSignal: function(server) {
      if (signal == null) signal = connectToSignal(server);
      else if (signal.ready) fire('ready', signal.myID); // oof, get me (this line of code) out of here
      return signal;
    },
    existingSignal: function() {
      return signal;
    }
  };
};