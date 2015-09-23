module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {},
    link: ($scope, element, attributes) => {
      console.log('contacts linker', $scope);
    }
  };
};