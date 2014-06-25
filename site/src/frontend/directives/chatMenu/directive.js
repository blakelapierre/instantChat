var _ = require('lodash');

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
      $scope.isMouseInside = false;

      $scope.collapse = () => element.addClass('collapse');

      $scope.expand = () => element.removeClass('collapse');

      $scope.mouseEnterExpandedView = () => {
        $scope.isMouseInside = true;
      };

      var debouncedCollapse = _.debounce(() => {
        if (!$scope.isMouseInside) $scope.collapse();
      }, 1500);

      $scope.mouseLeftExpandedView = () => {
        $scope.isMouseInside = false;
        debouncedCollapse();
      };
    },
    controller: ['$scope', ($scope) => {
      $scope.invite = () => {

      };

      $scope.subscribe = () => {

      };
    }]
  }
};