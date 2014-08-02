var fitText = require('fitText');

module.exports = function() {
  return {
    restrict: 'A',
    link: function($scope, element, attributes) {
      console.log(element);
      element.on('resize', sizeElement);
      element.on('input', sizeElement);
      $scope.$on('$destroy', sizeElement);

      sizeElement();

      function sizeElement() {
        fitText(element);
      }
    }
  };
};