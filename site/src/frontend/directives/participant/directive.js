module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      participant: '='
    },
    link: ($scope, element, attributes) => {

    },
    controller: ['$scope', ($scope) => {

    }]
  };
};