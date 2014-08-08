module.exports = () => {
  return {
    restrict: 'A',
    link: ($scope, element, attributes) => {
      element = element[0];

      $scope.$watch(attributes['focusOn'], newValue => {
        if (newValue) setTimeout(() => element.focus(), 0);
      });
    }
  };
};