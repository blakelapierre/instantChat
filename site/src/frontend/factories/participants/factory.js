var _ = require('lodash');

module.exports = ['$timeout', 'rtc', 'emitter', 'streams', 'instantChatChannelHandler',
($timeout, rtc, emitter, streams, instantChatChannelHandler) => {
  var participants = [],
      participantsMap = {},
      nextOrdinal = 0,
      {emit, on, off} = emitter();

  _.extend(participants, {
    add: add,
    remove: remove,
    removeByPeer: removeByPeer,
    removeAllExceptLocal: removeAllExceptLocal,

    getByID: getByID,

    on: on,
    off: off
  });

  return participants;

  function add(config) {
    console.log('adding participant', config);

    var registeredListeners = [];

    var peer = config.peer;

    var participant = {};

    _.extend(participant, {
      id: 'local',
      ordinal: nextOrdinal++,
      config: {},
      peer: undefined,
      isActive: !!config.isLocal,
      isLocal: false,
      streams: streams(participant),

      on: on,
      off: off,

      _registeredListeners: registeredListeners
    });

    _.extend(participant, config);

    participants.push(participant);

    if (participant.isActive) $timeout(() => emit('active', participant), 100);

    if (peer) {
      participant.id = peer.id;

      _.each(config.localStreams, stream => peer.addLocalStream(stream.rawStream));

      listenTo(peer, {
        'remoteStream add': stream => {
          console.log('remoteStream add', stream);
          participant.streams.add(stream.stream);
        },
        //this event doesn't exist yet
        'remoteStream removed': stream => participant.streams.remove(),

        'disconnected': () => remove(participant)
      });

      if (peer.config.isExistingPeer) {
        var channel = peer.addChannel('instantChat', null, instantChatChannelHandler());
        peer.connect()
          .then(
            peer => {
              participant.isActive = true;
              console.log('participant active');
              emit('active', participant);
            },
            error => log.error(error));
      }
      else {
        peer.on('channel add', channel => {
          if (channel.label === 'instantChat') {
            channel.attachHandler(instantChatChannelHandler());
            participant.isActive = true;
            emit('active', participant);
          }
        });
      }
    }

    participantsMap[participant.id] = participant;

    listenTo(participant.streams, {
      'add':    stream => {
        if (participant.peer.remoteStreams.indexOf(stream) == -1 &&
            participant.peer.localStreams.indexOf(stream) == -1) {
          participant.peer.addLocalStream(stream);
        }
        emit('stream add', participant, stream);
      },
      'remove': stream => emit('stream remove', participant, stream)
    });

    emit('add', participant);

    function listenTo(obj, listeners) {
      registeredListeners.push(obj.on(listeners));
    }

    return participant;
  }

  function remove(participant) {
    console.log('removing', participant, 'from', participants);
    participant.isActive = false;
    emit('inactive', participant);

    var peer = participant.peer;
    if (peer) delete participantsMap[peer.id];

    var index = _.indexOf(participants, participant);
    if (index >= 0) participants.splice(index, 1);

    destroy(participant);

    console.log(participants);

    emit('remove', [participant]);
  }

  function destroy(participant) {
    participant.peer.close();

    _.each(participant._registeredListeners, listeners => {
      _.each(listeners, unreg => unreg());
    });
  }

  function removeByPeer(peer) {
    var participant = _.find(participants, {peer: {id: peer.id}});
    if (participant) remove(participant);
  }

  function removeAllExceptLocal() {
    var removed = _.remove(participants, participant => {
      if (!participant.isLocal) {
        destroy(participant);
        return true;
      }
      return false;
    });

    emit('remove', removed);
  }

  function getByID(id) {
    return participantsMap[id];
  }
}];