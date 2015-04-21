var _ = require('lodash');

module.exports = () => {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$rootScope', '$scope', 'instantChat',
    ($rootScope, $scope, instantChat) => {
      $scope.havePermissionForFrontPage = true;

      $rootScope.test = () => console.log('worked');

      _.extend($scope, {
        emailSubject: 'I want to chat with you!',
        emailBody() { return 'Come join me at ' + encodeURIComponent(window.location.toString()); },
        smsBody() { return 'Come join me at ' + encodeURIComponent(window.location.toString()); },
        inviteLink() { return encodeURIComponent(window.location.toString()); },
        inviteText: 'I\'m currently video chatting. Come join me!',


        isMouseInside: true,
        mainVisible: true,
        settingsVisible: false,
        feedbackVisible: false,
        roomsVisible: false,

        mouseEnterExpandedView() {
          $scope.isMouseInside = true;
        },
        mouseLeftExpandedView() {
          $scope.isMouseInside = false;
          if (!$scope.menuIsCollapsed) debouncedCollapse();
        },

        collapse() {
          $scope.collapseMenu();
          $scope.mainVisible = true;
          $scope.settingsVisible = false;
          $scope.feedbackVisible = false;
          $scope.roomsVisible = false;
        },

        triggerSettings() {
          $scope.roomsVisible = false;
          $scope.feedbackVisible = false;
          $scope.settingsVisible = !$scope.settingsVisible;
          $scope.mainVisible = !$scope.settingsVisible;
        },
        triggerFeedback() {
          $scope.mainVisible = false;
          $scope.settingsVisible = false;
          $scope.roomsVisible = false;
          $scope.feedbackVisible = !$scope.feedbackVisible;
          $scope.mainVisible = !$scope.feedbackVisible;
        },
        triggerRooms() {
          $scope.settingsVisible = false;
          $scope.feedbackVisible = false;
          $scope.roomsVisible = !$scope.roomsVisible;
          $scope.mainVisible = !$scope.roomsVisible;
        },

        participantNameBlur() {
        },

        broadcast() {
          instantChat.broadcast($scope.currentRoom.name).then(peer => console.log('got broadcaster', peer), error => console.log('broadcast error!', error));
        }
      });

      var debouncedCollapse = _.debounce(() => {
        if (!$scope.isMouseInside && !$scope.menuIsCollapsed) {
          $scope.collapse();
          $scope.$apply();
        }
      }, 1250);

      $rootScope.$on('thumbnail', ($event, participant, stream, dataUrl) => {
        participant.thumbnailSrc = dataUrl;
      });

      debouncedCollapse();
    }]
  };
};