import instantChat from './modules/instant-chat';

module.exports = {
    'instant-chat': instantChat['instant-chat']
};

// require('angular'); // Don't assign result...angular/browserify doesn't like it...
// require('angular-animate');
// require('angular-route');
// require('angular-resource');
// require('angular-event-emitter');
// require('angular-local-storage');

// import identity from './modules/identity';
// import network from './modules/network';
// import ui from './modules/ui';
// import util from './modules/util';

// module.exports = {
//   'identity': identity.identity,
//   'network': network.network,
//   'ui': ui.ui,
//   'util': util.util,
//   'instant-chat': angular.module('instant-chat', ['ngAnimate', 'ngRoute', 'ngResource', 'ngEventEmitter', 'LocalStorageModule', 'identity', 'ui', 'util'])
//     .directive('instantChat',   require('./modules/instant-chat/directives/instantChat/directive'))

//     .directive('chatMenu',      require('./modules/instant-chat/directives/chatMenu/directive'))

//     .directive('feedback',      require('./modules/instant-chat/directives/feedback/directive'))

//     .directive('participant',   require('./modules/instant-chat/directives/participant/directive'))

//     .directive('roomList',      require('./modules/instant-chat/directives/roomList/directive'))

//     .directive('settings',      require('./modules/instant-chat/directives/settings/directive'))
//     .directive('stream',        require('./modules/instant-chat/directives/stream/directive'))

//     .directive('teaser',        require('./modules/instant-chat/directives/teaser/directive'))

//     .directive('contenteditable', require('./modules/instant-chat/directives/util/contenteditable/directive'))
//     .directive('focusOn',         require('./modules/instant-chat/directives/util/focusOn/directive'))
//     .directive('ngScopeElement',  require('./modules/instant-chat/directives/util/ngScopeElement/directive'))
//     .directive('selectOnClick',   require('./modules/instant-chat/directives/util/selectOnClick/directive'))

//     .factory('config',          require('./modules/instant-chat/factories/config/factory'))

//     .factory('emitter',         require('./modules/instant-chat/factories/emitter/factory'))

//     .factory('localMedia',      require('./modules/instant-chat/factories/localMedia/factory'))

//     .factory('instantChat',     require('./modules/instant-chat/factories/instantChat/factory'))

//     .factory('rtc',             require('./modules/instant-chat/factories/rtc/factory'))
//     .factory('signaler',        require('./modules/instant-chat/factories/rtc/signaler/factory'))

//     .factory('streams',         require('./modules/instant-chat/factories/streams/factory'))

//     .factory('chatReceiveHandlers',           require('./modules/instant-chat/factories/rtc/chatReceiveHandlers/factory'))
//     .factory('chatServeHandlers',             require('./modules/instant-chat/factories/rtc/chatServeHandlers/factory'))
//     .factory('instantChatChannelHandler',     require('./modules/instant-chat/factories/rtc/instantChatChannelHandler/factory'))
//     .factory('instantChatManager',            require('./modules/instant-chat/factories/rtc/instantChatManager/factory'))

//     .factory('log',                           require('./modules/instant-chat/factories/log/factory'))

//     .factory('participants',                  require('./modules/instant-chat/factories/participants/factory'))

//     .factory('videoTools',            require('./modules/instant-chat/factories/videoTools/factory'))

//     .config(['$routeProvider', '$compileProvider', ($routeProvider, $compileProvider) => {
//       $routeProvider
//         .when('/:id', {
//           template: '<instant-chat></instant-chat>'
//         })
//         .otherwise({
//           template: '<main-stage></main-stage>'
//         });
//       $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|sms):/);
//     }])

// };

// // function define(name, dependencies, components) {
// //   const module = angular.module(name, dependencies),
// //         {directives} = components;

// //   directives.forEach(directive => {
// //     console.log(directive);
// //     module.directive(directive, require(`./modules/${name}/${directive}/directive`));
// //   });

// //   return module;
// // }