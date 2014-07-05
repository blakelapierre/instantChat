module.exports = ['$rootScope', ($rootScope) => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      stream: '='
    },
    link: ($scope, element, attributes) => {
      var video = element.find('video')[0];

      $scope.haveSize = false;

      video.addEventListener('loadedmetadata', () => {
        $scope.haveSize = true;
        $rootScope.$broadcast('haveVideoSize', $scope.stream);
      });

      video.addEventListener('resize', event => {
        console.log(event);
      });

      var cell = _.find(element.children(), child => angular.element(child).hasClass('cell'));

      window.addEventListener('resize', event => refreshSize());

      function refreshSize() {
        if ($scope.haveSize) {
          var videoWidth = video.videoWidth,
              videoHeight = video.videoHeight,
              videoRatio = videoWidth / videoHeight,
              cellWidth = cell.clientWidth,
              cellHeight = cell.clientHeight,
              cellRatio = cellWidth / cellHeight;

          var videoSurfaceWidth, videoSurfaceHeight;

          if (cellRatio > videoRatio) {
            videoSurfaceWidth = cellHeight * videoRatio,
            videoSurfaceHeight = cellHeight;
          }
          else {
            videoSurfaceWidth = cellWidth,
            videoSurfaceHeight = cellWidth / videoRatio;
          }

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

    }]
  };
}];