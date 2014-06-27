var _ = require('lodash');

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
    },
    controller: ['$scope', ($scope) => {

      _.extend($scope, {
        emailSubject: 'I want to chat with you!',
        emailBody() { return 'Come join me at ' + window.location.toString(); },

        isMouseInside: false,

        mouseEnterExpandedView() {
          $scope.isMouseInside = true;
          console.log('inside');

        },
        mouseLeftExpandedView() {
          console.log('left');
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
        console.log('debounced');
        if (!$scope.isMouseInside) {
          $scope.collapse();
          $scope.$apply();
        }
      }, 1500);

      $scope.invite = () => {

      };

      $scope.subscribe = () => {

      };
    }]
  }
};