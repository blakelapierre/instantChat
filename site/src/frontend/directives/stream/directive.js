var _ = require('lodash');

module.exports = ['$rootScope', '$interval', '$timeout', 'videoTools', ($rootScope, $interval, $timeout, videoTools) => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      stream: '=',
      streamName: '=',
      participant: '='
    },
    link: ($scope, element, attributes) => {
      var video = element.find('video')[0],
          cell = element[0].childNodes[0];

      $scope.haveSize = false;
      $scope.thumbSrc = 'about:blank';

      $scope.listenersCleanup = [];

      // Cheap, but effective. Without debouncing this function
      // we can get many calls in a row
      var gotSize = $scope.gotSize =  _.debounce(() => {
        $scope.haveSize = true;
        $rootScope.$broadcast('haveVideoSize', $scope.stream);
      }, 10, {maxWait: 10});

      video.addEventListener('loadedmetadata', gotSize);
      video.addEventListener('playing',        gotSize);
      video.addEventListener('play',           gotSize);

      element.on('resize',                     gotSize);
      cell.addEventListener('resize',          gotSize);
      video.addEventListener('resize',         gotSize);
      window.addEventListener('resize',        gotSize);

      onRootScope({
        'resize':               gotSize,
        'participant active':   gotSize,
        'participant inactive': gotSize,
        'stream add':           gotSize,
        'stream remove':        gotSize,
        'haveVideoSize':        refreshSize
      });

      function onRootScope(listeners) {
        _.each(listeners, (listener, eventName) => {
          $scope.listenersCleanup.push($rootScope.$on(eventName, listener));
        });
      }

      // function gotSize() {
      //   $scope.haveSize = true;
      //   $timeout(() => $rootScope.$broadcast('haveVideoSize', $scope.stream), 0);
      // }

      function refreshSize() {
        var videoWidth = video.videoWidth,
            videoHeight = video.videoHeight,
            videoRatio = (videoWidth / videoHeight) || (4 / 3),
            cellWidth = cell.clientWidth,
            cellHeight = cell.clientHeight,
            cellRatio = cellWidth / cellHeight;

        var videoSurfaceWidth, videoSurfaceHeight;

        if (cellRatio > videoRatio) {
          videoSurfaceWidth = cellHeight * videoRatio;
          videoSurfaceHeight = cellHeight;
        }
        else {
          videoSurfaceWidth = cellWidth;
          videoSurfaceHeight = cellWidth / videoRatio;
        }

        $scope.videoSurfaceTop = (cellHeight - videoSurfaceHeight) / 2;
        $scope.videoSurfaceLeft = (cellWidth - videoSurfaceWidth) / 2;
        $scope.videoSurfaceBottom = $scope.videoSurfaceTop; // CSS Bottom is inverted
        $scope.videoSurfaceRight = cellWidth - $scope.videoSurfaceLeft;

        $scope.videoSurfaceWidth = videoSurfaceWidth;
        $scope.videoSurfaceHeight = videoSurfaceHeight;

        video.videoSurfaceWidth = videoSurfaceWidth;
        video.videoSurfaceHeight = videoSurfaceHeight;

        if (Math.abs((16 / 9) - videoRatio) < 0.01) {
          $scope.is16_9 = true;
          $scope.is16_10 = false;
          $scope.is4_3 = false;
        }
        else if (Math.abs((16 / 10) - videoRatio) < 0.01) {
          $scope.is16_9 = false;
          $scope.is16_10 = true;
          $scope.is4_3 = false;
        }
        else if (Math.abs((4 / 3) - videoRatio) < 0.01) {
          $scope.is16_9 = false;
          $scope.is16_10 = false;
          $scope.is4_3 = true;
        }

        $scope.$digest();
      }

      video.addEventListener('playing', () => {
        // Allow some time for camera/stream to adjust
        $timeout($scope.generateLocalThumbnail, 100);
      });


      $scope.$watch('stream', stream => {
        stream.isMuted = $scope.participant.isLocal || stream.isMuted;
        stream.isVotedUp = false;
        stream.isVotedDown = false;

        video.muted = stream.isMuted;

        $scope.thumbnailInterval = $interval($scope.generateLocalThumbnail, 15000);
      });

      $scope.toggleMute = $event => {
        var stream = $scope.stream;

        if (stream) {
          stream.isMuted = !stream.isMuted;
          video.muted = stream.isMuted;
        }
      };

      $scope.captureFrame = (options, callback) => {
        videoTools.captureFrame(video, options || {width: 96}, callback);
      };
    },
    controller: ['$scope', 'instantChatManager', ($scope, instantChatManager) => {
      $scope.toggleVoteUp = $event => {
        var stream = $scope.stream;

        stream.isVotedUp = !stream.isVotedUp;
        stream.isVotedDown = false;

        instantChatManager.sendToggleVoteUp(stream, stream.isVotedUp);

        $scope.captureFrame(null, dataUrl => {
          stream.thumbSrc = dataUrl;
        });
      };

      $scope.toggleVoteDown = $event => {
        var stream = $scope.stream;

        stream.isVotedUp = false;
        stream.isVotedDown = !stream.isVotedDown;

        instantChatManager.sendToggleVoteDown(stream, stream.isVotedDown);
      };

      $scope.generateLocalThumbnail = () => {
        var participant = $scope.participant,
            stream = $scope.stream;

        $scope.captureFrame(null, dataUrl => {
          $rootScope.$broadcast('thumbnail', participant, stream, dataUrl);

          if (participant.isLocal) $rootScope.$broadcast('localThumbnail', participant, stream, dataUrl);
        });
      };

      $scope.$on('$destroy', () => {
        window.removeEventListener('resize', $scope.gotSize);
        _.each($scope.listenersCleanup, fn => fn());
        if ($scope.thumbnailInterval) $interval.cancel($scope.thumbnailInterval);
      });
    }]
  };
}];