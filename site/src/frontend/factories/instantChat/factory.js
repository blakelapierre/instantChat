module.exports = [
  '$rootScope', 'log', 'participants', 'rtc', 'emitter',
    'instantChatManager', 'config', 'localMedia',
  ($rootScope, log, participants, rtc, emitter,
    instantChatManager, config, localMedia) => {

  var {emit, on, off} = emitter();

  var instantChat = {
    // Methods
    sendMessage: sendMessage,
    shareFile: shareFile,

    connect: connect,
    disconnect: disconnect,

    on: on,
    off: off,

    // Observable Data
    participants: participants,
    activeParticipants: [],

    // These will have values populated once connect is called
    signal: undefined,
    localParticipant: undefined,
    roomName: undefined
  };

  var activeParticipants = instantChat.activeParticipants;

  var connectPromise;

  // Should this be what we return as the factory?
  function connect(url) {
    connectPromise = connectPromise || new Promise((resolve, reject) => {
      var signal = instantChat.signal = rtc(url);

      signal.on({
        // Room Events
        'ready':       ready,
        'room join':   joinRoom,
        'room leave':  leaveRoom,

        'peer add':    peer => participants.add({peer: peer, localStreams: instantChat.localParticipant.streams}),
        'peer remove': peer => participants.removeByPeer(peer),

        // Informational
        'peer receive offer':               peer => log.status(peer.id, 'Offer Received'),
        'peer receive answer':              peer => log.status(peer.id, 'Answer Received'),
        'peer send offer':                  peer => log.status(peer.id, 'Offer Sent'),
        'peer send answer':                 peer => log.status(peer.id, 'Answer Sent'),
        'peer signaling_state_change':      peer => log.status(peer.id, 'Signaling:', peer.connection.signalingState),
        'peer ice_connection_state_change': peer => log.status(peer.id, 'ICE:', peer.connection.iceConnectionState),

        // Errors
        'peer error set_local_description':   (peer, error, offer) =>     log.error('peer error set_local_description', peer, error, offer),
        'peer error set_remote_description':  (peer, error, offer) =>     log.error('peer error set_remote_description', peer, error, offer),
        'peer error send answer':             (peer, error, offer) =>     log.error('peer error send answer', peer, error, offer),
        'peer error create offer':            (peer, error) =>            log.error('peer error create offer', peer, error),
        'peer error ice_candidate':           (peer, error, candidate) => log.error('peer error ice_candidate', peer, error, candidate)
      });

      // TODO: remove these listeners?
      participants.on({
        'add':    participant => emit('participant add', participant),
        'remove': participant => emit('participant remove', participant),

        'active': participant => {
          activeParticipants.push(participant);
          emit('participant active', participant);
        },

        'inactive': participant => {
          console.log('inactive');
          _.remove(activeParticipants, {id: participant.id});
          emit('participant inactive', participant);
        },

        'stream add':    (participant, stream) => {
          // Probably not the best place for this!
          if (participant.isLocal) {
            console.log('new local stream, adding to all participants');
            _.each(participants, remoteParticipant => {
              console.log(participant, remoteParticipant);
              if (participant != remoteParticipant) {
                console.log('adding stream to', remoteParticipant)
                remoteParticipant.peer.addLocalStream(stream.rawStream);
              }
            });
          }
          emit('stream add', participant, stream);
        },
        'stream remove': (participant, stream) => emit('stream remove', participant, stream)
      });

      function ready(handle) {
        var localParticipant = instantChat.localParticipant = participants.add({id: handle, isLocal: true, config: config});
        instantChat.connected = true;
        resolve(signal, localParticipant);
      }

      function joinRoom(name) {
        instantChat.roomName = name;
        emit('room join', name);
      }

      function leaveRoom(name) {
        instantChat.roomName = undefined;

        participants.removeAllExceptLocal();

        instantChat.localParticipant.streams.removeAll();

        emit('room leave', name);
      }
    });

    return connectPromise;
  }

  function disconnect() {
    //Need to do more here
    connectPromise = null;
    _.each(instantChat.localParticipant.streams, stream => stream.rawStream.__doneWithStream())
    instantChat.signal.close();
  }

  function sendMessage(message) {

  }

  function shareFile(file) {

  }

  return instantChat;
}];