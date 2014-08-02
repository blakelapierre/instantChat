module.exports = () => {
  return {
    restrict: 'A',
    link: ($scope, element, attributes) => {
      element = element[0];

      console.log('focuson', attributes);
      $scope.$watch(attributes['focusOn'], newValue => {
        console.log('watch', newValue);
        if (newValue) setTimeout(() => element.focus(), 0);
      });
    }
  };
};