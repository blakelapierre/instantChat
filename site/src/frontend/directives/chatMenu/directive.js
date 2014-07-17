var _ = require('lodash');

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {

    },
    controller: ['$rootScope', '$scope', ($rootScope, $scope) => {
      $scope.havePermissionForFrontPage = true;

      _.extend($scope, {
        emailSubject: 'I want to chat with you!',
        emailBody() { return 'Come join me at ' + encodeURIComponent(window.location.toString()); },
        smsBody() { return 'Come join me at ' + encodeURIComponent(window.location.toString()); },

        isMouseInside: false,

        mouseEnterExpandedView() {
          $scope.isMouseInside = true;
        },
        mouseLeftExpandedView() {
          $scope.isMouseInside = false;
          debouncedCollapse();
        },

        collapse() { $scope.isCollapsed = true; },
        expand() {
          $scope.isCollapsed = false;
          $scope.isMouseInside = true;
        }
      });

      var debouncedCollapse = _.debounce(() => {
        if (!$scope.isMouseInside) {
          $scope.collapse();
          $scope.$apply();
        }
      }, 1250);

      $rootScope.$on('localThumbnail', ($event, dataUrl) => {
        if (dataUrl) $scope.localThumbnailSrc = dataUrl;
      });

      debouncedCollapse();
    }]
  };
};