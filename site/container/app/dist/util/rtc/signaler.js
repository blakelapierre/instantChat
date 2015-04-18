"use strict";
module.exports = (function(emitter) {
  if (!emitter)
    emitter = require('../emitter')();
  return (function(transport) {
    var $__0 = $traceurRuntime.assertObject(emitter()),
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
    var peers = $traceurRuntime.assertObject(signaler).peers;
    var send = $traceurRuntime.assertObject(transport).emit;
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
