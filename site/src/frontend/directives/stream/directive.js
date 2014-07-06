module.exports = ['$rootScope', ($rootScope) => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      stream: '='
    },
    link: ($scope, element, attributes) => {
      var video = element.find('video')[0],
          cell = element[0].childNodes[0];

      $scope.haveSize = false;

      video.addEventListener('loadedmetadata', () => {
        $scope.haveSize = true;
        $rootScope.$broadcast('haveVideoSize', $scope.stream);
      });

      video.addEventListener('playing', () => {
        $scope.haveSize = true;
        $rootScope.$broadcast('haveVideoSize', $scope.stream);
      });

      video.addEventListener('play', () => {
        $scope.haveSize = true;
        $rootScope.$broadcast('haveVideoSize', $scope.stream);
      });

      video.addEventListener('resize', event => refreshSize());
      window.addEventListener('resize', event => refreshSize());

      function refreshSize() {
        if ($scope.haveSize) {
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

          console.log(videoRatio, cellRatio);

          $scope.videoSurfaceTop = (cellHeight - videoSurfaceHeight) / 2;
          $scope.videoSurfaceLeft = (cellWidth - videoSurfaceWidth) / 2;
          $scope.videoSurfaceBottom = $scope.videoSurfaceTop; // CSS Bottom is inverted
          $scope.videoSurfaceRight = cellWidth - $scope.videoSurfaceLeft;

          $scope.videoSurfaceWidth = videoSurfaceWidth;
          $scope.videoSurfaceHeight = videoSurfaceHeight;

          $scope.$apply();
        }
      }

      $rootScope.$on('haveVideoSize', () => refreshSize());
      $rootScope.$on('participant added', () => refreshSize());
      $rootScope.$on('participant removed', () => refreshSize());

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
    },
    controller: ['$scope', ($scope) => {
      $scope.toggleVoteUp = $event => {
        var stream = $scope.stream;

        stream.isVotedUp = !stream.isVotedUp;
        stream.isVotedDown = false;
      };

      $scope.toggleVoteDown = $event => {
        var stream = $scope.stream;

        stream.isVotedUp = false;
        stream.isVotedDown = !stream.isVotedDown;
      };
    }]
  };
}];