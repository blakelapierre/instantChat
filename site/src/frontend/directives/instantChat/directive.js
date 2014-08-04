import {InstantChatChannelHandler} from '../../factories/rtc/instantChatChannelHandler/factory';

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
      $scope.videoLoaded = event => log(event);

      $scope.toggleFullscreen = () => {
        if (isFullscreen()) exitFullscreen();
        else enterFullscreen();
      };

      document.addEventListener('fullscreenchange', updateFullscreenMessage);
      document.addEventListener('webkitfullscreenchange', updateFullscreenMessage);
      document.addEventListener('mozfullscreenchange', updateFullscreenMessage);

      function updateFullscreenMessage() {
        $scope.fullscreenMessage = isFullscreen() ? 'Exit Fullscreen' : 'Go Fullscreen';
      }

      function isFullscreen() {
        return !!document.fullscreenElement || !!document.mozFullScreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement;
      }

      function exitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        updateFullscreenMessage();
      }

      function enterFullscreen() {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        else if (document.documentElement.msRequestFullscreen) document.documentElement.msRequestFullscreen();
        else if (document.documentElement.mozRequestFullScreen) document.documentElement.mozRequestFullScreen();
        else if (document.documentElement.webkitRequestFullscreen) document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        updateFullscreenMessage();
      }

      updateFullscreenMessage();
    },
    controller:
      ['$rootScope', '$scope', '$sce', '$location', '$timeout', '$interval', '$resource', '$window', '$$rAF', 'log', 'rtc', 'localMedia', 'instantChatChannelHandler', 'instantChatManager', 'config',
      ($rootScope, $scope, $sce, $location, $timeout, $interval, $resource, $window, $$rAF, log, rtc, localMedia, instantChatChannelHandler, instantChatManager, config) => {

      log.info('Entering instantChat controller');

      localMedia.getDevices()
        .then(devices => $scope.sources = devices)
        .catch(error => log.error('Error retrieving sources', error));

      $window.addEventListener('click', () => {
        toggleBars();
        $scope.$apply();
      });

      $scope.menuIsCollapsed = false;
      $scope.hideBars = true;

      $scope.expandMenu = () => {
        $scope.menuIsCollapsed = false;
        toggleBars(true);
      };

      $scope.collapseMenu = () => {
        $scope.menuIsCollapsed = true;
        toggleBars(false);
      };

      function toggleBars(hide) {
        var changed = $scope.hideBars != hide;

        $scope.hideBars = hide != null ? hide === true : !$scope.hideBars;

        if (changed) {
          $scope.resizing = $$rAF(broadcastResize);
          $timeout(() => $scope.resizing(), 1000);
        }
      }

      function broadcastResize() {
        $rootScope.$broadcast('resize');
        $scope.resizing = $$rAF(broadcastResize);
      }

      var rootScopeCleanup = [];

      var localParticipant = {
        isLocal: true,
        config: config,
        streams: []
      };

      $scope.localParticipant = localParticipant;
      $scope.config = localParticipant.config;
      $scope.participants = [localParticipant];
      $scope.activeParticipants = [];

      localMedia.getStream({
        audio: true,
        video: {
          mandatory: {
            minWidth: 320,
            maxWidth: 320,
            minHeight: 240,
            maxHeight: 240
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

          $rootScope.localStream = stream;

          $scope.$apply();
        })
        .catch(error => $rootScope.$broadcast('error', 'Could not access your camera. Please try refreshing the page!', error));

      var signalListeners = {
        'ready': handle => {
          localParticipant.id = handle;
          joinRoom();
        },

        'peer added':   createParticipant,
        'peer removed': removeParticipant,

        // 'peer ice_candidate': () => log('ICE Candidate Received'),
        'peer receive offer':  () => log('Offer Received'),
        'peer receive answer': () => log('Answer Received'),

        'peer send answer':    () => log('Answer Sent'),

        'peer signaling_state_change':      peer => log('Signaling: ' + peer.connection.signalingState),
        'peer ice_connection_state_change': peer => log(      'ICE: ' + peer.connection.iceConnectionState),

        //'peer ice_candidate accepted': (peer, candidate) => log('candidate accepted', peer, candidate),

        'peer error set_local_description':  (peer, error, offer) => log.error('peer error set_local_description', peer, error, offer),
        'peer error set_remote_description': (peer, error, offer) => log.error('peer error set_remote_description', peer, error, offer),

        'peer error create offer': (peer, error)        => log.error('peer error create offer', peer, error),
        'peer error send answer':  (peer, error, offer) => log.error('peer error send answer', peer, error, offer),

        'peer error ice_candidate': (peer, error, candidate) => log.error('peer error ice_candidate', peer, error, candidate)
      };

      var signal = rtc.connectToSignal('https://' + $location.host(), signalListeners);

      $scope.currentRoom = {name: null};
      $scope.currentRooms = signal.currentRooms;

      function joinRoom() {
        log('joining room', $location.path());
        signal.leaveRooms();

        var room = $location.path().replace(/^\//, '');

        if (room) {
          $scope.currentRoom.name = room;
          signal.joinRoom(room);
        }
      }

      function addActiveParticipant(participant) {
        if (!participant.isActive) {
          participant.isActive = true;

          $scope.activeParticipants.push(participant);

          instantChatManager.addParticipant(participant);
        }
      }

      function createParticipant(peer) {
        localMedia.getStream()
          .then(
            stream => {
              var participant = {
                id: peer.id,
                peer: peer,
                streams: [],
                isActive: false,
                config: {}
              };

              $scope.participants.push(participant);

              peer.addLocalStream('local', stream);

              if (peer.config.isExistingPeer) {
                var channel = peer.addChannel('instantChat', null, instantChatChannelHandler($scope));
                peer.connect()
                  .then(
                    peer => {
                      addActiveParticipant(participant);
                      $scope.$apply();
                    },
                    error => log.error(error));
              }
              else {
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

              peer.on('disconnected', removeParticipant);

              $rootScope.$broadcast('participant added', participant);

              $scope.$apply();
            },
            error => log.error('*** Error getting local media stream', error));
      }

      function removeParticipant(peer) {
        // Occasionally, the localParticipant has been removed. It's likely that is because a null/undefined
        // is being passed as peer here. Not sure what's causing it, but adding a guard here for now.
        var participant = _.find($scope.participants, {peer: peer, isLocal: undefined});

        if (participant) {
          log('removing', participant);
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

      $scope.$watchCollection('config', _.debounce(config => {
        log(config);
      }, 500));

      //onRootScope('$locationChangeSuccess', joinRoom);

      onRootScope('error', ($event, message, error) => {
        $scope.errorMessage = message;
        log.error('Global Error', message, error);
        $scope.$apply(); // is this necessary?
      });

      onRootScope('stream vote up', ($event, data) => {
        var from = data.from,
            to = data.to,
            stream = data.stream,
            status = data.status;

        if (stream.votes.length > 3) stream.votes.shift();
        stream.votes.push({vote: 'up', status: status, from: from});
        $timeout(() => stream.votes.shift(), 4000);
        $scope.$apply();
      });

      onRootScope('stream vote down', ($event, data) => {
        var from = data.from,
            to = data.to,
            stream = data.stream,
            status = data.status;

        if (stream.votes.length > 3) stream.votes.shift();
        stream.votes.push({vote: 'down', status: status, from: from});
        $timeout(() => stream.votes.shift(), 4000);
        $scope.$apply();
      });

      onRootScope('participant config', ($event, data) => {
        var from = data.from,
            config = data.config;

        from.config = config;
        $scope.$apply();
      });

      var Images = $resource('/images');
      onRootScope('localThumbnail', ($event, participant, stream, imageData) => {
        Images.save({
          id: localParticipant.id,
          data: imageData
        });
      });

      $scope.$on('$destroy', () => {
        signal.leaveRooms();
        signal.off(signalListeners);
        _.each(rootScopeCleanup, fn => fn());
        rootScopeCleanup.splice(0);
        $window.removeEventListener(toggleBars);
      });

      function onRootScope(eventName, listener) {
        rootScopeCleanup.push($rootScope.$on(eventName, listener));
      }
    }]
  };
};