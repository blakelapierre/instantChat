// Coordinates your peers. Sets up connections, streams, and channels.
// Based on webrtc.io

import {Peer} from './peer';

var _ = require('lodash'),
    io = require('socket.io');

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
}

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
    if (listeners.length === 0) delete events[event];
  }
}

function fire(event) {
  var listeners = events[event] || [],
      args = Array.prototype.slice.call(arguments, 1);

  for (var i = 0; i < listeners.length; i++) {
    listeners[i].apply(null, args);
  }
}
/*
-  Event Handling
*/

function createPeer(peerID, config, emit, fire) {
  var candidates = [];

  var peer = new Peer(peerID, config, {
    'offerReady': offer => {
      emit('peer offer', {peerID, offer});
      fire('peer send offer', peer, offer);
    },

    ice_candidate: event => {
      var candidate = event.candidate;

      if (candidate) {
        candidates.push(candidate);
        emitIceCandidates();
        fire('peer ice_candidate', peer, candidate);
      }
    },

    // Do we want to be passing the raw event here?
    add_stream:                   event => fire('peer add_stream', peer, event),
    remove_stream:                event => fire('peer remove_stream', peer, event),
    data_channel:                 event => fire('peer data_channel connected', peer, event.channel),
    signaling_state_change:       event => fire('peer signaling_state_change', peer, event),
    ice_connection_state_change:  event => fire('peer ice_connection_state_change', peer, event)
  });

  var emitIceCandidates = _.throttle(() => {
    emit('peer candidates', {peerID, candidates});
    candidates.splice(0);
  }, 250);

  return peer;
}

/*
+  Signalling
*/
function connectToSignal(server) {
  var socket = io(server);

  var emit = (event, data) => socket.emit(event, data);

  socket.on('error', () => console.log('error', arguments));

  socket.on('connect', () => {
    socket.on('your_id', myID => {
      var peers = [],
          peersHash = {};

      signal.myID = myID;

      function getPeer(id) {
        return peersHash[id];
      }

      function addPeer(id, config) {
        config = config || {isExistingPeer: false};

        var peer = createPeer(id, config, emit, fire);
        peers.push(peer);
        peersHash[id] = peer;

        fire('peer added', peer);
      }

      function removePeerByID(id) {
        var peer = getPeer(id);
        if (peer) {
          peer.close();
          _.remove(peers, peer => { return peer.id === id; });
          delete peersHash[id];
          fire('peer removed', peer);
        }
      }

      function sendAnswer(peerID, offer) {
        var peer = getPeer(peerID);

        peer
          .receiveOffer(offer)
          .then(
            answer => {
              emit('peer answer', {peerID, answer});
              fire('peer send answer', peer, answer);
            },
            ...error => fire(...error)
          );

        fire('peer receive offer', peer, offer);
      }

      function receiveAnswer(peerID, answer) {
        var peer = getPeer(peerID);

        peer
          .receiveAnswer(answer)
          .then(
            () =>    fire('peer receive answer', peer, answer),
            error => fire('peer error answer', peer, error, answer));
      }

      function addIceCandidates(peerID, candidates) {
        var peer = getPeer(peerID);

        peer
          .addIceCandidates(candidates)
          .then(
            () =>    fire('peer candidates accepted', peer, candidates),
            error => fire('peer error candidates', peer, error, candidates));
      }

      _.each({

        'peer join':    id => addPeer(id),
        'peer leave':   id => removePeerByID(id),

        'peer list':  data => _.each(data.peerIDs, peerID => addPeer(peerID, {isExistingPeer: true})),

        'peer offer': data => sendAnswer(data.peerID, data.offer),
        'peer answer':data => receiveAnswer(data.peerID, data.answer),

        'peer candidates': data => addIceCandidates(data.peerID, data.candidates)

      }, (handler, name) => socket.on(name, function() {
        handler.apply(this, arguments);
        fire(name, ...arguments);
      }));

      signal.ready = true;
      fire('ready', myID);
    });
  });

  var rooms = [];

  function joinRoom(roomName) {
    rooms.push(roomName);
    emit('room join', roomName);
  }

  function leaveRoom(roomName) {
    _.remove(rooms, roomName);
    emit('room leave', roomName);
  }

  function leaveRooms() {
    _.each(rooms, leaveRoom);
  }

  var signal = {
    on: on,
    off: off,
    joinRoom: joinRoom,
    leaveRoom: leaveRoom,
    leaveRooms: leaveRooms,
    currentRooms: rooms
  };

  return signal;
}
/*
-  Signalling
*/

module.exports = function() {
  var signal;

  return {
    connectToSignal: server => {
      if (signal === undefined) signal = connectToSignal(server);
      else if (signal.ready) fire('ready', signal.myID); // oof, get me (this line of code) out of here
      return signal;
    },
    existingSignal: () => signal
  };
};