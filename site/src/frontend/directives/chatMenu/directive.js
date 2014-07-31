var _ = require('lodash');

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$rootScope', '$scope', 'config',
    ($rootScope, $scope, config) => {
      $scope.havePermissionForFrontPage = true;

      $rootScope.test = () => console.log('worked');

      $scope.participantName = config.name;

      _.extend($scope, {
        emailSubject: 'I want to chat with you!',
        emailBody() { return 'Come join me at ' + encodeURIComponent(window.location.toString()); },
        smsBody() { return 'Come join me at ' + encodeURIComponent(window.location.toString()); },
        inviteLink() { return encodeURIComponent(window.location.toString()); },
        inviteText: 'I\'m currently video chatting. Come join me!',


        isMouseInside: true,

        mouseEnterExpandedView() {
          $scope.isMouseInside = true;
        },
        mouseLeftExpandedView() {
          $scope.isMouseInside = false;
          if (!$scope.menuIsCollapsed) debouncedCollapse();
        },

        collapse() {
          console.log('collapse()');
          $scope.collapseMenu();
          $scope.settingsVisible = false;
          $scope.feedbackVisible = false;
          $scope.roomsVisible = false;
        },

        participantNameBlur() {
          config.name = $scope.participantName;
        },

        triggerSettings() {
          $scope.roomsVisible = false;
          $scope.feedbackVisible = false;
          $scope.settingsVisible = !$scope.settingsVisible;
        },
        triggerFeedback() {
          $scope.settingsVisible = false;
          $scope.roomsVisible = false;
          $scope.feedbackVisible = !$scope.feedbackVisible;
        },
        triggerRooms() {
          $scope.settingsVisible = false;
          $scope.feedbackVisible = false;
          $scope.roomsVisible = !$scope.roomsVisible;
        }
      });

      var debouncedCollapse = _.debounce(() => {
        if (!$scope.isMouseInside && !$scope.menuIsCollapsed) {
          $scope.collapse();
          $scope.$apply();
        }
      }, 1250);

      $rootScope.$on('localThumbnail', ($event, dataUrl) => {
        if (dataUrl) $scope.localThumbnailSrc = dataUrl;
      });

      debouncedCollapse();
    }]
  };
};