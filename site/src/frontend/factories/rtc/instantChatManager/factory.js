module.exports = ['$emit', ($emit) => {
  var participants = [];

  function sendToggleVoteUp(stream, voteUpStatus) {
    console.log('sending', stream, voteUpStatus, 'to', participants);
    _.each(participants, participant => {
      var peer = participant.peer;
      if (peer) {
        var channel = peer.channel('instantChat');

        channel.sendJSON({
          type: 'voteUp',
          participantID: stream.peer.id,
          streamID: stream.id,
          status: voteUpStatus
        });
      }
    });
  }

  function sendToggleVoteDown(stream, voteDownStatus) {
    _.each(participants, participant => {
      var peer = participant.peer;
      if (peer) {
        var channel = peer.channel('instantChat');

        channel.sendJSON({
          type: 'voteDown',
          participantID: stream.peer.id,
          streamID: stream.id,
          status: voteDownStatus
        });
      }
    });
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
    'voteDown': (peer, data) => receiveToggleVoteDown(peer, data.participantID, data.streamID, data.status)
  };

  function addParticipant(participant) {
    participants.push(participant);

    // This may be the local participant, which doesn't have a peer
    if (participant.peer) {
      participant.peer.channel('instantChat').on({
        message: (channel, event) => {
          console.log(channel, event);
          var message = JSON.parse(event.data);
          messageHandlers[message.type](channel.peer, message);
        }
      });
    }
  }

  function removeParticipant(participant) {
    var index = participants.indexOf(participant);
    if (index != -1) {
      participants.splice(index, 1);
    }
  }

  return {
    addParticipant: addParticipant,
    removeParticipant: removeParticipant,
    sendToggleVoteUp: sendToggleVoteUp,
    sendToggleVoteDown: sendToggleVoteDown
  };
}];