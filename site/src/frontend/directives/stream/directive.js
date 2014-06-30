module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      stream: '='
    },
    link: ($scope, element, attributes) => {
      var video = element.find('video')[0];

      $scope.$watch('stream', stream => {
        video.muted = stream.isLocal;
      });
    },
    controller: ['$scope', ($scope) => {

    }]
  };
};