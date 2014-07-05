module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
      $scope.videoLoaded = event => console.log(event);
    },
    controller: ['$rootScope', '$scope', '$sce', '$location', 'rtc', 'localMedia', ($rootScope, $scope, $sce, $location, rtc, localMedia) => {
      var localParticipant = {
        localParticipant: true,
        config: {participantName: 'Blake'},
        streams: []
      };

      $scope.config = localParticipant.config;
      $scope.participants = [localParticipant];

      localMedia.getStream({
        audio: true,
        video: {
          mandatory: {
            minWidth: 320,
            maxWidth: 320,
            minHeight: 240,
            maxHeight: 240,
            maxFrameRate: 15
          }
        }
      })
        .then(stream => {
          console.log('got local stream', stream.getAudioTracks());
          localParticipant.streams.push({
            isLocal: true,
            stream: stream,
            src: $sce.trustAsResourceUrl(URL.createObjectURL(stream))
          });
          $scope.$apply();
        })
        .catch(error => console.log(error));

      var signal = rtc.connectToSignal('https://' + $location.host());

      signal.on({
        'ready': handle => console.log('got handle', handle),

        'peer added':   addPeer,
        'peer removed': peerRemoved,

        // 'peer ice_candidate': () => console.log('ICE Candidate Received'),
        'peer receive offer':  () => console.log('Offer Received'),
        'peer receive answer': () => console.log('Answer Received'),

        'peer send answer':    () => console.log('Answer Sent'),

        'peer signaling_state_change':      peer => console.log('Signaling: ' + peer.connection.signalingState),
        'peer ice_connection_state_change': peer => console.log(      'ICE: ' + peer.connection.iceConnectionState),

        //'peer ice_candidate accepted': (peer, candidate) => console.log('candidate accepted', peer, candidate),

        'peer error set_local_description':  (peer, error, offer) => console.log('peer error set_local_description', peer, error, offer),
        'peer error set_remote_description': (peer, error, offer) => console.log('peer error set_remote_description', peer, error, offer),

        'peer error create offer': (peer, error)        => console.log('peer error create offer', peer, error),
        'peer error send answer':  (peer, error, offer) => console.log('peer error send answer', peer, error, offer),

        'peer error ice_candidate': (peer, error, candidate) => console.log('peer error ice_candidate', peer, error, candidate)
      });

      $scope.currentRooms = signal.currentRooms;

      $rootScope.$on('$locationChangeSuccess', event => {
        var room = $location.path().replace(/^\//, '');

        $scope.currentRoom = room;

        signal.leaveRooms();
        signal.joinRoom(room);
      });

      function addPeer(peer) {
        console.log('peer added', peer);
        var participant = {
          peer: peer,
          streams: []
        };

        $scope.participants.push(participant);

        localMedia.getStream()
          .then(
            stream => {
              peer.addLocalStream('local', stream);
              $scope.$apply();
            }
          ).catch(error => console.log('*** Error getting local media stream', error));

        if (peer.config.isExistingPeer) {
          peer.connect()
            .then(peer => {
              console.log('^^^ adding chat channel');
              var channel = peer.addChannel('chat', null, {
                message: (channel, event) => console.log('message', event),
                open: event => console.log('open'),
                close: event => console.log('close'),
                error: event => console.log('error')
              });
              console.log('channel', channel);

              console.log('Have Peer', peer);
            }).catch(error => console.log(error));
        }
        else {
          peer.on('channel added', channel => {
            channel.send('hello');
          });
        }

        peer.on('remoteStream added', stream => {
          console.log('got remote stream', stream);
          participant.streams.push({
            peer: peer,
            src: $sce.trustAsResourceUrl(URL.createObjectURL(stream.stream))
          });
          $scope.$apply();
        });

        $scope.$apply();

        $rootScope.$broadcast('participant added', participant);
      }

      function peerRemoved(peer) {
        var participant = _.find($scope.participants, {peer: peer}),
            index = $scope.participants.indexOf(participant);

        if (index != -1) {
          $scope.participants.splice(index, 1);
          $scope.$apply();
          $rootScope.$broadcast('participant removed', participant);
        }
      }

      $scope.$watchCollection('config', config => {
        console.log(config);
      });
    }]
  };
};