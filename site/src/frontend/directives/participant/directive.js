module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
    },
    controller: ['$scope', ($scope) => {
    }]
  };
};