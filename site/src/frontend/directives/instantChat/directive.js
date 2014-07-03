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
        streams: []
      };

      $scope.participants = [localParticipant];

      localMedia.getStream({
        audio: true,
        video: {
          mandatory: {
            minWidth: 320,
            minHeight: 240,
            maxWidth: 320,
            maxHeight: 240
          }
        }
      })
        .then(stream => {
          console.log('got local stream', stream.getAudioTracks());
          localParticipant.streams.push({
            isLocal: true,
            stream, 
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

        'peer ice_candidate accepted': (peer, candidate) => console.log('candidate accepted', peer, candidate),

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
          peer,
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
            .then(peer => 
              setTimeout(() => console.log('peer', peer), 0)
            ).catch(error => console.log(error));
        }

        peer.on('remoteStream added', stream => {
          console.log('got remote stream', stream);
          participant.streams.push({
            peer,
            src: $sce.trustAsResourceUrl(URL.createObjectURL(stream.stream))
          });
          $scope.$apply();
        });
      }

      function peerRemoved(peer) {
        _.remove($scope.participants, {peer: peer});
        $scope.$apply();
      }

    }]
  };
};