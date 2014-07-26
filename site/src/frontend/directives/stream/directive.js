module.exports = ['$rootScope', '$interval', '$timeout', 'videoTools', ($rootScope, $interval, $timeout, videoTools) => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      stream: '=',
      streamName: '='
    },
    link: ($scope, element, attributes) => {
      var video = element.find('video')[0],
          cell = element[0].childNodes[0];

      $scope.haveSize = false;
      $scope.thumbSrc = 'about:blank';

      video.addEventListener('loadedmetadata', () => gotSize());
      video.addEventListener('playing',        () => gotSize());
      video.addEventListener('play',           () => gotSize());

      element.on('resize',    () => refreshSize());
      video.addEventListener('resize',      () => refreshSize());
      window.addEventListener('resize',     () => refreshSize());

      $rootScope.$on('haveVideoSize',       () => refreshSize());
      $rootScope.$on('participant added',   () => refreshSize());
      $rootScope.$on('participant removed', () => refreshSize());

      function gotSize() {
        $scope.haveSize = true;
        $rootScope.$broadcast('haveVideoSize', $scope.stream);
      }

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

          $scope.$apply();

      }

      video.addEventListener('playing', () => {
        if ($scope.stream.isLocal) {
          $scope.generateLocalThumbnail(); // Yeah, we want to do something different here, but I'm not sure what
        }
      });

      $scope.thumbnailInterval = $interval($scope.generateLocalThumbnail, 15000);

      $scope.$watch('stream', stream => {
        stream.isMuted = stream.isLocal || stream.isMuted;
        stream.isVotedUp = false;
        stream.isVotedDown = false;

        video.muted = stream.isMuted;
      });

      $scope.toggleMute = $event => {
        var stream = $scope.stream;

        if (stream) {
          stream.isMuted = !stream.isMuted;
          video.muted = stream.isMuted;
        }
      };

      $scope.captureFrame = (options, callback) => {
        if ($scope.haveSize) {
          videoTools.captureFrame(video, options || {width: 96}, callback);
        }
        else {
          console.log('we probably want to return something here?!');
        }
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
          $scope.$apply();
        });
      };

      $scope.toggleVoteDown = $event => {
        var stream = $scope.stream;

        stream.isVotedUp = false;
        stream.isVotedDown = !stream.isVotedDown;

        instantChatManager.sendToggleVoteDown(stream, stream.isVotedDown);
      };

      $scope.generateLocalThumbnail = () => {
        $scope.captureFrame(null, dataUrl => $rootScope.$broadcast('localThumbnail', dataUrl));
      };

      $scope.$on('$destroy', () => {
        if ($scope.thumbnailInterval) $interval.cancel($scope.thumbnailInterval);
      });
    }]
  };
}];