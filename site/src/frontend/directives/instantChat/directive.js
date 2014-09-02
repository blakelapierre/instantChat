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
      ['$rootScope', '$scope', '$sce', '$location', '$timeout',
       '$interval', '$resource', '$window', '$$rAF', 'log', 'instantChat',
       'localMedia', 'instantChatChannelHandler', 'instantChatManager',
       'config', 'participants',
      ($rootScope, $scope, $sce, $location, $timeout,
        $interval, $resource, $window, $$rAF, log, instantChat,
        localMedia, instantChatChannelHandler, instantChatManager,
        config, participants) => {

      log.info('Entering instantChat controller');

      localMedia.getDevices()
        .then(devices => $scope.sources = devices)
        .catch(error => log.error('Error retrieving sources', error));

      $window.addEventListener('click', () => {
        toggleBars();
        $scope.$apply();
      });

      $scope.menuIsCollapsed = false;
      $scope.hideBars = false;

      $scope.showCameras = () => $scope.camerasVisible = true;
      $scope.hideCameras = () => $scope.camerasVisible = false;
      $scope.toggleCameras = () => $scope.camerasVisible = !$scope.camerasVisible;

      $scope.expandMenu = () => {
        $scope.menuIsCollapsed = false;
        //toggleBars(true);
      };

      $scope.collapseMenu = () => {
        $scope.menuIsCollapsed = true;
        toggleBars(false);
      };

      function toggleBars(hide) {
        var changed = $scope.hideBars != hide;

        $scope.hideBars = hide != null ? hide === true : !$scope.hideBars;

        $scope.hideCameras();

        if (changed) {
          $scope.resizing = $$rAF(broadcastResize);
          $timeout(() => $scope.resizing(), 1000);
        }
      }

      function broadcastResize() {
        $rootScope.$broadcast('resize');
        $scope.resizing = $$rAF(broadcastResize);
      }

      var listenersCleanup = [];

      // Using nested Promises here because we need the stream
      // after connecting to the signal...so we capture it in a closure :)
      localMedia.getStream(config.defaultStream)
        .then(stream => {
          if ($scope.$$destroyed) {
            stream.__doneWithStream();
            return;
          }

          instantChat
            .connect('https://' + $location.host())
            .then(signal => {
              if ($scope.$$destroyed) {
                stream.__doneWithStream();
                return;
              }
              $scope.signal = signal;

              $scope.localParticipant = instantChat.localParticipant;
              $scope.participants = instantChat.participants;
              $scope.activeParticipants = instantChat.activeParticipants;

              $scope.currentRoom = {name: null};
              $scope.currentRooms = signal.currentRooms;

              if (!$scope.localParticipant.streams.contains(stream)) {
                $scope.localParticipant.streams.add(stream);
              }

              joinRoom();
            })
            .catch(error => $rootScope.$broadcast('error', 'Could not access signalling server. Please refresh the page!', error));
        })
        .catch(error => $rootScope.$broadcast('error', 'Could not access your camera. Please refresh the page!', error));

      listenersCleanup.push(instantChat.on({
        'participant active':   participant => { $rootScope.$broadcast('participant active',   participant); },
        'participant inactive': participant => { $rootScope.$broadcast('participant inactive', participant); },
        'stream add':           stream =>      { $rootScope.$broadcast('stream add',           stream); },
        'stream remove':        stream =>      { $rootScope.$broadcast('stream remove',        stream); }
      }));

      $scope.$watchCollection('config', _.debounce(config => {
        log(config);
      }, 500));

      $scope.addCamera = source => {
        localMedia
          .getStream({audio: false, video: {optional: [{sourceId: source.id}]}})
          .then(
            stream => {
              $scope.localParticipant.streams.add(stream);
            },
            error => log.error(error));
      };

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

      onRootScope('participant config', ($event, data) => $scope.$apply());

      var Images = $resource('/images');
      onRootScope('localThumbnail', ($event, participant, stream, imageData) => {
        Images.save({
          id: participant.id,
          data: imageData
        });
      });

      $scope.$on('$destroy', () => {
        if ($scope.signal) $scope.signal.leaveRooms();
        _.each(listenersCleanup, fn => fn());
        listenersCleanup.splice(0);
        $window.removeEventListener(toggleBars);
      });

      function joinRoom() {
        log('joining room', $location.path());
        $scope.signal.leaveRooms();

        var room = $location.path().replace(/^\//, '');

        if (room) {
          $scope.currentRoom.name = room;
          $scope.signal.joinRoom(room);
        }
      }

      function onRootScope(eventName, listener) {
        listenersCleanup.push($rootScope.$on(eventName, listener));
      }

      function createStream(stream, options) {
        return _.extend({
          stream: stream,
          votes: [],
          src: $sce.trustAsResourceUrl(URL.createObjectURL(stream))
        }, options);
      }
    }]
  };
};