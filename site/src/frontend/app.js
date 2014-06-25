var angular = require('angular');

module.exports = angular.module('instantChat', ['ngRoute'])
  
  .directive('instantChat',   require('./directives/instantChat/directive'))

  .directive('chatMenu',      require('./directives/chatMenu/directive'))

  .directive('fitText',       require('./directives/util/fitText/directive'))
  .directive('selectOnClick', require('./directives/util/selectOnClick/directive'))

  .factory('localMedia',  require('./factories/localMedia/factory'))
  .factory('rtc',         require('./factories/rtc/factory'))

  .factory('chatReceiveHandlers',   require('./factories/rtc/chatReceiveHandlers/factory'))
  .factory('chatServeHandlers',     require('./factories/rtc/chatServeHandlers/factory'))
  
;