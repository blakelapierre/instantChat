module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ($scope, localMedia) => {
      localMedia
        .getSources()
        .then(sources => {
          $scope.sources = sources;
          console.log(sources);
        });
    }
  };
};