module.exports = () => {
  return {
    require: '^stage',
    restrict: 'E',
    template: require('./template.html'),
    scope: {},
    link: ($scope, element, attributes, stage) => {
      $scope.done = () => $scope.$apply(() => stage.done('generating'));
    },
    controller: ['$scope', 'identity', ($scope, identity) => {
      console.log('generating', $scope);

      $scope.generated = true;

      identity
        .get(notify)
        .then(generated);

      function notify(msg, ...args) {
        if (msg === 'Generating') {
          const [settings] = args,
                {numBits} = settings;

          $scope.generated = false;
          $scope.numBits = numBits;
        }
      }

      function generated() {
        $scope.done();
      }

      $scope.clearIdentity = () => identity.clear('yes');
    }]
  };
};