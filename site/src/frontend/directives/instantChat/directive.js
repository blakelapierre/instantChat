module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', '$location', 'rtc', ($scope, $location, rtc) => {

    }]
  };
};