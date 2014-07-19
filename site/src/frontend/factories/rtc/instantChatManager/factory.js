module.exports = ['$emit', ($emit) => {
  var participants = [], config;

  function setConfig(participant, c) {
    console.log('!!setting config', c);
    config = c;
    _.each(participants, sendConfig);
  }

  function sendConfig(participant) {
    console.log('sending config', participant, config);
    sendMessage(participant, {
      type: 'config',
      participantID: participant.id,
      config: config
    });
  }

  function sendToggleVoteUp(stream, voteUpStatus) {
    sendMessageToAll({
      type: 'voteUp',
      participantID: stream.peer.id,
      streamID: stream.id,
      status: voteUpStatus
    });
  }

  function sendToggleVoteDown(stream, voteDownStatus) {
    sendMessageToAll({
      type: 'voteDown',
      participantID: stream.peer.id,
      streamID: stream.id,
      status: voteDownStatus
    });
  }

  function receiveConfig(fromPeer, participantID, config) {
    var fromParticipant = _.find(participants, {id: fromPeer.id}),
        targetParticipant = _.find(participants, {id: participantID});

    $emit('participant config', {from: fromParticipant, to: targetParticipant, config: config});
  }

  function receiveToggleVoteUp(fromPeer, participantID, streamID, voteUpStatus) {
    var fromParticipant = _.find(participants, {id: fromPeer.id}),
        targetParticipant = _.find(participants, {id: participantID}),
        targetStream = _.find(targetParticipant.streams, {id: streamID});

    $emit('stream vote up', {from: fromParticipant, to: targetParticipant, stream: targetStream, status: voteUpStatus});
  }

  function receiveToggleVoteDown(fromPeer, participantID, streamID, voteDownStatus) {
    var fromParticipant = _.find(participants, {id: fromPeer.id}),
        targetParticipant = _.find(participants, {id: participantID}),
        targetStream = _.find(targetParticipant.streams, {id: streamID});

    $emit('stream vote down', {from: fromParticipant, to: targetParticipant, stream: targetStream, status: voteDownStatus});
  }

  var messageHandlers = {
    'voteUp': (peer, data) => receiveToggleVoteUp(peer, data.participantID, data.streamID, data.status),
    'voteDown': (peer, data) => receiveToggleVoteDown(peer, data.participantID, data.streamID, data.status),
    'config': (peer, data) => receiveConfig(peer, data.participantID, data.config)
  };

  function addParticipant(participant) {
    participants.push(participant);

    // This may be the local participant, which doesn't have a peer
    if (!participant.isLocalParticipant) {
      var channel = participant.peer.channel('instantChat');

      channel.on({
        message: (channel, event) => {
          console.log(channel, event);
          var message = JSON.parse(event.data);
          messageHandlers[message.type](channel.peer, message);
        },
        open: (channel, event) => {
          sendConfig(participant);
        }
      });

      if (channel.channel.readyState == 'open') sendConfig(participant);
    }
  }

  function removeParticipant(participant) {
    var index = participants.indexOf(participant);
    if (index != -1) {
      participants.splice(index, 1);
    }
  }

  function sendMessageToAll(message) {
    _.each(participants, participant => sendMessage(participant, message));
  }

  function sendMessage(participant, message) {
    if (!participant.isLocalParticipant) {
      try {
          var peer = participant.peer,
              chatChannel = peer.channel('instantChat');
          if (chatChannel) chatChannel.sendJSON(message);
      }
      catch (e) {
        console.log('Chat send error', e, chatChannel, message);
      }
    }
  }

  return {
    setConfig: setConfig,
    addParticipant: addParticipant,
    removeParticipant: removeParticipant,
    sendToggleVoteUp: sendToggleVoteUp,
    sendToggleVoteDown: sendToggleVoteDown
  };
}];