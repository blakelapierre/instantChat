// Coordinates your peers. Sets up connections, streams, and channels.
// Based on webrtc.io

import {Peer} from './peer';

var _ = require('lodash'),
    io = require('socket.io');

module.exports = ['log', 'emitter', (log, emitter) => {
  var signal;

  var {emit: fire, on, off} = emitter();

  return (server, listeners) => {
    if (signal === undefined) signal = connectToSignal(server);

    if (listeners) signal.on(listeners);

    if (signal.ready) setTimeout(() => fire('ready', signal.myID), 0); // oof, get me (this line of code) out of here

    return signal;
  };

    /*
  +  Signalling
  */
  function connectToSignal(server) {
    var signal = {
      on: on,
      off: off,
      joinRoom: joinRoom,
      leaveRoom: leaveRoom,
      leaveRooms: leaveRooms,
      currentRooms: rooms,
      close: close
    };

    var peers = [],
        peersHash = {},
        rooms = [];

    var socket = io(server);

    var emit = (event, data) => socket.emit(event, data);

    socket.on('error', (...args) => log.error('Failed to connect socket.io', ...args));

    socket.on('connect', () => {
      log.info('Connected to server');
    });

    socket.on('your_id', myID => {
      log('Got ID', myID);

      signal.myID = myID;

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

    function getPeer(id) {
      return peersHash[id];
    }

    function addPeer(id, config) {
      config = config || {isExistingPeer: false};

      var peer = createPeer(id, config, emit, fire);
      peers.push(peer);
      peersHash[id] = peer;

      fire('peer add', peer);
    }

    function removePeerByID(id) {
      var peer = getPeer(id);
      if (peer) {
        peer.close();
        _.remove(peers, peer => { return peer.id === id; });
        delete peersHash[id];
        fire('peer remove', peer);
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

    function joinRoom(roomName) {
      rooms.push(roomName);
      emit('room join', roomName);
      fire('room join', roomName);
    }

    function leaveRoom(roomName) {
      var index = _.indexOf(rooms, roomName);
      if (index >= 0) rooms.splice(index, 1);
      emit('room leave', roomName);
      fire('room leave', roomName);
    }

    function leaveRooms() {
      for (var i = rooms.length -1; i >= 0; i--) leaveRoom(rooms[i]);
    }

    function close() {
      socket.close();
      _.each(peers, peer => peer.close());
      signal = undefined;
    }

    return signal;
  }
  /*
  -  Signalling
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
}];