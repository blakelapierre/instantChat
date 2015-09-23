module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: ($scope, element, attributes) => {
      $scope.transitions = {
        'DEFAULT': 'contacts',
        'generating': 'contacts',
        'uisettings': 'contacts',
        'networkstatus': 'contacts'
      };

      $scope.sideNavigation = {
        'contacts': {west: 'uisettings', east: 'networkstatus'},
        'networkstatus': {west: 'contacts', east: 'uisettings'},
        'uisettings': {west: 'networkstatus', east: 'contacts'}
      };

      $scope.labels = {
        'contacts': 'Contacts',
        'networkstatus': 'Network Status',
        'uisettings': 'Settings'
      };


    },
    controller: ['$scope', $scope => {
      console.log('mainstage controller scope', $scope);

      $scope.hasTrigger = region => {
        const {sideNavigation, currentScene} = $scope;

        return sideNavigation[currentScene] && sideNavigation[currentScene][region];
      };

      $scope.getTriggerLabel = region => {
        const {sideNavigation, currentScene, labels} = $scope;

        return labels[sideNavigation[currentScene][region]];
      };

      $scope.clickTrigger = region => {
        const {sideNavigation, currentScene} = $scope;

        $scope.show(sideNavigation[currentScene][region], region);
      };
    }]
  };
};