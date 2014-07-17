var angular = require('angular');

module.exports = angular.module('instantChat', ['ngRoute', 'ngResource', 'LocalStorageModule'])

  .directive('instantChat',   require('./directives/instantChat/directive'))

  .directive('chatMenu',      require('./directives/chatMenu/directive'))

  .directive('participant',   require('./directives/participant/directive'))

  .directive('roomList',      require('./directives/roomList/directive'))

  .directive('stream',        require('./directives/stream/directive'))

  .directive('teaser',        require('./directives/teaser/directive'))

  .directive('fitText',       require('./directives/util/fitText/directive'))
  .directive('focusOn',       require('./directives/util/focusOn/directive'))
  .directive('selectOnClick', require('./directives/util/selectOnClick/directive'))

  .factory('localMedia',  require('./factories/localMedia/factory'))
  .factory('rtc',         require('./factories/rtc/factory'))

  .factory('chatReceiveHandlers',           require('./factories/rtc/chatReceiveHandlers/factory'))
  .factory('chatServeHandlers',             require('./factories/rtc/chatServeHandlers/factory'))
  .factory('instantChatChannelHandler',     require('./factories/rtc/instantChatChannelHandler/factory'))
  .factory('instantChatManager',            require('./factories/rtc/instantChatManager/factory'))

  .factory('videoTools',            require('./factories/videoTools/factory'))

  .config(['$routeProvider', '$compileProvider', ($routeProvider, $compileProvider) => {
    $routeProvider
      .when('/:id', {
        template: '<instant-chat></instant-chat>'
      })
      .otherwise({
        template: '<teaser></teaser>'
      });
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|sms):/);
  }])
;