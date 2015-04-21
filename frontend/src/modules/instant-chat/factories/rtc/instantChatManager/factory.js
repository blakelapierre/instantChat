var _ = require('lodash');

module.exports = ['log', '$emit', 'config', 'participants', (log, $emit, config, participants) => {
  config.on('$change', _.debounce(() => _.each(participants, p => sendConfig(p))));

  function sendConfig(participant) {
    sendMessage(participant, {
      type: 'config',
      config: config
    });
  }

  function sendToggleVoteUp(stream, voteUpStatus) {
    console.log(stream);
    sendMessageToAll({
      type: 'voteUp',
      peerID: stream.participant.id,
      streamID: stream.id,
      status: voteUpStatus
    });
  }

  function sendToggleVoteDown(stream, voteDownStatus) {
    sendMessageToAll({
      type: 'voteDown',
      peerID: stream.participant.id,
      streamID: stream.id,
      status: voteDownStatus
    });
  }

  function receiveConfig(fromParticipant, peerID, config) {
    var targetParticipant = participants.getByID(peerID);

    fromParticipant.config = config;

    $emit('participant config', {from: fromParticipant, to: targetParticipant, config: config});
  }

  function receiveToggleVoteUp(fromParticipant, peerID, streamID, voteUpStatus) {
    console.log(peerID, participants);
    var targetParticipant = participants.getByID(peerID),
        targetStream = _.find(targetParticipant.streams, {id: streamID});

    console.log('got vote up');
    $emit('stream vote up', {from: fromParticipant, to: targetParticipant, stream: targetStream, status: voteUpStatus});
  }

  function receiveToggleVoteDown(fromParticipant, peerID, streamID, voteDownStatus) {
    var targetParticipant = participants.getByID(peerID),
        targetStream = _.find(targetParticipant.streams, {id: streamID});

    $emit('stream vote down', {from: fromParticipant, to: targetParticipant, stream: targetStream, status: voteDownStatus});
  }

  var messageHandlers = {
    'voteUp': (participant, data) => receiveToggleVoteUp(participant, data.peerID, data.streamID, data.status),
    'voteDown': (participant, data) => receiveToggleVoteDown(participant, data.peerID, data.streamID, data.status),
    'config': (participant, data) => receiveConfig(participant, data.peerID, data.config)
  };

  participants.on({
    'active': addParticipant,
    'inactive': removeParticipant
  });

  function addParticipant(participant) {
    // This may be the local participant, which doesn't have a peer
    if (!participant.isLocal) {
      participant
        .peer
        .channel('instantChat')
        .then(channel => {
          channel.on('message', (channel, event) => {
            console.log(channel, event);
            var message = JSON.parse(event.data);
            messageHandlers[message.type](participant, message);
          });

          if (channel.channel.readyState == 'open') sendConfig(participant);
          else channel.on('open', () => sendConfig(participant));
        });
    }
  }

  function removeParticipant(participant) {
    // Should clean up event handlers? Yes, probably
  }

  function sendMessageToAll(message) {
    _.each(participants, participant => sendMessage(participant, message));
  }

  function sendMessage(participant, message) {
    if (!participant.isLocal) {
      try {
          var peer = participant.peer;

          console.log('sending', message, 'to', participant);
          peer.channel('instantChat').then(channel => channel.sendJSON(message));
      }
      catch (e) {
        log.error('Chat send error', e, chatChannel, message);
      }
    }
  }

  return {
    addParticipant: addParticipant,
    removeParticipant: removeParticipant,
    sendToggleVoteUp: sendToggleVoteUp,
    sendToggleVoteDown: sendToggleVoteDown
  };
}];