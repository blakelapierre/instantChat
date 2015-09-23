module.exports = [
  '$rootScope', 'log', 'participants', 'rtc', 'emitter',
    'instantChatManager', 'config', 'localMedia', 'identity',
  ($rootScope, log, participants, rtc, emitter,
    instantChatManager, config, localMedia, identity) => {

  var {emit, on, off} = emitter();

  var instantChat = {
    status: 'not-connected',

    // Methods
    sendMessage: sendMessage,
    shareFile: shareFile,

    broadcast: broadcast,

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

  let {activeParticipants} = instantChat;

  let connectPromise,
      broadcastPromiseFns = {};

  const {location} = window,
        {protocol, hostname} = location;

  connect(`${protocol}//${hostname}:3006`);

  return instantChat;

  // Should this be what we return as the factory?
  function connect(url) {
    setStatus('connecting');

    connectPromise = connectPromise || new Promise((resolve, reject) => {
      identity
        .get((...args) => console.log('notification', ...args))
        .then(fingerprint => {
          console.log('have fingerprint', fingerprint);
          var signal = instantChat.signal = rtc(url, fingerprint);

          signal.on({
            // Room Events
            'connect':     connect,
            'disconnect':  disconnect,

            'ready':       ready,
            'room join':   joinRoom,
            'room leave':  leaveRoom,

            'peer add':    peer => participants.add({peer: peer, localStreams: instantChat.localParticipant.streams}),
            'peer remove': peer => participants.removeByPeer(peer),

            'broadcast_ready': peer => broadcastReady(peer),
            'broadcast_error': error => broadcastError(error),

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
          log('inactive');
          _.remove(activeParticipants, {id: participant.id});
          emit('participant inactive', participant);
        },

        'stream add':    (participant, stream) => {
          emit('stream add', participant, stream);
        },
        'stream remove': (participant, stream) => emit('stream remove', participant, stream)
      });

      function connect(handle) {
        setStatus('connected');
      }

      function disconnect() {
        setStatus('not-connected');
      }

      function ready(handle) {
        var localParticipant = instantChat.localParticipant = participants.add({id: handle, isLocal: true, config: config});
        instantChat.connected = true;
        resolve(instantChat.signal, localParticipant);
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

      function broadcastReady(peer) {
        console.log('broadcast readly', peer, broadcastPromiseFns);
        broadcastPromiseFns.resolve(peer);
        broadcastPromiseFns.resolve = undefined;
        broadcastPromiseFns.reject = undefined;
      }

      function broadcastError(error) {
        console.log('broadcast error', error);
        broadcastPromiseFns.reject(error);
        broadcastPromiseFns.resolve = undefined;
        broadcastPromiseFns.reject = undefined;
      }
    });

    return connectPromise;
  }

  function setStatus(status) {
    instantChat.status = status;
    emit('statusChange', status);
  }

  function disconnect() {
    //Need to do more here
    connectPromise = null;
    _.each(instantChat.localParticipant.streams, stream => stream.rawStream.__doneWithStream());
    instantChat.signal.close();
  }

  function sendMessage(message) {

  }

  function shareFile(file) {

  }

  // Careful, we are relying on adminRoom
  // to eventually cause the promise to terminate
  function broadcast(roomName) {
    return new Promise((resolve, reject) => {
      instantChat.signal.adminRoom(roomName, {command: 'broadcast'});
      broadcastPromiseFns.resolve = resolve;
      broadcastPromiseFns.reject = reject;
      console.log(broadcastPromiseFns);
    });
  }
}];