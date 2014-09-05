var angular = require('angular');

module.exports = angular.module('instantChat', ['ngAnimate', 'ngRoute', 'ngResource', 'ngEventEmitter', 'LocalStorageModule'])

  .directive('instantChat',   require('./directives/instantChat/directive'))

  .directive('chatMenu',      require('./directives/chatMenu/directive'))

  .directive('feedback',      require('./directives/feedback/directive'))

  .directive('participant',   require('./directives/participant/directive'))

  .directive('roomList',      require('./directives/roomList/directive'))

  .directive('settings',      require('./directives/settings/directive'))
  .directive('stream',        require('./directives/stream/directive'))

  .directive('teaser',        require('./directives/teaser/directive'))

  .directive('contenteditable', require('./directives/util/contenteditable/directive'))
  .directive('fitText',         require('./directives/util/fitText/directive'))
  .directive('focusOn',         require('./directives/util/focusOn/directive'))
  .directive('ngScopeElement',  require('./directives/util/ngScopeElement/directive'))
  .directive('rotator',         require('./directives/util/rotator/directive'))
  .directive('selectOnClick',   require('./directives/util/selectOnClick/directive'))

  .factory('config',          require('./factories/config/factory'))

  .factory('emitter',         require('./factories/emitter/factory'))

  .factory('localMedia',      require('./factories/localMedia/factory'))

  .factory('instantChat',     require('./factories/instantChat/factory'))

  .factory('rtc',             require('./factories/rtc/factory'))
  .factory('signaler',        require('./factories/rtc/signaler/factory'))

  .factory('streams',         require('./factories/streams/factory'))

  .factory('chatReceiveHandlers',           require('./factories/rtc/chatReceiveHandlers/factory'))
  .factory('chatServeHandlers',             require('./factories/rtc/chatServeHandlers/factory'))
  .factory('instantChatChannelHandler',     require('./factories/rtc/instantChatChannelHandler/factory'))
  .factory('instantChatManager',            require('./factories/rtc/instantChatManager/factory'))

  .factory('log',                           require('./factories/log/factory'))

  .factory('participants',                  require('./factories/participants/factory'))

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