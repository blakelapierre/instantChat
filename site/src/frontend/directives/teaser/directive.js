module.exports = function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: function($scope, element, attributes, instantFile) {

    },
    controller: ['$scope', function($scope) {

    }]
  };
};