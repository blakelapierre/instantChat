import {InstantChatChannelHandler} from '../../factories/rtc/instantChatChannelHandler/factory';

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
      var domElement = element[0];

      $scope.videoLoaded = event => console.log(event);

      $scope.toggleFullscreen = () => {
        //Using Mozilla's polyfill...
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
          } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
          } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      };

      document.addEventListener('fullscreenchange', updateFullscreenMessage);
      document.addEventListener('webkitfullscreenchange', updateFullscreenMessage);
      document.addEventListener('mozfullscreenchange', updateFullscreenMessage);

      function updateFullscreenMessage() {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
          $scope.fullscreenMessage = 'Go Fullscreen';
        } else {
          $scope.fullscreenMessage = 'Exit Fullscreen';
        }
      }

      updateFullscreenMessage();
    },
    controller:
      ['$rootScope', '$scope', '$sce', '$location', '$timeout', 'rtc', 'localMedia', 'instantChatChannelHandler', 'instantChatManager',
      ($rootScope, $scope, $sce, $location, $timeout, rtc, localMedia, instantChatChannelHandler, instantChatManager) => {

      var localParticipant = {
        localParticipant: true,
        config: {participantName: 'Blake'},
        streams: []
      };

      $scope.config = localParticipant.config;
      $scope.participants = [localParticipant];
      $scope.activeParticipants = [];

      instantChatManager.setScope($rootScope);

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
          localParticipant.streams.push({
            isLocal: true,
            stream: stream,
            votes: [],
            src: $sce.trustAsResourceUrl(URL.createObjectURL(stream))
          });

          addActiveParticipant(localParticipant);

          $scope.$apply();
        })
        .catch(error => $rootScope.$broadcast('error', 'Could not access your camera. Please try refreshing the page!', error));

      var signal = rtc.connectToSignal('https://' + $location.host());

      signal.on({
        'ready': handle => {
          localParticipant.id = handle;
          joinRoom();
        },

        'peer added':   addPeer,
        'peer removed': removePeer,

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

      $rootScope.$on('$locationChangeSuccess', joinRoom);

      function joinRoom() {
        var room = $location.path().replace(/^\//, '');

        $scope.currentRoom = room;

        signal.leaveRooms();
        signal.joinRoom(room);
      }

      function addActiveParticipant(participant) {
        if (!participant.isActive) {
          participant.isActive = true;

          $scope.activeParticipants.push(participant);

          instantChatManager.addParticipant(participant);
        }
      }

      function addPeer(peer) {
        var participant = {
          id: peer.id,
          peer: peer,
          streams: [],
          isActive: false
        };

        $scope.participants.push(participant);

        localMedia.getStream()
          .then(
            stream => {
              peer.addLocalStream('local', stream);

              if (peer.config.isExistingPeer) {
                var channel = peer.addChannel('instantChat', null, instantChatChannelHandler($scope));

                peer.connect()
                  .then(
                    peer => {
                      addActiveParticipant(participant);
                      $scope.$apply();
                    },
                    error => console.log(error));
              }
              $scope.$apply();
            },
            error => console.log('*** Error getting local media stream', error));


        if (!peer.config.isExistingPeer) {
          peer.on('channel added', channel => {
            if (channel.label === 'instantChat') {
              channel.attachHandler(instantChatChannelHandler($scope));
              addActiveParticipant(participant);
            }
            $scope.$apply();
          });
        }

        peer.on('remoteStream added', stream => {
          participant.streams.push({
            peer: peer,
            votes: [],
            src: $sce.trustAsResourceUrl(URL.createObjectURL(stream.stream))
          });

          $scope.$apply();
        });

        peer.on('disconnected', removePeer);

        $scope.$apply();

        $rootScope.$broadcast('participant added', participant);
      }

      function removePeer(peer) {
        // Occasionally, the localParticipant has been removed. It's likely that is because a null/undefined
        // is being passed as peer here. Not sure what's causing it, but adding a guard here for now.
        var participant = _.find($scope.participants, {peer: peer, isLocalParticipant: undefined});

        if (participant) {
          console.log('removing', participant);
          var index = $scope.participants.indexOf(participant);

          if (index != -1) {
            $scope.participants.splice(index, 1);
            $scope.$apply();
            $timeout(() => $rootScope.$broadcast('participant removed', participant), 0);
          }

          if (participant.isActive) {
            index = $scope.activeParticipants.indexOf(participant);
            instantChatManager.removeParticipant(participant);
            $scope.activeParticipants.splice(index, 1);
            $scope.$apply();
            $rootScope.$broadcast('activeParticipant removed', participant);
          }
        }
      }

      $scope.$watchCollection('config', config => {
        console.log(config);
      });

      $rootScope.$on('error', (event, message, error) => {
        $scope.errorMessage = message;
        console.log('Global Error', message, error);
        $scope.$apply(); // is this necessary?
      });

      $rootScope.$on('stream vote up', (event, data) => {
        var from = data.from,
            to = data.to,
            stream = data.stream,
            status = data.status;

        if (stream.votes.length > 3) stream.votes.shift();
        stream.votes.push({vote: 'up', status: status, from: from});
        $timeout(() => stream.votes.shift(), 4000);
        $scope.$apply();
      });

      $rootScope.$on('stream vote down', (event, data) => {
        var from = data.from,
            to = data.to,
            stream = data.stream,
            status = data.status;

        if (stream.votes.length > 3) stream.votes.shift();
        stream.votes.push({vote: 'down', status: status, from: from});
        $timeout(() => stream.votes.shift(), 4000);
        $scope.$apply();
      });
    }]
  };
};