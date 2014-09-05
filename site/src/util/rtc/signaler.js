module.exports = ['emitter', emitter => {
  return transport => {
    var {emit, on, off} = emitter();
    var {send} = transport;

    var signaler = {
      peers: {},
      peerCount: 0,

      managePeer: managePeer,
      dropPeer: dropPeer
    };
    var {peers} = signaler;

    transport.on({
      'offer':      data => receiveOffer(data.peerID, data.offer),
      'answer':     data => receiveAnswer(data.peerID, data.answer),
      'candidates': data => receiveIceCandidates(data.peerID, data.candidates)
    });

    function managePeer(peer) {
      var peerID = peer.id,
          candidates = [];

      peers[peerID] = peer;
      signaler.peersCount++;

      peer.on({
        'offer ready': offer => {
          send('peer offer', {peerID, offer});
          emit('peer send offer', peer, offer);
        },

        ice_candidate: event => {
          var candidate = event.candidate;

          if (candidate) {
            candidates.push(candidate);
            sendIceCandidates();
            emit('peer ice_candidate', peer, candidate);
          }
        },
      });

      // Is this the best way to do this?
      var sendIceCandidates = _.throttle(() => {
        send('peer candidates', {peerID, candidates});
        candidates.splice(0);
      }, 0);
    }

    function dropPeer(peer) {
      var storedPeer = peers[peer.id];
      if (storedPeer) {
        storedPeer.off();
        delete peers[peer.id];
        signaler.peerCount--;
      }
    }

    function receiveOffer(peerID, offer) {
      var peer = getPeer(peerID);

      emit('peer receive offer', peer, offer);
      peer
        .receiveOffer(offer)
        .then(
          answer => {
            send('peer answer', {peerID, answer});
            emit('peer send answer', peer, answer);
          },
          ...error => emit(...error));

      emit('peer receive offer', peer, offer);
    }

    function receiveAnswer(peerID, answer) {
      var peer = getPeer(peerID);

      emit('peer receive answer', peer, answer);
      peer
        .receiveAnswer(answer)
        .then(
          () =>       emit('peer accepted answer', peer, answer),
          ...error => emit('peer error answer', peer, answer, ...error));
    }

    function receiveIceCandidates(peerID, candidates) {
      var peer = getPeer(peerID);

      emit('peer candidates receieved', peer, candidates);
      peer
        .addIceCandidates(candidates)
        .then(
          () =>       emit('peer candidates accepted', peer, candidates),
          ...error => emit('peer error candidates', peer, candidates, ...error));
    }

    function getPeer(id) {
      var peer = peers[id];

      if (peer) return peer;

      throw 'Tried to get non-existent peer!';
    }

    return signaler;
  };
}];