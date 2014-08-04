module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
console.log('!!part', $scope);
    },
    controller: ['$scope', ($scope) => {

    }]
  };
};