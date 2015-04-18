(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/app";
var angular = (window.angular);
module.exports = angular.module('instantChat', ['ngAnimate', 'ngRoute', 'ngResource', 'ngEventEmitter', 'LocalStorageModule']).directive('instantChat', require('./directives/instantChat/directive')).directive('chatMenu', require('./directives/chatMenu/directive')).directive('feedback', require('./directives/feedback/directive')).directive('participant', require('./directives/participant/directive')).directive('roomList', require('./directives/roomList/directive')).directive('settings', require('./directives/settings/directive')).directive('stream', require('./directives/stream/directive')).directive('teaser', require('./directives/teaser/directive')).directive('contenteditable', require('./directives/util/contenteditable/directive')).directive('fitText', require('./directives/util/fitText/directive')).directive('focusOn', require('./directives/util/focusOn/directive')).directive('ngScopeElement', require('./directives/util/ngScopeElement/directive')).directive('rotator', require('./directives/util/rotator/directive')).directive('selectOnClick', require('./directives/util/selectOnClick/directive')).factory('config', require('./factories/config/factory')).factory('emitter', require('./factories/emitter/factory')).factory('localMedia', require('./factories/localMedia/factory')).factory('instantChat', require('./factories/instantChat/factory')).factory('rtc', require('./factories/rtc/factory')).factory('signaler', require('./factories/rtc/signaler/factory')).factory('streams', require('./factories/streams/factory')).factory('chatReceiveHandlers', require('./factories/rtc/chatReceiveHandlers/factory')).factory('chatServeHandlers', require('./factories/rtc/chatServeHandlers/factory')).factory('instantChatChannelHandler', require('./factories/rtc/instantChatChannelHandler/factory')).factory('instantChatManager', require('./factories/rtc/instantChatManager/factory')).factory('log', require('./factories/log/factory')).factory('participants', require('./factories/participants/factory')).factory('videoTools', require('./factories/videoTools/factory')).config(['$routeProvider', '$compileProvider', (function($routeProvider, $compileProvider) {
  $routeProvider.when('/:id', {template: '<instant-chat></instant-chat>'}).otherwise({template: '<teaser></teaser>'});
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|mailto|sms):/);
})]);
;


},{"./directives/chatMenu/directive":2,"./directives/feedback/directive":4,"./directives/instantChat/directive":6,"./directives/participant/directive":8,"./directives/roomList/directive":10,"./directives/settings/directive":12,"./directives/stream/directive":14,"./directives/teaser/directive":16,"./directives/util/contenteditable/directive":18,"./directives/util/fitText/directive":19,"./directives/util/focusOn/directive":20,"./directives/util/ngScopeElement/directive":21,"./directives/util/rotator/directive":22,"./directives/util/selectOnClick/directive":23,"./factories/config/factory":24,"./factories/emitter/factory":25,"./factories/instantChat/factory":26,"./factories/localMedia/factory":27,"./factories/log/factory":28,"./factories/participants/factory":29,"./factories/rtc/chatReceiveHandlers/factory":30,"./factories/rtc/chatServeHandlers/factory":31,"./factories/rtc/factory":32,"./factories/rtc/instantChatChannelHandler/factory":33,"./factories/rtc/instantChatManager/factory":34,"./factories/rtc/signaler/factory":35,"./factories/streams/factory":36,"./factories/videoTools/factory":37}],2:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/chatMenu/directive";
var _ = (window._);
module.exports = (function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$rootScope', '$scope', 'instantChat', (function($rootScope, $scope, instantChat) {
      $scope.havePermissionForFrontPage = true;
      $rootScope.test = (function() {
        return console.log('worked');
      });
      _.extend($scope, {
        emailSubject: 'I want to chat with you!',
        emailBody: function() {
          return 'Come join me at ' + encodeURIComponent(window.location.toString());
        },
        smsBody: function() {
          return 'Come join me at ' + encodeURIComponent(window.location.toString());
        },
        inviteLink: function() {
          return encodeURIComponent(window.location.toString());
        },
        inviteText: 'I\'m currently video chatting. Come join me!',
        isMouseInside: true,
        mainVisible: true,
        settingsVisible: false,
        feedbackVisible: false,
        roomsVisible: false,
        mouseEnterExpandedView: function() {
          $scope.isMouseInside = true;
        },
        mouseLeftExpandedView: function() {
          $scope.isMouseInside = false;
          if (!$scope.menuIsCollapsed)
            debouncedCollapse();
        },
        collapse: function() {
          $scope.collapseMenu();
          $scope.mainVisible = true;
          $scope.settingsVisible = false;
          $scope.feedbackVisible = false;
          $scope.roomsVisible = false;
        },
        triggerSettings: function() {
          $scope.roomsVisible = false;
          $scope.feedbackVisible = false;
          $scope.settingsVisible = !$scope.settingsVisible;
          $scope.mainVisible = !$scope.settingsVisible;
        },
        triggerFeedback: function() {
          $scope.mainVisible = false;
          $scope.settingsVisible = false;
          $scope.roomsVisible = false;
          $scope.feedbackVisible = !$scope.feedbackVisible;
          $scope.mainVisible = !$scope.feedbackVisible;
        },
        triggerRooms: function() {
          $scope.settingsVisible = false;
          $scope.feedbackVisible = false;
          $scope.roomsVisible = !$scope.roomsVisible;
          $scope.mainVisible = !$scope.roomsVisible;
        },
        participantNameBlur: function() {},
        broadcast: function() {
          instantChat.broadcast($scope.currentRoom.name).then((function(peer) {
            return console.log('got broadcaster', peer);
          }), (function(error) {
            return console.log('broadcast error!', error);
          }));
        }
      });
      var debouncedCollapse = _.debounce((function() {
        if (!$scope.isMouseInside && !$scope.menuIsCollapsed) {
          $scope.collapse();
          $scope.$apply();
        }
      }), 1250);
      $rootScope.$on('thumbnail', (function($event, participant, stream, dataUrl) {
        participant.thumbnailSrc = dataUrl;
      }));
      debouncedCollapse();
    })]
  };
});


},{"./template.html":3}],3:[function(require,module,exports){
module.exports = '\n  <div ng-class="{\'menu-container\': true,\n                  \'settings-visible\': settingsVisible,\n                  \'feedback-visible\': feedbackVisible,\n                  \'rooms-visible\': roomsVisible}"\n       ng-mouseenter="mouseEnterExpandedView()"\n       ng-mouseleave="mouseLeftExpandedView()">\n\n    <div class="overlay"></div>\n\n    <div class="menu-content">\n      <span class="fa fa-reply exit" ng-click="collapse()"></span>\n      <div class="header">\n        <div class="badge">\n          <div class="room-name">#{{currentRoom.name}}</div>\n        </div>\n      </div>\n\n      <div class="body">\n        <div ng-if="mainVisible" class="main panel">\n          <div class="menu-items">\n            <ul>\n              <li>\n                <a href="mailto:?subject={{emailSubject}}&body={{emailBody()}}"\n                   target="_blank"><span class="fa fa-envelope"></span></a>\n              </li>\n\n              <li>\n                <a href="sms:?body={{smsBody()}}"\n                   target="_blank"><span class="fa fa-mobile"></span></a>\n              </li>\n\n              <li>\n                <a href="https://twitter.com/share?url={{inviteLink()}}&text={{inviteText}}" target="_blank"><span class="fa fa-twitter"></span></a>\n              </li>\n\n              <li>\n                <a href="https://facebook.com/dialog/feed?app_id=1443412259259623&display=popup&link={{inviteLink()}}&redirect_uri={{inviteLink()}}&caption={{inviteText}}" target="_blank"><span class="fa fa-facebook"></span></a>\n              </li>\n\n              <li>\n                <a href="https://plus.google.com/share?url={{inviteLink()}}" target="_blank"><span class="fa fa-google-plus"></span></a>\n              </li>\n            </ul>\n\n            <span class="invite">Invite Someone</span>\n          </div>\n\n          <button ng-click="broadcast()">BROADCAST</button>\n\n          <div class="participants-list">\n            <ng-pluralize\n                class="participants-count"\n                count="activeParticipants.length"\n                when="{\'0\': \'Nobody is here (not even you!)\',\n                       \'1\': \'1 Person Here\',\n                       \'other\': \'{} People Here\'}"></ng-pluralize>\n\n            <div class="participant" ng-repeat="participant in participants">\n              <img class="thumbnail" ng-src="{{participant.thumbnailSrc}}">\n              <!-- <video ng-if="participant.streams.length > 0" ng-src="{{participant.streams[0].src}}" autoplay></video> -->\n\n              <div ng-if="participant.isLocal" class="local-participant">\n                <div contenteditable\n                     placeholder="What\'s Your Name?"\n                     class="name-input"\n                     fit-text\n                     focus-on="!isCollapsed && (participant.config.name == null || participant.config.name == undefined || participant.config.name == \'\')"\n                     ng-model="participant.config.name"\n                    ></div>\n\n                <label class="permission">\n                  <input type="checkbox" ng-model="havePermissionForFrontPage"> <span>Use My Image On The <a href="https://instachat.io" class="front-page" target="_blank">Front Page</a></span>\n                </label>\n              </div>\n\n              <div ng-if="!participant.isLocal" class="remote-participant">\n                <span class="name">{{participant.config.name}}</span>\n              </div>\n            </div>\n\n          </div>\n\n        </div>\n\n        <settings ng-if="settingsVisible" class="panel"></settings>\n\n        <feedback ng-if="feedbackVisible" class="panel"></feedback>\n\n        <room-list ng-if="roomsVisible" class="panel"></room-list>\n\n      </div>\n\n      <div class="footer">\n        <div ng-class="{\'trigger\': true,\n                        \'settings-trigger\': true,\n                        \'settings-visible\': settingsVisible}" ng-click="triggerSettings()">\n          <span class="fa fa-cog"></span>\n        </div>\n        <div ng-class="{\'trigger\': true,\n                        \'feedback-trigger\': true,\n                        \'feedback-visible\': feedbackVisible}" ng-click="triggerFeedback()">\n          <span class="fa fa-comments"></span>\n        </div>\n        <div ng-class="{\'trigger\': true,\n                        \'rooms-trigger\': true,\n                        \'rooms-visible\': roomsVisible}" ng-click="triggerRooms()">\n          <span class="fa fa-globe"></span>\n        </div>\n      </div>\n\n    </div>\n  </div>';
},{}],4:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/feedback/directive";
module.exports = (function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: true,
    controller: ['$scope', '$resource', (function($scope, $resource) {
      var Suggestions = $resource('/suggestions/:id', {id: '@id'});
      $scope.submitSuggestion = (function() {
        Suggestions.save({
          text: $scope.newSuggestion,
          image: null
        }, (function() {
          $scope.newSuggestion = '';
          getSuggestions();
        }));
      });
      $scope.voteDown = (function(suggestion) {
        Suggestions.save({
          id: suggestion.id,
          vote: 'down'
        }, (function(response) {
          _.extend(suggestion, response.suggestion);
        }));
      });
      $scope.voteUp = (function(suggestion) {
        Suggestions.save({
          id: suggestion.id,
          vote: 'up'
        }, (function(response) {
          _.extend(suggestion, response.suggestion);
        }));
      });
      function getSuggestions() {
        Suggestions.get(null, (function(suggestions) {
          $scope.suggestions = suggestions.suggestions;
        }));
      }
      getSuggestions();
    })]
  };
});


},{"./template.html":5}],5:[function(require,module,exports){
module.exports = '<form class="suggestions">\n  <ol class="suggestion-list">\n    <li ng-repeat="suggestion in suggestions" class="suggestion">\n      <span class="vote vote-down"><span class="fa fa-thumbs-down" ng-click="voteDown(suggestion)"></span> {{suggestion.down_count}}</span>\n      {{suggestion.text}}\n      <span class="vote vote-up">{{suggestion.up_count}} <span class="fa fa-thumbs-up" ng-click="voteUp(suggestion)"></span></span>\n    </li>\n  </ol>\n  <div class="input">\n    <textarea ng-model="newSuggestion" placeholder="Add Your Suggestion"></textarea>\n    <button ng-click="submitSuggestion()">Submit</button>\n  </div>\n</form>';
},{}],6:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/instantChat/directive";
var InstantChatChannelHandler = require('../../factories/rtc/instantChatChannelHandler/factory').InstantChatChannelHandler;
module.exports = (function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: (function($scope, element, attributes) {
      $scope.videoLoaded = (function(event) {
        return log(event);
      });
      $scope.toggleFullscreen = (function() {
        if (isFullscreen())
          exitFullscreen();
        else
          enterFullscreen();
      });
      document.addEventListener('fullscreenchange', updateFullscreenMessage);
      document.addEventListener('webkitfullscreenchange', updateFullscreenMessage);
      document.addEventListener('mozfullscreenchange', updateFullscreenMessage);
      function updateFullscreenMessage() {
        $scope.fullscreenMessage = isFullscreen() ? 'Exit Fullscreen' : 'Go Fullscreen';
      }
      function isFullscreen() {
        return !!document.fullscreenElement || !!document.mozFullScreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement;
      }
      function exitFullscreen() {
        if (document.exitFullscreen)
          document.exitFullscreen();
        else if (document.msExitFullscreen)
          document.msExitFullscreen();
        else if (document.mozCancelFullScreen)
          document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen)
          document.webkitExitFullscreen();
        updateFullscreenMessage();
      }
      function enterFullscreen() {
        if (document.documentElement.requestFullscreen)
          document.documentElement.requestFullscreen();
        else if (document.documentElement.msRequestFullscreen)
          document.documentElement.msRequestFullscreen();
        else if (document.documentElement.mozRequestFullScreen)
          document.documentElement.mozRequestFullScreen();
        else if (document.documentElement.webkitRequestFullscreen)
          document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        updateFullscreenMessage();
      }
      updateFullscreenMessage();
    }),
    controller: ['$rootScope', '$scope', '$sce', '$location', '$timeout', '$interval', '$resource', '$window', '$$rAF', 'log', 'instantChat', 'localMedia', 'instantChatChannelHandler', 'instantChatManager', 'config', 'participants', (function($rootScope, $scope, $sce, $location, $timeout, $interval, $resource, $window, $$rAF, log, instantChat, localMedia, instantChatChannelHandler, instantChatManager, config, participants) {
      log.info('Entering instantChat controller');
      localMedia.getDevices().then((function(devices) {
        return $scope.sources = devices;
      })).catch((function(error) {
        return log.error('Error retrieving sources', error);
      }));
      $window.addEventListener('click', (function() {
        toggleBars();
        $scope.$apply();
      }));
      $scope.menuIsCollapsed = false;
      $scope.hideBars = false;
      $scope.showCameras = (function() {
        return $scope.camerasVisible = true;
      });
      $scope.hideCameras = (function() {
        return $scope.camerasVisible = false;
      });
      $scope.toggleCameras = (function() {
        return $scope.camerasVisible = !$scope.camerasVisible;
      });
      $scope.expandMenu = (function() {
        $scope.menuIsCollapsed = false;
      });
      $scope.collapseMenu = (function() {
        $scope.menuIsCollapsed = true;
        toggleBars(false);
      });
      function toggleBars(hide) {
        var changed = $scope.hideBars != hide;
        $scope.hideBars = hide != null ? hide === true : !$scope.hideBars;
        $scope.hideCameras();
        if (changed) {
          $scope.resizing = $$rAF(broadcastResize);
          $timeout((function() {
            return $scope.resizing();
          }), 1000);
        }
      }
      function broadcastResize() {
        $rootScope.$broadcast('resize');
        $scope.resizing = $$rAF(broadcastResize);
      }
      var listenersCleanup = [];
      localMedia.getStream(config.defaultStream).then((function(stream) {
        if ($scope.$$destroyed) {
          stream.__doneWithStream();
          return;
        }
        instantChat.connect('https://' + $location.host()).then((function(signal) {
          if ($scope.$$destroyed) {
            stream.__doneWithStream();
            return;
          }
          $scope.signal = signal;
          $scope.localParticipant = instantChat.localParticipant;
          $scope.participants = instantChat.participants;
          $scope.activeParticipants = instantChat.activeParticipants;
          $scope.currentRoom = {name: null};
          $scope.currentRooms = signal.currentRooms;
          if (!$scope.localParticipant.streams.contains(stream)) {
            $scope.localParticipant.streams.add(stream);
          }
          joinRoom();
        })).catch((function(error) {
          return $rootScope.$broadcast('error', 'Could not access signalling server. Please refresh the page!', error);
        }));
      })).catch((function(error) {
        return $rootScope.$broadcast('error', 'Could not access your camera. Please refresh the page!', error);
      }));
      listenersCleanup.push(instantChat.on({
        'participant active': (function(participant) {
          $scope.$apply();
          $rootScope.$broadcast('participant active', participant);
        }),
        'participant inactive': (function(participant) {
          $scope.$apply();
          $rootScope.$broadcast('participant inactive', participant);
        }),
        'stream add': (function(stream) {
          $scope.$apply();
          $rootScope.$broadcast('stream add', stream);
        }),
        'stream remove': (function(stream) {
          $scope.$apply();
          $rootScope.$broadcast('stream remove', stream);
        })
      }));
      $scope.$watchCollection('config', _.debounce((function(config) {
        log(config);
      }), 500));
      $scope.addCamera = (function(source) {
        localMedia.getStream({
          audio: false,
          video: {optional: [{sourceId: source.id}]}
        }).then((function(stream) {
          $scope.localParticipant.streams.add(stream);
        }), (function(error) {
          return log.error(error);
        }));
      });
      onRootScope('error', (function($event, message, error) {
        $scope.errorMessage = message;
        log.error('Global Error', message, error);
        $scope.$apply();
      }));
      onRootScope('stream vote up', (function($event, data) {
        var from = data.from,
            to = data.to,
            stream = data.stream,
            status = data.status;
        if (stream.votes.length > 3)
          stream.votes.shift();
        stream.votes.push({
          vote: 'up',
          status: status,
          from: from
        });
        $timeout((function() {
          return stream.votes.shift();
        }), 4000);
        $scope.$apply();
      }));
      onRootScope('stream vote down', (function($event, data) {
        var from = data.from,
            to = data.to,
            stream = data.stream,
            status = data.status;
        if (stream.votes.length > 3)
          stream.votes.shift();
        stream.votes.push({
          vote: 'down',
          status: status,
          from: from
        });
        $timeout((function() {
          return stream.votes.shift();
        }), 4000);
        $scope.$apply();
      }));
      onRootScope('participant config', (function($event, data) {
        return $scope.$apply();
      }));
      var Images = $resource('/images');
      onRootScope('localThumbnail', (function($event, participant, stream, imageData) {
        Images.save({
          id: participant.id,
          data: imageData
        });
      }));
      $scope.$on('$destroy', (function() {
        if ($scope.signal)
          $scope.signal.leaveRooms();
        _.each(listenersCleanup, (function(fn) {
          return fn();
        }));
        listenersCleanup.splice(0);
        $window.removeEventListener(toggleBars);
      }));
      function joinRoom() {
        log('joining room', $location.path());
        $scope.signal.leaveRooms();
        var room = $location.path().replace(/^\//, '');
        if (room) {
          $scope.currentRoom.name = room;
          $scope.signal.joinRoom(room);
        }
      }
      function onRootScope(eventName, listener) {
        listenersCleanup.push($rootScope.$on(eventName, listener));
      }
      function createStream(stream, options) {
        return _.extend({
          stream: stream,
          votes: [],
          src: $sce.trustAsResourceUrl(URL.createObjectURL(stream))
        }, options);
      }
    })]
  };
});


},{"../../factories/rtc/instantChatChannelHandler/factory":33,"./template.html":7}],7:[function(require,module,exports){
module.exports = '<div ng-class="{\'instant-chat-content\': true, \'hide-bars\': hideBars}">\n  <div class="top-bar">\n    <div class="full-screen" ng-click="toggleFullscreen(); $event.stopPropagation()">\n      <span class="fa fa-arrows-alt"></span> <span>{{fullscreenMessage}}</span>\n    </div>\n  </div>\n  <div class="middle-bar">\n    <div class="error-message" ng-show="errorMessage != null" ng-click="errorMessage = null">{{errorMessage}}</div>\n    <div class="participants participants-count-{{activeParticipants.length}}">\n\n      <participant ng-repeat="participant in activeParticipants"\n        class="participant participant-{{$index}}" participant="participant">\n      </participant>\n\n    </div>\n  </div>\n  <div class="bottom-bar">\n    <div ng-show="sources.video.length > 1"\n         ng-click="toggleCameras(); $event.stopPropagation()"\n         ng-class="{\'tool\': true,\n                    \'add-camera\': true,\n                    \'is-active\': camerasVisible}">\n      <span class="plus">+</span><span class="fa fa-video-camera"></span>\n    </div>\n\n    <div ng-class="{\'tool\': true,\n                    \'show-menu\': true,\n                    \'is-active\': !menuIsCollapsed}">\n      <span class="fa fa-bars" ng-click="expandMenu(); $event.stopPropagation()"></span>\n    </div>\n  </div>\n</div>\n\n<div class="cameras" ng-if="camerasVisible" ng-click="hideCameras(); $event.stopPropagation()">\n  <div class="cameras-container">\n    <div class="source video-source"\n         ng-repeat="video in sources.video"\n         ng-click="addCamera(video)">\n      <span class="fa fa-video-camera"></span>\n      <span class="source-label">{{video.label}}</span>\n      <span ng-show="video.facing != \'\' && video.facing != null"> - {{video.facing}}</span>\n    </div>\n  </div>\n</div>\n\n<chat-menu ng-class="{\'collapsed\': menuIsCollapsed, \'expanded\': !menuIsCollapsed}" config="config" current-room="currentRoom" ng-click="$event.stopPropagation()"></chat-menu>';
},{}],8:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/participant/directive";
module.exports = (function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: (function($scope, element, attributes) {}),
    controller: ['$scope', (function($scope) {})]
  };
});


},{"./template.html":9}],9:[function(require,module,exports){
module.exports = '<div class="streams streams-count-{{participant.streams.length}}">\n\n  <stream ng-repeat="stream in participant.streams"\n    class="stream stream-{{$index}}" stream="stream" stream-name="participant.config.name" participant="participant">\n  </stream>\n\n</div>';
},{}],10:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/roomList/directive";
module.exports = (function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: ['$scope', '$resource', '$interval', (function($scope, $resource, $interval) {
      var Rooms = $resource('/rooms');
      function getRooms() {
        Rooms.get(null, (function(rooms) {
          return $scope.rooms = rooms.rooms;
        }));
      }
      getRooms();
      var getRoomPromise = $interval(getRooms, 30000);
      $scope.$on('$destroy', (function() {
        return $interval.cancel(getRoomPromise);
      }));
    })]
  };
});


},{"./template.html":11}],11:[function(require,module,exports){
module.exports = '<div class="room" ng-repeat="room in rooms">\n  <div class="room-name">\n    <a href="/#/{{room.name}}"><span class="hash">#</span>{{room.name}}</a>\n  </div>\n\n  <div class="participant" ng-repeat="participant in room.participants">\n    <img ng-src="{{participant.image}}">\n  </div>\n</div>';
},{}],12:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/settings/directive";
module.exports = (function() {
  return {
    restrict: 'E',
    template: require('./template.html'),
    controller: (function($scope, localMedia) {
      localMedia.getDevices().then((function(devices) {
        $scope.sources = devices;
      }));
    })
  };
});


},{"./template.html":13}],13:[function(require,module,exports){
module.exports = '<div class="sources">\n  <div class="audio-sources">\n    <span>Audio Sources</span>\n    <div class="source audio-source" ng-repeat="audio in sources.audio">\n      <span class="fa fa-volume-up"></span>\n      <span class="source-label">{{audio.label}}</span>\n      <span ng-show="audio.facing != \'\' && audio.facing != null"> - {{audio.facing}}</span>\n    </div>\n  </div>\n\n  <div class="video-sources">\n    <span>Video Sources</span>\n    <div class="source video-source" ng-repeat="video in sources.video">\n      <span class="fa fa-video-camera"></span>\n      <span class="source-label">{{video.label}}</span>\n      <span ng-show="video.facing != \'\' && video.facing != null"> - {{video.facing}}</span>\n    </div>\n  </div>\n</div>';
},{}],14:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/stream/directive";
var _ = (window._);
module.exports = ['$rootScope', '$interval', '$timeout', 'videoTools', (function($rootScope, $interval, $timeout, videoTools) {
  return {
    restrict: 'E',
    template: require('./template.html'),
    scope: {
      stream: '=',
      streamName: '=',
      participant: '='
    },
    link: (function($scope, element, attributes) {
      var video = element.find('video')[0],
          cell = element[0].childNodes[0];
      $scope.haveSize = false;
      $scope.thumbSrc = 'about:blank';
      $scope.listenersCleanup = [];
      var gotSize = $scope.gotSize = (function() {
        $scope.haveSize = true;
        $rootScope.$broadcast('haveVideoSize', $scope.stream);
      });
      video.addEventListener('loadedmetadata', gotSize);
      video.addEventListener('playing', gotSize);
      video.addEventListener('play', gotSize);
      element.on('resize', gotSize);
      cell.addEventListener('resize', gotSize);
      video.addEventListener('resize', gotSize);
      window.addEventListener('resize', gotSize);
      onRootScope({
        'resize': gotSize,
        'participant active': stateChange,
        'participant inactive': stateChange,
        'stream add': stateChange,
        'stream remove': stateChange,
        'haveVideoSize': refreshSize
      });
      $scope.$on('$destroy', (function() {
        video.removeEventListener('loadedmetadata', gotSize);
        video.removeEventListener('playing', gotSize);
        video.removeEventListener('play', gotSize);
        element.off('resize', gotSize);
        cell.removeEventListener('resize', gotSize);
        video.removeEventListener('resize', gotSize);
        window.removeEventListener('resize', gotSize);
      }));
      function stateChange() {
        console.log('state change');
        $timeout(refreshSize, 0);
      }
      function onRootScope(listeners) {
        _.each(listeners, (function(listener, eventName) {
          $scope.listenersCleanup.push($rootScope.$on(eventName, listener));
        }));
      }
      function refreshSize() {
        if (!$scope.haveSize)
          return;
        var videoWidth = video.videoWidth,
            videoHeight = video.videoHeight,
            videoRatio = (videoWidth / videoHeight) || (4 / 3),
            cellWidth = cell.clientWidth,
            cellHeight = cell.clientHeight,
            cellRatio = cellWidth / cellHeight;
        var videoSurfaceWidth,
            videoSurfaceHeight;
        if (cellRatio > videoRatio) {
          videoSurfaceWidth = cellHeight * videoRatio;
          videoSurfaceHeight = cellHeight;
        } else {
          videoSurfaceWidth = cellWidth;
          videoSurfaceHeight = cellWidth / videoRatio;
        }
        video.videoSurfaceWidth = videoSurfaceWidth;
        video.videoSurfaceHeight = videoSurfaceHeight;
        var top = (cellHeight - videoSurfaceHeight) / 2,
            left = (cellWidth - videoSurfaceWidth) / 2,
            bottom = top,
            right = cellWidth - left;
        $scope.streamOverlay.css({
          top: top + 'px',
          left: left + 'px',
          bottom: bottom + 'px',
          right: right + 'px',
          width: videoSurfaceWidth + 'px',
          height: videoSurfaceHeight + 'px'
        });
      }
      video.addEventListener('playing', (function() {
        $timeout($scope.generateLocalThumbnail, 100);
      }));
      $scope.$watch('stream', (function(stream) {
        stream.isMuted = $scope.participant.isLocal || stream.isMuted;
        stream.isVotedUp = false;
        stream.isVotedDown = false;
        video.muted = stream.isMuted;
        $scope.thumbnailInterval = $interval($scope.generateLocalThumbnail, 15000);
      }));
      $scope.toggleMute = (function($event) {
        var stream = $scope.stream;
        if (stream) {
          stream.isMuted = !stream.isMuted;
          video.muted = stream.isMuted;
        }
      });
      $scope.captureFrame = (function(options, callback) {
        videoTools.captureFrame(video, options || {width: 96}, callback);
      });
    }),
    controller: ['$scope', 'instantChatManager', (function($scope, instantChatManager) {
      $scope.toggleVoteUp = (function($event) {
        var stream = $scope.stream;
        stream.isVotedUp = !stream.isVotedUp;
        stream.isVotedDown = false;
        instantChatManager.sendToggleVoteUp(stream, stream.isVotedUp);
        $scope.captureFrame(null, (function(dataUrl) {
          stream.thumbSrc = dataUrl;
        }));
      });
      $scope.toggleVoteDown = (function($event) {
        var stream = $scope.stream;
        stream.isVotedUp = false;
        stream.isVotedDown = !stream.isVotedDown;
        instantChatManager.sendToggleVoteDown(stream, stream.isVotedDown);
      });
      $scope.generateLocalThumbnail = (function() {
        var participant = $scope.participant,
            stream = $scope.stream;
        $scope.captureFrame(null, (function(dataUrl) {
          $rootScope.$broadcast('thumbnail', participant, stream, dataUrl);
          if (participant.isLocal)
            $rootScope.$broadcast('localThumbnail', participant, stream, dataUrl);
        }));
      });
      $scope.$on('$destroy', (function() {
        window.removeEventListener('resize', $scope.gotSize);
        _.each($scope.listenersCleanup, (function(fn) {
          return fn();
        }));
        if ($scope.thumbnailInterval)
          $interval.cancel($scope.thumbnailInterval);
      }));
    })]
  };
})];


},{"./template.html":15}],15:[function(require,module,exports){
module.exports = '<div ng-show="stream.src != null" ng-class="{\'stream-container\': true, \'has-votes\': stream.votes.length > 0}">\n  <div class="cell">\n    <video class="stream-video" src="{{stream.src}}" autoplay></video>\n\n    <div ng-scope-element="streamOverlay"\n         class="stream-overlay">\n      <span class="stream-name">{{streamName}}</span>\n      <div class="votes">\n        <div class="vote" ng-repeat="vote in stream.votes">\n          <video class="video" src="{{vote.from.streams[0].src}}" muted="muted" autoplay></video>\n          <span ng-class="{\n                  \'fa\': true,\n                  \'fa-thumbs-up\': vote.vote == \'up\',\n                  \'fa-thumbs-down\': vote.vote == \'down\',\n                  \'thumbs\': true}"></span>\n        </div>\n      </div>\n      <div class="stream-controls">\n        <div ng-show="!participant.isLocal">\n          <span ng-class="{\n                  \'fa\': true,\n                  \'volume\': true,\n                  \'fa-volume-off\': stream.isMuted,\n                  \'volume-off\': stream.isMuted,\n                  \'fa-volume-up\': !stream.isMuted,\n                  \'volume-on\': !stream.isMuted}"\n                ng-click="toggleMute($event); $event.stopPropagation()"></span>\n\n          <span ng-class="{\n                  \'fa\': true,\n                  \'thumbs\': true,\n                  \'fa-thumbs-o-up\': !stream.isVotedUp,\n                  \'fa-thumbs-up\': stream.isVotedUp,\n                  \'thumbs-up\': true,\n                  \'thumbs-up-selected\': stream.isVotedUp}"\n                ng-click="toggleVoteUp(); $event.stopPropagation()"></span>\n\n          <span ng-class="{\n                  \'fa\': true,\n                  \'thumbs\': true,\n                  \'fa-thumbs-o-down\': !stream.isVotedDown,\n                  \'fa-thumbs-down\': stream.isVotedDown,\n                  \'thumbs-down\': true,\n                  \'thumbs-down-selected\': stream.isVotedDown}"\n                ng-click="toggleVoteDown(); $event.stopPropagation()"></span>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div ng-show="stream.src == null">\nStream Interrupted!\n</div>';
},{}],16:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/teaser/directive";
var _ = (window._);
module.exports = ['instantChat', (function(instantChat) {
  return {
    restrict: 'E',
    template: require('./template.html'),
    link: (function($scope, element, attributes, instantFile) {
      element.find('input')[0].focus();
    }),
    controller: ['$scope', '$location', (function($scope, $location) {
      $scope.joinChannel = (function() {
        $location.path($scope.channelName);
      });
      $scope.channelChange = _.debounce((function() {
        $scope.joinChannel();
        $scope.$apply();
      }), 1500);
    })]
  };
})];


},{"./template.html":17}],17:[function(require,module,exports){
module.exports = '<div class="intro">\n  <h3>Welcome to <span class="site-name">instachat.io</span></h3>\n\n  <rotator interval="4000">\n    <h5>Encrypted P2P Hashtag-based Video Sharing</h5>\n    <h5>Make Free Encrypted Video Calls To Over 1.5 Billion Devices</h5>\n  </rotator>\n\n  <form ng-submit="joinChannel()">\n    <label class="channel-input"><span class="hash">#</span><input type="text" placeholder="Enter Channel Name" tabindex="0" ng-model="channelName" ng-change="channelChange()"></label>\n  </form>\n</div>\n\n<room-list></room-list>';
},{}],18:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/util/contenteditable/directive";
module.exports = (function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, element, attr, ngModel) {
      if (!ngModel)
        return;
      ngModel.$render = (function() {
        return element.html(ngModel.$viewValue);
      });
      element.bind('blur', (function() {
        if (ngModel.$viewValue !== element.html().trim()) {
          return scope.$apply(read);
        }
      }));
      function read() {
        return ngModel.$setViewValue(element.html().trim());
      }
    }
  };
});


},{}],19:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/util/fitText/directive";
var fitText = (window.fitText);
module.exports = function() {
  return {
    restrict: 'A',
    link: function($scope, element, attributes) {
      element.on('resize', sizeElement);
      element.on('input', sizeElement);
      $scope.$on('$destroy', sizeElement);
      sizeElement();
      function sizeElement() {
        fitText(element);
      }
    }
  };
};


},{}],20:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/util/focusOn/directive";
module.exports = (function() {
  return {
    restrict: 'A',
    link: (function($scope, element, attributes) {
      element = element[0];
      $scope.$watch(attributes['focusOn'], (function(newValue) {
        if (newValue)
          setTimeout((function() {
            return element.focus();
          }), 0);
      }));
    })
  };
});


},{}],21:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/util/ngScopeElement/directive";
module.exports = (function() {
  return {
    restrict: "A",
    compile: function compile(tElement, tAttrs, transclude) {
      return {pre: function preLink(scope, iElement, iAttrs, controller) {
          scope[iAttrs.ngScopeElement] = iElement;
        }};
    }
  };
});


},{}],22:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/util/rotator/directive";
module.exports = ['$interval', (function($interval) {
  return {
    restrict: 'E',
    link: (function($scope, element, attributes) {
      var children = element[0].children,
          currentIndex = 0;
      console.log(element);
      if (children.length > 0)
        children[0].classList.add('active');
      $interval(rotate, parseInt(attributes.interval || "1000"));
      function rotate() {
        var active = children[currentIndex];
        if (active)
          active.classList.remove('active');
        currentIndex = (currentIndex + 1) % children.length;
        children[currentIndex].classList.add('active');
      }
    })
  };
})];


},{}],23:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/directives/util/selectOnClick/directive";
module.exports = function() {
  return {
    restrict: 'A',
    link: function($scope, element, attributes) {
      element.bind('click', function(e) {
        if (window.getSelection && document.createRange) {
          var selection = window.getSelection();
          var range = document.createRange();
          range.selectNodeContents(element[0]);
          selection.removeAllRanges();
          selection.addRange(range);
        } else if (document.selection && document.body.createTextRange) {
          var range = document.body.createTextRange();
          range.moveToElementText(element[0]);
          range.select();
        }
      });
    }
  };
};


},{}],24:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/config/factory";
var _ = (window._);
module.exports = ['emitter', 'localStorageService', (function(emitter, localStorageService) {
  var $__1 = emitter(),
      emit = $__1.emit,
      on = $__1.on,
      off = $__1.off;
  var storageKey = 'config',
      data = {};
  var config = _.extend({
    name: undefined,
    defaultStream: {
      audio: true,
      video: {mandatory: {
          minWidth: 320,
          maxWidth: 320,
          minHeight: 240,
          maxHeight: 240
        }}
    }
  }, localStorageService.get(storageKey) || {});
  _.each(config, (function(value, key) {
    console.log('setting', value, key);
    Object.defineProperty(data, key, {
      enumerable: true,
      get: (function() {
        return config[key];
      }),
      set: (function(value) {
        config[key] = value;
        localStorageService.set(storageKey, config);
        emit(key, value);
        emit('$change', config);
      })
    });
  }));
  Object.defineProperties(data, {
    'on': {get: (function() {
        return (function() {
          for (var args = [],
              $__0 = 0; $__0 < arguments.length; $__0++)
            args[$__0] = arguments[$__0];
          return on.apply(null, $traceurRuntime.toObject(args));
        });
      })},
    'off': {get: (function() {
        return (function() {
          for (var args = [],
              $__0 = 0; $__0 < arguments.length; $__0++)
            args[$__0] = arguments[$__0];
          return off.apply(null, $traceurRuntime.toObject(args));
        });
      })}
  });
  return data;
})];


},{}],25:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/emitter/factory";
module.exports = require('../../../util/emitter');


},{"../../../util/emitter":38}],26:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/instantChat/factory";
module.exports = ['$rootScope', 'log', 'participants', 'rtc', 'emitter', 'instantChatManager', 'config', 'localMedia', (function($rootScope, log, participants, rtc, emitter, instantChatManager, config, localMedia) {
  var $__0 = emitter(),
      emit = $__0.emit,
      on = $__0.on,
      off = $__0.off;
  var instantChat = {
    sendMessage: sendMessage,
    shareFile: shareFile,
    broadcast: broadcast,
    connect: connect,
    disconnect: disconnect,
    on: on,
    off: off,
    participants: participants,
    activeParticipants: [],
    signal: undefined,
    localParticipant: undefined,
    roomName: undefined
  };
  var activeParticipants = instantChat.activeParticipants;
  var connectPromise,
      broadcastPromiseFns = {};
  function connect(url) {
    connectPromise = connectPromise || new Promise((function(resolve, reject) {
      var signal = instantChat.signal = rtc(url);
      signal.on({
        'ready': ready,
        'room join': joinRoom,
        'room leave': leaveRoom,
        'peer add': (function(peer) {
          return participants.add({
            peer: peer,
            localStreams: instantChat.localParticipant.streams
          });
        }),
        'peer remove': (function(peer) {
          return participants.removeByPeer(peer);
        }),
        'broadcast_ready': (function(peer) {
          return broadcastReady(peer);
        }),
        'broadcast_error': (function(error) {
          return broadcastError(error);
        }),
        'peer receive offer': (function(peer) {
          return log.status(peer.id, 'Offer Received');
        }),
        'peer receive answer': (function(peer) {
          return log.status(peer.id, 'Answer Received');
        }),
        'peer send offer': (function(peer) {
          return log.status(peer.id, 'Offer Sent');
        }),
        'peer send answer': (function(peer) {
          return log.status(peer.id, 'Answer Sent');
        }),
        'peer signaling_state_change': (function(peer) {
          return log.status(peer.id, 'Signaling:', peer.connection.signalingState);
        }),
        'peer ice_connection_state_change': (function(peer) {
          return log.status(peer.id, 'ICE:', peer.connection.iceConnectionState);
        }),
        'peer error set_local_description': (function(peer, error, offer) {
          return log.error('peer error set_local_description', peer, error, offer);
        }),
        'peer error set_remote_description': (function(peer, error, offer) {
          return log.error('peer error set_remote_description', peer, error, offer);
        }),
        'peer error send answer': (function(peer, error, offer) {
          return log.error('peer error send answer', peer, error, offer);
        }),
        'peer error create offer': (function(peer, error) {
          return log.error('peer error create offer', peer, error);
        }),
        'peer error ice_candidate': (function(peer, error, candidate) {
          return log.error('peer error ice_candidate', peer, error, candidate);
        })
      });
      participants.on({
        'add': (function(participant) {
          return emit('participant add', participant);
        }),
        'remove': (function(participant) {
          return emit('participant remove', participant);
        }),
        'active': (function(participant) {
          activeParticipants.push(participant);
          emit('participant active', participant);
        }),
        'inactive': (function(participant) {
          log('inactive');
          _.remove(activeParticipants, {id: participant.id});
          emit('participant inactive', participant);
        }),
        'stream add': (function(participant, stream) {
          emit('stream add', participant, stream);
        }),
        'stream remove': (function(participant, stream) {
          return emit('stream remove', participant, stream);
        })
      });
      function ready(handle) {
        var localParticipant = instantChat.localParticipant = participants.add({
          id: handle,
          isLocal: true,
          config: config
        });
        instantChat.connected = true;
        resolve(signal, localParticipant);
      }
      function joinRoom(name) {
        instantChat.roomName = name;
        emit('room join', name);
      }
      function leaveRoom(name) {
        instantChat.roomName = undefined;
        participants.removeAllExceptLocal();
        instantChat.localParticipant.streams.removeAll();
        emit('room leave', name);
      }
      function broadcastReady(peer) {
        console.log('broadcast readly', peer, broadcastPromiseFns);
        broadcastPromiseFns.resolve(peer);
        broadcastPromiseFns.resolve = undefined;
        broadcastPromiseFns.reject = undefined;
      }
      function broadcastError(error) {
        console.log('broadcast error', error);
        broadcastPromiseFns.reject(error);
        broadcastPromiseFns.resolve = undefined;
        broadcastPromiseFns.reject = undefined;
      }
    }));
    return connectPromise;
  }
  function disconnect() {
    connectPromise = null;
    _.each(instantChat.localParticipant.streams, (function(stream) {
      return stream.rawStream.__doneWithStream();
    }));
    instantChat.signal.close();
  }
  function sendMessage(message) {}
  function shareFile(file) {}
  function broadcast(roomName) {
    return new Promise((function(resolve, reject) {
      instantChat.signal.adminRoom(roomName, {command: 'broadcast'});
      broadcastPromiseFns.resolve = resolve;
      broadcastPromiseFns.reject = reject;
      console.log(broadcastPromiseFns);
    }));
  }
  return instantChat;
})];


},{}],27:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/localMedia/factory";
var _ = (window._);
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
var getMediaDevices = navigator.getMediaDevices || (MediaStreamTrack && MediaStreamTrack.getSources ? (MediaStreamTrack.getSources) : (function() {
  return [];
}));
module.exports = ['$q', '$timeout', (function($q, $timeout) {
  var promises = {};
  return {
    getStream: (function(options) {
      options = options || {
        audio: true,
        video: true
      };
      var key = '';
      if (options.audio)
        key += 'audio';
      else if (options.audio && options.audio.optional)
        key += _.reduce(options.audio.optional, (function(key, source) {
          return key + source.sourceId;
        }), key);
      if (options.video)
        key += 'video';
      else if (options.video && options.video.optional)
        key += _.reduce(options.video.optional, (function(key, source) {
          return key + source.sourceId;
        }), key);
      console.log('#####stream key:', key);
      var createPromise = (function() {
        console.log('creating promise', key);
        return new Promise((function(resolve, reject) {
          getUserMedia.call(navigator, options, (function(stream) {
            promise.waitForEnd = new Promise((function(waitResolve, waitReject) {
              var ended = (function() {
                console.log('deleting promise', key);
                delete promises[key];
                waitResolve();
              });
              if (stream.addEventListener)
                stream.addEventListener('ended', ended);
              else
                stream.onended = ended;
              console.log('got stream', stream);
              stream.__doneWithStream = _.once((function() {
                console.log('done with stream');
                promise.stopTimeout = $timeout((function() {
                  console.log('timedout');
                  promise.stopTimeout = null;
                  stream.stop();
                  promise.stopped = true;
                }), 1000);
              }));
              resolve(stream);
            }));
          }), reject);
        }));
      });
      var promise = promises[key];
      if (promise) {
        if (promise.stopTimeout) {
          $timeout.cancel(promise.stopTimeout);
          delete promise.stopTimeout;
          return promise;
        }
        if (promise.stopped) {
          return promise.waitForEnd.then((function() {
            return promises[key] = createPromise();
          }));
        }
      } else {
        promise = createPromise();
        promises[key] = promise;
      }
      return promise;
    }),
    getDevices: (function() {
      var deferred = $q.defer();
      getMediaDevices((function(devices) {
        var ret = {
          audio: [],
          video: []
        };
        _.each(devices, (function(device) {
          if (device.kind == 'audio')
            ret.audio.push(device);
          else if (device.kind == 'video')
            ret.video.push(device);
        }));
        deferred.resolve(ret);
      }));
      return deferred.promise;
    })
  };
})];


},{}],28:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/log/factory";
var _ = (window._);
module.exports = ['$resource', (function($resource) {
  var buffer = [];
  var Log = $resource('/log');
  var methods = {
    log: log,
    debug: debug,
    info: info,
    status: status,
    warn: warn,
    error: error
  };
  function log() {
    var $__7;
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    ($__7 = console).log.apply($__7, $traceurRuntime.toObject(args));
  }
  function debug() {
    var $__7;
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$__1] = arguments[$__1];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['DEBUG:'], args));
    send.apply(null, $traceurRuntime.spread(['debug', new Date()], args));
  }
  function info() {
    var $__7;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['INFO:'], args));
    send.apply(null, $traceurRuntime.spread(['info', new Date()], args));
  }
  function status() {
    var $__7;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['STATUS:'], args));
    send.apply(null, $traceurRuntime.spread(['status', new Date()], args));
  }
  function warn() {
    var $__7;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['WARN:'], args));
    send.apply(null, $traceurRuntime.spread(['warn', new Date()], args));
  }
  function error() {
    var $__7;
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['ERROR:'], args));
    send.apply(null, $traceurRuntime.spread(['error', new Date()], args));
  }
  function send(level) {
    for (var args = [],
        $__6 = 1; $__6 < arguments.length; $__6++)
      args[$__6 - 1] = arguments[$__6];
    buffer.push({
      level: level,
      args: args
    });
    debouncedSend();
  }
  var debouncedSend = _.debounce((function() {
    Log.save({logs: buffer}, (function() {
      buffer.splice(0);
    }));
    buffer = [];
  }), 100, {maxWait: 500});
  return _.extend(methods.log, methods);
})];


},{}],29:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/participants/factory";
var _ = (window._);
module.exports = ['$timeout', 'rtc', 'emitter', 'streams', 'instantChatChannelHandler', (function($timeout, rtc, emitter, streams, instantChatChannelHandler) {
  var participants = [],
      participantsMap = {},
      nextOrdinal = 0,
      $__0 = emitter(),
      emit = $__0.emit,
      on = $__0.on,
      off = $__0.off;
  _.extend(participants, {
    add: add,
    remove: remove,
    removeByPeer: removeByPeer,
    removeAllExceptLocal: removeAllExceptLocal,
    getByID: getByID,
    on: on,
    off: off
  });
  return participants;
  function add(config) {
    console.log('adding participant', config);
    var registeredListeners = [];
    var peer = config.peer;
    var participant = {};
    _.extend(participant, {
      id: 'local',
      ordinal: nextOrdinal++,
      config: {},
      peer: peer,
      isActive: !!config.isLocal,
      isLocal: false,
      streams: streams(participant),
      on: on,
      off: off,
      _registeredListeners: registeredListeners
    });
    _.extend(participant, config);
    participants.push(participant);
    if (participant.isActive)
      $timeout((function() {
        return emit('active', participant);
      }), 100);
    if (peer) {
      participant.id = peer.id;
      _.each(config.localStreams, (function(stream) {
        return peer.addLocalStream(stream.rawStream);
      }));
      listenTo(peer, {
        'remoteStream add': (function(stream) {
          console.log('remoteStream add', stream);
          participant.streams.add(stream.stream);
        }),
        'remoteStream removed': (function(stream) {
          return participant.streams.remove();
        }),
        'disconnected': (function() {
          return remove(participant);
        })
      });
      if (peer.config.isExistingPeer) {
        var channel = peer.addChannel('instantChat', null, instantChatChannelHandler());
        peer.connect().then((function(peer) {
          participant.isActive = true;
          console.log('participant active');
          emit('active', participant);
        }), (function(error) {
          return log.error(error);
        }));
      } else {
        peer.on('channel add', (function(channel) {
          if (channel.label === 'instantChat') {
            channel.attachHandler(instantChatChannelHandler());
            participant.isActive = true;
            emit('active', participant);
          }
        }));
      }
    }
    participantsMap[participant.id] = participant;
    listenTo(participant.streams, {
      'add': (function(stream) {
        if (peer && peer.remoteStreams.indexOf(stream) == -1 && peer.localStreams.indexOf(stream) == -1) {
          peer.addLocalStream(stream);
        }
        emit('stream add', participant, stream);
      }),
      'remove': (function(stream) {
        return emit('stream remove', participant, stream);
      })
    });
    emit('add', participant);
    function listenTo(obj, listeners) {
      registeredListeners.push(obj.on(listeners));
    }
    return participant;
  }
  function remove(participant) {
    console.log('removing', participant, 'from', participants);
    participant.isActive = false;
    emit('inactive', participant);
    var peer = participant.peer;
    if (peer)
      delete participantsMap[peer.id];
    var index = _.indexOf(participants, participant);
    if (index >= 0)
      participants.splice(index, 1);
    destroy(participant);
    console.log(participants);
    emit('remove', [participant]);
  }
  function destroy(participant) {
    participant.peer.close();
    _.each(participant._registeredListeners, (function(listeners) {
      _.each(listeners, (function(unreg) {
        return unreg();
      }));
    }));
  }
  function removeByPeer(peer) {
    var participant = _.find(participants, {peer: {id: peer.id}});
    if (participant)
      remove(participant);
  }
  function removeAllExceptLocal() {
    var removed = _.remove(participants, (function(participant) {
      if (!participant.isLocal) {
        destroy(participant);
        return true;
      }
      return false;
    }));
    emit('remove', removed);
  }
  function getByID(id) {
    return participantsMap[id];
  }
})];


},{}],30:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/rtc/chatReceiveHandlers/factory";
module.exports = function() {
  return function(onMessage) {
    console.log('Initializing ChatReceive');
    return {handlers: {
        open: (function(channel) {
          return console.log('chat open');
        }),
        close: (function(channel) {}),
        error: (function(channel, error) {}),
        message: (function(channel, event) {
          return onMessage(channel, JSON.parse(event.data));
        })
      }};
  };
};


},{}],31:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/rtc/chatServeHandlers/factory";
module.exports = function() {
  function sendMessageToAll(peers, message) {
    _.each(peers, (function(peer) {
      return sendMessage(peer, message);
    }));
  }
  function sendMessage(peer, message) {
    try {
      var chatChannel = peer.channel('chat');
      if (chatChannel)
        chatChannel.sendJSON(message);
    } catch (e) {
      console.log('Chat send error', e, chatChannel, message);
    }
  }
  function messageHandler(channel, message, peers, onMessage) {
    message = JSON.parse(message);
    sendMessageToAll(peers, message);
    onMessage(channel, message);
  }
  return function(peers, onMessage) {
    console.log('Initializing ChatServe');
    return {
      sendMessageToAll: (function(message) {
        return sendMessageToAll(peers, message);
      }),
      sendMessage: sendMessage,
      handlers: {
        open: (function(channel) {
          return console.log('chat opened');
        }),
        close: (function(channel) {}),
        error: (function(channel, error) {}),
        message: (function(channel, event) {
          return messageHandler(channel, event.data, peers, onMessage);
        })
      }
    };
  };
};


},{}],32:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/rtc/factory";
var rtc = require('../../../util/rtc/rtc');
module.exports = ['log', 'emitter', 'signaler', rtc];


},{"../../../util/rtc/rtc":42}],33:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/rtc/instantChatChannelHandler/factory";
module.exports = (function() {
  return (function($scope) {
    return (function(channel) {
      function message(channel, event) {
        var message = JSON.parse(event.data);
      }
      function open(channel) {}
      function close(channel) {}
      function error(channel, error) {}
      return {
        'message': message,
        'open': open,
        'close': close,
        'error': error
      };
    });
  });
});


},{}],34:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/rtc/instantChatManager/factory";
var _ = (window._);
module.exports = ['log', '$emit', 'config', 'participants', (function(log, $emit, config, participants) {
  config.on('$change', _.debounce((function() {
    return _.each(participants, (function(p) {
      return sendConfig(p);
    }));
  })));
  function sendConfig(participant) {
    sendMessage(participant, {
      type: 'config',
      config: config
    });
  }
  function sendToggleVoteUp(stream, voteUpStatus) {
    console.log(stream);
    sendMessageToAll({
      type: 'voteUp',
      peerID: stream.participant.id,
      streamID: stream.id,
      status: voteUpStatus
    });
  }
  function sendToggleVoteDown(stream, voteDownStatus) {
    sendMessageToAll({
      type: 'voteDown',
      peerID: stream.participant.id,
      streamID: stream.id,
      status: voteDownStatus
    });
  }
  function receiveConfig(fromParticipant, peerID, config) {
    var targetParticipant = participants.getByID(peerID);
    fromParticipant.config = config;
    $emit('participant config', {
      from: fromParticipant,
      to: targetParticipant,
      config: config
    });
  }
  function receiveToggleVoteUp(fromParticipant, peerID, streamID, voteUpStatus) {
    console.log(peerID, participants);
    var targetParticipant = participants.getByID(peerID),
        targetStream = _.find(targetParticipant.streams, {id: streamID});
    console.log('got vote up');
    $emit('stream vote up', {
      from: fromParticipant,
      to: targetParticipant,
      stream: targetStream,
      status: voteUpStatus
    });
  }
  function receiveToggleVoteDown(fromParticipant, peerID, streamID, voteDownStatus) {
    var targetParticipant = participants.getByID(peerID),
        targetStream = _.find(targetParticipant.streams, {id: streamID});
    $emit('stream vote down', {
      from: fromParticipant,
      to: targetParticipant,
      stream: targetStream,
      status: voteDownStatus
    });
  }
  var messageHandlers = {
    'voteUp': (function(participant, data) {
      return receiveToggleVoteUp(participant, data.peerID, data.streamID, data.status);
    }),
    'voteDown': (function(participant, data) {
      return receiveToggleVoteDown(participant, data.peerID, data.streamID, data.status);
    }),
    'config': (function(participant, data) {
      return receiveConfig(participant, data.peerID, data.config);
    })
  };
  participants.on({
    'active': addParticipant,
    'inactive': removeParticipant
  });
  function addParticipant(participant) {
    if (!participant.isLocal) {
      participant.peer.channel('instantChat').then((function(channel) {
        channel.on('message', (function(channel, event) {
          console.log(channel, event);
          var message = JSON.parse(event.data);
          messageHandlers[message.type](participant, message);
        }));
        if (channel.channel.readyState == 'open')
          sendConfig(participant);
        else
          channel.on('open', (function() {
            return sendConfig(participant);
          }));
      }));
    }
  }
  function removeParticipant(participant) {}
  function sendMessageToAll(message) {
    _.each(participants, (function(participant) {
      return sendMessage(participant, message);
    }));
  }
  function sendMessage(participant, message) {
    if (!participant.isLocal) {
      try {
        var peer = participant.peer;
        console.log('sending', message, 'to', participant);
        peer.channel('instantChat').then((function(channel) {
          return channel.sendJSON(message);
        }));
      } catch (e) {
        log.error('Chat send error', e, chatChannel, message);
      }
    }
  }
  return {
    addParticipant: addParticipant,
    removeParticipant: removeParticipant,
    sendToggleVoteUp: sendToggleVoteUp,
    sendToggleVoteDown: sendToggleVoteDown
  };
})];


},{}],35:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/rtc/signaler/factory";
var signaler = require('../../../../util/rtc/signaler');
module.exports = ['emitter', signaler];


},{"../../../../util/rtc/signaler":43}],36:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/streams/factory";
module.exports = ['$sce', 'emitter', (function($sce, emitter) {
  return (function(participant) {
    console.log('participant', participant);
    var streams = [],
        nextOrdinal = 0,
        $__0 = emitter(),
        emit = $__0.emit,
        on = $__0.on,
        off = $__0.off;
    _.extend(streams, {
      add: add,
      remove: remove,
      removeAll: removeAll,
      contains: contains,
      on: on,
      off: off
    });
    return streams;
    function add(rawStream) {
      console.log('adding stream', rawStream);
      var stream = createStream(rawStream);
      streams.push(stream);
      emit('add', stream);
      return stream;
    }
    function remove(stream) {
      stream.rawStream.__doneWithStream();
      _.remove(streams, {id: stream.id});
      emit('remove', stream);
    }
    function removeAll() {
      for (var i = streams.length - 1; i >= 0; i--) {
        remove(streams[i]);
      }
    }
    function contains(stream) {
      for (var i = 0; streams.length; i++) {
        if (streams[i].rawStream === stream)
          return true;
      }
      return false;
    }
    function createStream(rawStream) {
      return {
        ordinal: nextOrdinal++,
        id: rawStream.id,
        participant: participant,
        rawStream: rawStream,
        votes: [],
        src: $sce.trustAsResourceUrl(URL.createObjectURL(rawStream))
      };
    }
  });
})];


},{}],37:[function(require,module,exports){
"use strict";
var __moduleName = "src/frontend/factories/videoTools/factory";
module.exports = (function() {
  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d');
  function captureFrame(video, options, callback, iterations) {
    options = options || {};
    iterations = iterations || 0;
    canvas.width = video.videoSurfaceWidth;
    canvas.height = video.videoSurfaceHeight;
    if (options.width && !options.height) {
      options.height = options.width * (canvas.height / canvas.width);
    } else if (!options.width && options.height) {
      options.width = options.height * (canvas.width / canvas.width);
    }
    options.width = options.width || canvas.width;
    options.height = options.height || canvas.height;
    canvas.width = options.width;
    canvas.height = options.height;
    try {
      context.drawImage(video, 0, 0, options.width, options.height);
      callback(canvas.toDataURL());
    } catch (e) {
      if (e.name == 'NS_ERROR_NOT_AVAILABLE' && iterations < 5) {
        setTimeout(captureFrame, 100, video, options, callback, iterations + 1);
      } else
        throw e;
    }
  }
  return {captureFrame: captureFrame};
});


},{}],38:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/emitter";
module.exports = (function() {
  return (function(listenerInterceptor) {
    var events = {};
    return {
      emit: (function() {
        for (var args = [],
            $__0 = 0; $__0 < arguments.length; $__0++)
          args[$__0] = arguments[$__0];
        return emit.apply(null, $traceurRuntime.spread([events], args));
      }),
      on: (function() {
        for (var args = [],
            $__1 = 0; $__1 < arguments.length; $__1++)
          args[$__1] = arguments[$__1];
        return on.apply(null, $traceurRuntime.spread([events, listenerInterceptor], args));
      }),
      off: (function() {
        for (var args = [],
            $__2 = 0; $__2 < arguments.length; $__2++)
          args[$__2] = arguments[$__2];
        return off.apply(null, $traceurRuntime.spread([events], args));
      })
    };
  });
  function emit(events, event) {
    var listeners = events[event] || [],
        args = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(null, args);
    }
  }
  function on(events, listenerInterceptor, event, listener) {
    if (typeof event == 'object') {
      var unregister = (function() {
        return _.each(unregister, (function(fn) {
          return fn();
        }));
      });
      return _.transform(event, (function(result, listener, eventName) {
        result[eventName] = on(events, listenerInterceptor, eventName, listener);
      }), unregister);
    }
    if (listenerInterceptor) {
      var ret = listenerInterceptor.attemptIntercept(event, listener);
      if (ret)
        return ret;
    }
    events[event] = events[event] || [];
    events[event].push(listener);
    return (function() {
      return off(events, event, listener);
    });
  }
  function off(events, event, listener) {
    if (typeof event == 'object') {
      for (var eventName in event)
        off(events, eventName, event[eventName]);
      return;
    }
    var listeners = events[event];
    if (listeners && listeners.length > 0) {
      removeListener(listeners, listener);
      if (listeners.length === 0)
        delete events[event];
    }
    function removeListener(listeners, listener) {
      for (var i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
        }
      }
      return listeners;
    }
  }
});


},{}],39:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/log";
var _ = (window._);
module.exports = (function() {
  var methods = {
    log: log,
    debug: debug,
    info: info,
    status: status,
    warn: warn,
    error: error
  };
  function log() {
    var $__7;
    for (var args = [],
        $__0 = 0; $__0 < arguments.length; $__0++)
      args[$__0] = arguments[$__0];
    ($__7 = console).log.apply($__7, $traceurRuntime.toObject(args));
  }
  function debug() {
    var $__7;
    for (var args = [],
        $__1 = 0; $__1 < arguments.length; $__1++)
      args[$__1] = arguments[$__1];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['DEBUG:'], args));
    send.apply(null, $traceurRuntime.spread(['debug', new Date()], args));
  }
  function info() {
    var $__7;
    for (var args = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      args[$__2] = arguments[$__2];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['INFO:'], args));
    send.apply(null, $traceurRuntime.spread(['info', new Date()], args));
  }
  function status() {
    var $__7;
    for (var args = [],
        $__3 = 0; $__3 < arguments.length; $__3++)
      args[$__3] = arguments[$__3];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['STATUS:'], args));
    send.apply(null, $traceurRuntime.spread(['status', new Date()], args));
  }
  function warn() {
    var $__7;
    for (var args = [],
        $__4 = 0; $__4 < arguments.length; $__4++)
      args[$__4] = arguments[$__4];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['WARN:'], args));
    send.apply(null, $traceurRuntime.spread(['warn', new Date()], args));
  }
  function error() {
    var $__7;
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(['ERROR:'], args));
    send.apply(null, $traceurRuntime.spread(['error', new Date()], args));
  }
  function send(level) {
    for (var args = [],
        $__6 = 1; $__6 < arguments.length; $__6++)
      args[$__6 - 1] = arguments[$__6];
  }
  var debouncedSend = _.debounce((function() {
    Log.save({logs: buffer}, (function() {
      buffer.splice(0);
    }));
    buffer = [];
  }), 100, {maxWait: 500});
  return _.extend(methods.log, methods);
});


},{}],40:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/channel";
var Channel = function Channel(peer, channel, channelHandler) {
  this._channel = channel;
  this._peer = peer;
  this.attachHandler(channelHandler);
};
($traceurRuntime.createClass)(Channel, {
  send: function(data) {
    this._channel.send(data);
  },
  sendJSON: function(data) {
    this._channel.send(JSON.stringify(data));
  },
  get label() {
    return this._channel.label;
  },
  get channel() {
    return this._channel;
  },
  get peer() {
    return this._peer;
  },
  attachHandler: function(channelHandler) {
    if (typeof channelHandler === 'function')
      channelHandler = channelHandler(this._channel);
    this.on(channelHandler || {});
  },
  on: function(event, listener) {
    var $__0 = this;
    if (typeof event == 'object') {
      for (var eventName in event)
        this.on(eventName, event[eventName]);
      return;
    }
    this._channel.addEventListener(event, (function(event) {
      return listener($__0, event);
    }));
    return this;
  }
}, {});
;
module.exports = {
  get Channel() {
    return Channel;
  },
  __esModule: true
};


},{}],41:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/peer";
var Channel = require('./channel').Channel;
var Stream = require('./stream').Stream;
var _ = (window._),
    emitter = require('../emitter')();
var RTCPeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
var RTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
var RTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
var CONNECTION_EVENTS = ['negotiation_needed', 'ice_candidate', 'signaling_state_change', 'add_stream', 'remove_stream', 'ice_connection_state_change', 'data_channel'];
var iceServers = {
  iceServers: [{
    url: 'stun:104.131.128.101:3478',
    urls: 'stun:104.131.128.101:3478'
  }, {
    url: 'turn:104.131.128.101:3478',
    urls: 'turn:104.131.128.101:3478',
    username: 'turn',
    credential: 'turn'
  }],
  iceTransports: 'all'
};
var Peer = function Peer(id, config) {
  var $__0 = this;
  this._id = id;
  this._config = config;
  this._remoteCandidates = [];
  this._localCandidates = [];
  this._remoteStreams = [];
  this._localStreams = [];
  this._channels = {};
  this._events = {};
  this._isConnectingPeer = false;
  this._connectPromise = null;
  this._connectCalled = false;
  this._connected = false;
  this._isReadyForIceCandidates = false;
  this._iceCandidatePromises = [];
  this._nextChannelID = 0;
  this._log = [];
  var connection = this._connection = new RTCPeerConnection(iceServers);
  var $__2 = emitter({attemptIntercept: (function(event, listener) {
      if (connection && CONNECTION_EVENTS.indexOf(event) != -1) {
        connection.addEventListener(event.replace(/_/g, ''), listener);
        return true;
      }
      return false;
    })}),
      emit = $__2.emit,
      on = $__2.on,
      off = $__2.off;
  this.fire = emit;
  this.on = on;
  this.off = off;
  this.on({
    'ice_candidate': (function(event) {
      return $__0._localCandidates.push(event.candidate);
    }),
    'data_channel': (function(event) {
      return $__0._addChannel(event.channel);
    }),
    'add_stream': (function(event) {
      return $__0._addRemoteStream(event.stream);
    })
  });
  this.on({'ice_connection_state_change': (function(event) {
      switch (connection.iceConnectionState) {
        case 'connected':
        case 'completed':
          $__0._connected = true;
          console.log('connected!');
          break;
        case 'failed':
        case 'disconnected':
        case 'closed':
          $__0._connected = false;
          $__0.fire('disconnected');
      }
    })});
};
($traceurRuntime.createClass)(Peer, {
  connect: function() {
    var $__0 = this;
    this._isConnectingPeer = true;
    this._connectPromise = this._connectPromise || new Promise((function(resolve, reject) {
      var connectWatcher = (function(event) {
        $__0._connectCalled = true;
        var connection = event.target;
        switch (connection.iceConnectionState) {
          case 'connected':
          case 'completed':
            $__0._connected = true;
            connection.removeEventListener('iceconnectionstatechange', connectWatcher);
            resolve($__0);
            break;
          case 'failed':
          case 'disconnected':
          case 'closed':
            connection.removeEventListener('iceconnectionstatechange', connectWatcher);
            reject({
              peer: $__0,
              event: event
            });
            break;
        }
      });
      $__0._connection.addEventListener('iceconnectionstatechange', connectWatcher);
      $__0.initiateOffer().then((function(offer) {
        return $__0.fire('offer ready', offer);
      })).catch((function(error) {
        return $__0.fire('offer error');
      }));
    }));
    return this._connectPromise;
  },
  initiateOffer: function(options) {
    var $__0 = this;
    options = options || {mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true
      }};
    return new Promise((function(resolve, reject) {
      $__0._connection.createOffer((function(offer) {
        return $__0._connection.setLocalDescription(offer, (function() {
          return resolve($__0._connection.localDescription);
        }), (function(error) {
          return reject('peer error set_local_description', $__0, error, offer);
        }));
      }), (function(error) {
        return reject(error);
      }), options);
    }));
  },
  receiveOffer: function(offer) {
    var $__0 = this;
    return new Promise((function(resolve, reject) {
      $__0._connection.setRemoteDescription(new RTCSessionDescription(offer), (function() {
        $__0._resolveIceCandidatePromises();
        $__0._connection.createAnswer((function(answer) {
          $__0._connection.setLocalDescription(answer, (function() {
            return resolve($__0._connection.localDescription);
          }), (function(error) {
            return reject('peer error set_local_description', $__0, error, answer);
          }));
        }), (function(error) {
          return reject('peer error send answer', $__0, error, offer);
        }));
      }), (function(error) {
        return reject('peer error set_remote_description', $__0, error, offer);
      }));
    }));
  },
  receiveAnswer: function(answer) {
    var $__0 = this;
    return new Promise((function(resolve, reject) {
      return $__0._connection.setRemoteDescription(new RTCSessionDescription(answer), (function() {
        $__0._resolveIceCandidatePromises();
        resolve();
      }), reject);
    }));
  },
  addIceCandidates: function(candidates) {
    var $__0 = this;
    return new Promise((function(outerResolve, outerReject) {
      _.each(candidates, (function(candidate) {
        $__0._iceCandidatePromises.push((function() {
          return new Promise((function(resolve, reject) {
            $__0._connection.addIceCandidate(new RTCIceCandidate(candidate), (function() {
              $__0._remoteCandidates.push(candidate);
              resolve();
            }), (function(error) {
              reject(error);
            }));
          }));
        }));
      }));
      $__0._resolveIceCandidatePromises(outerResolve, outerReject);
    }));
  },
  addChannel: function(label, options, channelHandler) {
    label = label || ('data-channel-' + this._nextChannelID++);
    var channel = this._addChannel(this._connection.createDataChannel(label, options), channelHandler);
    return channel;
  },
  removeChannel: function(label) {
    var channel = this._channels[label];
    if (channel) {
      delete this._channels[label];
      this.fire('channel removed', channel);
    }
  },
  addLocalStream: function(stream) {
    var localStream = new Stream(this, stream);
    this._localStreams.push(localStream);
    this._addLocalStream(stream);
    return localStream;
  },
  removeStream: function(stream) {
    var index = this._localStreams.indexOf(stream);
    if (index != 1) {
      this._localStreams.splice(index, 1);
      this._connection.removeStream(stream.stream);
    }
  },
  forwardStream: function(stream) {
    this._localStreams.push(stream);
    this._addLocalStream(stream.stream);
  },
  close: function() {
    if (this._connection && this._connection.iceConnectionState != 'closed')
      this._connection.close();
  },
  getStats: function() {
    var $__0 = this;
    return new Promise((function(resolve, reject) {
      $__0._connection.getStats(resolve, reject);
    }));
  },
  get id() {
    return this._id;
  },
  get config() {
    return this._config;
  },
  get localStreams() {
    return this._localStreams;
  },
  get remoteStreams() {
    return this._remoteStreams;
  },
  get channels() {
    return this._channels;
  },
  get isConnectingPeer() {
    return this._isConnectingPeer;
  },
  get log() {
    return this._log;
  },
  channel: function(label) {
    var $__0 = this;
    var promises = this._channelPromises = this._channelPromises || {};
    var promise = promises[label] = promises[label] || new Promise((function(resolve, reject) {
      var channel = $__0._channels[label];
      if (channel)
        resolve(channel);
      else {
        var listener = (function(channel) {
          if (channel.label == label) {
            $__0.off('channel add', listener);
            resolve(channel);
          }
        });
        $__0.on('channel add', listener);
      }
    }));
    return promise;
  },
  stream: function(id) {
    return _.find(this._remoteStreams, {'id': id});
  },
  get connection() {
    return this._connection;
  },
  _addChannel: function(channel) {
    var $__0 = this;
    channel = new Channel(this, channel);
    channel.on({'close': (function() {
        return $__0.removeChannel(channel.label);
      })});
    this._channels[channel.label] = channel;
    this.fire('channel add', channel);
    return channel;
  },
  _addLocalStream: function(stream) {
    var $__0 = this;
    this._connection.addStream(stream);
    console.log('_adding local stream');
    if (this._connected) {
      this.initiateOffer().then((function(offer) {
        return $__0.fire('offer ready', offer);
      })).catch((function(error) {
        console.log(error);
        $__0.fire('offer error');
      }));
    }
    this.fire('localStream add', stream);
    return stream;
  },
  _addRemoteStream: function(stream) {
    console.log('add remote stream');
    stream = new Stream(this, stream);
    this._remoteStreams.push(stream);
    this.fire('remoteStream add', stream);
    return stream;
  },
  _resolveIceCandidatePromises: function(resolve, reject) {
    if (this._connection.signalingState != 'have-local-offer' && this._connection.remoteDescription) {
      Promise.all(_.map(this._iceCandidatePromises, (function(fn) {
        return fn();
      }))).then((function() {
        return resolve();
      })).catch(reject);
      this._iceCandidatePromises.splice(0);
    }
  },
  _log: function() {
    this._log.push({
      at: new Date(),
      args: $traceurRuntime.spread(arguments)
    });
  }
}, {});
;
module.exports = {
  get Peer() {
    return Peer;
  },
  __esModule: true
};


},{"../emitter":38,"./channel":40,"./stream":44}],42:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/rtc";
var Peer = require('./peer').Peer;
var _ = (window._),
    io = (window.io);
module.exports = (function(log, emitter, signaler) {
  if (!log)
    log = require('../log');
  if (!emitter)
    emitter = require('../emitter')();
  if (!signaler)
    signaler = require('./signaler')();
  var signal;
  var $__1 = emitter(),
      fire = $__1.emit,
      on = $__1.on,
      off = $__1.off;
  return (function(server) {
    if (signal === undefined)
      signal = connectToSignal(server);
    if (signal.ready)
      setTimeout((function() {
        return fire('ready', signal.myID);
      }), 0);
    return signal;
  });
  function connectToSignal(server) {
    var signal = {
      on: on,
      off: off,
      joinRoom: joinRoom,
      leaveRoom: leaveRoom,
      leaveRooms: leaveRooms,
      adminRoom: adminRoom,
      currentRooms: {},
      close: close
    };
    var rooms = signal.currentRooms;
    var peers = [],
        peersHash = {};
    var signalerEmitter = emitter();
    var socket = io(server + '/signal');
    var emit = (function(event, data) {
      return socket.emit(event, data);
    });
    var socketSignaler = signaler({
      emit: (function(name, data) {
        return emit('peer ' + name, data);
      }),
      on: signalerEmitter.on
    });
    socket.on('error', (function() {
      var $__2;
      for (var args = [],
          $__0 = 0; $__0 < arguments.length; $__0++)
        args[$__0] = arguments[$__0];
      return ($__2 = log).error.apply($__2, $traceurRuntime.spread(['Failed to connect socket.io'], args));
    }));
    _.each({
      'connect': (function() {
        return log.info('Connected to server');
      }),
      'your_id': (function(myID) {
        return gotID(myID);
      }),
      'room': (function(data) {
        return updateRoom(data);
      }),
      'peer join': (function(data) {
        return socketSignaler.managePeer(newPeer(data.id));
      }),
      'peer leave': (function(data) {
        return socketSignaler.dropPeer(removePeerByID(data.id));
      }),
      'peer offer': (function(data) {
        return signalerEmitter.emit('offer', data);
      }),
      'peer answer': (function(data) {
        return signalerEmitter.emit('answer', data);
      }),
      'peer candidates': (function(data) {
        return signalerEmitter.emit('candidates', data);
      }),
      'broadcast ready': (function(data) {
        return fire('broadcast_ready', socketSignaler.managePeer(newPeer(data.broadcasterID)));
      }),
      'broadcast error': (function(data) {
        return fire('broadcast_error', data);
      }),
      'error': (function(error) {
        return log.error(error);
      })
    }, (function(handler, name) {
      return socket.on(name, function() {
        handler.apply(this, arguments);
        fire.apply(null, $traceurRuntime.spread([name], arguments));
      });
    }));
    function gotID(myID) {
      log('Got ID', myID);
      signal.myID = myID;
      signal.ready = true;
      fire('ready', myID);
    }
    function updateRoom(data) {
      var room = rooms[data.roomName] || {};
      _.extend(room, data);
      console.log('got room', room);
      if (room.broadcasterID)
        socketSignaler.managePeer(newPeer(room.broadcasterID, {isExistingPeer: true}));
      else
        _.each(data.peerIDs, (function(peerID) {
          return socketSignaler.managePeer(newPeer(peerID, {isExistingPeer: true}));
        }));
    }
    function newPeer(id, config) {
      config = config || {isExistingPeer: false};
      var peer = new Peer(id, config);
      peers.push(peer);
      peersHash[id] = peer;
      fire('peer add', peer);
      return peer;
    }
    function removePeerByID(id) {
      var peer = getPeer(id);
      if (peer) {
        peer.close();
        _.remove(peers, (function(peer) {
          return peer.id === id;
        }));
        delete peersHash[id];
        fire('peer remove', peer);
        return peer;
      }
    }
    function joinRoom(roomName) {
      rooms[roomName] = rooms[roomName] || {roomName: roomName};
      emit('room join', roomName);
      fire('room join', roomName);
    }
    function leaveRoom(roomName) {
      delete rooms[roomName];
      emit('room leave', roomName);
      fire('room leave', roomName);
    }
    function leaveRooms() {
      for (var i = rooms.length - 1; i >= 0; i--)
        leaveRoom(rooms[i]);
    }
    function adminRoom(roomName, command) {
      log('admining', roomName, command);
      emit('room admin', _.extend({roomName: roomName}, command));
    }
    function close() {
      socket.close();
      _.each(peers, (function(peer) {
        return peer.close();
      }));
      signal = undefined;
    }
    function getPeer(id) {
      return peersHash[id];
    }
    return signal;
  }
});


},{"../emitter":38,"../log":39,"./peer":41,"./signaler":43}],43:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/signaler";
module.exports = (function(emitter) {
  if (!emitter)
    emitter = require('../emitter')();
  return (function(transport) {
    var $__0 = emitter(),
        emit = $__0.emit,
        on = $__0.on,
        off = $__0.off;
    var signaler = {
      peers: {},
      peerCount: 0,
      managePeer: managePeer,
      dropPeer: dropPeer,
      managesPeer: managesPeer
    };
    transport.on({
      'offer': (function(data) {
        return receiveOffer(data.peerID, data.offer);
      }),
      'answer': (function(data) {
        return receiveAnswer(data.peerID, data.answer);
      }),
      'candidates': (function(data) {
        return receiveIceCandidates(data.peerID, data.candidates);
      })
    });
    var peers = signaler.peers;
    var send = transport.emit;
    function managePeer(peer) {
      var peerID = peer.id,
          candidates = [];
      peers[peerID] = peer;
      signaler.peerCount++;
      peer.on({
        'offer ready': (function(offer) {
          console.log('offer ready');
          send('offer', {
            peerID: peerID,
            offer: offer
          });
          emit('send offer', peer, offer);
        }),
        ice_candidate: (function(event) {
          var candidate = event.candidate;
          if (candidate) {
            candidates.push(candidate);
            sendIceCandidates();
            emit('ice_candidate', peer, candidate);
          }
        })
      });
      var sendIceCandidates = _.throttle((function() {
        send('candidates', {
          peerID: peerID,
          candidates: candidates
        });
        candidates.splice(0);
      }), 0);
      return peer;
    }
    function dropPeer(peer) {
      var storedPeer = peers[peer.id];
      if (storedPeer) {
        storedPeer.off();
        delete peers[peer.id];
        signaler.peerCount--;
      }
      return peer;
    }
    function receiveOffer(peerID, offer) {
      var $__1;
      var peer = getPeer(peerID);
      emit('peer receive offer', peer, offer);
      ($__1 = peer.receiveOffer(offer)).then.apply($__1, $traceurRuntime.spread([(function(answer) {
        send('answer', {
          peerID: peerID,
          answer: answer
        });
        emit('send answer', peer, answer);
      })], (function(error) {
        return emit.apply(null, $traceurRuntime.spread(['error offer', peer, answer], error));
      })));
    }
    function receiveAnswer(peerID, answer) {
      var $__1;
      var peer = getPeer(peerID);
      emit('peer receive answer', peer, answer);
      ($__1 = peer.receiveAnswer(answer)).then.apply($__1, $traceurRuntime.spread([(function() {
        return emit('accepted answer', peer, answer);
      })], (function(error) {
        return emit.apply(null, $traceurRuntime.spread(['error answer', peer, answer], error));
      })));
    }
    function receiveIceCandidates(peerID, candidates) {
      var $__1;
      var peer = getPeer(peerID);
      emit('peer receive candidates', peer, candidates);
      ($__1 = peer.addIceCandidates(candidates)).then.apply($__1, $traceurRuntime.spread([(function() {
        return emit('accepted candidates', peer, candidates);
      })], (function(error) {
        return emit.apply(null, $traceurRuntime.spread(['error candidates', peer, candidates], error));
      })));
    }
    function getPeer(id) {
      var peer = peers[id];
      if (peer)
        return peer;
      throw 'Tried to get non-existent peer!';
    }
    function managesPeer(id) {
      return peers[id] != null;
    }
    return signaler;
  });
});


},{"../emitter":38}],44:[function(require,module,exports){
"use strict";
var __moduleName = "src/util/rtc/stream";
var Stream = function Stream(peer, stream, streamListeners) {
  this._peer = peer;
  this._stream = stream;
  this._id = stream.id;
};
($traceurRuntime.createClass)(Stream, {
  get stream() {
    return this._stream;
  },
  get id() {
    return this._id;
  },
  get peer() {
    return this._peer;
  }
}, {});
;
module.exports = {
  get Stream() {
    return Stream;
  },
  __esModule: true
};


},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2FwcC5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2RpcmVjdGl2ZXMvY2hhdE1lbnUvZGlyZWN0aXZlLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZGlyZWN0aXZlcy9jaGF0TWVudS90ZW1wbGF0ZS5odG1sIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZGlyZWN0aXZlcy9mZWVkYmFjay9kaXJlY3RpdmUuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL2ZlZWRiYWNrL3RlbXBsYXRlLmh0bWwiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL2luc3RhbnRDaGF0L2RpcmVjdGl2ZS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2RpcmVjdGl2ZXMvaW5zdGFudENoYXQvdGVtcGxhdGUuaHRtbCIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2RpcmVjdGl2ZXMvcGFydGljaXBhbnQvZGlyZWN0aXZlLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZGlyZWN0aXZlcy9wYXJ0aWNpcGFudC90ZW1wbGF0ZS5odG1sIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZGlyZWN0aXZlcy9yb29tTGlzdC9kaXJlY3RpdmUuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL3Jvb21MaXN0L3RlbXBsYXRlLmh0bWwiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL3NldHRpbmdzL2RpcmVjdGl2ZS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2RpcmVjdGl2ZXMvc2V0dGluZ3MvdGVtcGxhdGUuaHRtbCIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2RpcmVjdGl2ZXMvc3RyZWFtL2RpcmVjdGl2ZS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2RpcmVjdGl2ZXMvc3RyZWFtL3RlbXBsYXRlLmh0bWwiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL3RlYXNlci9kaXJlY3RpdmUuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL3RlYXNlci90ZW1wbGF0ZS5odG1sIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZGlyZWN0aXZlcy91dGlsL2NvbnRlbnRlZGl0YWJsZS9kaXJlY3RpdmUuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL3V0aWwvZml0VGV4dC9kaXJlY3RpdmUuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL3V0aWwvZm9jdXNPbi9kaXJlY3RpdmUuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9kaXJlY3RpdmVzL3V0aWwvbmdTY29wZUVsZW1lbnQvZGlyZWN0aXZlLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZGlyZWN0aXZlcy91dGlsL3JvdGF0b3IvZGlyZWN0aXZlLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZGlyZWN0aXZlcy91dGlsL3NlbGVjdE9uQ2xpY2svZGlyZWN0aXZlLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL2NvbmZpZy9mYWN0b3J5LmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL2VtaXR0ZXIvZmFjdG9yeS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2ZhY3Rvcmllcy9pbnN0YW50Q2hhdC9mYWN0b3J5LmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL2xvY2FsTWVkaWEvZmFjdG9yeS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2ZhY3Rvcmllcy9sb2cvZmFjdG9yeS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2ZhY3Rvcmllcy9wYXJ0aWNpcGFudHMvZmFjdG9yeS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2ZhY3Rvcmllcy9ydGMvY2hhdFJlY2VpdmVIYW5kbGVycy9mYWN0b3J5LmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL3J0Yy9jaGF0U2VydmVIYW5kbGVycy9mYWN0b3J5LmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL3J0Yy9mYWN0b3J5LmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL3J0Yy9pbnN0YW50Q2hhdENoYW5uZWxIYW5kbGVyL2ZhY3RvcnkuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy9mcm9udGVuZC9mYWN0b3JpZXMvcnRjL2luc3RhbnRDaGF0TWFuYWdlci9mYWN0b3J5LmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL3J0Yy9zaWduYWxlci9mYWN0b3J5LmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvZnJvbnRlbmQvZmFjdG9yaWVzL3N0cmVhbXMvZmFjdG9yeS5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL2Zyb250ZW5kL2ZhY3Rvcmllcy92aWRlb1Rvb2xzL2ZhY3RvcnkuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL2VtaXR0ZXIuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL2xvZy5qcyIsIi9ob21lL2JsYWtlL2RldmVsb3BtZW50L2luc3RhbnRDaGF0L3NpdGUvc3JjL3V0aWwvcnRjL2NoYW5uZWwuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL3J0Yy9wZWVyLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvdXRpbC9ydGMvcnRjLmpzIiwiL2hvbWUvYmxha2UvZGV2ZWxvcG1lbnQvaW5zdGFudENoYXQvc2l0ZS9zcmMvdXRpbC9ydGMvc2lnbmFsZXIuanMiLCIvaG9tZS9ibGFrZS9kZXZlbG9wbWVudC9pbnN0YW50Q2hhdC9zaXRlL3NyYy91dGlsL3J0Yy9zdHJlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFBSSxDQUFKLEVBQUksQ0FBQSxPQUFPLEVBQUcsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFakMsQ0FBQSxLQUFNLFFBQVEsRUFBRyxDQUFBLE9BQU8sT0FBTyxDQUFDLGFBQWEsQ0FBRSxFQUFDLFdBQVcsQ0FBRSxVQUFTLENBQUUsYUFBWSxDQUFFLGlCQUFnQixDQUFFLHFCQUFvQixDQUFDLENBQUMsVUFFbEgsQ0FBQyxhQUFhLENBQUksQ0FBQSxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxVQUVoRSxDQUFDLFVBQVUsQ0FBTyxDQUFBLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLFVBRTdELENBQUMsVUFBVSxDQUFPLENBQUEsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsVUFFN0QsQ0FBQyxhQUFhLENBQUksQ0FBQSxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxVQUVoRSxDQUFDLFVBQVUsQ0FBTyxDQUFBLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDLFVBRTdELENBQUMsVUFBVSxDQUFPLENBQUEsT0FBTyxDQUFDLGlDQUFpQyxDQUFDLENBQUMsVUFDN0QsQ0FBQyxR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QUksQ0FBRSxXQUFVLEVBQUssTUFBSztXQUFHO0tBQ3ZFO0NBRUQsV0FBUyxRQUFPLENBQUMsRUFBRSxDQUFFO0FBQ2YsQ0FBSixRQUFJLENBQUEsSUFBSSxFQUFHLENBQUEsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBRXJCLFNBQUksSUFBSTtDQUFFLGFBQU8sS0FBSSxDQUFDO0FBRXRCLENBRnNCLFVBRWhCLGtDQUFpQyxDQUFDO0tBQ3pDO0FBRUQsQ0FGQyxXQUVRLFlBQVcsQ0FBQyxFQUFFLENBQUU7Q0FDdkIsV0FBTyxDQUFBLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBSSxLQUFJLENBQUM7S0FDMUI7QUFFRCxDQUZDLFNBRU0sU0FBUSxDQUFDO0tBQ2hCO0VBQ0gsQ0FBQztDQUFBOzs7QUN4SEY7O1lBQUEsU0FBTSxPQUFNLENBQ0UsSUFBSSxDQUFFLENBQUEsTUFBTSxDQUFFLENBQUEsZUFBZSxDQUFFO0FBQ3pDLENBQUEsS0FBSSxNQUFNLEVBQUcsS0FBSSxDQUFDO0FBQ2xCLENBQUEsS0FBSSxRQUFRLEVBQUcsT0FBTSxDQUFDO0FBQ3RCLENBQUEsS0FBSSxJQUFJLEVBQUcsQ0FBQSxNQUFNLEdBQUcsQ0FBQztDQUd0Qjs7Q0FFRCxJQUFJLE9BQU0sRUFBRztDQUFFLFNBQU8sQ0FBQSxJQUFJLFFBQVEsQ0FBQztHQUFFO0NBQ3JDLElBQUksR0FBRSxFQUFHO0NBQUUsU0FBTyxDQUFBLElBQUksSUFBSSxDQUFDO0dBQUU7Q0FDN0IsSUFBSSxLQUFJLEVBQUc7Q0FBRSxTQUFPLENBQUEsSUFBSSxNQUFNLENBQUM7R0FBRTtDQUFBOzs7Ozs7OztDQW9CbkIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFuZ3VsYXIgPSByZXF1aXJlKCdhbmd1bGFyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2luc3RhbnRDaGF0JywgWyduZ0FuaW1hdGUnLCAnbmdSb3V0ZScsICduZ1Jlc291cmNlJywgJ25nRXZlbnRFbWl0dGVyJywgJ0xvY2FsU3RvcmFnZU1vZHVsZSddKVxuXG4gIC5kaXJlY3RpdmUoJ2luc3RhbnRDaGF0JywgICByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvaW5zdGFudENoYXQvZGlyZWN0aXZlJykpXG5cbiAgLmRpcmVjdGl2ZSgnY2hhdE1lbnUnLCAgICAgIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9jaGF0TWVudS9kaXJlY3RpdmUnKSlcblxuICAuZGlyZWN0aXZlKCdmZWVkYmFjaycsICAgICAgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL2ZlZWRiYWNrL2RpcmVjdGl2ZScpKVxuXG4gIC5kaXJlY3RpdmUoJ3BhcnRpY2lwYW50JywgICByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvcGFydGljaXBhbnQvZGlyZWN0aXZlJykpXG5cbiAgLmRpcmVjdGl2ZSgncm9vbUxpc3QnLCAgICAgIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy9yb29tTGlzdC9kaXJlY3RpdmUnKSlcblxuICAuZGlyZWN0aXZlKCdzZXR0aW5ncycsICAgICAgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL3NldHRpbmdzL2RpcmVjdGl2ZScpKVxuICAuZGlyZWN0aXZlKCdzdHJlYW0nLCAgICAgICAgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL3N0cmVhbS9kaXJlY3RpdmUnKSlcblxuICAuZGlyZWN0aXZlKCd0ZWFzZXInLCAgICAgICAgcmVxdWlyZSgnLi9kaXJlY3RpdmVzL3RlYXNlci9kaXJlY3RpdmUnKSlcblxuICAuZGlyZWN0aXZlKCdjb250ZW50ZWRpdGFibGUnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvdXRpbC9jb250ZW50ZWRpdGFibGUvZGlyZWN0aXZlJykpXG4gIC5kaXJlY3RpdmUoJ2ZpdFRleHQnLCAgICAgICAgIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy91dGlsL2ZpdFRleHQvZGlyZWN0aXZlJykpXG4gIC5kaXJlY3RpdmUoJ2ZvY3VzT24nLCAgICAgICAgIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy91dGlsL2ZvY3VzT24vZGlyZWN0aXZlJykpXG4gIC5kaXJlY3RpdmUoJ25nU2NvcGVFbGVtZW50JywgIHJlcXVpcmUoJy4vZGlyZWN0aXZlcy91dGlsL25nU2NvcGVFbGVtZW50L2RpcmVjdGl2ZScpKVxuICAuZGlyZWN0aXZlKCdyb3RhdG9yJywgICAgICAgICByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvdXRpbC9yb3RhdG9yL2RpcmVjdGl2ZScpKVxuICAuZGlyZWN0aXZlKCdzZWxlY3RPbkNsaWNrJywgICByZXF1aXJlKCcuL2RpcmVjdGl2ZXMvdXRpbC9zZWxlY3RPbkNsaWNrL2RpcmVjdGl2ZScpKVxuXG4gIC5mYWN0b3J5KCdjb25maWcnLCAgICAgICAgICByZXF1aXJlKCcuL2ZhY3Rvcmllcy9jb25maWcvZmFjdG9yeScpKVxuXG4gIC5mYWN0b3J5KCdlbWl0dGVyJywgICAgICAgICByZXF1aXJlKCcuL2ZhY3Rvcmllcy9lbWl0dGVyL2ZhY3RvcnknKSlcblxuICAuZmFjdG9yeSgnbG9jYWxNZWRpYScsICAgICAgcmVxdWlyZSgnLi9mYWN0b3JpZXMvbG9jYWxNZWRpYS9mYWN0b3J5JykpXG5cbiAgLmZhY3RvcnkoJ2luc3RhbnRDaGF0JywgICAgIHJlcXVpcmUoJy4vZmFjdG9yaWVzL2luc3RhbnRDaGF0L2ZhY3RvcnknKSlcblxuICAuZmFjdG9yeSgncnRjJywgICAgICAgICAgICAgcmVxdWlyZSgnLi9mYWN0b3JpZXMvcnRjL2ZhY3RvcnknKSlcbiAgLmZhY3RvcnkoJ3NpZ25hbGVyJywgICAgICAgIHJlcXVpcmUoJy4vZmFjdG9yaWVzL3J0Yy9zaWduYWxlci9mYWN0b3J5JykpXG5cbiAgLmZhY3RvcnkoJ3N0cmVhbXMnLCAgICAgICAgIHJlcXVpcmUoJy4vZmFjdG9yaWVzL3N0cmVhbXMvZmFjdG9yeScpKVxuXG4gIC5mYWN0b3J5KCdjaGF0UmVjZWl2ZUhhbmRsZXJzJywgICAgICAgICAgIHJlcXVpcmUoJy4vZmFjdG9yaWVzL3J0Yy9jaGF0UmVjZWl2ZUhhbmRsZXJzL2ZhY3RvcnknKSlcbiAgLmZhY3RvcnkoJ2NoYXRTZXJ2ZUhhbmRsZXJzJywgICAgICAgICAgICAgcmVxdWlyZSgnLi9mYWN0b3JpZXMvcnRjL2NoYXRTZXJ2ZUhhbmRsZXJzL2ZhY3RvcnknKSlcbiAgLmZhY3RvcnkoJ2luc3RhbnRDaGF0Q2hhbm5lbEhhbmRsZXInLCAgICAgcmVxdWlyZSgnLi9mYWN0b3JpZXMvcnRjL2luc3RhbnRDaGF0Q2hhbm5lbEhhbmRsZXIvZmFjdG9yeScpKVxuICAuZmFjdG9yeSgnaW5zdGFudENoYXRNYW5hZ2VyJywgICAgICAgICAgICByZXF1aXJlKCcuL2ZhY3Rvcmllcy9ydGMvaW5zdGFudENoYXRNYW5hZ2VyL2ZhY3RvcnknKSlcblxuICAuZmFjdG9yeSgnbG9nJywgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2ZhY3Rvcmllcy9sb2cvZmFjdG9yeScpKVxuXG4gIC5mYWN0b3J5KCdwYXJ0aWNpcGFudHMnLCAgICAgICAgICAgICAgICAgIHJlcXVpcmUoJy4vZmFjdG9yaWVzL3BhcnRpY2lwYW50cy9mYWN0b3J5JykpXG5cbiAgLmZhY3RvcnkoJ3ZpZGVvVG9vbHMnLCAgICAgICAgICAgIHJlcXVpcmUoJy4vZmFjdG9yaWVzL3ZpZGVvVG9vbHMvZmFjdG9yeScpKVxuXG4gIC5jb25maWcoWyckcm91dGVQcm92aWRlcicsICckY29tcGlsZVByb3ZpZGVyJywgKCRyb3V0ZVByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSA9PiB7XG4gICAgJHJvdXRlUHJvdmlkZXJcbiAgICAgIC53aGVuKCcvOmlkJywge1xuICAgICAgICB0ZW1wbGF0ZTogJzxpbnN0YW50LWNoYXQ+PC9pbnN0YW50LWNoYXQ+J1xuICAgICAgfSlcbiAgICAgIC5vdGhlcndpc2Uoe1xuICAgICAgICB0ZW1wbGF0ZTogJzx0ZWFzZXI+PC90ZWFzZXI+J1xuICAgICAgfSk7XG4gICAgJGNvbXBpbGVQcm92aWRlci5hSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fG1haWx0b3xzbXMpOi8pO1xuICB9XSlcbjsiLCJ2YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlLmh0bWwnKSxcbiAgICBjb250cm9sbGVyOiBbJyRyb290U2NvcGUnLCAnJHNjb3BlJywgJ2luc3RhbnRDaGF0JyxcbiAgICAoJHJvb3RTY29wZSwgJHNjb3BlLCBpbnN0YW50Q2hhdCkgPT4ge1xuICAgICAgJHNjb3BlLmhhdmVQZXJtaXNzaW9uRm9yRnJvbnRQYWdlID0gdHJ1ZTtcblxuICAgICAgJHJvb3RTY29wZS50ZXN0ID0gKCkgPT4gY29uc29sZS5sb2coJ3dvcmtlZCcpO1xuXG4gICAgICBfLmV4dGVuZCgkc2NvcGUsIHtcbiAgICAgICAgZW1haWxTdWJqZWN0OiAnSSB3YW50IHRvIGNoYXQgd2l0aCB5b3UhJyxcbiAgICAgICAgZW1haWxCb2R5KCkgeyByZXR1cm4gJ0NvbWUgam9pbiBtZSBhdCAnICsgZW5jb2RlVVJJQ29tcG9uZW50KHdpbmRvdy5sb2NhdGlvbi50b1N0cmluZygpKTsgfSxcbiAgICAgICAgc21zQm9keSgpIHsgcmV0dXJuICdDb21lIGpvaW4gbWUgYXQgJyArIGVuY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24udG9TdHJpbmcoKSk7IH0sXG4gICAgICAgIGludml0ZUxpbmsoKSB7IHJldHVybiBlbmNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnRvU3RyaW5nKCkpOyB9LFxuICAgICAgICBpbnZpdGVUZXh0OiAnSVxcJ20gY3VycmVudGx5IHZpZGVvIGNoYXR0aW5nLiBDb21lIGpvaW4gbWUhJyxcblxuXG4gICAgICAgIGlzTW91c2VJbnNpZGU6IHRydWUsXG4gICAgICAgIG1haW5WaXNpYmxlOiB0cnVlLFxuICAgICAgICBzZXR0aW5nc1Zpc2libGU6IGZhbHNlLFxuICAgICAgICBmZWVkYmFja1Zpc2libGU6IGZhbHNlLFxuICAgICAgICByb29tc1Zpc2libGU6IGZhbHNlLFxuXG4gICAgICAgIG1vdXNlRW50ZXJFeHBhbmRlZFZpZXcoKSB7XG4gICAgICAgICAgJHNjb3BlLmlzTW91c2VJbnNpZGUgPSB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBtb3VzZUxlZnRFeHBhbmRlZFZpZXcoKSB7XG4gICAgICAgICAgJHNjb3BlLmlzTW91c2VJbnNpZGUgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoISRzY29wZS5tZW51SXNDb2xsYXBzZWQpIGRlYm91bmNlZENvbGxhcHNlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29sbGFwc2UoKSB7XG4gICAgICAgICAgJHNjb3BlLmNvbGxhcHNlTWVudSgpO1xuICAgICAgICAgICRzY29wZS5tYWluVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLnNldHRpbmdzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5mZWVkYmFja1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUucm9vbXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHJpZ2dlclNldHRpbmdzKCkge1xuICAgICAgICAgICRzY29wZS5yb29tc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuZmVlZGJhY2tWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLnNldHRpbmdzVmlzaWJsZSA9ICEkc2NvcGUuc2V0dGluZ3NWaXNpYmxlO1xuICAgICAgICAgICRzY29wZS5tYWluVmlzaWJsZSA9ICEkc2NvcGUuc2V0dGluZ3NWaXNpYmxlO1xuICAgICAgICB9LFxuICAgICAgICB0cmlnZ2VyRmVlZGJhY2soKSB7XG4gICAgICAgICAgJHNjb3BlLm1haW5WaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLnNldHRpbmdzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5yb29tc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuZmVlZGJhY2tWaXNpYmxlID0gISRzY29wZS5mZWVkYmFja1Zpc2libGU7XG4gICAgICAgICAgJHNjb3BlLm1haW5WaXNpYmxlID0gISRzY29wZS5mZWVkYmFja1Zpc2libGU7XG4gICAgICAgIH0sXG4gICAgICAgIHRyaWdnZXJSb29tcygpIHtcbiAgICAgICAgICAkc2NvcGUuc2V0dGluZ3NWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLmZlZWRiYWNrVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5yb29tc1Zpc2libGUgPSAhJHNjb3BlLnJvb21zVmlzaWJsZTtcbiAgICAgICAgICAkc2NvcGUubWFpblZpc2libGUgPSAhJHNjb3BlLnJvb21zVmlzaWJsZTtcbiAgICAgICAgfSxcblxuICAgICAgICBwYXJ0aWNpcGFudE5hbWVCbHVyKCkge1xuICAgICAgICB9LFxuXG4gICAgICAgIGJyb2FkY2FzdCgpIHtcbiAgICAgICAgICBpbnN0YW50Q2hhdC5icm9hZGNhc3QoJHNjb3BlLmN1cnJlbnRSb29tLm5hbWUpLnRoZW4ocGVlciA9PiBjb25zb2xlLmxvZygnZ290IGJyb2FkY2FzdGVyJywgcGVlciksIGVycm9yID0+IGNvbnNvbGUubG9nKCdicm9hZGNhc3QgZXJyb3IhJywgZXJyb3IpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBkZWJvdW5jZWRDb2xsYXBzZSA9IF8uZGVib3VuY2UoKCkgPT4ge1xuICAgICAgICBpZiAoISRzY29wZS5pc01vdXNlSW5zaWRlICYmICEkc2NvcGUubWVudUlzQ29sbGFwc2VkKSB7XG4gICAgICAgICAgJHNjb3BlLmNvbGxhcHNlKCk7XG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9XG4gICAgICB9LCAxMjUwKTtcblxuICAgICAgJHJvb3RTY29wZS4kb24oJ3RodW1ibmFpbCcsICgkZXZlbnQsIHBhcnRpY2lwYW50LCBzdHJlYW0sIGRhdGFVcmwpID0+IHtcbiAgICAgICAgcGFydGljaXBhbnQudGh1bWJuYWlsU3JjID0gZGF0YVVybDtcbiAgICAgIH0pO1xuXG4gICAgICBkZWJvdW5jZWRDb2xsYXBzZSgpO1xuICAgIH1dXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gJ1xcbiAgPGRpdiBuZy1jbGFzcz1cIntcXCdtZW51LWNvbnRhaW5lclxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICBcXCdzZXR0aW5ncy12aXNpYmxlXFwnOiBzZXR0aW5nc1Zpc2libGUsXFxuICAgICAgICAgICAgICAgICAgXFwnZmVlZGJhY2stdmlzaWJsZVxcJzogZmVlZGJhY2tWaXNpYmxlLFxcbiAgICAgICAgICAgICAgICAgIFxcJ3Jvb21zLXZpc2libGVcXCc6IHJvb21zVmlzaWJsZX1cIlxcbiAgICAgICBuZy1tb3VzZWVudGVyPVwibW91c2VFbnRlckV4cGFuZGVkVmlldygpXCJcXG4gICAgICAgbmctbW91c2VsZWF2ZT1cIm1vdXNlTGVmdEV4cGFuZGVkVmlldygpXCI+XFxuXFxuICAgIDxkaXYgY2xhc3M9XCJvdmVybGF5XCI+PC9kaXY+XFxuXFxuICAgIDxkaXYgY2xhc3M9XCJtZW51LWNvbnRlbnRcIj5cXG4gICAgICA8c3BhbiBjbGFzcz1cImZhIGZhLXJlcGx5IGV4aXRcIiBuZy1jbGljaz1cImNvbGxhcHNlKClcIj48L3NwYW4+XFxuICAgICAgPGRpdiBjbGFzcz1cImhlYWRlclwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cImJhZGdlXCI+XFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJyb29tLW5hbWVcIj4je3tjdXJyZW50Um9vbS5uYW1lfX08L2Rpdj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XCJib2R5XCI+XFxuICAgICAgICA8ZGl2IG5nLWlmPVwibWFpblZpc2libGVcIiBjbGFzcz1cIm1haW4gcGFuZWxcIj5cXG4gICAgICAgICAgPGRpdiBjbGFzcz1cIm1lbnUtaXRlbXNcIj5cXG4gICAgICAgICAgICA8dWw+XFxuICAgICAgICAgICAgICA8bGk+XFxuICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJtYWlsdG86P3N1YmplY3Q9e3tlbWFpbFN1YmplY3R9fSZib2R5PXt7ZW1haWxCb2R5KCl9fVwiXFxuICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiPjxzcGFuIGNsYXNzPVwiZmEgZmEtZW52ZWxvcGVcIj48L3NwYW4+PC9hPlxcbiAgICAgICAgICAgICAgPC9saT5cXG5cXG4gICAgICAgICAgICAgIDxsaT5cXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cInNtczo/Ym9keT17e3Ntc0JvZHkoKX19XCJcXG4gICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCI+PHNwYW4gY2xhc3M9XCJmYSBmYS1tb2JpbGVcIj48L3NwYW4+PC9hPlxcbiAgICAgICAgICAgICAgPC9saT5cXG5cXG4gICAgICAgICAgICAgIDxsaT5cXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vc2hhcmU/dXJsPXt7aW52aXRlTGluaygpfX0mdGV4dD17e2ludml0ZVRleHR9fVwiIHRhcmdldD1cIl9ibGFua1wiPjxzcGFuIGNsYXNzPVwiZmEgZmEtdHdpdHRlclwiPjwvc3Bhbj48L2E+XFxuICAgICAgICAgICAgICA8L2xpPlxcblxcbiAgICAgICAgICAgICAgPGxpPlxcbiAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly9mYWNlYm9vay5jb20vZGlhbG9nL2ZlZWQ/YXBwX2lkPTE0NDM0MTIyNTkyNTk2MjMmZGlzcGxheT1wb3B1cCZsaW5rPXt7aW52aXRlTGluaygpfX0mcmVkaXJlY3RfdXJpPXt7aW52aXRlTGluaygpfX0mY2FwdGlvbj17e2ludml0ZVRleHR9fVwiIHRhcmdldD1cIl9ibGFua1wiPjxzcGFuIGNsYXNzPVwiZmEgZmEtZmFjZWJvb2tcIj48L3NwYW4+PC9hPlxcbiAgICAgICAgICAgICAgPC9saT5cXG5cXG4gICAgICAgICAgICAgIDxsaT5cXG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vcGx1cy5nb29nbGUuY29tL3NoYXJlP3VybD17e2ludml0ZUxpbmsoKX19XCIgdGFyZ2V0PVwiX2JsYW5rXCI+PHNwYW4gY2xhc3M9XCJmYSBmYS1nb29nbGUtcGx1c1wiPjwvc3Bhbj48L2E+XFxuICAgICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgICAgIDwvdWw+XFxuXFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJpbnZpdGVcIj5JbnZpdGUgU29tZW9uZTwvc3Bhbj5cXG4gICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgIDxidXR0b24gbmctY2xpY2s9XCJicm9hZGNhc3QoKVwiPkJST0FEQ0FTVDwvYnV0dG9uPlxcblxcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwicGFydGljaXBhbnRzLWxpc3RcIj5cXG4gICAgICAgICAgICA8bmctcGx1cmFsaXplXFxuICAgICAgICAgICAgICAgIGNsYXNzPVwicGFydGljaXBhbnRzLWNvdW50XCJcXG4gICAgICAgICAgICAgICAgY291bnQ9XCJhY3RpdmVQYXJ0aWNpcGFudHMubGVuZ3RoXCJcXG4gICAgICAgICAgICAgICAgd2hlbj1cIntcXCcwXFwnOiBcXCdOb2JvZHkgaXMgaGVyZSAobm90IGV2ZW4geW91ISlcXCcsXFxuICAgICAgICAgICAgICAgICAgICAgICBcXCcxXFwnOiBcXCcxIFBlcnNvbiBIZXJlXFwnLFxcbiAgICAgICAgICAgICAgICAgICAgICAgXFwnb3RoZXJcXCc6IFxcJ3t9IFBlb3BsZSBIZXJlXFwnfVwiPjwvbmctcGx1cmFsaXplPlxcblxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwYXJ0aWNpcGFudFwiIG5nLXJlcGVhdD1cInBhcnRpY2lwYW50IGluIHBhcnRpY2lwYW50c1wiPlxcbiAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInRodW1ibmFpbFwiIG5nLXNyYz1cInt7cGFydGljaXBhbnQudGh1bWJuYWlsU3JjfX1cIj5cXG4gICAgICAgICAgICAgIDwhLS0gPHZpZGVvIG5nLWlmPVwicGFydGljaXBhbnQuc3RyZWFtcy5sZW5ndGggPiAwXCIgbmctc3JjPVwie3twYXJ0aWNpcGFudC5zdHJlYW1zWzBdLnNyY319XCIgYXV0b3BsYXk+PC92aWRlbz4gLS0+XFxuXFxuICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwicGFydGljaXBhbnQuaXNMb2NhbFwiIGNsYXNzPVwibG9jYWwtcGFydGljaXBhbnRcIj5cXG4gICAgICAgICAgICAgICAgPGRpdiBjb250ZW50ZWRpdGFibGVcXG4gICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIldoYXRcXCdzIFlvdXIgTmFtZT9cIlxcbiAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwibmFtZS1pbnB1dFwiXFxuICAgICAgICAgICAgICAgICAgICAgZml0LXRleHRcXG4gICAgICAgICAgICAgICAgICAgICBmb2N1cy1vbj1cIiFpc0NvbGxhcHNlZCAmJiAocGFydGljaXBhbnQuY29uZmlnLm5hbWUgPT0gbnVsbCB8fCBwYXJ0aWNpcGFudC5jb25maWcubmFtZSA9PSB1bmRlZmluZWQgfHwgcGFydGljaXBhbnQuY29uZmlnLm5hbWUgPT0gXFwnXFwnKVwiXFxuICAgICAgICAgICAgICAgICAgICAgbmctbW9kZWw9XCJwYXJ0aWNpcGFudC5jb25maWcubmFtZVwiXFxuICAgICAgICAgICAgICAgICAgICA+PC9kaXY+XFxuXFxuICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzcz1cInBlcm1pc3Npb25cIj5cXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgbmctbW9kZWw9XCJoYXZlUGVybWlzc2lvbkZvckZyb250UGFnZVwiPiA8c3Bhbj5Vc2UgTXkgSW1hZ2UgT24gVGhlIDxhIGhyZWY9XCJodHRwczovL2luc3RhY2hhdC5pb1wiIGNsYXNzPVwiZnJvbnQtcGFnZVwiIHRhcmdldD1cIl9ibGFua1wiPkZyb250IFBhZ2U8L2E+PC9zcGFuPlxcbiAgICAgICAgICAgICAgICA8L2xhYmVsPlxcbiAgICAgICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICAgICAgICA8ZGl2IG5nLWlmPVwiIXBhcnRpY2lwYW50LmlzTG9jYWxcIiBjbGFzcz1cInJlbW90ZS1wYXJ0aWNpcGFudFwiPlxcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm5hbWVcIj57e3BhcnRpY2lwYW50LmNvbmZpZy5uYW1lfX08L3NwYW4+XFxuICAgICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgICAgPC9kaXY+XFxuXFxuICAgICAgICA8L2Rpdj5cXG5cXG4gICAgICAgIDxzZXR0aW5ncyBuZy1pZj1cInNldHRpbmdzVmlzaWJsZVwiIGNsYXNzPVwicGFuZWxcIj48L3NldHRpbmdzPlxcblxcbiAgICAgICAgPGZlZWRiYWNrIG5nLWlmPVwiZmVlZGJhY2tWaXNpYmxlXCIgY2xhc3M9XCJwYW5lbFwiPjwvZmVlZGJhY2s+XFxuXFxuICAgICAgICA8cm9vbS1saXN0IG5nLWlmPVwicm9vbXNWaXNpYmxlXCIgY2xhc3M9XCJwYW5lbFwiPjwvcm9vbS1saXN0PlxcblxcbiAgICAgIDwvZGl2PlxcblxcbiAgICAgIDxkaXYgY2xhc3M9XCJmb290ZXJcIj5cXG4gICAgICAgIDxkaXYgbmctY2xhc3M9XCJ7XFwndHJpZ2dlclxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICAgICAgICBcXCdzZXR0aW5ncy10cmlnZ2VyXFwnOiB0cnVlLFxcbiAgICAgICAgICAgICAgICAgICAgICAgIFxcJ3NldHRpbmdzLXZpc2libGVcXCc6IHNldHRpbmdzVmlzaWJsZX1cIiBuZy1jbGljaz1cInRyaWdnZXJTZXR0aW5ncygpXCI+XFxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZmEgZmEtY29nXCI+PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8ZGl2IG5nLWNsYXNzPVwie1xcJ3RyaWdnZXJcXCc6IHRydWUsXFxuICAgICAgICAgICAgICAgICAgICAgICAgXFwnZmVlZGJhY2stdHJpZ2dlclxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICAgICAgICBcXCdmZWVkYmFjay12aXNpYmxlXFwnOiBmZWVkYmFja1Zpc2libGV9XCIgbmctY2xpY2s9XCJ0cmlnZ2VyRmVlZGJhY2soKVwiPlxcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImZhIGZhLWNvbW1lbnRzXCI+PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8ZGl2IG5nLWNsYXNzPVwie1xcJ3RyaWdnZXJcXCc6IHRydWUsXFxuICAgICAgICAgICAgICAgICAgICAgICAgXFwncm9vbXMtdHJpZ2dlclxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICAgICAgICBcXCdyb29tcy12aXNpYmxlXFwnOiByb29tc1Zpc2libGV9XCIgbmctY2xpY2s9XCJ0cmlnZ2VyUm9vbXMoKVwiPlxcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImZhIGZhLWdsb2JlXCI+PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgPC9kaXY+XFxuXFxuICAgIDwvZGl2PlxcbiAgPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlLmh0bWwnKSxcbiAgICBzY29wZTogdHJ1ZSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckcmVzb3VyY2UnLCAoJHNjb3BlLCAkcmVzb3VyY2UpID0+IHtcbiAgICAgIHZhciBTdWdnZXN0aW9ucyA9ICRyZXNvdXJjZSgnL3N1Z2dlc3Rpb25zLzppZCcsIHtpZDogJ0BpZCd9KTtcblxuICAgICAgJHNjb3BlLnN1Ym1pdFN1Z2dlc3Rpb24gPSAoKSA9PiB7XG4gICAgICAgIFN1Z2dlc3Rpb25zLnNhdmUoe1xuICAgICAgICAgIHRleHQ6ICRzY29wZS5uZXdTdWdnZXN0aW9uLFxuICAgICAgICAgIGltYWdlOiBudWxsIC8vIGluY2x1ZGUgdXNlcidzIHBpY3R1cmVcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICRzY29wZS5uZXdTdWdnZXN0aW9uID0gJyc7XG4gICAgICAgICAgZ2V0U3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudm90ZURvd24gPSBzdWdnZXN0aW9uID0+IHtcbiAgICAgICAgU3VnZ2VzdGlvbnMuc2F2ZSh7XG4gICAgICAgICAgaWQ6IHN1Z2dlc3Rpb24uaWQsXG4gICAgICAgICAgdm90ZTogJ2Rvd24nXG4gICAgICAgIH0sIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICBfLmV4dGVuZChzdWdnZXN0aW9uLCByZXNwb25zZS5zdWdnZXN0aW9uKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudm90ZVVwID0gc3VnZ2VzdGlvbiA9PiB7XG4gICAgICAgIFN1Z2dlc3Rpb25zLnNhdmUoe1xuICAgICAgICAgIGlkOiBzdWdnZXN0aW9uLmlkLFxuICAgICAgICAgIHZvdGU6ICd1cCdcbiAgICAgICAgfSwgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgIF8uZXh0ZW5kKHN1Z2dlc3Rpb24sIHJlc3BvbnNlLnN1Z2dlc3Rpb24pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIGdldFN1Z2dlc3Rpb25zKCkge1xuICAgICAgICBTdWdnZXN0aW9ucy5nZXQobnVsbCwgc3VnZ2VzdGlvbnMgPT4ge1xuICAgICAgICAgICRzY29wZS5zdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zLnN1Z2dlc3Rpb25zO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZ2V0U3VnZ2VzdGlvbnMoKTtcbiAgICB9XVxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8Zm9ybSBjbGFzcz1cInN1Z2dlc3Rpb25zXCI+XFxuICA8b2wgY2xhc3M9XCJzdWdnZXN0aW9uLWxpc3RcIj5cXG4gICAgPGxpIG5nLXJlcGVhdD1cInN1Z2dlc3Rpb24gaW4gc3VnZ2VzdGlvbnNcIiBjbGFzcz1cInN1Z2dlc3Rpb25cIj5cXG4gICAgICA8c3BhbiBjbGFzcz1cInZvdGUgdm90ZS1kb3duXCI+PHNwYW4gY2xhc3M9XCJmYSBmYS10aHVtYnMtZG93blwiIG5nLWNsaWNrPVwidm90ZURvd24oc3VnZ2VzdGlvbilcIj48L3NwYW4+IHt7c3VnZ2VzdGlvbi5kb3duX2NvdW50fX08L3NwYW4+XFxuICAgICAge3tzdWdnZXN0aW9uLnRleHR9fVxcbiAgICAgIDxzcGFuIGNsYXNzPVwidm90ZSB2b3RlLXVwXCI+e3tzdWdnZXN0aW9uLnVwX2NvdW50fX0gPHNwYW4gY2xhc3M9XCJmYSBmYS10aHVtYnMtdXBcIiBuZy1jbGljaz1cInZvdGVVcChzdWdnZXN0aW9uKVwiPjwvc3Bhbj48L3NwYW4+XFxuICAgIDwvbGk+XFxuICA8L29sPlxcbiAgPGRpdiBjbGFzcz1cImlucHV0XCI+XFxuICAgIDx0ZXh0YXJlYSBuZy1tb2RlbD1cIm5ld1N1Z2dlc3Rpb25cIiBwbGFjZWhvbGRlcj1cIkFkZCBZb3VyIFN1Z2dlc3Rpb25cIj48L3RleHRhcmVhPlxcbiAgICA8YnV0dG9uIG5nLWNsaWNrPVwic3VibWl0U3VnZ2VzdGlvbigpXCI+U3VibWl0PC9idXR0b24+XFxuICA8L2Rpdj5cXG48L2Zvcm0+JzsiLCJpbXBvcnQge0luc3RhbnRDaGF0Q2hhbm5lbEhhbmRsZXJ9IGZyb20gJy4uLy4uL2ZhY3Rvcmllcy9ydGMvaW5zdGFudENoYXRDaGFubmVsSGFuZGxlci9mYWN0b3J5JztcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZS5odG1sJyksXG4gICAgbGluazogKCRzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykgPT4ge1xuICAgICAgJHNjb3BlLnZpZGVvTG9hZGVkID0gZXZlbnQgPT4gbG9nKGV2ZW50KTtcblxuICAgICAgJHNjb3BlLnRvZ2dsZUZ1bGxzY3JlZW4gPSAoKSA9PiB7XG4gICAgICAgIGlmIChpc0Z1bGxzY3JlZW4oKSkgZXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgZWxzZSBlbnRlckZ1bGxzY3JlZW4oKTtcbiAgICAgIH07XG5cbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2Z1bGxzY3JlZW5jaGFuZ2UnLCB1cGRhdGVGdWxsc2NyZWVuTWVzc2FnZSk7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd3ZWJraXRmdWxsc2NyZWVuY2hhbmdlJywgdXBkYXRlRnVsbHNjcmVlbk1lc3NhZ2UpO1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW96ZnVsbHNjcmVlbmNoYW5nZScsIHVwZGF0ZUZ1bGxzY3JlZW5NZXNzYWdlKTtcblxuICAgICAgZnVuY3Rpb24gdXBkYXRlRnVsbHNjcmVlbk1lc3NhZ2UoKSB7XG4gICAgICAgICRzY29wZS5mdWxsc2NyZWVuTWVzc2FnZSA9IGlzRnVsbHNjcmVlbigpID8gJ0V4aXQgRnVsbHNjcmVlbicgOiAnR28gRnVsbHNjcmVlbic7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGlzRnVsbHNjcmVlbigpIHtcbiAgICAgICAgcmV0dXJuICEhZG9jdW1lbnQuZnVsbHNjcmVlbkVsZW1lbnQgfHwgISFkb2N1bWVudC5tb3pGdWxsU2NyZWVuRWxlbWVudCB8fCAhIWRvY3VtZW50LndlYmtpdEZ1bGxzY3JlZW5FbGVtZW50IHx8ICEhZG9jdW1lbnQubXNGdWxsc2NyZWVuRWxlbWVudDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZXhpdEZ1bGxzY3JlZW4oKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5leGl0RnVsbHNjcmVlbikgZG9jdW1lbnQuZXhpdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlbikgZG9jdW1lbnQubXNFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICBlbHNlIGlmIChkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuKSBkb2N1bWVudC5tb3pDYW5jZWxGdWxsU2NyZWVuKCk7XG4gICAgICAgIGVsc2UgaWYgKGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuKSBkb2N1bWVudC53ZWJraXRFeGl0RnVsbHNjcmVlbigpO1xuICAgICAgICB1cGRhdGVGdWxsc2NyZWVuTWVzc2FnZSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBlbnRlckZ1bGxzY3JlZW4oKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4pIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgICAgICBlbHNlIGlmIChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlbikgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1zUmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50Lm1velJlcXVlc3RGdWxsU2NyZWVuKSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubW96UmVxdWVzdEZ1bGxTY3JlZW4oKTtcbiAgICAgICAgZWxzZSBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsc2NyZWVuKSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQud2Via2l0UmVxdWVzdEZ1bGxzY3JlZW4oRWxlbWVudC5BTExPV19LRVlCT0FSRF9JTlBVVCk7XG4gICAgICAgIHVwZGF0ZUZ1bGxzY3JlZW5NZXNzYWdlKCk7XG4gICAgICB9XG5cbiAgICAgIHVwZGF0ZUZ1bGxzY3JlZW5NZXNzYWdlKCk7XG4gICAgfSxcbiAgICBjb250cm9sbGVyOlxuICAgICAgWyckcm9vdFNjb3BlJywgJyRzY29wZScsICckc2NlJywgJyRsb2NhdGlvbicsICckdGltZW91dCcsXG4gICAgICAgJyRpbnRlcnZhbCcsICckcmVzb3VyY2UnLCAnJHdpbmRvdycsICckJHJBRicsICdsb2cnLCAnaW5zdGFudENoYXQnLFxuICAgICAgICdsb2NhbE1lZGlhJywgJ2luc3RhbnRDaGF0Q2hhbm5lbEhhbmRsZXInLCAnaW5zdGFudENoYXRNYW5hZ2VyJyxcbiAgICAgICAnY29uZmlnJywgJ3BhcnRpY2lwYW50cycsXG4gICAgICAoJHJvb3RTY29wZSwgJHNjb3BlLCAkc2NlLCAkbG9jYXRpb24sICR0aW1lb3V0LFxuICAgICAgICAkaW50ZXJ2YWwsICRyZXNvdXJjZSwgJHdpbmRvdywgJCRyQUYsIGxvZywgaW5zdGFudENoYXQsXG4gICAgICAgIGxvY2FsTWVkaWEsIGluc3RhbnRDaGF0Q2hhbm5lbEhhbmRsZXIsIGluc3RhbnRDaGF0TWFuYWdlcixcbiAgICAgICAgY29uZmlnLCBwYXJ0aWNpcGFudHMpID0+IHtcblxuICAgICAgbG9nLmluZm8oJ0VudGVyaW5nIGluc3RhbnRDaGF0IGNvbnRyb2xsZXInKTtcblxuICAgICAgbG9jYWxNZWRpYS5nZXREZXZpY2VzKClcbiAgICAgICAgLnRoZW4oZGV2aWNlcyA9PiAkc2NvcGUuc291cmNlcyA9IGRldmljZXMpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBsb2cuZXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgc291cmNlcycsIGVycm9yKSk7XG5cbiAgICAgICR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHRvZ2dsZUJhcnMoKTtcbiAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS5tZW51SXNDb2xsYXBzZWQgPSBmYWxzZTtcbiAgICAgICRzY29wZS5oaWRlQmFycyA9IGZhbHNlO1xuXG4gICAgICAkc2NvcGUuc2hvd0NhbWVyYXMgPSAoKSA9PiAkc2NvcGUuY2FtZXJhc1Zpc2libGUgPSB0cnVlO1xuICAgICAgJHNjb3BlLmhpZGVDYW1lcmFzID0gKCkgPT4gJHNjb3BlLmNhbWVyYXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAkc2NvcGUudG9nZ2xlQ2FtZXJhcyA9ICgpID0+ICRzY29wZS5jYW1lcmFzVmlzaWJsZSA9ICEkc2NvcGUuY2FtZXJhc1Zpc2libGU7XG5cbiAgICAgICRzY29wZS5leHBhbmRNZW51ID0gKCkgPT4ge1xuICAgICAgICAkc2NvcGUubWVudUlzQ29sbGFwc2VkID0gZmFsc2U7XG4gICAgICAgIC8vdG9nZ2xlQmFycyh0cnVlKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jb2xsYXBzZU1lbnUgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5tZW51SXNDb2xsYXBzZWQgPSB0cnVlO1xuICAgICAgICB0b2dnbGVCYXJzKGZhbHNlKTtcbiAgICAgIH07XG5cbiAgICAgIGZ1bmN0aW9uIHRvZ2dsZUJhcnMoaGlkZSkge1xuICAgICAgICB2YXIgY2hhbmdlZCA9ICRzY29wZS5oaWRlQmFycyAhPSBoaWRlO1xuXG4gICAgICAgICRzY29wZS5oaWRlQmFycyA9IGhpZGUgIT0gbnVsbCA/IGhpZGUgPT09IHRydWUgOiAhJHNjb3BlLmhpZGVCYXJzO1xuXG4gICAgICAgICRzY29wZS5oaWRlQ2FtZXJhcygpO1xuXG4gICAgICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgICAgJHNjb3BlLnJlc2l6aW5nID0gJCRyQUYoYnJvYWRjYXN0UmVzaXplKTtcbiAgICAgICAgICAkdGltZW91dCgoKSA9PiAkc2NvcGUucmVzaXppbmcoKSwgMTAwMCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0UmVzaXplKCkge1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Jlc2l6ZScpO1xuICAgICAgICAkc2NvcGUucmVzaXppbmcgPSAkJHJBRihicm9hZGNhc3RSZXNpemUpO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGlzdGVuZXJzQ2xlYW51cCA9IFtdO1xuXG4gICAgICAvLyBVc2luZyBuZXN0ZWQgUHJvbWlzZXMgaGVyZSBiZWNhdXNlIHdlIG5lZWQgdGhlIHN0cmVhbVxuICAgICAgLy8gYWZ0ZXIgY29ubmVjdGluZyB0byB0aGUgc2lnbmFsLi4uc28gd2UgY2FwdHVyZSBpdCBpbiBhIGNsb3N1cmUgOilcbiAgICAgIGxvY2FsTWVkaWEuZ2V0U3RyZWFtKGNvbmZpZy5kZWZhdWx0U3RyZWFtKVxuICAgICAgICAudGhlbihzdHJlYW0gPT4ge1xuICAgICAgICAgIGlmICgkc2NvcGUuJCRkZXN0cm95ZWQpIHtcbiAgICAgICAgICAgIHN0cmVhbS5fX2RvbmVXaXRoU3RyZWFtKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5zdGFudENoYXRcbiAgICAgICAgICAgIC5jb25uZWN0KCdodHRwczovLycgKyAkbG9jYXRpb24uaG9zdCgpKVxuICAgICAgICAgICAgLnRoZW4oc2lnbmFsID0+IHtcbiAgICAgICAgICAgICAgaWYgKCRzY29wZS4kJGRlc3Ryb3llZCkge1xuICAgICAgICAgICAgICAgIHN0cmVhbS5fX2RvbmVXaXRoU3RyZWFtKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICRzY29wZS5zaWduYWwgPSBzaWduYWw7XG5cbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsUGFydGljaXBhbnQgPSBpbnN0YW50Q2hhdC5sb2NhbFBhcnRpY2lwYW50O1xuICAgICAgICAgICAgICAkc2NvcGUucGFydGljaXBhbnRzID0gaW5zdGFudENoYXQucGFydGljaXBhbnRzO1xuICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlUGFydGljaXBhbnRzID0gaW5zdGFudENoYXQuYWN0aXZlUGFydGljaXBhbnRzO1xuXG4gICAgICAgICAgICAgICRzY29wZS5jdXJyZW50Um9vbSA9IHtuYW1lOiBudWxsfTtcbiAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRSb29tcyA9IHNpZ25hbC5jdXJyZW50Um9vbXM7XG5cbiAgICAgICAgICAgICAgaWYgKCEkc2NvcGUubG9jYWxQYXJ0aWNpcGFudC5zdHJlYW1zLmNvbnRhaW5zKHN0cmVhbSkpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9jYWxQYXJ0aWNpcGFudC5zdHJlYW1zLmFkZChzdHJlYW0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgam9pblJvb20oKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZXJyb3IgPT4gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdlcnJvcicsICdDb3VsZCBub3QgYWNjZXNzIHNpZ25hbGxpbmcgc2VydmVyLiBQbGVhc2UgcmVmcmVzaCB0aGUgcGFnZSEnLCBlcnJvcikpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdlcnJvcicsICdDb3VsZCBub3QgYWNjZXNzIHlvdXIgY2FtZXJhLiBQbGVhc2UgcmVmcmVzaCB0aGUgcGFnZSEnLCBlcnJvcikpO1xuXG4gICAgICBsaXN0ZW5lcnNDbGVhbnVwLnB1c2goaW5zdGFudENoYXQub24oe1xuICAgICAgICAncGFydGljaXBhbnQgYWN0aXZlJzogICBwYXJ0aWNpcGFudCA9PiB7ICRzY29wZS4kYXBwbHkoKTsgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdwYXJ0aWNpcGFudCBhY3RpdmUnLCAgIHBhcnRpY2lwYW50KTsgfSxcbiAgICAgICAgJ3BhcnRpY2lwYW50IGluYWN0aXZlJzogcGFydGljaXBhbnQgPT4geyAkc2NvcGUuJGFwcGx5KCk7ICRyb290U2NvcGUuJGJyb2FkY2FzdCgncGFydGljaXBhbnQgaW5hY3RpdmUnLCBwYXJ0aWNpcGFudCk7IH0sXG4gICAgICAgICdzdHJlYW0gYWRkJzogICAgICAgICAgIHN0cmVhbSA9PiAgICAgIHsgJHNjb3BlLiRhcHBseSgpOyAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3N0cmVhbSBhZGQnLCAgICAgICAgICAgc3RyZWFtKTsgfSxcbiAgICAgICAgJ3N0cmVhbSByZW1vdmUnOiAgICAgICAgc3RyZWFtID0+ICAgICAgeyAkc2NvcGUuJGFwcGx5KCk7ICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc3RyZWFtIHJlbW92ZScsICAgICAgICBzdHJlYW0pOyB9XG4gICAgICB9KSk7XG5cbiAgICAgICRzY29wZS4kd2F0Y2hDb2xsZWN0aW9uKCdjb25maWcnLCBfLmRlYm91bmNlKGNvbmZpZyA9PiB7XG4gICAgICAgIGxvZyhjb25maWcpO1xuICAgICAgfSwgNTAwKSk7XG5cbiAgICAgICRzY29wZS5hZGRDYW1lcmEgPSBzb3VyY2UgPT4ge1xuICAgICAgICBsb2NhbE1lZGlhXG4gICAgICAgICAgLmdldFN0cmVhbSh7YXVkaW86IGZhbHNlLCB2aWRlbzoge29wdGlvbmFsOiBbe3NvdXJjZUlkOiBzb3VyY2UuaWR9XX19KVxuICAgICAgICAgIC50aGVuKFxuICAgICAgICAgICAgc3RyZWFtID0+IHtcbiAgICAgICAgICAgICAgJHNjb3BlLmxvY2FsUGFydGljaXBhbnQuc3RyZWFtcy5hZGQoc3RyZWFtKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvciA9PiBsb2cuZXJyb3IoZXJyb3IpKTtcbiAgICAgIH07XG5cbiAgICAgIC8vb25Sb290U2NvcGUoJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBqb2luUm9vbSk7XG5cbiAgICAgIG9uUm9vdFNjb3BlKCdlcnJvcicsICgkZXZlbnQsIG1lc3NhZ2UsIGVycm9yKSA9PiB7XG4gICAgICAgICRzY29wZS5lcnJvck1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICBsb2cuZXJyb3IoJ0dsb2JhbCBFcnJvcicsIG1lc3NhZ2UsIGVycm9yKTtcbiAgICAgICAgJHNjb3BlLiRhcHBseSgpOyAvLyBpcyB0aGlzIG5lY2Vzc2FyeT9cbiAgICAgIH0pO1xuXG4gICAgICBvblJvb3RTY29wZSgnc3RyZWFtIHZvdGUgdXAnLCAoJGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgIHZhciBmcm9tID0gZGF0YS5mcm9tLFxuICAgICAgICAgICAgdG8gPSBkYXRhLnRvLFxuICAgICAgICAgICAgc3RyZWFtID0gZGF0YS5zdHJlYW0sXG4gICAgICAgICAgICBzdGF0dXMgPSBkYXRhLnN0YXR1cztcblxuICAgICAgICBpZiAoc3RyZWFtLnZvdGVzLmxlbmd0aCA+IDMpIHN0cmVhbS52b3Rlcy5zaGlmdCgpO1xuICAgICAgICBzdHJlYW0udm90ZXMucHVzaCh7dm90ZTogJ3VwJywgc3RhdHVzOiBzdGF0dXMsIGZyb206IGZyb219KTtcbiAgICAgICAgJHRpbWVvdXQoKCkgPT4gc3RyZWFtLnZvdGVzLnNoaWZ0KCksIDQwMDApO1xuICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICB9KTtcblxuICAgICAgb25Sb290U2NvcGUoJ3N0cmVhbSB2b3RlIGRvd24nLCAoJGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgIHZhciBmcm9tID0gZGF0YS5mcm9tLFxuICAgICAgICAgICAgdG8gPSBkYXRhLnRvLFxuICAgICAgICAgICAgc3RyZWFtID0gZGF0YS5zdHJlYW0sXG4gICAgICAgICAgICBzdGF0dXMgPSBkYXRhLnN0YXR1cztcblxuICAgICAgICBpZiAoc3RyZWFtLnZvdGVzLmxlbmd0aCA+IDMpIHN0cmVhbS52b3Rlcy5zaGlmdCgpO1xuICAgICAgICBzdHJlYW0udm90ZXMucHVzaCh7dm90ZTogJ2Rvd24nLCBzdGF0dXM6IHN0YXR1cywgZnJvbTogZnJvbX0pO1xuICAgICAgICAkdGltZW91dCgoKSA9PiBzdHJlYW0udm90ZXMuc2hpZnQoKSwgNDAwMCk7XG4gICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgIH0pO1xuXG4gICAgICBvblJvb3RTY29wZSgncGFydGljaXBhbnQgY29uZmlnJywgKCRldmVudCwgZGF0YSkgPT4gJHNjb3BlLiRhcHBseSgpKTtcblxuICAgICAgdmFyIEltYWdlcyA9ICRyZXNvdXJjZSgnL2ltYWdlcycpO1xuICAgICAgb25Sb290U2NvcGUoJ2xvY2FsVGh1bWJuYWlsJywgKCRldmVudCwgcGFydGljaXBhbnQsIHN0cmVhbSwgaW1hZ2VEYXRhKSA9PiB7XG4gICAgICAgIEltYWdlcy5zYXZlKHtcbiAgICAgICAgICBpZDogcGFydGljaXBhbnQuaWQsXG4gICAgICAgICAgZGF0YTogaW1hZ2VEYXRhXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4ge1xuICAgICAgICBpZiAoJHNjb3BlLnNpZ25hbCkgJHNjb3BlLnNpZ25hbC5sZWF2ZVJvb21zKCk7XG4gICAgICAgIF8uZWFjaChsaXN0ZW5lcnNDbGVhbnVwLCBmbiA9PiBmbigpKTtcbiAgICAgICAgbGlzdGVuZXJzQ2xlYW51cC5zcGxpY2UoMCk7XG4gICAgICAgICR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcih0b2dnbGVCYXJzKTtcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiBqb2luUm9vbSgpIHtcbiAgICAgICAgbG9nKCdqb2luaW5nIHJvb20nLCAkbG9jYXRpb24ucGF0aCgpKTtcbiAgICAgICAgJHNjb3BlLnNpZ25hbC5sZWF2ZVJvb21zKCk7XG5cbiAgICAgICAgdmFyIHJvb20gPSAkbG9jYXRpb24ucGF0aCgpLnJlcGxhY2UoL15cXC8vLCAnJyk7XG5cbiAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAkc2NvcGUuY3VycmVudFJvb20ubmFtZSA9IHJvb207XG4gICAgICAgICAgJHNjb3BlLnNpZ25hbC5qb2luUm9vbShyb29tKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblJvb3RTY29wZShldmVudE5hbWUsIGxpc3RlbmVyKSB7XG4gICAgICAgIGxpc3RlbmVyc0NsZWFudXAucHVzaCgkcm9vdFNjb3BlLiRvbihldmVudE5hbWUsIGxpc3RlbmVyKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZVN0cmVhbShzdHJlYW0sIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIF8uZXh0ZW5kKHtcbiAgICAgICAgICBzdHJlYW06IHN0cmVhbSxcbiAgICAgICAgICB2b3RlczogW10sXG4gICAgICAgICAgc3JjOiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSkpXG4gICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1dXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgbmctY2xhc3M9XCJ7XFwnaW5zdGFudC1jaGF0LWNvbnRlbnRcXCc6IHRydWUsIFxcJ2hpZGUtYmFyc1xcJzogaGlkZUJhcnN9XCI+XFxuICA8ZGl2IGNsYXNzPVwidG9wLWJhclwiPlxcbiAgICA8ZGl2IGNsYXNzPVwiZnVsbC1zY3JlZW5cIiBuZy1jbGljaz1cInRvZ2dsZUZ1bGxzY3JlZW4oKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCI+XFxuICAgICAgPHNwYW4gY2xhc3M9XCJmYSBmYS1hcnJvd3MtYWx0XCI+PC9zcGFuPiA8c3Bhbj57e2Z1bGxzY3JlZW5NZXNzYWdlfX08L3NwYW4+XFxuICAgIDwvZGl2PlxcbiAgPC9kaXY+XFxuICA8ZGl2IGNsYXNzPVwibWlkZGxlLWJhclwiPlxcbiAgICA8ZGl2IGNsYXNzPVwiZXJyb3ItbWVzc2FnZVwiIG5nLXNob3c9XCJlcnJvck1lc3NhZ2UgIT0gbnVsbFwiIG5nLWNsaWNrPVwiZXJyb3JNZXNzYWdlID0gbnVsbFwiPnt7ZXJyb3JNZXNzYWdlfX08L2Rpdj5cXG4gICAgPGRpdiBjbGFzcz1cInBhcnRpY2lwYW50cyBwYXJ0aWNpcGFudHMtY291bnQte3thY3RpdmVQYXJ0aWNpcGFudHMubGVuZ3RofX1cIj5cXG5cXG4gICAgICA8cGFydGljaXBhbnQgbmctcmVwZWF0PVwicGFydGljaXBhbnQgaW4gYWN0aXZlUGFydGljaXBhbnRzXCJcXG4gICAgICAgIGNsYXNzPVwicGFydGljaXBhbnQgcGFydGljaXBhbnQte3skaW5kZXh9fVwiIHBhcnRpY2lwYW50PVwicGFydGljaXBhbnRcIj5cXG4gICAgICA8L3BhcnRpY2lwYW50PlxcblxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cImJvdHRvbS1iYXJcIj5cXG4gICAgPGRpdiBuZy1zaG93PVwic291cmNlcy52aWRlby5sZW5ndGggPiAxXCJcXG4gICAgICAgICBuZy1jbGljaz1cInRvZ2dsZUNhbWVyYXMoKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCJcXG4gICAgICAgICBuZy1jbGFzcz1cIntcXCd0b29sXFwnOiB0cnVlLFxcbiAgICAgICAgICAgICAgICAgICAgXFwnYWRkLWNhbWVyYVxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICAgIFxcJ2lzLWFjdGl2ZVxcJzogY2FtZXJhc1Zpc2libGV9XCI+XFxuICAgICAgPHNwYW4gY2xhc3M9XCJwbHVzXCI+Kzwvc3Bhbj48c3BhbiBjbGFzcz1cImZhIGZhLXZpZGVvLWNhbWVyYVwiPjwvc3Bhbj5cXG4gICAgPC9kaXY+XFxuXFxuICAgIDxkaXYgbmctY2xhc3M9XCJ7XFwndG9vbFxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICAgIFxcJ3Nob3ctbWVudVxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICAgIFxcJ2lzLWFjdGl2ZVxcJzogIW1lbnVJc0NvbGxhcHNlZH1cIj5cXG4gICAgICA8c3BhbiBjbGFzcz1cImZhIGZhLWJhcnNcIiBuZy1jbGljaz1cImV4cGFuZE1lbnUoKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCI+PC9zcGFuPlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgY2xhc3M9XCJjYW1lcmFzXCIgbmctaWY9XCJjYW1lcmFzVmlzaWJsZVwiIG5nLWNsaWNrPVwiaGlkZUNhbWVyYXMoKTsgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCI+XFxuICA8ZGl2IGNsYXNzPVwiY2FtZXJhcy1jb250YWluZXJcIj5cXG4gICAgPGRpdiBjbGFzcz1cInNvdXJjZSB2aWRlby1zb3VyY2VcIlxcbiAgICAgICAgIG5nLXJlcGVhdD1cInZpZGVvIGluIHNvdXJjZXMudmlkZW9cIlxcbiAgICAgICAgIG5nLWNsaWNrPVwiYWRkQ2FtZXJhKHZpZGVvKVwiPlxcbiAgICAgIDxzcGFuIGNsYXNzPVwiZmEgZmEtdmlkZW8tY2FtZXJhXCI+PC9zcGFuPlxcbiAgICAgIDxzcGFuIGNsYXNzPVwic291cmNlLWxhYmVsXCI+e3t2aWRlby5sYWJlbH19PC9zcGFuPlxcbiAgICAgIDxzcGFuIG5nLXNob3c9XCJ2aWRlby5mYWNpbmcgIT0gXFwnXFwnICYmIHZpZGVvLmZhY2luZyAhPSBudWxsXCI+IC0ge3t2aWRlby5mYWNpbmd9fTwvc3Bhbj5cXG4gICAgPC9kaXY+XFxuICA8L2Rpdj5cXG48L2Rpdj5cXG5cXG48Y2hhdC1tZW51IG5nLWNsYXNzPVwie1xcJ2NvbGxhcHNlZFxcJzogbWVudUlzQ29sbGFwc2VkLCBcXCdleHBhbmRlZFxcJzogIW1lbnVJc0NvbGxhcHNlZH1cIiBjb25maWc9XCJjb25maWdcIiBjdXJyZW50LXJvb209XCJjdXJyZW50Um9vbVwiIG5nLWNsaWNrPVwiJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXCI+PC9jaGF0LW1lbnU+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlLmh0bWwnKSxcbiAgICBsaW5rOiAoJHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSA9PiB7XG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICgkc2NvcGUpID0+IHtcbiAgICB9XVxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwic3RyZWFtcyBzdHJlYW1zLWNvdW50LXt7cGFydGljaXBhbnQuc3RyZWFtcy5sZW5ndGh9fVwiPlxcblxcbiAgPHN0cmVhbSBuZy1yZXBlYXQ9XCJzdHJlYW0gaW4gcGFydGljaXBhbnQuc3RyZWFtc1wiXFxuICAgIGNsYXNzPVwic3RyZWFtIHN0cmVhbS17eyRpbmRleH19XCIgc3RyZWFtPVwic3RyZWFtXCIgc3RyZWFtLW5hbWU9XCJwYXJ0aWNpcGFudC5jb25maWcubmFtZVwiIHBhcnRpY2lwYW50PVwicGFydGljaXBhbnRcIj5cXG4gIDwvc3RyZWFtPlxcblxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZS5odG1sJyksXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJHJlc291cmNlJywgJyRpbnRlcnZhbCcsICgkc2NvcGUsICRyZXNvdXJjZSwgJGludGVydmFsKSA9PiB7XG4gICAgICB2YXIgUm9vbXMgPSAkcmVzb3VyY2UoJy9yb29tcycpO1xuXG4gICAgICBmdW5jdGlvbiBnZXRSb29tcygpIHtcbiAgICAgICAgUm9vbXMuZ2V0KG51bGwsIHJvb21zID0+ICRzY29wZS5yb29tcyA9IHJvb21zLnJvb21zKTtcbiAgICAgIH1cblxuICAgICAgZ2V0Um9vbXMoKTtcblxuICAgICAgdmFyIGdldFJvb21Qcm9taXNlID0gJGludGVydmFsKGdldFJvb21zLCAzMDAwMCk7XG5cbiAgICAgICRzY29wZS4kb24oJyRkZXN0cm95JywgKCkgPT4gJGludGVydmFsLmNhbmNlbChnZXRSb29tUHJvbWlzZSkpO1xuICAgIH1dXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyb29tXCIgbmctcmVwZWF0PVwicm9vbSBpbiByb29tc1wiPlxcbiAgPGRpdiBjbGFzcz1cInJvb20tbmFtZVwiPlxcbiAgICA8YSBocmVmPVwiLyMve3tyb29tLm5hbWV9fVwiPjxzcGFuIGNsYXNzPVwiaGFzaFwiPiM8L3NwYW4+e3tyb29tLm5hbWV9fTwvYT5cXG4gIDwvZGl2PlxcblxcbiAgPGRpdiBjbGFzcz1cInBhcnRpY2lwYW50XCIgbmctcmVwZWF0PVwicGFydGljaXBhbnQgaW4gcm9vbS5wYXJ0aWNpcGFudHNcIj5cXG4gICAgPGltZyBuZy1zcmM9XCJ7e3BhcnRpY2lwYW50LmltYWdlfX1cIj5cXG4gIDwvZGl2PlxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFJyxcbiAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZS5odG1sJyksXG4gICAgY29udHJvbGxlcjogKCRzY29wZSwgbG9jYWxNZWRpYSkgPT4ge1xuICAgICAgbG9jYWxNZWRpYVxuICAgICAgICAuZ2V0RGV2aWNlcygpXG4gICAgICAgIC50aGVuKGRldmljZXMgPT4ge1xuICAgICAgICAgICRzY29wZS5zb3VyY2VzID0gZGV2aWNlcztcbiAgICAgICAgfSk7XG4gICAgfVxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwic291cmNlc1wiPlxcbiAgPGRpdiBjbGFzcz1cImF1ZGlvLXNvdXJjZXNcIj5cXG4gICAgPHNwYW4+QXVkaW8gU291cmNlczwvc3Bhbj5cXG4gICAgPGRpdiBjbGFzcz1cInNvdXJjZSBhdWRpby1zb3VyY2VcIiBuZy1yZXBlYXQ9XCJhdWRpbyBpbiBzb3VyY2VzLmF1ZGlvXCI+XFxuICAgICAgPHNwYW4gY2xhc3M9XCJmYSBmYS12b2x1bWUtdXBcIj48L3NwYW4+XFxuICAgICAgPHNwYW4gY2xhc3M9XCJzb3VyY2UtbGFiZWxcIj57e2F1ZGlvLmxhYmVsfX08L3NwYW4+XFxuICAgICAgPHNwYW4gbmctc2hvdz1cImF1ZGlvLmZhY2luZyAhPSBcXCdcXCcgJiYgYXVkaW8uZmFjaW5nICE9IG51bGxcIj4gLSB7e2F1ZGlvLmZhY2luZ319PC9zcGFuPlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcblxcbiAgPGRpdiBjbGFzcz1cInZpZGVvLXNvdXJjZXNcIj5cXG4gICAgPHNwYW4+VmlkZW8gU291cmNlczwvc3Bhbj5cXG4gICAgPGRpdiBjbGFzcz1cInNvdXJjZSB2aWRlby1zb3VyY2VcIiBuZy1yZXBlYXQ9XCJ2aWRlbyBpbiBzb3VyY2VzLnZpZGVvXCI+XFxuICAgICAgPHNwYW4gY2xhc3M9XCJmYSBmYS12aWRlby1jYW1lcmFcIj48L3NwYW4+XFxuICAgICAgPHNwYW4gY2xhc3M9XCJzb3VyY2UtbGFiZWxcIj57e3ZpZGVvLmxhYmVsfX08L3NwYW4+XFxuICAgICAgPHNwYW4gbmctc2hvdz1cInZpZGVvLmZhY2luZyAhPSBcXCdcXCcgJiYgdmlkZW8uZmFjaW5nICE9IG51bGxcIj4gLSB7e3ZpZGVvLmZhY2luZ319PC9zcGFuPlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2Pic7IiwidmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBbJyRyb290U2NvcGUnLCAnJGludGVydmFsJywgJyR0aW1lb3V0JywgJ3ZpZGVvVG9vbHMnLCAoJHJvb3RTY29wZSwgJGludGVydmFsLCAkdGltZW91dCwgdmlkZW9Ub29scykgPT4ge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGUuaHRtbCcpLFxuICAgIHNjb3BlOiB7XG4gICAgICBzdHJlYW06ICc9JyxcbiAgICAgIHN0cmVhbU5hbWU6ICc9JyxcbiAgICAgIHBhcnRpY2lwYW50OiAnPSdcbiAgICB9LFxuICAgIGxpbms6ICgkc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpID0+IHtcbiAgICAgIHZhciB2aWRlbyA9IGVsZW1lbnQuZmluZCgndmlkZW8nKVswXSxcbiAgICAgICAgICBjZWxsID0gZWxlbWVudFswXS5jaGlsZE5vZGVzWzBdO1xuXG4gICAgICAkc2NvcGUuaGF2ZVNpemUgPSBmYWxzZTtcbiAgICAgICRzY29wZS50aHVtYlNyYyA9ICdhYm91dDpibGFuayc7XG5cbiAgICAgICRzY29wZS5saXN0ZW5lcnNDbGVhbnVwID0gW107XG5cbiAgICAgIC8vIENoZWFwLCBidXQgZWZmZWN0aXZlLiBXaXRob3V0IGRlYm91bmNpbmcgdGhpcyBmdW5jdGlvblxuICAgICAgLy8gd2UgY2FuIGdldCBtYW55IGNhbGxzIGluIGEgcm93XG4gICAgICB2YXIgZ290U2l6ZSA9ICRzY29wZS5nb3RTaXplID0gICgpID0+IHtcbiAgICAgICAgJHNjb3BlLmhhdmVTaXplID0gdHJ1ZTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdoYXZlVmlkZW9TaXplJywgJHNjb3BlLnN0cmVhbSk7XG4gICAgICB9O1xuXG4gICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdsb2FkZWRtZXRhZGF0YScsIGdvdFNpemUpO1xuICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcigncGxheWluZycsICAgICAgICBnb3RTaXplKTtcbiAgICAgIHZpZGVvLmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCAgICAgICAgICAgZ290U2l6ZSk7XG5cbiAgICAgIGVsZW1lbnQub24oJ3Jlc2l6ZScsICAgICAgICAgICAgICAgICAgICAgZ290U2l6ZSk7XG4gICAgICBjZWxsLmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICAgICAgICAgIGdvdFNpemUpO1xuICAgICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgICAgICAgICBnb3RTaXplKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAgICAgICAgZ290U2l6ZSk7XG5cbiAgICAgIG9uUm9vdFNjb3BlKHtcbiAgICAgICAgJ3Jlc2l6ZSc6ICAgICAgICAgICAgICAgZ290U2l6ZSxcbiAgICAgICAgJ3BhcnRpY2lwYW50IGFjdGl2ZSc6ICAgc3RhdGVDaGFuZ2UsXG4gICAgICAgICdwYXJ0aWNpcGFudCBpbmFjdGl2ZSc6IHN0YXRlQ2hhbmdlLFxuICAgICAgICAnc3RyZWFtIGFkZCc6ICAgICAgICAgICBzdGF0ZUNoYW5nZSxcbiAgICAgICAgJ3N0cmVhbSByZW1vdmUnOiAgICAgICAgc3RhdGVDaGFuZ2UsXG4gICAgICAgICdoYXZlVmlkZW9TaXplJzogICAgICAgIHJlZnJlc2hTaXplXG4gICAgICB9KTtcblxuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWRlZG1ldGFkYXRhJywgZ290U2l6ZSk7XG4gICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BsYXlpbmcnLCAgICAgICAgZ290U2l6ZSk7XG4gICAgICAgIHZpZGVvLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3BsYXknLCAgICAgICAgICAgZ290U2l6ZSk7XG5cbiAgICAgICAgZWxlbWVudC5vZmYoJ3Jlc2l6ZScsICAgICAgICAgICAgICAgICAgICAgICBnb3RTaXplKTtcbiAgICAgICAgY2VsbC5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCAgICAgICAgICBnb3RTaXplKTtcbiAgICAgICAgdmlkZW8ucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgICAgICAgICBnb3RTaXplKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsICAgICAgICBnb3RTaXplKTtcbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiBzdGF0ZUNoYW5nZSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N0YXRlIGNoYW5nZScpO1xuICAgICAgICAkdGltZW91dChyZWZyZXNoU2l6ZSwgMCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIG9uUm9vdFNjb3BlKGxpc3RlbmVycykge1xuICAgICAgICBfLmVhY2gobGlzdGVuZXJzLCAobGlzdGVuZXIsIGV2ZW50TmFtZSkgPT4ge1xuICAgICAgICAgICRzY29wZS5saXN0ZW5lcnNDbGVhbnVwLnB1c2goJHJvb3RTY29wZS4kb24oZXZlbnROYW1lLCBsaXN0ZW5lcikpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVmcmVzaFNpemUoKSB7XG4gICAgICAgIGlmICghJHNjb3BlLmhhdmVTaXplKSByZXR1cm47XG5cbiAgICAgICAgdmFyIHZpZGVvV2lkdGggPSB2aWRlby52aWRlb1dpZHRoLFxuICAgICAgICAgICAgdmlkZW9IZWlnaHQgPSB2aWRlby52aWRlb0hlaWdodCxcbiAgICAgICAgICAgIHZpZGVvUmF0aW8gPSAodmlkZW9XaWR0aCAvIHZpZGVvSGVpZ2h0KSB8fCAoNCAvIDMpLFxuICAgICAgICAgICAgY2VsbFdpZHRoID0gY2VsbC5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgIGNlbGxIZWlnaHQgPSBjZWxsLmNsaWVudEhlaWdodCxcbiAgICAgICAgICAgIGNlbGxSYXRpbyA9IGNlbGxXaWR0aCAvIGNlbGxIZWlnaHQ7XG5cbiAgICAgICAgdmFyIHZpZGVvU3VyZmFjZVdpZHRoLCB2aWRlb1N1cmZhY2VIZWlnaHQ7XG5cbiAgICAgICAgaWYgKGNlbGxSYXRpbyA+IHZpZGVvUmF0aW8pIHtcbiAgICAgICAgICB2aWRlb1N1cmZhY2VXaWR0aCA9IGNlbGxIZWlnaHQgKiB2aWRlb1JhdGlvO1xuICAgICAgICAgIHZpZGVvU3VyZmFjZUhlaWdodCA9IGNlbGxIZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdmlkZW9TdXJmYWNlV2lkdGggPSBjZWxsV2lkdGg7XG4gICAgICAgICAgdmlkZW9TdXJmYWNlSGVpZ2h0ID0gY2VsbFdpZHRoIC8gdmlkZW9SYXRpbztcbiAgICAgICAgfVxuXG4gICAgICAgIHZpZGVvLnZpZGVvU3VyZmFjZVdpZHRoID0gdmlkZW9TdXJmYWNlV2lkdGg7XG4gICAgICAgIHZpZGVvLnZpZGVvU3VyZmFjZUhlaWdodCA9IHZpZGVvU3VyZmFjZUhlaWdodDtcblxuICAgICAgICB2YXIgdG9wID0gKGNlbGxIZWlnaHQgLSB2aWRlb1N1cmZhY2VIZWlnaHQpIC8gMixcbiAgICAgICAgICAgIGxlZnQgPSAoY2VsbFdpZHRoIC0gdmlkZW9TdXJmYWNlV2lkdGgpIC8gMixcbiAgICAgICAgICAgIGJvdHRvbSA9IHRvcCwgLy8gQ1NTIEJvdHRvbSBpcyBpbnZlcnRlZFxuICAgICAgICAgICAgcmlnaHQgPSBjZWxsV2lkdGggLSBsZWZ0O1xuXG4gICAgICAgICRzY29wZS5zdHJlYW1PdmVybGF5LmNzcyh7XG4gICAgICAgICAgdG9wOiB0b3AgKyAncHgnLFxuICAgICAgICAgIGxlZnQ6IGxlZnQgKyAncHgnLFxuICAgICAgICAgIGJvdHRvbTogYm90dG9tICsgJ3B4JyxcbiAgICAgICAgICByaWdodDogcmlnaHQgKyAncHgnLFxuICAgICAgICAgIHdpZHRoOiB2aWRlb1N1cmZhY2VXaWR0aCArICdweCcsXG4gICAgICAgICAgaGVpZ2h0OiB2aWRlb1N1cmZhY2VIZWlnaHQgKyAncHgnXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKCdwbGF5aW5nJywgKCkgPT4ge1xuICAgICAgICAvLyBBbGxvdyBzb21lIHRpbWUgZm9yIGNhbWVyYS9zdHJlYW0gdG8gYWRqdXN0XG4gICAgICAgICR0aW1lb3V0KCRzY29wZS5nZW5lcmF0ZUxvY2FsVGh1bWJuYWlsLCAxMDApO1xuICAgICAgfSk7XG5cblxuICAgICAgJHNjb3BlLiR3YXRjaCgnc3RyZWFtJywgc3RyZWFtID0+IHtcbiAgICAgICAgc3RyZWFtLmlzTXV0ZWQgPSAkc2NvcGUucGFydGljaXBhbnQuaXNMb2NhbCB8fCBzdHJlYW0uaXNNdXRlZDtcbiAgICAgICAgc3RyZWFtLmlzVm90ZWRVcCA9IGZhbHNlO1xuICAgICAgICBzdHJlYW0uaXNWb3RlZERvd24gPSBmYWxzZTtcblxuICAgICAgICB2aWRlby5tdXRlZCA9IHN0cmVhbS5pc011dGVkO1xuXG4gICAgICAgICRzY29wZS50aHVtYm5haWxJbnRlcnZhbCA9ICRpbnRlcnZhbCgkc2NvcGUuZ2VuZXJhdGVMb2NhbFRodW1ibmFpbCwgMTUwMDApO1xuICAgICAgfSk7XG5cbiAgICAgICRzY29wZS50b2dnbGVNdXRlID0gJGV2ZW50ID0+IHtcbiAgICAgICAgdmFyIHN0cmVhbSA9ICRzY29wZS5zdHJlYW07XG5cbiAgICAgICAgaWYgKHN0cmVhbSkge1xuICAgICAgICAgIHN0cmVhbS5pc011dGVkID0gIXN0cmVhbS5pc011dGVkO1xuICAgICAgICAgIHZpZGVvLm11dGVkID0gc3RyZWFtLmlzTXV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jYXB0dXJlRnJhbWUgPSAob3B0aW9ucywgY2FsbGJhY2spID0+IHtcbiAgICAgICAgdmlkZW9Ub29scy5jYXB0dXJlRnJhbWUodmlkZW8sIG9wdGlvbnMgfHwge3dpZHRoOiA5Nn0sIGNhbGxiYWNrKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICdpbnN0YW50Q2hhdE1hbmFnZXInLCAoJHNjb3BlLCBpbnN0YW50Q2hhdE1hbmFnZXIpID0+IHtcbiAgICAgICRzY29wZS50b2dnbGVWb3RlVXAgPSAkZXZlbnQgPT4ge1xuICAgICAgICB2YXIgc3RyZWFtID0gJHNjb3BlLnN0cmVhbTtcblxuICAgICAgICBzdHJlYW0uaXNWb3RlZFVwID0gIXN0cmVhbS5pc1ZvdGVkVXA7XG4gICAgICAgIHN0cmVhbS5pc1ZvdGVkRG93biA9IGZhbHNlO1xuXG4gICAgICAgIGluc3RhbnRDaGF0TWFuYWdlci5zZW5kVG9nZ2xlVm90ZVVwKHN0cmVhbSwgc3RyZWFtLmlzVm90ZWRVcCk7XG5cbiAgICAgICAgJHNjb3BlLmNhcHR1cmVGcmFtZShudWxsLCBkYXRhVXJsID0+IHtcbiAgICAgICAgICBzdHJlYW0udGh1bWJTcmMgPSBkYXRhVXJsO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS50b2dnbGVWb3RlRG93biA9ICRldmVudCA9PiB7XG4gICAgICAgIHZhciBzdHJlYW0gPSAkc2NvcGUuc3RyZWFtO1xuXG4gICAgICAgIHN0cmVhbS5pc1ZvdGVkVXAgPSBmYWxzZTtcbiAgICAgICAgc3RyZWFtLmlzVm90ZWREb3duID0gIXN0cmVhbS5pc1ZvdGVkRG93bjtcblxuICAgICAgICBpbnN0YW50Q2hhdE1hbmFnZXIuc2VuZFRvZ2dsZVZvdGVEb3duKHN0cmVhbSwgc3RyZWFtLmlzVm90ZWREb3duKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5nZW5lcmF0ZUxvY2FsVGh1bWJuYWlsID0gKCkgPT4ge1xuICAgICAgICB2YXIgcGFydGljaXBhbnQgPSAkc2NvcGUucGFydGljaXBhbnQsXG4gICAgICAgICAgICBzdHJlYW0gPSAkc2NvcGUuc3RyZWFtO1xuXG4gICAgICAgICRzY29wZS5jYXB0dXJlRnJhbWUobnVsbCwgZGF0YVVybCA9PiB7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd0aHVtYm5haWwnLCBwYXJ0aWNpcGFudCwgc3RyZWFtLCBkYXRhVXJsKTtcblxuICAgICAgICAgIGlmIChwYXJ0aWNpcGFudC5pc0xvY2FsKSAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvY2FsVGh1bWJuYWlsJywgcGFydGljaXBhbnQsIHN0cmVhbSwgZGF0YVVybCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCAoKSA9PiB7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCAkc2NvcGUuZ290U2l6ZSk7XG4gICAgICAgIF8uZWFjaCgkc2NvcGUubGlzdGVuZXJzQ2xlYW51cCwgZm4gPT4gZm4oKSk7XG4gICAgICAgIGlmICgkc2NvcGUudGh1bWJuYWlsSW50ZXJ2YWwpICRpbnRlcnZhbC5jYW5jZWwoJHNjb3BlLnRodW1ibmFpbEludGVydmFsKTtcbiAgICAgIH0pO1xuICAgIH1dXG4gIH07XG59XTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IG5nLXNob3c9XCJzdHJlYW0uc3JjICE9IG51bGxcIiBuZy1jbGFzcz1cIntcXCdzdHJlYW0tY29udGFpbmVyXFwnOiB0cnVlLCBcXCdoYXMtdm90ZXNcXCc6IHN0cmVhbS52b3Rlcy5sZW5ndGggPiAwfVwiPlxcbiAgPGRpdiBjbGFzcz1cImNlbGxcIj5cXG4gICAgPHZpZGVvIGNsYXNzPVwic3RyZWFtLXZpZGVvXCIgc3JjPVwie3tzdHJlYW0uc3JjfX1cIiBhdXRvcGxheT48L3ZpZGVvPlxcblxcbiAgICA8ZGl2IG5nLXNjb3BlLWVsZW1lbnQ9XCJzdHJlYW1PdmVybGF5XCJcXG4gICAgICAgICBjbGFzcz1cInN0cmVhbS1vdmVybGF5XCI+XFxuICAgICAgPHNwYW4gY2xhc3M9XCJzdHJlYW0tbmFtZVwiPnt7c3RyZWFtTmFtZX19PC9zcGFuPlxcbiAgICAgIDxkaXYgY2xhc3M9XCJ2b3Rlc1wiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cInZvdGVcIiBuZy1yZXBlYXQ9XCJ2b3RlIGluIHN0cmVhbS52b3Rlc1wiPlxcbiAgICAgICAgICA8dmlkZW8gY2xhc3M9XCJ2aWRlb1wiIHNyYz1cInt7dm90ZS5mcm9tLnN0cmVhbXNbMF0uc3JjfX1cIiBtdXRlZD1cIm11dGVkXCIgYXV0b3BsYXk+PC92aWRlbz5cXG4gICAgICAgICAgPHNwYW4gbmctY2xhc3M9XCJ7XFxuICAgICAgICAgICAgICAgICAgXFwnZmFcXCc6IHRydWUsXFxuICAgICAgICAgICAgICAgICAgXFwnZmEtdGh1bWJzLXVwXFwnOiB2b3RlLnZvdGUgPT0gXFwndXBcXCcsXFxuICAgICAgICAgICAgICAgICAgXFwnZmEtdGh1bWJzLWRvd25cXCc6IHZvdGUudm90ZSA9PSBcXCdkb3duXFwnLFxcbiAgICAgICAgICAgICAgICAgIFxcJ3RodW1ic1xcJzogdHJ1ZX1cIj48L3NwYW4+XFxuICAgICAgICA8L2Rpdj5cXG4gICAgICA8L2Rpdj5cXG4gICAgICA8ZGl2IGNsYXNzPVwic3RyZWFtLWNvbnRyb2xzXCI+XFxuICAgICAgICA8ZGl2IG5nLXNob3c9XCIhcGFydGljaXBhbnQuaXNMb2NhbFwiPlxcbiAgICAgICAgICA8c3BhbiBuZy1jbGFzcz1cIntcXG4gICAgICAgICAgICAgICAgICBcXCdmYVxcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICBcXCd2b2x1bWVcXCc6IHRydWUsXFxuICAgICAgICAgICAgICAgICAgXFwnZmEtdm9sdW1lLW9mZlxcJzogc3RyZWFtLmlzTXV0ZWQsXFxuICAgICAgICAgICAgICAgICAgXFwndm9sdW1lLW9mZlxcJzogc3RyZWFtLmlzTXV0ZWQsXFxuICAgICAgICAgICAgICAgICAgXFwnZmEtdm9sdW1lLXVwXFwnOiAhc3RyZWFtLmlzTXV0ZWQsXFxuICAgICAgICAgICAgICAgICAgXFwndm9sdW1lLW9uXFwnOiAhc3RyZWFtLmlzTXV0ZWR9XCJcXG4gICAgICAgICAgICAgICAgbmctY2xpY2s9XCJ0b2dnbGVNdXRlKCRldmVudCk7ICRldmVudC5zdG9wUHJvcGFnYXRpb24oKVwiPjwvc3Bhbj5cXG5cXG4gICAgICAgICAgPHNwYW4gbmctY2xhc3M9XCJ7XFxuICAgICAgICAgICAgICAgICAgXFwnZmFcXCc6IHRydWUsXFxuICAgICAgICAgICAgICAgICAgXFwndGh1bWJzXFwnOiB0cnVlLFxcbiAgICAgICAgICAgICAgICAgIFxcJ2ZhLXRodW1icy1vLXVwXFwnOiAhc3RyZWFtLmlzVm90ZWRVcCxcXG4gICAgICAgICAgICAgICAgICBcXCdmYS10aHVtYnMtdXBcXCc6IHN0cmVhbS5pc1ZvdGVkVXAsXFxuICAgICAgICAgICAgICAgICAgXFwndGh1bWJzLXVwXFwnOiB0cnVlLFxcbiAgICAgICAgICAgICAgICAgIFxcJ3RodW1icy11cC1zZWxlY3RlZFxcJzogc3RyZWFtLmlzVm90ZWRVcH1cIlxcbiAgICAgICAgICAgICAgICBuZy1jbGljaz1cInRvZ2dsZVZvdGVVcCgpOyAkZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcIj48L3NwYW4+XFxuXFxuICAgICAgICAgIDxzcGFuIG5nLWNsYXNzPVwie1xcbiAgICAgICAgICAgICAgICAgIFxcJ2ZhXFwnOiB0cnVlLFxcbiAgICAgICAgICAgICAgICAgIFxcJ3RodW1ic1xcJzogdHJ1ZSxcXG4gICAgICAgICAgICAgICAgICBcXCdmYS10aHVtYnMtby1kb3duXFwnOiAhc3RyZWFtLmlzVm90ZWREb3duLFxcbiAgICAgICAgICAgICAgICAgIFxcJ2ZhLXRodW1icy1kb3duXFwnOiBzdHJlYW0uaXNWb3RlZERvd24sXFxuICAgICAgICAgICAgICAgICAgXFwndGh1bWJzLWRvd25cXCc6IHRydWUsXFxuICAgICAgICAgICAgICAgICAgXFwndGh1bWJzLWRvd24tc2VsZWN0ZWRcXCc6IHN0cmVhbS5pc1ZvdGVkRG93bn1cIlxcbiAgICAgICAgICAgICAgICBuZy1jbGljaz1cInRvZ2dsZVZvdGVEb3duKCk7ICRldmVudC5zdG9wUHJvcGFnYXRpb24oKVwiPjwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgIDwvZGl2PlxcbiAgICA8L2Rpdj5cXG4gIDwvZGl2PlxcbjwvZGl2PlxcblxcbjxkaXYgbmctc2hvdz1cInN0cmVhbS5zcmMgPT0gbnVsbFwiPlxcblN0cmVhbSBJbnRlcnJ1cHRlZCFcXG48L2Rpdj4nOyIsInZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gWydpbnN0YW50Q2hhdCcsIGluc3RhbnRDaGF0ID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlLmh0bWwnKSxcbiAgICBsaW5rOiAoJHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzLCBpbnN0YW50RmlsZSkgPT4ge1xuICAgICAgZWxlbWVudC5maW5kKCdpbnB1dCcpWzBdLmZvY3VzKCk7XG4gICAgfSxcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckbG9jYXRpb24nLCAoJHNjb3BlLCAkbG9jYXRpb24pID0+IHtcbiAgICAgICRzY29wZS5qb2luQ2hhbm5lbCA9ICgpID0+IHtcbiAgICAgICAgJGxvY2F0aW9uLnBhdGgoJHNjb3BlLmNoYW5uZWxOYW1lKTtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS5jaGFubmVsQ2hhbmdlID0gXy5kZWJvdW5jZSgoKSA9PiB7XG4gICAgICAgICRzY29wZS5qb2luQ2hhbm5lbCgpO1xuICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICB9LCAxNTAwKTtcbiAgICB9XVxuICB9O1xufV07IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cImludHJvXCI+XFxuICA8aDM+V2VsY29tZSB0byA8c3BhbiBjbGFzcz1cInNpdGUtbmFtZVwiPmluc3RhY2hhdC5pbzwvc3Bhbj48L2gzPlxcblxcbiAgPHJvdGF0b3IgaW50ZXJ2YWw9XCI0MDAwXCI+XFxuICAgIDxoNT5FbmNyeXB0ZWQgUDJQIEhhc2h0YWctYmFzZWQgVmlkZW8gU2hhcmluZzwvaDU+XFxuICAgIDxoNT5NYWtlIEZyZWUgRW5jcnlwdGVkIFZpZGVvIENhbGxzIFRvIE92ZXIgMS41IEJpbGxpb24gRGV2aWNlczwvaDU+XFxuICA8L3JvdGF0b3I+XFxuXFxuICA8Zm9ybSBuZy1zdWJtaXQ9XCJqb2luQ2hhbm5lbCgpXCI+XFxuICAgIDxsYWJlbCBjbGFzcz1cImNoYW5uZWwtaW5wdXRcIj48c3BhbiBjbGFzcz1cImhhc2hcIj4jPC9zcGFuPjxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgQ2hhbm5lbCBOYW1lXCIgdGFiaW5kZXg9XCIwXCIgbmctbW9kZWw9XCJjaGFubmVsTmFtZVwiIG5nLWNoYW5nZT1cImNoYW5uZWxDaGFuZ2UoKVwiPjwvbGFiZWw+XFxuICA8L2Zvcm0+XFxuPC9kaXY+XFxuXFxuPHJvb20tbGlzdD48L3Jvb20tbGlzdD4nOyIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0ciwgbmdNb2RlbCkge1xuICAgICAgaWYgKCFuZ01vZGVsKSByZXR1cm47XG5cbiAgICAgIG5nTW9kZWwuJHJlbmRlciA9ICgpID0+IGVsZW1lbnQuaHRtbChuZ01vZGVsLiR2aWV3VmFsdWUpO1xuXG4gICAgICBlbGVtZW50LmJpbmQoJ2JsdXInLCAoKSA9PiB7XG4gICAgICAgIGlmIChuZ01vZGVsLiR2aWV3VmFsdWUgIT09IGVsZW1lbnQuaHRtbCgpLnRyaW0oKSkge1xuICAgICAgICAgIHJldHVybiBzY29wZS4kYXBwbHkocmVhZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBmdW5jdGlvbiByZWFkKCkge1xuICAgICAgICByZXR1cm4gbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKGVsZW1lbnQuaHRtbCgpLnRyaW0oKSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTsiLCJ2YXIgZml0VGV4dCA9IHJlcXVpcmUoJ2ZpdFRleHQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgZWxlbWVudC5vbigncmVzaXplJywgc2l6ZUVsZW1lbnQpO1xuICAgICAgZWxlbWVudC5vbignaW5wdXQnLCBzaXplRWxlbWVudCk7XG4gICAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsIHNpemVFbGVtZW50KTtcblxuICAgICAgc2l6ZUVsZW1lbnQoKTtcblxuICAgICAgZnVuY3Rpb24gc2l6ZUVsZW1lbnQoKSB7XG4gICAgICAgIGZpdFRleHQoZWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIGxpbms6ICgkc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpID0+IHtcbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50WzBdO1xuXG4gICAgICAkc2NvcGUuJHdhdGNoKGF0dHJpYnV0ZXNbJ2ZvY3VzT24nXSwgbmV3VmFsdWUgPT4ge1xuICAgICAgICBpZiAobmV3VmFsdWUpIHNldFRpbWVvdXQoKCkgPT4gZWxlbWVudC5mb2N1cygpLCAwKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07IiwiLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE1ODgxNDUzL2FuZ3VsYXJqcy1hY2Nlc3NpbmctZG9tLWVsZW1lbnRzLWluc2lkZS1kaXJlY3RpdmUtdGVtcGxhdGVcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uIGNvbXBpbGUodEVsZW1lbnQsIHRBdHRycywgdHJhbnNjbHVkZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcHJlOiBmdW5jdGlvbiBwcmVMaW5rKHNjb3BlLCBpRWxlbWVudCwgaUF0dHJzLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgc2NvcGVbaUF0dHJzLm5nU2NvcGVFbGVtZW50XSA9IGlFbGVtZW50O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBbJyRpbnRlcnZhbCcsICgkaW50ZXJ2YWwpID0+IHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIGxpbms6ICgkc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpID0+IHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IGVsZW1lbnRbMF0uY2hpbGRyZW4sXG4gICAgICAgICAgY3VycmVudEluZGV4ID0gMDtcblxuICAgICAgY29uc29sZS5sb2coZWxlbWVudCk7XG5cbiAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAwKSBjaGlsZHJlblswXS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblxuICAgICAgJGludGVydmFsKHJvdGF0ZSwgcGFyc2VJbnQoYXR0cmlidXRlcy5pbnRlcnZhbCB8fCBcIjEwMDBcIikpO1xuXG4gICAgICBmdW5jdGlvbiByb3RhdGUoKSB7XG4gICAgICAgIHZhciBhY3RpdmUgPSBjaGlsZHJlbltjdXJyZW50SW5kZXhdO1xuICAgICAgICBpZiAoYWN0aXZlKSBhY3RpdmUuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7IC8vIFRoZSBub2RlIG1heSAoISkgaGF2ZSBkaXNhcHBlYXJlZFxuXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IChjdXJyZW50SW5kZXggKyAxKSAlIGNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgY2hpbGRyZW5bY3VycmVudEluZGV4XS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICBlbGVtZW50LmJpbmQoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbiAmJiBkb2N1bWVudC5jcmVhdGVSYW5nZSkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIHZhciByYW5nZSA9IGRvY3VtZW50LmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICByYW5nZS5zZWxlY3ROb2RlQ29udGVudHMoZWxlbWVudFswXSk7XG4gICAgICAgICAgICBzZWxlY3Rpb24ucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICBzZWxlY3Rpb24uYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50LnNlbGVjdGlvbiAmJiBkb2N1bWVudC5ib2R5LmNyZWF0ZVRleHRSYW5nZSkge1xuICAgICAgICAgICAgdmFyIHJhbmdlID0gZG9jdW1lbnQuYm9keS5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgIHJhbmdlLm1vdmVUb0VsZW1lbnRUZXh0KGVsZW1lbnRbMF0pO1xuICAgICAgICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07IiwiLy9cbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gWydlbWl0dGVyJywgJ2xvY2FsU3RvcmFnZVNlcnZpY2UnLCAoZW1pdHRlciwgbG9jYWxTdG9yYWdlU2VydmljZSkgPT4ge1xuICB2YXIge2VtaXQsIG9uLCBvZmZ9ID0gZW1pdHRlcigpO1xuXG4gIHZhciBzdG9yYWdlS2V5ID0gJ2NvbmZpZycsXG4gICAgICBkYXRhID0ge307XG5cbiAgdmFyIGNvbmZpZyA9IF8uZXh0ZW5kKHtcbiAgICBuYW1lOiB1bmRlZmluZWQsXG4gICAgZGVmYXVsdFN0cmVhbToge1xuICAgICAgYXVkaW86IHRydWUsXG4gICAgICAvL3ZpZGVvOiB0cnVlXG4gICAgICB2aWRlbzoge1xuICAgICAgICBtYW5kYXRvcnk6IHtcbiAgICAgICAgICBtaW5XaWR0aDogMzIwLFxuICAgICAgICAgIG1heFdpZHRoOiAzMjAsXG4gICAgICAgICAgbWluSGVpZ2h0OiAyNDAsXG4gICAgICAgICAgbWF4SGVpZ2h0OiAyNDBcbiAgICAgICAgfVxuICAgICAgICAvLyBtYW5kYXRvcnk6IHtcbiAgICAgICAgLy8gICBtaW5XaWR0aDogNzIwLFxuICAgICAgICAvLyAgIG1heFdpZHRoOiA3MjAsXG4gICAgICAgIC8vICAgbWluSGVpZ2h0OiA1NDAsXG4gICAgICAgIC8vICAgbWF4SGVpZ2h0OiA1NDBcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgIH1cbiAgfSwgbG9jYWxTdG9yYWdlU2VydmljZS5nZXQoc3RvcmFnZUtleSkgfHwge30pO1xuXG4gIF8uZWFjaChjb25maWcsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgY29uc29sZS5sb2coJ3NldHRpbmcnLCB2YWx1ZSwga2V5KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZGF0YSwga2V5LCB7XG4gICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgZ2V0OiAoKSA9PiBjb25maWdba2V5XSxcbiAgICAgIHNldDogKHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbmZpZ1trZXldID0gdmFsdWU7XG4gICAgICAgIGxvY2FsU3RvcmFnZVNlcnZpY2Uuc2V0KHN0b3JhZ2VLZXksIGNvbmZpZyk7XG4gICAgICAgIGVtaXQoa2V5LCB2YWx1ZSk7XG4gICAgICAgIGVtaXQoJyRjaGFuZ2UnLCBjb25maWcpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICAvLyBBbGxvd3MgbGlzdGVuaW5nIHRvIGNoYW5nZXNcbiAgLy8gVXNlIHByb3BlcnRpZXMgc28gdGhhdCB0aGV5IGFyZSBub3QgZW51bWVyYXRlZCAoZWcuIHdoZW4gc2VyaWFsaXphaW5nIHRvIEpTT04pXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGRhdGEsIHtcbiAgICAnb24nOiB7Z2V0OiAoKSA9PiAoLi4uYXJncykgPT4gb24oLi4uYXJncyl9LFxuICAgICdvZmYnOiB7Z2V0OiAoKSA9PiAoLi4uYXJncykgPT4gb2ZmKC4uLmFyZ3MpfVxuICB9KTtcblxuICByZXR1cm4gZGF0YTtcbn1dOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vLi4vdXRpbC9lbWl0dGVyJyk7IiwibW9kdWxlLmV4cG9ydHMgPSBbXG4gICckcm9vdFNjb3BlJywgJ2xvZycsICdwYXJ0aWNpcGFudHMnLCAncnRjJywgJ2VtaXR0ZXInLFxuICAgICdpbnN0YW50Q2hhdE1hbmFnZXInLCAnY29uZmlnJywgJ2xvY2FsTWVkaWEnLFxuICAoJHJvb3RTY29wZSwgbG9nLCBwYXJ0aWNpcGFudHMsIHJ0YywgZW1pdHRlcixcbiAgICBpbnN0YW50Q2hhdE1hbmFnZXIsIGNvbmZpZywgbG9jYWxNZWRpYSkgPT4ge1xuXG4gIHZhciB7ZW1pdCwgb24sIG9mZn0gPSBlbWl0dGVyKCk7XG5cbiAgdmFyIGluc3RhbnRDaGF0ID0ge1xuICAgIC8vIE1ldGhvZHNcbiAgICBzZW5kTWVzc2FnZTogc2VuZE1lc3NhZ2UsXG4gICAgc2hhcmVGaWxlOiBzaGFyZUZpbGUsXG5cbiAgICBicm9hZGNhc3Q6IGJyb2FkY2FzdCxcblxuICAgIGNvbm5lY3Q6IGNvbm5lY3QsXG4gICAgZGlzY29ubmVjdDogZGlzY29ubmVjdCxcblxuICAgIG9uOiBvbixcbiAgICBvZmY6IG9mZixcblxuICAgIC8vIE9ic2VydmFibGUgRGF0YVxuICAgIHBhcnRpY2lwYW50czogcGFydGljaXBhbnRzLFxuICAgIGFjdGl2ZVBhcnRpY2lwYW50czogW10sXG5cbiAgICAvLyBUaGVzZSB3aWxsIGhhdmUgdmFsdWVzIHBvcHVsYXRlZCBvbmNlIGNvbm5lY3QgaXMgY2FsbGVkXG4gICAgc2lnbmFsOiB1bmRlZmluZWQsXG4gICAgbG9jYWxQYXJ0aWNpcGFudDogdW5kZWZpbmVkLFxuICAgIHJvb21OYW1lOiB1bmRlZmluZWRcbiAgfTtcblxuICB2YXIge2FjdGl2ZVBhcnRpY2lwYW50c30gPSBpbnN0YW50Q2hhdDtcblxuICB2YXIgY29ubmVjdFByb21pc2UsXG4gICAgICBicm9hZGNhc3RQcm9taXNlRm5zID0ge307XG5cbiAgLy8gU2hvdWxkIHRoaXMgYmUgd2hhdCB3ZSByZXR1cm4gYXMgdGhlIGZhY3Rvcnk/XG4gIGZ1bmN0aW9uIGNvbm5lY3QodXJsKSB7XG4gICAgY29ubmVjdFByb21pc2UgPSBjb25uZWN0UHJvbWlzZSB8fCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgc2lnbmFsID0gaW5zdGFudENoYXQuc2lnbmFsID0gcnRjKHVybCk7XG5cbiAgICAgIHNpZ25hbC5vbih7XG4gICAgICAgIC8vIFJvb20gRXZlbnRzXG4gICAgICAgICdyZWFkeSc6ICAgICAgIHJlYWR5LFxuICAgICAgICAncm9vbSBqb2luJzogICBqb2luUm9vbSxcbiAgICAgICAgJ3Jvb20gbGVhdmUnOiAgbGVhdmVSb29tLFxuXG4gICAgICAgICdwZWVyIGFkZCc6ICAgIHBlZXIgPT4gcGFydGljaXBhbnRzLmFkZCh7cGVlcjogcGVlciwgbG9jYWxTdHJlYW1zOiBpbnN0YW50Q2hhdC5sb2NhbFBhcnRpY2lwYW50LnN0cmVhbXN9KSxcbiAgICAgICAgJ3BlZXIgcmVtb3ZlJzogcGVlciA9PiBwYXJ0aWNpcGFudHMucmVtb3ZlQnlQZWVyKHBlZXIpLFxuXG4gICAgICAgICdicm9hZGNhc3RfcmVhZHknOiBwZWVyID0+IGJyb2FkY2FzdFJlYWR5KHBlZXIpLFxuICAgICAgICAnYnJvYWRjYXN0X2Vycm9yJzogZXJyb3IgPT4gYnJvYWRjYXN0RXJyb3IoZXJyb3IpLFxuXG4gICAgICAgIC8vIEluZm9ybWF0aW9uYWxcbiAgICAgICAgJ3BlZXIgcmVjZWl2ZSBvZmZlcic6ICAgICAgICAgICAgICAgcGVlciA9PiBsb2cuc3RhdHVzKHBlZXIuaWQsICdPZmZlciBSZWNlaXZlZCcpLFxuICAgICAgICAncGVlciByZWNlaXZlIGFuc3dlcic6ICAgICAgICAgICAgICBwZWVyID0+IGxvZy5zdGF0dXMocGVlci5pZCwgJ0Fuc3dlciBSZWNlaXZlZCcpLFxuICAgICAgICAncGVlciBzZW5kIG9mZmVyJzogICAgICAgICAgICAgICAgICBwZWVyID0+IGxvZy5zdGF0dXMocGVlci5pZCwgJ09mZmVyIFNlbnQnKSxcbiAgICAgICAgJ3BlZXIgc2VuZCBhbnN3ZXInOiAgICAgICAgICAgICAgICAgcGVlciA9PiBsb2cuc3RhdHVzKHBlZXIuaWQsICdBbnN3ZXIgU2VudCcpLFxuICAgICAgICAncGVlciBzaWduYWxpbmdfc3RhdGVfY2hhbmdlJzogICAgICBwZWVyID0+IGxvZy5zdGF0dXMocGVlci5pZCwgJ1NpZ25hbGluZzonLCBwZWVyLmNvbm5lY3Rpb24uc2lnbmFsaW5nU3RhdGUpLFxuICAgICAgICAncGVlciBpY2VfY29ubmVjdGlvbl9zdGF0ZV9jaGFuZ2UnOiBwZWVyID0+IGxvZy5zdGF0dXMocGVlci5pZCwgJ0lDRTonLCBwZWVyLmNvbm5lY3Rpb24uaWNlQ29ubmVjdGlvblN0YXRlKSxcblxuICAgICAgICAvLyBFcnJvcnNcbiAgICAgICAgJ3BlZXIgZXJyb3Igc2V0X2xvY2FsX2Rlc2NyaXB0aW9uJzogICAocGVlciwgZXJyb3IsIG9mZmVyKSA9PiAgICAgbG9nLmVycm9yKCdwZWVyIGVycm9yIHNldF9sb2NhbF9kZXNjcmlwdGlvbicsIHBlZXIsIGVycm9yLCBvZmZlciksXG4gICAgICAgICdwZWVyIGVycm9yIHNldF9yZW1vdGVfZGVzY3JpcHRpb24nOiAgKHBlZXIsIGVycm9yLCBvZmZlcikgPT4gICAgIGxvZy5lcnJvcigncGVlciBlcnJvciBzZXRfcmVtb3RlX2Rlc2NyaXB0aW9uJywgcGVlciwgZXJyb3IsIG9mZmVyKSxcbiAgICAgICAgJ3BlZXIgZXJyb3Igc2VuZCBhbnN3ZXInOiAgICAgICAgICAgICAocGVlciwgZXJyb3IsIG9mZmVyKSA9PiAgICAgbG9nLmVycm9yKCdwZWVyIGVycm9yIHNlbmQgYW5zd2VyJywgcGVlciwgZXJyb3IsIG9mZmVyKSxcbiAgICAgICAgJ3BlZXIgZXJyb3IgY3JlYXRlIG9mZmVyJzogICAgICAgICAgICAocGVlciwgZXJyb3IpID0+ICAgICAgICAgICAgbG9nLmVycm9yKCdwZWVyIGVycm9yIGNyZWF0ZSBvZmZlcicsIHBlZXIsIGVycm9yKSxcbiAgICAgICAgJ3BlZXIgZXJyb3IgaWNlX2NhbmRpZGF0ZSc6ICAgICAgICAgICAocGVlciwgZXJyb3IsIGNhbmRpZGF0ZSkgPT4gbG9nLmVycm9yKCdwZWVyIGVycm9yIGljZV9jYW5kaWRhdGUnLCBwZWVyLCBlcnJvciwgY2FuZGlkYXRlKVxuICAgICAgfSk7XG5cbiAgICAgIC8vIFRPRE86IHJlbW92ZSB0aGVzZSBsaXN0ZW5lcnM/XG4gICAgICBwYXJ0aWNpcGFudHMub24oe1xuICAgICAgICAnYWRkJzogICAgcGFydGljaXBhbnQgPT4gZW1pdCgncGFydGljaXBhbnQgYWRkJywgcGFydGljaXBhbnQpLFxuICAgICAgICAncmVtb3ZlJzogcGFydGljaXBhbnQgPT4gZW1pdCgncGFydGljaXBhbnQgcmVtb3ZlJywgcGFydGljaXBhbnQpLFxuXG4gICAgICAgICdhY3RpdmUnOiBwYXJ0aWNpcGFudCA9PiB7XG4gICAgICAgICAgYWN0aXZlUGFydGljaXBhbnRzLnB1c2gocGFydGljaXBhbnQpO1xuICAgICAgICAgIGVtaXQoJ3BhcnRpY2lwYW50IGFjdGl2ZScsIHBhcnRpY2lwYW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICAnaW5hY3RpdmUnOiBwYXJ0aWNpcGFudCA9PiB7XG4gICAgICAgICAgbG9nKCdpbmFjdGl2ZScpO1xuICAgICAgICAgIF8ucmVtb3ZlKGFjdGl2ZVBhcnRpY2lwYW50cywge2lkOiBwYXJ0aWNpcGFudC5pZH0pO1xuICAgICAgICAgIGVtaXQoJ3BhcnRpY2lwYW50IGluYWN0aXZlJywgcGFydGljaXBhbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgICdzdHJlYW0gYWRkJzogICAgKHBhcnRpY2lwYW50LCBzdHJlYW0pID0+IHtcbiAgICAgICAgICBlbWl0KCdzdHJlYW0gYWRkJywgcGFydGljaXBhbnQsIHN0cmVhbSk7XG4gICAgICAgIH0sXG4gICAgICAgICdzdHJlYW0gcmVtb3ZlJzogKHBhcnRpY2lwYW50LCBzdHJlYW0pID0+IGVtaXQoJ3N0cmVhbSByZW1vdmUnLCBwYXJ0aWNpcGFudCwgc3RyZWFtKVxuICAgICAgfSk7XG5cbiAgICAgIGZ1bmN0aW9uIHJlYWR5KGhhbmRsZSkge1xuICAgICAgICB2YXIgbG9jYWxQYXJ0aWNpcGFudCA9IGluc3RhbnRDaGF0LmxvY2FsUGFydGljaXBhbnQgPSBwYXJ0aWNpcGFudHMuYWRkKHtpZDogaGFuZGxlLCBpc0xvY2FsOiB0cnVlLCBjb25maWc6IGNvbmZpZ30pO1xuICAgICAgICBpbnN0YW50Q2hhdC5jb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlKHNpZ25hbCwgbG9jYWxQYXJ0aWNpcGFudCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGpvaW5Sb29tKG5hbWUpIHtcbiAgICAgICAgaW5zdGFudENoYXQucm9vbU5hbWUgPSBuYW1lO1xuICAgICAgICBlbWl0KCdyb29tIGpvaW4nLCBuYW1lKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gbGVhdmVSb29tKG5hbWUpIHtcbiAgICAgICAgaW5zdGFudENoYXQucm9vbU5hbWUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgcGFydGljaXBhbnRzLnJlbW92ZUFsbEV4Y2VwdExvY2FsKCk7XG5cbiAgICAgICAgaW5zdGFudENoYXQubG9jYWxQYXJ0aWNpcGFudC5zdHJlYW1zLnJlbW92ZUFsbCgpO1xuXG4gICAgICAgIGVtaXQoJ3Jvb20gbGVhdmUnLCBuYW1lKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYnJvYWRjYXN0UmVhZHkocGVlcikge1xuICAgICAgICBjb25zb2xlLmxvZygnYnJvYWRjYXN0IHJlYWRseScsIHBlZXIsIGJyb2FkY2FzdFByb21pc2VGbnMpO1xuICAgICAgICBicm9hZGNhc3RQcm9taXNlRm5zLnJlc29sdmUocGVlcik7XG4gICAgICAgIGJyb2FkY2FzdFByb21pc2VGbnMucmVzb2x2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgYnJvYWRjYXN0UHJvbWlzZUZucy5yZWplY3QgPSB1bmRlZmluZWQ7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGJyb2FkY2FzdEVycm9yKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdicm9hZGNhc3QgZXJyb3InLCBlcnJvcik7XG4gICAgICAgIGJyb2FkY2FzdFByb21pc2VGbnMucmVqZWN0KGVycm9yKTtcbiAgICAgICAgYnJvYWRjYXN0UHJvbWlzZUZucy5yZXNvbHZlID0gdW5kZWZpbmVkO1xuICAgICAgICBicm9hZGNhc3RQcm9taXNlRm5zLnJlamVjdCA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBjb25uZWN0UHJvbWlzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgLy9OZWVkIHRvIGRvIG1vcmUgaGVyZVxuICAgIGNvbm5lY3RQcm9taXNlID0gbnVsbDtcbiAgICBfLmVhY2goaW5zdGFudENoYXQubG9jYWxQYXJ0aWNpcGFudC5zdHJlYW1zLCBzdHJlYW0gPT4gc3RyZWFtLnJhd1N0cmVhbS5fX2RvbmVXaXRoU3RyZWFtKCkpO1xuICAgIGluc3RhbnRDaGF0LnNpZ25hbC5jbG9zZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VuZE1lc3NhZ2UobWVzc2FnZSkge1xuXG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZUZpbGUoZmlsZSkge1xuXG4gIH1cblxuICBmdW5jdGlvbiBicm9hZGNhc3Qocm9vbU5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgaW5zdGFudENoYXQuc2lnbmFsLmFkbWluUm9vbShyb29tTmFtZSwge2NvbW1hbmQ6ICdicm9hZGNhc3QnfSk7XG4gICAgICBicm9hZGNhc3RQcm9taXNlRm5zLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgYnJvYWRjYXN0UHJvbWlzZUZucy5yZWplY3QgPSByZWplY3Q7XG4gICAgICBjb25zb2xlLmxvZyhicm9hZGNhc3RQcm9taXNlRm5zKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBpbnN0YW50Q2hhdDtcbn1dOyIsInZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbnZhciBnZXRVc2VyTWVkaWEgPSAobmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhKTtcbnZhciBnZXRNZWRpYURldmljZXMgPSBuYXZpZ2F0b3IuZ2V0TWVkaWFEZXZpY2VzIHx8IChNZWRpYVN0cmVhbVRyYWNrICYmIE1lZGlhU3RyZWFtVHJhY2suZ2V0U291cmNlcyA/IChNZWRpYVN0cmVhbVRyYWNrLmdldFNvdXJjZXMpIDogKCkgPT4geyByZXR1cm4gW107IH0pO1xuXG5cbm1vZHVsZS5leHBvcnRzID0gWyckcScsICckdGltZW91dCcsICgkcSwgJHRpbWVvdXQpID0+IHtcbiAgdmFyIHByb21pc2VzID0ge307XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRTdHJlYW06IG9wdGlvbnMgPT4ge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge2F1ZGlvOiB0cnVlLCB2aWRlbzogdHJ1ZX07XG5cbiAgICAgIHZhciBrZXkgPSAnJztcbiAgICAgIGlmIChvcHRpb25zLmF1ZGlvKSBrZXkgKz0gJ2F1ZGlvJztcbiAgICAgIGVsc2UgaWYgKG9wdGlvbnMuYXVkaW8gJiYgb3B0aW9ucy5hdWRpby5vcHRpb25hbCkga2V5ICs9IF8ucmVkdWNlKG9wdGlvbnMuYXVkaW8ub3B0aW9uYWwsIChrZXksIHNvdXJjZSkgPT4ga2V5ICsgc291cmNlLnNvdXJjZUlkLCBrZXkpO1xuICAgICAgaWYgKG9wdGlvbnMudmlkZW8pIGtleSArPSAndmlkZW8nO1xuICAgICAgZWxzZSBpZiAob3B0aW9ucy52aWRlbyAmJiBvcHRpb25zLnZpZGVvLm9wdGlvbmFsKSBrZXkgKz0gXy5yZWR1Y2Uob3B0aW9ucy52aWRlby5vcHRpb25hbCwgKGtleSwgc291cmNlKSA9PiBrZXkgKyBzb3VyY2Uuc291cmNlSWQsIGtleSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKCcjIyMjI3N0cmVhbSBrZXk6Jywga2V5KTtcblxuICAgICAgdmFyIGNyZWF0ZVByb21pc2UgPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjcmVhdGluZyBwcm9taXNlJywga2V5KTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBnZXRVc2VyTWVkaWEuY2FsbChuYXZpZ2F0b3IsIG9wdGlvbnMsIHN0cmVhbSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlLndhaXRGb3JFbmQgPSBuZXcgUHJvbWlzZSgod2FpdFJlc29sdmUsIHdhaXRSZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgdmFyIGVuZGVkID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZWxldGluZyBwcm9taXNlJywga2V5KTtcbiAgICAgICAgICAgICAgICBkZWxldGUgcHJvbWlzZXNba2V5XTtcbiAgICAgICAgICAgICAgICB3YWl0UmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgIC8vIERvZXNuJ3QgZXhpc3QgaW4gRkYgMzAuMCBMaW51eFxuICAgICAgICAgICAgICBpZiAoc3RyZWFtLmFkZEV2ZW50TGlzdGVuZXIpIHN0cmVhbS5hZGRFdmVudExpc3RlbmVyKCdlbmRlZCcsIGVuZGVkKTtcbiAgICAgICAgICAgICAgZWxzZSBzdHJlYW0ub25lbmRlZCA9IGVuZGVkO1xuXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnb3Qgc3RyZWFtJywgc3RyZWFtKTtcblxuICAgICAgICAgICAgICBzdHJlYW0uX19kb25lV2l0aFN0cmVhbSA9IF8ub25jZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2RvbmUgd2l0aCBzdHJlYW0nKTtcbiAgICAgICAgICAgICAgICBwcm9taXNlLnN0b3BUaW1lb3V0ID0gJHRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RpbWVkb3V0Jyk7XG4gICAgICAgICAgICAgICAgICBwcm9taXNlLnN0b3BUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgIHN0cmVhbS5zdG9wKCk7XG4gICAgICAgICAgICAgICAgICBwcm9taXNlLnN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICByZXNvbHZlKHN0cmVhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHZhciBwcm9taXNlID0gcHJvbWlzZXNba2V5XTtcblxuICAgICAgaWYgKHByb21pc2UpIHtcbiAgICAgICAgaWYgKHByb21pc2Uuc3RvcFRpbWVvdXQpIHtcbiAgICAgICAgICAkdGltZW91dC5jYW5jZWwocHJvbWlzZS5zdG9wVGltZW91dCk7XG4gICAgICAgICAgZGVsZXRlIHByb21pc2Uuc3RvcFRpbWVvdXQ7XG4gICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb21pc2Uuc3RvcHBlZCkge1xuICAgICAgICAgIHJldHVybiBwcm9taXNlLndhaXRGb3JFbmQudGhlbigoKSA9PiBwcm9taXNlc1trZXldID0gY3JlYXRlUHJvbWlzZSgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSBjcmVhdGVQcm9taXNlKCk7XG4gICAgICAgIHByb21pc2VzW2tleV0gPSBwcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9LFxuICAgIGdldERldmljZXM6ICgpID0+IHtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGdldE1lZGlhRGV2aWNlcyhkZXZpY2VzID0+IHtcbiAgICAgICAgdmFyIHJldCA9IHthdWRpbzpbXSwgdmlkZW86IFtdfTtcbiAgICAgICAgXy5lYWNoKGRldmljZXMsIGRldmljZSA9PiB7XG4gICAgICAgICAgaWYgKGRldmljZS5raW5kID09ICdhdWRpbycpIHJldC5hdWRpby5wdXNoKGRldmljZSk7XG4gICAgICAgICAgZWxzZSBpZiAoZGV2aWNlLmtpbmQgPT0gJ3ZpZGVvJykgcmV0LnZpZGVvLnB1c2goZGV2aWNlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUocmV0KTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG4gIH07XG59XTsiLCJ2YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFsnJHJlc291cmNlJywgKCRyZXNvdXJjZSkgPT4ge1xuICB2YXIgYnVmZmVyID0gW107XG5cbiAgdmFyIExvZyA9ICRyZXNvdXJjZSgnL2xvZycpO1xuXG4gIHZhciBtZXRob2RzID0ge2xvZywgZGVidWcsIGluZm8sIHN0YXR1cywgd2FybiwgZXJyb3J9O1xuXG4gIGZ1bmN0aW9uIGxvZyguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ0RFQlVHOicsIC4uLmFyZ3MpO1xuICAgIHNlbmQoJ2RlYnVnJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbmZvKC4uLmFyZ3MpIHtcbiAgICBjb25zb2xlLmxvZygnSU5GTzonLCAuLi5hcmdzKTtcbiAgICBzZW5kKCdpbmZvJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXMoLi4uYXJncykge1xuICAgIGNvbnNvbGUubG9nKCdTVEFUVVM6JywgLi4uYXJncyk7XG4gICAgc2VuZCgnc3RhdHVzJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcbiAgICBjb25zb2xlLmxvZygnV0FSTjonLCAuLi5hcmdzKTtcbiAgICBzZW5kKCd3YXJuJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBlcnJvciguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ0VSUk9SOicsIC4uLmFyZ3MpO1xuICAgIHNlbmQoJ2Vycm9yJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBzZW5kKGxldmVsLCAuLi5hcmdzKSB7XG4gICAgYnVmZmVyLnB1c2goe2xldmVsLCBhcmdzfSk7XG4gICAgZGVib3VuY2VkU2VuZCgpO1xuICB9XG5cbiAgdmFyIGRlYm91bmNlZFNlbmQgPSBfLmRlYm91bmNlKCgpID0+IHtcbiAgICBMb2cuc2F2ZSh7bG9nczogYnVmZmVyfSwgKCkgPT4ge1xuICAgICAgYnVmZmVyLnNwbGljZSgwKTtcbiAgICB9KTtcblxuICAgIGJ1ZmZlciA9IFtdO1xuICB9LCAxMDAsIHttYXhXYWl0OiA1MDB9KTtcblxuICByZXR1cm4gXy5leHRlbmQobWV0aG9kcy5sb2csIG1ldGhvZHMpO1xufV07IiwidmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBbJyR0aW1lb3V0JywgJ3J0YycsICdlbWl0dGVyJywgJ3N0cmVhbXMnLCAnaW5zdGFudENoYXRDaGFubmVsSGFuZGxlcicsXG4oJHRpbWVvdXQsIHJ0YywgZW1pdHRlciwgc3RyZWFtcywgaW5zdGFudENoYXRDaGFubmVsSGFuZGxlcikgPT4ge1xuICB2YXIgcGFydGljaXBhbnRzID0gW10sXG4gICAgICBwYXJ0aWNpcGFudHNNYXAgPSB7fSxcbiAgICAgIG5leHRPcmRpbmFsID0gMCxcbiAgICAgIHtlbWl0LCBvbiwgb2ZmfSA9IGVtaXR0ZXIoKTtcblxuICBfLmV4dGVuZChwYXJ0aWNpcGFudHMsIHtcbiAgICBhZGQ6IGFkZCxcbiAgICByZW1vdmU6IHJlbW92ZSxcbiAgICByZW1vdmVCeVBlZXI6IHJlbW92ZUJ5UGVlcixcbiAgICByZW1vdmVBbGxFeGNlcHRMb2NhbDogcmVtb3ZlQWxsRXhjZXB0TG9jYWwsXG5cbiAgICBnZXRCeUlEOiBnZXRCeUlELFxuXG4gICAgb246IG9uLFxuICAgIG9mZjogb2ZmXG4gIH0pO1xuXG4gIHJldHVybiBwYXJ0aWNpcGFudHM7XG5cbiAgZnVuY3Rpb24gYWRkKGNvbmZpZykge1xuICAgIGNvbnNvbGUubG9nKCdhZGRpbmcgcGFydGljaXBhbnQnLCBjb25maWcpO1xuXG4gICAgdmFyIHJlZ2lzdGVyZWRMaXN0ZW5lcnMgPSBbXTtcblxuICAgIHZhciBwZWVyID0gY29uZmlnLnBlZXI7XG5cbiAgICB2YXIgcGFydGljaXBhbnQgPSB7fTtcblxuICAgIF8uZXh0ZW5kKHBhcnRpY2lwYW50LCB7XG4gICAgICBpZDogJ2xvY2FsJyxcbiAgICAgIG9yZGluYWw6IG5leHRPcmRpbmFsKyssXG4gICAgICBjb25maWc6IHt9LFxuICAgICAgcGVlcjogcGVlcixcbiAgICAgIGlzQWN0aXZlOiAhIWNvbmZpZy5pc0xvY2FsLFxuICAgICAgaXNMb2NhbDogZmFsc2UsXG4gICAgICBzdHJlYW1zOiBzdHJlYW1zKHBhcnRpY2lwYW50KSxcblxuICAgICAgb246IG9uLFxuICAgICAgb2ZmOiBvZmYsXG5cbiAgICAgIF9yZWdpc3RlcmVkTGlzdGVuZXJzOiByZWdpc3RlcmVkTGlzdGVuZXJzXG4gICAgfSk7XG5cbiAgICBfLmV4dGVuZChwYXJ0aWNpcGFudCwgY29uZmlnKTtcblxuICAgIHBhcnRpY2lwYW50cy5wdXNoKHBhcnRpY2lwYW50KTtcblxuICAgIGlmIChwYXJ0aWNpcGFudC5pc0FjdGl2ZSkgJHRpbWVvdXQoKCkgPT4gZW1pdCgnYWN0aXZlJywgcGFydGljaXBhbnQpLCAxMDApO1xuXG4gICAgaWYgKHBlZXIpIHtcbiAgICAgIHBhcnRpY2lwYW50LmlkID0gcGVlci5pZDtcblxuICAgICAgXy5lYWNoKGNvbmZpZy5sb2NhbFN0cmVhbXMsIHN0cmVhbSA9PiBwZWVyLmFkZExvY2FsU3RyZWFtKHN0cmVhbS5yYXdTdHJlYW0pKTtcblxuICAgICAgbGlzdGVuVG8ocGVlciwge1xuICAgICAgICAncmVtb3RlU3RyZWFtIGFkZCc6IHN0cmVhbSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3JlbW90ZVN0cmVhbSBhZGQnLCBzdHJlYW0pO1xuICAgICAgICAgIHBhcnRpY2lwYW50LnN0cmVhbXMuYWRkKHN0cmVhbS5zdHJlYW0pO1xuICAgICAgICB9LFxuICAgICAgICAvL3RoaXMgZXZlbnQgZG9lc24ndCBleGlzdCB5ZXRcbiAgICAgICAgJ3JlbW90ZVN0cmVhbSByZW1vdmVkJzogc3RyZWFtID0+IHBhcnRpY2lwYW50LnN0cmVhbXMucmVtb3ZlKCksXG5cbiAgICAgICAgJ2Rpc2Nvbm5lY3RlZCc6ICgpID0+IHJlbW92ZShwYXJ0aWNpcGFudClcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGVlci5jb25maWcuaXNFeGlzdGluZ1BlZXIpIHtcbiAgICAgICAgdmFyIGNoYW5uZWwgPSBwZWVyLmFkZENoYW5uZWwoJ2luc3RhbnRDaGF0JywgbnVsbCwgaW5zdGFudENoYXRDaGFubmVsSGFuZGxlcigpKTtcbiAgICAgICAgcGVlci5jb25uZWN0KClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIHBlZXIgPT4ge1xuICAgICAgICAgICAgICBwYXJ0aWNpcGFudC5pc0FjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXJ0aWNpcGFudCBhY3RpdmUnKTtcbiAgICAgICAgICAgICAgZW1pdCgnYWN0aXZlJywgcGFydGljaXBhbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yID0+IGxvZy5lcnJvcihlcnJvcikpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHBlZXIub24oJ2NoYW5uZWwgYWRkJywgY2hhbm5lbCA9PiB7XG4gICAgICAgICAgaWYgKGNoYW5uZWwubGFiZWwgPT09ICdpbnN0YW50Q2hhdCcpIHtcbiAgICAgICAgICAgIGNoYW5uZWwuYXR0YWNoSGFuZGxlcihpbnN0YW50Q2hhdENoYW5uZWxIYW5kbGVyKCkpO1xuICAgICAgICAgICAgcGFydGljaXBhbnQuaXNBY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgZW1pdCgnYWN0aXZlJywgcGFydGljaXBhbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcGFydGljaXBhbnRzTWFwW3BhcnRpY2lwYW50LmlkXSA9IHBhcnRpY2lwYW50O1xuXG4gICAgbGlzdGVuVG8ocGFydGljaXBhbnQuc3RyZWFtcywge1xuICAgICAgJ2FkZCc6IHN0cmVhbSA9PiB7XG4gICAgICAgIC8vIFRoaXMgbWF5IGJlIHRoZSBsb2NhbCBQYXJ0aWNpcGFudCwgd2hpY2ggZG9lc24ndCBoYXZlIGEgcGVlci4uLlxuICAgICAgICAvLyBQcm9iYWJseSBub3QgYSBnb29kIHNpZ24gdGhhdCB3ZSBhcmUgaGF2aW5nIHRvIGNoZWNrIHRoaXMgaGVyZT9cbiAgICAgICAgaWYgKHBlZXIgJiYgcGVlci5yZW1vdGVTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKSA9PSAtMSAmJlxuICAgICAgICAgICAgcGVlci5sb2NhbFN0cmVhbXMuaW5kZXhPZihzdHJlYW0pID09IC0xKSB7XG4gICAgICAgICAgcGVlci5hZGRMb2NhbFN0cmVhbShzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICAgIGVtaXQoJ3N0cmVhbSBhZGQnLCBwYXJ0aWNpcGFudCwgc3RyZWFtKTtcbiAgICAgIH0sXG4gICAgICAncmVtb3ZlJzogc3RyZWFtID0+IGVtaXQoJ3N0cmVhbSByZW1vdmUnLCBwYXJ0aWNpcGFudCwgc3RyZWFtKVxuICAgIH0pO1xuXG4gICAgZW1pdCgnYWRkJywgcGFydGljaXBhbnQpO1xuXG4gICAgZnVuY3Rpb24gbGlzdGVuVG8ob2JqLCBsaXN0ZW5lcnMpIHtcbiAgICAgIHJlZ2lzdGVyZWRMaXN0ZW5lcnMucHVzaChvYmoub24obGlzdGVuZXJzKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcnRpY2lwYW50O1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlKHBhcnRpY2lwYW50KSB7XG4gICAgY29uc29sZS5sb2coJ3JlbW92aW5nJywgcGFydGljaXBhbnQsICdmcm9tJywgcGFydGljaXBhbnRzKTtcbiAgICBwYXJ0aWNpcGFudC5pc0FjdGl2ZSA9IGZhbHNlO1xuICAgIGVtaXQoJ2luYWN0aXZlJywgcGFydGljaXBhbnQpO1xuXG4gICAgdmFyIHBlZXIgPSBwYXJ0aWNpcGFudC5wZWVyO1xuICAgIGlmIChwZWVyKSBkZWxldGUgcGFydGljaXBhbnRzTWFwW3BlZXIuaWRdO1xuXG4gICAgdmFyIGluZGV4ID0gXy5pbmRleE9mKHBhcnRpY2lwYW50cywgcGFydGljaXBhbnQpO1xuICAgIGlmIChpbmRleCA+PSAwKSBwYXJ0aWNpcGFudHMuc3BsaWNlKGluZGV4LCAxKTtcblxuICAgIGRlc3Ryb3kocGFydGljaXBhbnQpO1xuXG4gICAgY29uc29sZS5sb2cocGFydGljaXBhbnRzKTtcblxuICAgIGVtaXQoJ3JlbW92ZScsIFtwYXJ0aWNpcGFudF0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZGVzdHJveShwYXJ0aWNpcGFudCkge1xuICAgIHBhcnRpY2lwYW50LnBlZXIuY2xvc2UoKTtcblxuICAgIF8uZWFjaChwYXJ0aWNpcGFudC5fcmVnaXN0ZXJlZExpc3RlbmVycywgbGlzdGVuZXJzID0+IHtcbiAgICAgIF8uZWFjaChsaXN0ZW5lcnMsIHVucmVnID0+IHVucmVnKCkpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVtb3ZlQnlQZWVyKHBlZXIpIHtcbiAgICB2YXIgcGFydGljaXBhbnQgPSBfLmZpbmQocGFydGljaXBhbnRzLCB7cGVlcjoge2lkOiBwZWVyLmlkfX0pO1xuICAgIGlmIChwYXJ0aWNpcGFudCkgcmVtb3ZlKHBhcnRpY2lwYW50KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZUFsbEV4Y2VwdExvY2FsKCkge1xuICAgIHZhciByZW1vdmVkID0gXy5yZW1vdmUocGFydGljaXBhbnRzLCBwYXJ0aWNpcGFudCA9PiB7XG4gICAgICBpZiAoIXBhcnRpY2lwYW50LmlzTG9jYWwpIHtcbiAgICAgICAgZGVzdHJveShwYXJ0aWNpcGFudCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgZW1pdCgncmVtb3ZlJywgcmVtb3ZlZCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRCeUlEKGlkKSB7XG4gICAgcmV0dXJuIHBhcnRpY2lwYW50c01hcFtpZF07XG4gIH1cbn1dOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9uTWVzc2FnZSkge1xuICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgQ2hhdFJlY2VpdmUnKTtcbiAgICBcbiAgICByZXR1cm4ge1xuICAgICAgaGFuZGxlcnM6IHtcbiAgICAgICAgb3BlbjogY2hhbm5lbCA9PiBjb25zb2xlLmxvZygnY2hhdCBvcGVuJyksXG4gICAgICAgIGNsb3NlOiBjaGFubmVsID0+IHsgfSxcbiAgICAgICAgZXJyb3I6IChjaGFubmVsLCBlcnJvcikgPT4geyB9LFxuICAgICAgICBtZXNzYWdlOiAoY2hhbm5lbCwgZXZlbnQpID0+IG9uTWVzc2FnZShjaGFubmVsLCBKU09OLnBhcnNlKGV2ZW50LmRhdGEpKVxuICAgICAgfVxuICAgIH1cbiAgfVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuXG4gIGZ1bmN0aW9uIHNlbmRNZXNzYWdlVG9BbGwocGVlcnMsIG1lc3NhZ2UpIHtcbiAgICBfLmVhY2gocGVlcnMsIHBlZXIgPT4gc2VuZE1lc3NhZ2UocGVlciwgbWVzc2FnZSkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2VuZE1lc3NhZ2UocGVlciwgbWVzc2FnZSkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgY2hhdENoYW5uZWwgPSBwZWVyLmNoYW5uZWwoJ2NoYXQnKTtcbiAgICAgIGlmIChjaGF0Q2hhbm5lbCkgY2hhdENoYW5uZWwuc2VuZEpTT04obWVzc2FnZSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZygnQ2hhdCBzZW5kIGVycm9yJywgZSwgY2hhdENoYW5uZWwsIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1lc3NhZ2VIYW5kbGVyKGNoYW5uZWwsIG1lc3NhZ2UsIHBlZXJzLCBvbk1lc3NhZ2UpIHtcbiAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShtZXNzYWdlKTtcblxuICAgIHNlbmRNZXNzYWdlVG9BbGwocGVlcnMsIG1lc3NhZ2UpO1xuXG4gICAgb25NZXNzYWdlKGNoYW5uZWwsIG1lc3NhZ2UpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHBlZXJzLCBvbk1lc3NhZ2UpIHtcbiAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIENoYXRTZXJ2ZScpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNlbmRNZXNzYWdlVG9BbGw6IG1lc3NhZ2UgPT4gc2VuZE1lc3NhZ2VUb0FsbChwZWVycywgbWVzc2FnZSksXG4gICAgICBzZW5kTWVzc2FnZTogc2VuZE1lc3NhZ2UsXG4gICAgICBoYW5kbGVyczoge1xuICAgICAgICBvcGVuOiBjaGFubmVsID0+IGNvbnNvbGUubG9nKCdjaGF0IG9wZW5lZCcpLFxuICAgICAgICBjbG9zZTogY2hhbm5lbCA9PiB7fSxcbiAgICAgICAgZXJyb3I6IChjaGFubmVsLCBlcnJvcikgPT4ge30sXG4gICAgICAgIG1lc3NhZ2U6IChjaGFubmVsLCBldmVudCkgPT4gbWVzc2FnZUhhbmRsZXIoY2hhbm5lbCwgZXZlbnQuZGF0YSwgcGVlcnMsIG9uTWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG4gIH07XG59OyIsInZhciBydGMgPSByZXF1aXJlKCcuLi8uLi8uLi91dGlsL3J0Yy9ydGMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBbJ2xvZycsICdlbWl0dGVyJywgJ3NpZ25hbGVyJywgcnRjXTsiLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgcmV0dXJuICRzY29wZSA9PiB7XG4gICAgcmV0dXJuIGNoYW5uZWwgPT4ge1xuXG4gICAgICBmdW5jdGlvbiBtZXNzYWdlKGNoYW5uZWwsIGV2ZW50KSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb3BlbihjaGFubmVsKSB7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2xvc2UoY2hhbm5lbCkge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGVycm9yKGNoYW5uZWwsIGVycm9yKSB7XG5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ21lc3NhZ2UnOiBtZXNzYWdlLFxuICAgICAgICAnb3Blbic6IG9wZW4sXG4gICAgICAgICdjbG9zZSc6IGNsb3NlLFxuICAgICAgICAnZXJyb3InOiBlcnJvclxuICAgICAgfTtcbiAgICB9O1xuICB9O1xufTsiLCJ2YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFsnbG9nJywgJyRlbWl0JywgJ2NvbmZpZycsICdwYXJ0aWNpcGFudHMnLCAobG9nLCAkZW1pdCwgY29uZmlnLCBwYXJ0aWNpcGFudHMpID0+IHtcbiAgY29uZmlnLm9uKCckY2hhbmdlJywgXy5kZWJvdW5jZSgoKSA9PiBfLmVhY2gocGFydGljaXBhbnRzLCBwID0+IHNlbmRDb25maWcocCkpKSk7XG5cbiAgZnVuY3Rpb24gc2VuZENvbmZpZyhwYXJ0aWNpcGFudCkge1xuICAgIHNlbmRNZXNzYWdlKHBhcnRpY2lwYW50LCB7XG4gICAgICB0eXBlOiAnY29uZmlnJyxcbiAgICAgIGNvbmZpZzogY29uZmlnXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZW5kVG9nZ2xlVm90ZVVwKHN0cmVhbSwgdm90ZVVwU3RhdHVzKSB7XG4gICAgY29uc29sZS5sb2coc3RyZWFtKTtcbiAgICBzZW5kTWVzc2FnZVRvQWxsKHtcbiAgICAgIHR5cGU6ICd2b3RlVXAnLFxuICAgICAgcGVlcklEOiBzdHJlYW0ucGFydGljaXBhbnQuaWQsXG4gICAgICBzdHJlYW1JRDogc3RyZWFtLmlkLFxuICAgICAgc3RhdHVzOiB2b3RlVXBTdGF0dXNcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmRUb2dnbGVWb3RlRG93bihzdHJlYW0sIHZvdGVEb3duU3RhdHVzKSB7XG4gICAgc2VuZE1lc3NhZ2VUb0FsbCh7XG4gICAgICB0eXBlOiAndm90ZURvd24nLFxuICAgICAgcGVlcklEOiBzdHJlYW0ucGFydGljaXBhbnQuaWQsXG4gICAgICBzdHJlYW1JRDogc3RyZWFtLmlkLFxuICAgICAgc3RhdHVzOiB2b3RlRG93blN0YXR1c1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVjZWl2ZUNvbmZpZyhmcm9tUGFydGljaXBhbnQsIHBlZXJJRCwgY29uZmlnKSB7XG4gICAgdmFyIHRhcmdldFBhcnRpY2lwYW50ID0gcGFydGljaXBhbnRzLmdldEJ5SUQocGVlcklEKTtcblxuICAgIGZyb21QYXJ0aWNpcGFudC5jb25maWcgPSBjb25maWc7XG5cbiAgICAkZW1pdCgncGFydGljaXBhbnQgY29uZmlnJywge2Zyb206IGZyb21QYXJ0aWNpcGFudCwgdG86IHRhcmdldFBhcnRpY2lwYW50LCBjb25maWc6IGNvbmZpZ30pO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVjZWl2ZVRvZ2dsZVZvdGVVcChmcm9tUGFydGljaXBhbnQsIHBlZXJJRCwgc3RyZWFtSUQsIHZvdGVVcFN0YXR1cykge1xuICAgIGNvbnNvbGUubG9nKHBlZXJJRCwgcGFydGljaXBhbnRzKTtcbiAgICB2YXIgdGFyZ2V0UGFydGljaXBhbnQgPSBwYXJ0aWNpcGFudHMuZ2V0QnlJRChwZWVySUQpLFxuICAgICAgICB0YXJnZXRTdHJlYW0gPSBfLmZpbmQodGFyZ2V0UGFydGljaXBhbnQuc3RyZWFtcywge2lkOiBzdHJlYW1JRH0pO1xuXG4gICAgY29uc29sZS5sb2coJ2dvdCB2b3RlIHVwJyk7XG4gICAgJGVtaXQoJ3N0cmVhbSB2b3RlIHVwJywge2Zyb206IGZyb21QYXJ0aWNpcGFudCwgdG86IHRhcmdldFBhcnRpY2lwYW50LCBzdHJlYW06IHRhcmdldFN0cmVhbSwgc3RhdHVzOiB2b3RlVXBTdGF0dXN9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2VpdmVUb2dnbGVWb3RlRG93bihmcm9tUGFydGljaXBhbnQsIHBlZXJJRCwgc3RyZWFtSUQsIHZvdGVEb3duU3RhdHVzKSB7XG4gICAgdmFyIHRhcmdldFBhcnRpY2lwYW50ID0gcGFydGljaXBhbnRzLmdldEJ5SUQocGVlcklEKSxcbiAgICAgICAgdGFyZ2V0U3RyZWFtID0gXy5maW5kKHRhcmdldFBhcnRpY2lwYW50LnN0cmVhbXMsIHtpZDogc3RyZWFtSUR9KTtcblxuICAgICRlbWl0KCdzdHJlYW0gdm90ZSBkb3duJywge2Zyb206IGZyb21QYXJ0aWNpcGFudCwgdG86IHRhcmdldFBhcnRpY2lwYW50LCBzdHJlYW06IHRhcmdldFN0cmVhbSwgc3RhdHVzOiB2b3RlRG93blN0YXR1c30pO1xuICB9XG5cbiAgdmFyIG1lc3NhZ2VIYW5kbGVycyA9IHtcbiAgICAndm90ZVVwJzogKHBhcnRpY2lwYW50LCBkYXRhKSA9PiByZWNlaXZlVG9nZ2xlVm90ZVVwKHBhcnRpY2lwYW50LCBkYXRhLnBlZXJJRCwgZGF0YS5zdHJlYW1JRCwgZGF0YS5zdGF0dXMpLFxuICAgICd2b3RlRG93bic6IChwYXJ0aWNpcGFudCwgZGF0YSkgPT4gcmVjZWl2ZVRvZ2dsZVZvdGVEb3duKHBhcnRpY2lwYW50LCBkYXRhLnBlZXJJRCwgZGF0YS5zdHJlYW1JRCwgZGF0YS5zdGF0dXMpLFxuICAgICdjb25maWcnOiAocGFydGljaXBhbnQsIGRhdGEpID0+IHJlY2VpdmVDb25maWcocGFydGljaXBhbnQsIGRhdGEucGVlcklELCBkYXRhLmNvbmZpZylcbiAgfTtcblxuICBwYXJ0aWNpcGFudHMub24oe1xuICAgICdhY3RpdmUnOiBhZGRQYXJ0aWNpcGFudCxcbiAgICAnaW5hY3RpdmUnOiByZW1vdmVQYXJ0aWNpcGFudFxuICB9KTtcblxuICBmdW5jdGlvbiBhZGRQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCkge1xuICAgIC8vIFRoaXMgbWF5IGJlIHRoZSBsb2NhbCBwYXJ0aWNpcGFudCwgd2hpY2ggZG9lc24ndCBoYXZlIGEgcGVlclxuICAgIGlmICghcGFydGljaXBhbnQuaXNMb2NhbCkge1xuICAgICAgcGFydGljaXBhbnRcbiAgICAgICAgLnBlZXJcbiAgICAgICAgLmNoYW5uZWwoJ2luc3RhbnRDaGF0JylcbiAgICAgICAgLnRoZW4oY2hhbm5lbCA9PiB7XG4gICAgICAgICAgY2hhbm5lbC5vbignbWVzc2FnZScsIChjaGFubmVsLCBldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coY2hhbm5lbCwgZXZlbnQpO1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgbWVzc2FnZUhhbmRsZXJzW21lc3NhZ2UudHlwZV0ocGFydGljaXBhbnQsIG1lc3NhZ2UpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGNoYW5uZWwuY2hhbm5lbC5yZWFkeVN0YXRlID09ICdvcGVuJykgc2VuZENvbmZpZyhwYXJ0aWNpcGFudCk7XG4gICAgICAgICAgZWxzZSBjaGFubmVsLm9uKCdvcGVuJywgKCkgPT4gc2VuZENvbmZpZyhwYXJ0aWNpcGFudCkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVQYXJ0aWNpcGFudChwYXJ0aWNpcGFudCkge1xuICAgIC8vIFNob3VsZCBjbGVhbiB1cCBldmVudCBoYW5kbGVycz8gWWVzLCBwcm9iYWJseVxuICB9XG5cbiAgZnVuY3Rpb24gc2VuZE1lc3NhZ2VUb0FsbChtZXNzYWdlKSB7XG4gICAgXy5lYWNoKHBhcnRpY2lwYW50cywgcGFydGljaXBhbnQgPT4gc2VuZE1lc3NhZ2UocGFydGljaXBhbnQsIG1lc3NhZ2UpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmRNZXNzYWdlKHBhcnRpY2lwYW50LCBtZXNzYWdlKSB7XG4gICAgaWYgKCFwYXJ0aWNpcGFudC5pc0xvY2FsKSB7XG4gICAgICB0cnkge1xuICAgICAgICAgIHZhciBwZWVyID0gcGFydGljaXBhbnQucGVlcjtcblxuICAgICAgICAgIGNvbnNvbGUubG9nKCdzZW5kaW5nJywgbWVzc2FnZSwgJ3RvJywgcGFydGljaXBhbnQpO1xuICAgICAgICAgIHBlZXIuY2hhbm5lbCgnaW5zdGFudENoYXQnKS50aGVuKGNoYW5uZWwgPT4gY2hhbm5lbC5zZW5kSlNPTihtZXNzYWdlKSk7XG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBsb2cuZXJyb3IoJ0NoYXQgc2VuZCBlcnJvcicsIGUsIGNoYXRDaGFubmVsLCBtZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGFkZFBhcnRpY2lwYW50OiBhZGRQYXJ0aWNpcGFudCxcbiAgICByZW1vdmVQYXJ0aWNpcGFudDogcmVtb3ZlUGFydGljaXBhbnQsXG4gICAgc2VuZFRvZ2dsZVZvdGVVcDogc2VuZFRvZ2dsZVZvdGVVcCxcbiAgICBzZW5kVG9nZ2xlVm90ZURvd246IHNlbmRUb2dnbGVWb3RlRG93blxuICB9O1xufV07IiwidmFyIHNpZ25hbGVyID0gcmVxdWlyZSgnLi4vLi4vLi4vLi4vdXRpbC9ydGMvc2lnbmFsZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBbJ2VtaXR0ZXInLCBzaWduYWxlcl07IiwibW9kdWxlLmV4cG9ydHMgPSBbJyRzY2UnLCAnZW1pdHRlcicsICgkc2NlLCBlbWl0dGVyKSA9PiB7XG4gIHJldHVybiBwYXJ0aWNpcGFudCA9PiB7XG4gICAgY29uc29sZS5sb2coJ3BhcnRpY2lwYW50JywgcGFydGljaXBhbnQpO1xuICAgIHZhciBzdHJlYW1zID0gW10sXG4gICAgICAgIG5leHRPcmRpbmFsID0gMCxcbiAgICAgICAge2VtaXQsIG9uLCBvZmZ9ID0gZW1pdHRlcigpO1xuXG4gICAgXy5leHRlbmQoc3RyZWFtcywge1xuICAgICAgYWRkOiBhZGQsXG4gICAgICByZW1vdmU6IHJlbW92ZSxcbiAgICAgIHJlbW92ZUFsbDogcmVtb3ZlQWxsLFxuXG4gICAgICBjb250YWluczogY29udGFpbnMsXG5cbiAgICAgIG9uOiBvbixcbiAgICAgIG9mZjogb2ZmXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3RyZWFtcztcblxuICAgIGZ1bmN0aW9uIGFkZChyYXdTdHJlYW0pIHtcbiAgICAgIGNvbnNvbGUubG9nKCdhZGRpbmcgc3RyZWFtJywgcmF3U3RyZWFtKTtcbiAgICAgIHZhciBzdHJlYW0gPSBjcmVhdGVTdHJlYW0ocmF3U3RyZWFtKTtcblxuICAgICAgc3RyZWFtcy5wdXNoKHN0cmVhbSk7XG5cbiAgICAgIGVtaXQoJ2FkZCcsIHN0cmVhbSk7XG5cbiAgICAgIHJldHVybiBzdHJlYW07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVtb3ZlKHN0cmVhbSkge1xuICAgICAgc3RyZWFtLnJhd1N0cmVhbS5fX2RvbmVXaXRoU3RyZWFtKCk7XG4gICAgICBfLnJlbW92ZShzdHJlYW1zLCB7aWQ6IHN0cmVhbS5pZH0pO1xuICAgICAgZW1pdCgncmVtb3ZlJywgc3RyZWFtKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVBbGwoKSB7XG4gICAgICBmb3IgKHZhciBpID0gc3RyZWFtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICByZW1vdmUoc3RyZWFtc1tpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29udGFpbnMoc3RyZWFtKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgc3RyZWFtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc3RyZWFtc1tpXS5yYXdTdHJlYW0gPT09IHN0cmVhbSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlU3RyZWFtKHJhd1N0cmVhbSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb3JkaW5hbDogbmV4dE9yZGluYWwrKyxcbiAgICAgICAgaWQ6IHJhd1N0cmVhbS5pZCxcbiAgICAgICAgcGFydGljaXBhbnQ6IHBhcnRpY2lwYW50LFxuICAgICAgICByYXdTdHJlYW06IHJhd1N0cmVhbSxcbiAgICAgICAgdm90ZXM6IFtdLCAvLyBJcyB0aGlzIHdoZXJlIHdlIHNob3VsZCBiZSB0cmFja2luZyB0aGVzZT9cbiAgICAgICAgc3JjOiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChVUkwuY3JlYXRlT2JqZWN0VVJMKHJhd1N0cmVhbSkpXG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1dOyIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgZnVuY3Rpb24gY2FwdHVyZUZyYW1lKHZpZGVvLCBvcHRpb25zLCBjYWxsYmFjaywgaXRlcmF0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGl0ZXJhdGlvbnMgPSBpdGVyYXRpb25zIHx8IDA7XG5cbiAgICBjYW52YXMud2lkdGggPSB2aWRlby52aWRlb1N1cmZhY2VXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gdmlkZW8udmlkZW9TdXJmYWNlSGVpZ2h0O1xuXG4gICAgaWYgKG9wdGlvbnMud2lkdGggJiYgIW9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICBvcHRpb25zLmhlaWdodCA9IG9wdGlvbnMud2lkdGggKiAoY2FudmFzLmhlaWdodCAvIGNhbnZhcy53aWR0aCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKCFvcHRpb25zLndpZHRoICYmIG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgICBvcHRpb25zLndpZHRoID0gb3B0aW9ucy5oZWlnaHQgKiAoY2FudmFzLndpZHRoIC8gY2FudmFzLndpZHRoKTtcbiAgICB9XG5cbiAgICBvcHRpb25zLndpZHRoID0gb3B0aW9ucy53aWR0aCB8fCBjYW52YXMud2lkdGg7XG4gICAgb3B0aW9ucy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCBjYW52YXMuaGVpZ2h0O1xuXG4gICAgY2FudmFzLndpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG5cbiAgICB0cnkge1xuICAgICAgY29udGV4dC5kcmF3SW1hZ2UodmlkZW8sIDAsIDAsIG9wdGlvbnMud2lkdGgsIG9wdGlvbnMuaGVpZ2h0KTtcbiAgICAgIGNhbGxiYWNrKGNhbnZhcy50b0RhdGFVUkwoKSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAvLyBUaGVyZSBpcyBhIEZGIGJ1ZyB0aGF0IGNhdXNlcyB0aGlzIHRvIGZhaWwgaW50ZXJtaXRlbnRseS4gV29ya2Fyb3VuZCBpcyB0byBqdXN0IHJldHJ5IGxhdGVyLi4uXG4gICAgICBpZiAoZS5uYW1lID09ICdOU19FUlJPUl9OT1RfQVZBSUxBQkxFJyAmJiBpdGVyYXRpb25zIDwgNSkge1xuICAgICAgICBzZXRUaW1lb3V0KGNhcHR1cmVGcmFtZSwgMTAwLCB2aWRlbywgb3B0aW9ucywgY2FsbGJhY2ssIGl0ZXJhdGlvbnMgKyAxKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGNhcHR1cmVGcmFtZTogY2FwdHVyZUZyYW1lXG4gIH07XG59OyIsIm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICByZXR1cm4gbGlzdGVuZXJJbnRlcmNlcHRvciA9PiB7XG4gICAgdmFyIGV2ZW50cyA9IHt9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGVtaXQ6ICguLi5hcmdzKSA9PiBlbWl0KGV2ZW50cywgLi4uYXJncyksXG4gICAgICBvbjogKC4uLmFyZ3MpID0+IG9uKGV2ZW50cywgbGlzdGVuZXJJbnRlcmNlcHRvciwgLi4uYXJncyksXG4gICAgICBvZmY6ICguLi5hcmdzKSA9PiBvZmYoZXZlbnRzLCAuLi5hcmdzKVxuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gZW1pdChldmVudHMsIGV2ZW50KSB7XG4gICAgdmFyIGxpc3RlbmVycyA9IGV2ZW50c1tldmVudF0gfHwgW10sXG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvbihldmVudHMsIGxpc3RlbmVySW50ZXJjZXB0b3IsIGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgPT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciB1bnJlZ2lzdGVyID0gKCkgPT4gXy5lYWNoKHVucmVnaXN0ZXIsIGZuID0+IGZuKCkpO1xuICAgICAgcmV0dXJuIF8udHJhbnNmb3JtKGV2ZW50LCAocmVzdWx0LCBsaXN0ZW5lciwgZXZlbnROYW1lKSA9PiB7XG4gICAgICAgIHJlc3VsdFtldmVudE5hbWVdID0gb24oZXZlbnRzLCBsaXN0ZW5lckludGVyY2VwdG9yLCBldmVudE5hbWUsIGxpc3RlbmVyKTtcbiAgICAgIH0sIHVucmVnaXN0ZXIpO1xuICAgIH1cblxuICAgIGlmIChsaXN0ZW5lckludGVyY2VwdG9yKSB7XG4gICAgICB2YXIgcmV0ID0gbGlzdGVuZXJJbnRlcmNlcHRvci5hdHRlbXB0SW50ZXJjZXB0KGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICBpZiAocmV0KSByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGV2ZW50c1tldmVudF0gPSBldmVudHNbZXZlbnRdIHx8IFtdO1xuICAgIGV2ZW50c1tldmVudF0ucHVzaChsaXN0ZW5lcik7XG5cbiAgICByZXR1cm4gKCkgPT4gb2ZmKGV2ZW50cywgZXZlbnQsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9mZihldmVudHMsIGV2ZW50LCBsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgPT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGV2ZW50TmFtZSBpbiBldmVudCkgb2ZmKGV2ZW50cywgZXZlbnROYW1lLCBldmVudFtldmVudE5hbWVdKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gZXZlbnRzW2V2ZW50XTtcbiAgICBpZiAobGlzdGVuZXJzICYmIGxpc3RlbmVycy5sZW5ndGggPiAwKSB7XG4gICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcnMsIGxpc3RlbmVyKTtcbiAgICAgIGlmIChsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSBkZWxldGUgZXZlbnRzW2V2ZW50XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcnMsIGxpc3RlbmVyKSB7XG4gICAgICBmb3IgKHZhciBpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChsaXN0ZW5lcnNbaV0gPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGxpc3RlbmVycztcbiAgICB9XG4gIH1cbn07IiwidmFyIF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIHZhciBtZXRob2RzID0ge2xvZywgZGVidWcsIGluZm8sIHN0YXR1cywgd2FybiwgZXJyb3J9O1xuXG4gIGZ1bmN0aW9uIGxvZyguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBkZWJ1ZyguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ0RFQlVHOicsIC4uLmFyZ3MpO1xuICAgIHNlbmQoJ2RlYnVnJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbmZvKC4uLmFyZ3MpIHtcbiAgICBjb25zb2xlLmxvZygnSU5GTzonLCAuLi5hcmdzKTtcbiAgICBzZW5kKCdpbmZvJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXMoLi4uYXJncykge1xuICAgIGNvbnNvbGUubG9nKCdTVEFUVVM6JywgLi4uYXJncyk7XG4gICAgc2VuZCgnc3RhdHVzJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiB3YXJuKC4uLmFyZ3MpIHtcbiAgICBjb25zb2xlLmxvZygnV0FSTjonLCAuLi5hcmdzKTtcbiAgICBzZW5kKCd3YXJuJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBlcnJvciguLi5hcmdzKSB7XG4gICAgY29uc29sZS5sb2coJ0VSUk9SOicsIC4uLmFyZ3MpO1xuICAgIHNlbmQoJ2Vycm9yJywgbmV3IERhdGUoKSwgLi4uYXJncyk7XG4gIH1cblxuICBmdW5jdGlvbiBzZW5kKGxldmVsLCAuLi5hcmdzKSB7XG4gICAgLy8gYnVmZmVyLnB1c2goe2xldmVsLCBhcmdzfSk7XG4gICAgLy8gZGVib3VuY2VkU2VuZCgpO1xuICB9XG5cbiAgdmFyIGRlYm91bmNlZFNlbmQgPSBfLmRlYm91bmNlKCgpID0+IHtcbiAgICBMb2cuc2F2ZSh7bG9nczogYnVmZmVyfSwgKCkgPT4ge1xuICAgICAgYnVmZmVyLnNwbGljZSgwKTtcbiAgICB9KTtcblxuICAgIGJ1ZmZlciA9IFtdO1xuICB9LCAxMDAsIHttYXhXYWl0OiA1MDB9KTtcblxuICByZXR1cm4gXy5leHRlbmQobWV0aG9kcy5sb2csIG1ldGhvZHMpO1xufTsiLCJjbGFzcyBDaGFubmVsIHtcbiAgY29uc3RydWN0b3IocGVlciwgY2hhbm5lbCwgY2hhbm5lbEhhbmRsZXIpIHtcbiAgICB0aGlzLl9jaGFubmVsID0gY2hhbm5lbDtcbiAgICB0aGlzLl9wZWVyID0gcGVlcjtcblxuICAgIHRoaXMuYXR0YWNoSGFuZGxlcihjaGFubmVsSGFuZGxlcik7XG4gIH1cblxuICBzZW5kKGRhdGEpIHsgdGhpcy5fY2hhbm5lbC5zZW5kKGRhdGEpOyB9XG4gIHNlbmRKU09OKGRhdGEpIHsgdGhpcy5fY2hhbm5lbC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTsgfVxuXG4gIGdldCBsYWJlbCgpIHsgcmV0dXJuIHRoaXMuX2NoYW5uZWwubGFiZWw7IH1cbiAgZ2V0IGNoYW5uZWwoKSB7IHJldHVybiB0aGlzLl9jaGFubmVsOyB9XG4gIGdldCBwZWVyKCkgeyByZXR1cm4gdGhpcy5fcGVlcjsgfVxuXG4gIGF0dGFjaEhhbmRsZXIoY2hhbm5lbEhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIGNoYW5uZWxIYW5kbGVyID09PSAnZnVuY3Rpb24nKSBjaGFubmVsSGFuZGxlciA9IGNoYW5uZWxIYW5kbGVyKHRoaXMuX2NoYW5uZWwpO1xuXG4gICAgdGhpcy5vbihjaGFubmVsSGFuZGxlciB8fCB7fSk7XG4gIH1cblxuICAvKlxuICArICBFdmVudCBIYW5kbGluZ1xuICAqL1xuICBvbihldmVudCwgbGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50ID09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKHZhciBldmVudE5hbWUgaW4gZXZlbnQpIHRoaXMub24oZXZlbnROYW1lLCBldmVudFtldmVudE5hbWVdKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGFubmVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50ID0+IGxpc3RlbmVyKHRoaXMsIGV2ZW50KSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICAvKlxuICAtICBFdmVudCBIYW5kbGluZ1xuICAqL1xufVxuXG5leHBvcnQge0NoYW5uZWx9OyIsImltcG9ydCB7Q2hhbm5lbH0gZnJvbSAnLi9jaGFubmVsJztcbmltcG9ydCB7U3RyZWFtfSBmcm9tICcuL3N0cmVhbSc7XG5cbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgZW1pdHRlciA9IHJlcXVpcmUoJy4uL2VtaXR0ZXInKSgpO1xuXG5cbnZhciBSVENQZWVyQ29ubmVjdGlvbiA9ICh3aW5kb3cuUGVlckNvbm5lY3Rpb24gfHwgd2luZG93LndlYmtpdFBlZXJDb25uZWN0aW9uMDAgfHwgd2luZG93LndlYmtpdFJUQ1BlZXJDb25uZWN0aW9uIHx8IHdpbmRvdy5tb3pSVENQZWVyQ29ubmVjdGlvbik7XG52YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gKHdpbmRvdy5tb3pSVENTZXNzaW9uRGVzY3JpcHRpb24gfHwgd2luZG93LlJUQ1Nlc3Npb25EZXNjcmlwdGlvbik7XG52YXIgUlRDSWNlQ2FuZGlkYXRlID0gKHdpbmRvdy5tb3pSVENJY2VDYW5kaWRhdGUgfHwgd2luZG93LlJUQ0ljZUNhbmRpZGF0ZSk7XG5cbnZhciBDT05ORUNUSU9OX0VWRU5UUyA9IFsnbmVnb3RpYXRpb25fbmVlZGVkJywgJ2ljZV9jYW5kaWRhdGUnLCAnc2lnbmFsaW5nX3N0YXRlX2NoYW5nZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZF9zdHJlYW0nLCAncmVtb3ZlX3N0cmVhbScsICdpY2VfY29ubmVjdGlvbl9zdGF0ZV9jaGFuZ2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhX2NoYW5uZWwnXTtcblxudmFyIGljZVNlcnZlcnMgPSB7XG4gIGljZVNlcnZlcnM6IFtcbiAgICB7dXJsOiAnc3R1bjoxMDQuMTMxLjEyOC4xMDE6MzQ3OCcsIHVybHM6ICdzdHVuOjEwNC4xMzEuMTI4LjEwMTozNDc4J30sXG4gICAge3VybDogJ3R1cm46MTA0LjEzMS4xMjguMTAxOjM0NzgnLCB1cmxzOiAndHVybjoxMDQuMTMxLjEyOC4xMDE6MzQ3OCcsIHVzZXJuYW1lOiAndHVybicsIGNyZWRlbnRpYWw6ICd0dXJuJ31cbiAgXSxcbiAgaWNlVHJhbnNwb3J0czogJ2FsbCdcbn07XG5cbmNsYXNzIFBlZXIge1xuICBjb25zdHJ1Y3RvcihpZCwgY29uZmlnKSB7XG4gICAgdGhpcy5faWQgPSBpZDtcbiAgICB0aGlzLl9jb25maWcgPSBjb25maWc7XG4gICAgdGhpcy5fcmVtb3RlQ2FuZGlkYXRlcyA9IFtdO1xuICAgIHRoaXMuX2xvY2FsQ2FuZGlkYXRlcyA9IFtdO1xuICAgIHRoaXMuX3JlbW90ZVN0cmVhbXMgPSBbXTtcbiAgICB0aGlzLl9sb2NhbFN0cmVhbXMgPSBbXTtcbiAgICB0aGlzLl9jaGFubmVscyA9IHt9O1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gICAgdGhpcy5faXNDb25uZWN0aW5nUGVlciA9IGZhbHNlO1xuICAgIHRoaXMuX2Nvbm5lY3RQcm9taXNlID0gbnVsbDtcblxuICAgIHRoaXMuX2Nvbm5lY3RDYWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9jb25uZWN0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX2lzUmVhZHlGb3JJY2VDYW5kaWRhdGVzID0gZmFsc2U7XG4gICAgdGhpcy5faWNlQ2FuZGlkYXRlUHJvbWlzZXMgPSBbXTtcblxuICAgIHRoaXMuX25leHRDaGFubmVsSUQgPSAwO1xuXG4gICAgdGhpcy5fbG9nID0gW107XG5cbiAgICB2YXIgY29ubmVjdGlvbiA9IHRoaXMuX2Nvbm5lY3Rpb24gPSBuZXcgUlRDUGVlckNvbm5lY3Rpb24oaWNlU2VydmVycyk7XG5cbiAgICB2YXIge2VtaXQsIG9uLCBvZmZ9ID0gZW1pdHRlcih7XG4gICAgICBhdHRlbXB0SW50ZXJjZXB0OiAoZXZlbnQsIGxpc3RlbmVyKSA9PiB7XG4gICAgICAgIGlmIChjb25uZWN0aW9uICYmIENPTk5FQ1RJT05fRVZFTlRTLmluZGV4T2YoZXZlbnQpICE9IC0xKSB7XG4gICAgICAgICAgY29ubmVjdGlvbi5hZGRFdmVudExpc3RlbmVyKGV2ZW50LnJlcGxhY2UoL18vZywgJycpLCBsaXN0ZW5lcik7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5maXJlID0gZW1pdDtcbiAgICB0aGlzLm9uID0gb247XG4gICAgdGhpcy5vZmYgPSBvZmY7XG5cbiAgICB0aGlzLm9uKHtcbiAgICAgICdpY2VfY2FuZGlkYXRlJzogIGV2ZW50ID0+IHRoaXMuX2xvY2FsQ2FuZGlkYXRlcy5wdXNoKGV2ZW50LmNhbmRpZGF0ZSksXG4gICAgICAnZGF0YV9jaGFubmVsJzogICBldmVudCA9PiB0aGlzLl9hZGRDaGFubmVsKGV2ZW50LmNoYW5uZWwpLFxuICAgICAgJ2FkZF9zdHJlYW0nOiAgICAgZXZlbnQgPT4gdGhpcy5fYWRkUmVtb3RlU3RyZWFtKGV2ZW50LnN0cmVhbSlcbiAgICB9KTtcblxuICAgIHRoaXMub24oe1xuICAgICAgJ2ljZV9jb25uZWN0aW9uX3N0YXRlX2NoYW5nZSc6IGV2ZW50ID0+IHtcbiAgICAgICAgc3dpdGNoIChjb25uZWN0aW9uLmljZUNvbm5lY3Rpb25TdGF0ZSkge1xuICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XG4gICAgICAgICAgY2FzZSAnY29tcGxldGVkJzpcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY29ubmVjdGVkIScpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnZmFpbGVkJzpcbiAgICAgICAgICBjYXNlICdkaXNjb25uZWN0ZWQnOlxuICAgICAgICAgIGNhc2UgJ2Nsb3NlZCc6XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZmlyZSgnZGlzY29ubmVjdGVkJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgdGhpcy5faXNDb25uZWN0aW5nUGVlciA9IHRydWU7XG5cbiAgICB0aGlzLl9jb25uZWN0UHJvbWlzZSA9IHRoaXMuX2Nvbm5lY3RQcm9taXNlIHx8IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHZhciBjb25uZWN0V2F0Y2hlciA9IGV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5fY29ubmVjdENhbGxlZCA9IHRydWU7XG5cbiAgICAgICAgdmFyIGNvbm5lY3Rpb24gPSBldmVudC50YXJnZXQ7XG5cbiAgICAgICAgc3dpdGNoIChjb25uZWN0aW9uLmljZUNvbm5lY3Rpb25TdGF0ZSkge1xuICAgICAgICAgIGNhc2UgJ2Nvbm5lY3RlZCc6XG4gICAgICAgICAgY2FzZSAnY29tcGxldGVkJzpcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25uZWN0aW9uLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScsIGNvbm5lY3RXYXRjaGVyKTtcbiAgICAgICAgICAgIHJlc29sdmUodGhpcyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdmYWlsZWQnOlxuICAgICAgICAgIGNhc2UgJ2Rpc2Nvbm5lY3RlZCc6XG4gICAgICAgICAgY2FzZSAnY2xvc2VkJzpcbiAgICAgICAgICAgIGNvbm5lY3Rpb24ucmVtb3ZlRXZlbnRMaXN0ZW5lcignaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJywgY29ubmVjdFdhdGNoZXIpO1xuICAgICAgICAgICAgcmVqZWN0KHtwZWVyOiB0aGlzLCBldmVudDogZXZlbnR9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmFkZEV2ZW50TGlzdGVuZXIoJ2ljZWNvbm5lY3Rpb25zdGF0ZWNoYW5nZScsIGNvbm5lY3RXYXRjaGVyKTtcblxuICAgICAgdGhpcy5pbml0aWF0ZU9mZmVyKClcbiAgICAgICAgLnRoZW4ob2ZmZXIgPT4gdGhpcy5maXJlKCdvZmZlciByZWFkeScsIG9mZmVyKSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHRoaXMuZmlyZSgnb2ZmZXIgZXJyb3InKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5fY29ubmVjdFByb21pc2U7XG4gIH1cblxuICBpbml0aWF0ZU9mZmVyKG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7bWFuZGF0b3J5OiB7T2ZmZXJUb1JlY2VpdmVBdWRpbzogdHJ1ZSwgT2ZmZXJUb1JlY2VpdmVWaWRlbzogdHJ1ZX19O1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLmNyZWF0ZU9mZmVyKFxuICAgICAgICBvZmZlciA9PlxuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25cbiAgICAgICAgICAgICAgLnNldExvY2FsRGVzY3JpcHRpb24ob2ZmZXIsXG4gICAgICAgICAgICAgICAgKCkgPT4gcmVzb2x2ZSh0aGlzLl9jb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pLFxuICAgICAgICAgICAgICAgIGVycm9yID0+IHJlamVjdCgncGVlciBlcnJvciBzZXRfbG9jYWxfZGVzY3JpcHRpb24nLCB0aGlzLCBlcnJvciwgb2ZmZXIpKSxcbiAgICAgICAgZXJyb3IgPT4gcmVqZWN0KGVycm9yKSxcbiAgICAgICAgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cblxuICByZWNlaXZlT2ZmZXIob2ZmZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKG9mZmVyKSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3Jlc29sdmVJY2VDYW5kaWRhdGVQcm9taXNlcygpO1xuICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uY3JlYXRlQW5zd2VyKFxuICAgICAgICAgICAgYW5zd2VyID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5zZXRMb2NhbERlc2NyaXB0aW9uKGFuc3dlciwgKCkgPT4gcmVzb2x2ZSh0aGlzLl9jb25uZWN0aW9uLmxvY2FsRGVzY3JpcHRpb24pLCBlcnJvciA9PiByZWplY3QoJ3BlZXIgZXJyb3Igc2V0X2xvY2FsX2Rlc2NyaXB0aW9uJywgdGhpcywgZXJyb3IsIGFuc3dlcikpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yID0+IHJlamVjdCgncGVlciBlcnJvciBzZW5kIGFuc3dlcicsIHRoaXMsIGVycm9yLCBvZmZlcikpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvciA9PiByZWplY3QoJ3BlZXIgZXJyb3Igc2V0X3JlbW90ZV9kZXNjcmlwdGlvbicsIHRoaXMsIGVycm9yLCBvZmZlcikpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVjZWl2ZUFuc3dlcihhbnN3ZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gdGhpcy5fY29ubmVjdGlvbi5zZXRSZW1vdGVEZXNjcmlwdGlvbihuZXcgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uKGFuc3dlciksICgpID0+IHtcbiAgICAgIHRoaXMuX3Jlc29sdmVJY2VDYW5kaWRhdGVQcm9taXNlcygpO1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIHJlamVjdCkpO1xuICB9XG5cbiAgYWRkSWNlQ2FuZGlkYXRlcyhjYW5kaWRhdGVzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChvdXRlclJlc29sdmUsIG91dGVyUmVqZWN0KSA9PiB7XG4gICAgICBfLmVhY2goY2FuZGlkYXRlcywgY2FuZGlkYXRlID0+IHtcbiAgICAgICAgdGhpcy5faWNlQ2FuZGlkYXRlUHJvbWlzZXMucHVzaCgoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uYWRkSWNlQ2FuZGlkYXRlKG5ldyBSVENJY2VDYW5kaWRhdGUoY2FuZGlkYXRlKSwgKCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLl9yZW1vdGVDYW5kaWRhdGVzLnB1c2goY2FuZGlkYXRlKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuX3Jlc29sdmVJY2VDYW5kaWRhdGVQcm9taXNlcyhvdXRlclJlc29sdmUsIG91dGVyUmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZENoYW5uZWwobGFiZWwsIG9wdGlvbnMsIGNoYW5uZWxIYW5kbGVyKSB7XG4gICAgbGFiZWwgPSBsYWJlbCB8fCAoJ2RhdGEtY2hhbm5lbC0nICsgdGhpcy5fbmV4dENoYW5uZWxJRCsrKTtcbiAgICAvLyBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAvLyBvcHRpb25zLm5lZ290aWF0ZWQgPSBmYWxzZTtcblxuICAgIHZhciBjaGFubmVsID0gdGhpcy5fYWRkQ2hhbm5lbCh0aGlzLl9jb25uZWN0aW9uLmNyZWF0ZURhdGFDaGFubmVsKGxhYmVsLCBvcHRpb25zKSwgY2hhbm5lbEhhbmRsZXIpO1xuXG4gICAgcmV0dXJuIGNoYW5uZWw7XG4gIH1cblxuICByZW1vdmVDaGFubmVsKGxhYmVsKSB7XG4gICAgdmFyIGNoYW5uZWwgPSB0aGlzLl9jaGFubmVsc1tsYWJlbF07XG4gICAgaWYgKGNoYW5uZWwpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLl9jaGFubmVsc1tsYWJlbF07XG4gICAgICB0aGlzLmZpcmUoJ2NoYW5uZWwgcmVtb3ZlZCcsIGNoYW5uZWwpO1xuICAgIH1cbiAgfVxuXG4gIGFkZExvY2FsU3RyZWFtKHN0cmVhbSkge1xuICAgIHZhciBsb2NhbFN0cmVhbSA9IG5ldyBTdHJlYW0odGhpcywgc3RyZWFtKTtcblxuICAgIHRoaXMuX2xvY2FsU3RyZWFtcy5wdXNoKGxvY2FsU3RyZWFtKTtcblxuICAgIHRoaXMuX2FkZExvY2FsU3RyZWFtKHN0cmVhbSk7XG5cbiAgICByZXR1cm4gbG9jYWxTdHJlYW07XG4gIH1cblxuICByZW1vdmVTdHJlYW0oc3RyZWFtKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKTtcbiAgICBpZiAoaW5kZXggIT0gMSkge1xuICAgICAgdGhpcy5fbG9jYWxTdHJlYW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLnJlbW92ZVN0cmVhbShzdHJlYW0uc3RyZWFtKTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkU3RyZWFtKHN0cmVhbSkge1xuICAgIHRoaXMuX2xvY2FsU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgdGhpcy5fYWRkTG9jYWxTdHJlYW0oc3RyZWFtLnN0cmVhbSk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbiAmJiB0aGlzLl9jb25uZWN0aW9uLmljZUNvbm5lY3Rpb25TdGF0ZSAhPSAnY2xvc2VkJykgdGhpcy5fY29ubmVjdGlvbi5jbG9zZSgpO1xuICB9XG5cbiAgZ2V0U3RhdHMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uZ2V0U3RhdHMocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldCBpZCgpIHsgcmV0dXJuIHRoaXMuX2lkOyB9XG4gIGdldCBjb25maWcoKSB7IHJldHVybiB0aGlzLl9jb25maWc7IH1cbiAgZ2V0IGxvY2FsU3RyZWFtcygpIHsgcmV0dXJuIHRoaXMuX2xvY2FsU3RyZWFtczsgfVxuICBnZXQgcmVtb3RlU3RyZWFtcygpIHsgcmV0dXJuIHRoaXMuX3JlbW90ZVN0cmVhbXM7IH1cbiAgZ2V0IGNoYW5uZWxzKCkgeyByZXR1cm4gdGhpcy5fY2hhbm5lbHM7IH1cbiAgZ2V0IGlzQ29ubmVjdGluZ1BlZXIoKSB7IHJldHVybiB0aGlzLl9pc0Nvbm5lY3RpbmdQZWVyOyB9XG4gIGdldCBsb2coKSB7IHJldHVybiB0aGlzLl9sb2c7IH1cblxuICAvL2NoYW5uZWwobGFiZWwpIHsgcmV0dXJuIHRoaXMuX2NoYW5uZWxzW2xhYmVsXTsgfVxuXG4gIGNoYW5uZWwobGFiZWwpIHtcbiAgICB2YXIgcHJvbWlzZXMgPSB0aGlzLl9jaGFubmVsUHJvbWlzZXMgPSB0aGlzLl9jaGFubmVsUHJvbWlzZXMgfHwge307XG5cbiAgICB2YXIgcHJvbWlzZSA9IHByb21pc2VzW2xhYmVsXSA9IHByb21pc2VzW2xhYmVsXSB8fCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB2YXIgY2hhbm5lbCA9IHRoaXMuX2NoYW5uZWxzW2xhYmVsXTtcblxuICAgICAgaWYgKGNoYW5uZWwpIHJlc29sdmUoY2hhbm5lbCk7XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gY2hhbm5lbCA9PiB7XG4gICAgICAgICAgaWYgKGNoYW5uZWwubGFiZWwgPT0gbGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKCdjaGFubmVsIGFkZCcsIGxpc3RlbmVyKTtcbiAgICAgICAgICAgIHJlc29sdmUoY2hhbm5lbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub24oJ2NoYW5uZWwgYWRkJywgbGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBzdHJlYW0oaWQpIHsgcmV0dXJuIF8uZmluZCh0aGlzLl9yZW1vdGVTdHJlYW1zLCB7J2lkJzogaWR9KTsgfVxuXG4gIC8vIERvIHdlIHdhbnQgdG8gZXhwb3NlIHRoaXM/IVxuICBnZXQgY29ubmVjdGlvbigpIHsgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb247IH1cblxuICBfYWRkQ2hhbm5lbChjaGFubmVsKSB7XG4gICAgY2hhbm5lbCA9IG5ldyBDaGFubmVsKHRoaXMsIGNoYW5uZWwpO1xuXG4gICAgY2hhbm5lbC5vbih7XG4gICAgICAnY2xvc2UnOiAoKSA9PiB0aGlzLnJlbW92ZUNoYW5uZWwoY2hhbm5lbC5sYWJlbClcbiAgICB9KTtcblxuICAgIHRoaXMuX2NoYW5uZWxzW2NoYW5uZWwubGFiZWxdID0gY2hhbm5lbDtcblxuICAgIHRoaXMuZmlyZSgnY2hhbm5lbCBhZGQnLCBjaGFubmVsKTtcblxuICAgIHJldHVybiBjaGFubmVsO1xuICB9XG5cbiAgX2FkZExvY2FsU3RyZWFtKHN0cmVhbSkge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uYWRkU3RyZWFtKHN0cmVhbSk7XG4gICAgY29uc29sZS5sb2coJ19hZGRpbmcgbG9jYWwgc3RyZWFtJyk7XG4gICAgLy8gVGhpcyBtaWdodCBub3QgYmUgYSBnb29kIGlkZWEuIFdoYXQgaGFwcGVucyBpZlxuICAgIC8vIF9hZGRMb2NhbFN0cmVhbSBpcyBjYWxsZWQgYWdhaW4gYmVmb3JlIHRoZSBvZmZlciBpcyBmdWxsIHJlc29sdmVkP1xuICAgIGlmICh0aGlzLl9jb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuaW5pdGlhdGVPZmZlcigpXG4gICAgICAgIC50aGVuKG9mZmVyID0+IHRoaXMuZmlyZSgnb2ZmZXIgcmVhZHknLCBvZmZlcikpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgIHRoaXMuZmlyZSgnb2ZmZXIgZXJyb3InKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuZmlyZSgnbG9jYWxTdHJlYW0gYWRkJywgc3RyZWFtKTtcbiAgICByZXR1cm4gc3RyZWFtO1xuICB9XG5cbiAgX2FkZFJlbW90ZVN0cmVhbShzdHJlYW0pIHtcbiAgICBjb25zb2xlLmxvZygnYWRkIHJlbW90ZSBzdHJlYW0nKTtcbiAgICBzdHJlYW0gPSBuZXcgU3RyZWFtKHRoaXMsIHN0cmVhbSk7XG4gICAgdGhpcy5fcmVtb3RlU3RyZWFtcy5wdXNoKHN0cmVhbSk7XG4gICAgdGhpcy5maXJlKCdyZW1vdGVTdHJlYW0gYWRkJywgc3RyZWFtKTtcbiAgICByZXR1cm4gc3RyZWFtO1xuICB9XG5cbiAgX3Jlc29sdmVJY2VDYW5kaWRhdGVQcm9taXNlcyhyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbi5zaWduYWxpbmdTdGF0ZSAhPSAnaGF2ZS1sb2NhbC1vZmZlcicgJiYgdGhpcy5fY29ubmVjdGlvbi5yZW1vdGVEZXNjcmlwdGlvbikge1xuICAgICAgUHJvbWlzZVxuICAgICAgICAuYWxsKF8ubWFwKHRoaXMuX2ljZUNhbmRpZGF0ZVByb21pc2VzLCBmbiA9PiB7cmV0dXJuIGZuKCk7fSkpXG4gICAgICAgIC50aGVuKCgpID0+IHJlc29sdmUoKSlcbiAgICAgICAgLmNhdGNoKHJlamVjdCk7XG5cbiAgICAgIHRoaXMuX2ljZUNhbmRpZGF0ZVByb21pc2VzLnNwbGljZSgwKTtcbiAgICB9XG4gIH1cblxuICBfbG9nKCkge1xuICAgIHRoaXMuX2xvZy5wdXNoKHtcbiAgICAgIGF0OiBuZXcgRGF0ZSgpLFxuICAgICAgYXJnczogWy4uLmFyZ3VtZW50c11cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQge1BlZXJ9OyIsIi8vIENvb3JkaW5hdGVzIHlvdXIgcGVlcnMuIFNldHMgdXAgY29ubmVjdGlvbnMsIHN0cmVhbXMsIGFuZCBjaGFubmVscy5cbi8vIEJhc2VkIG9uIHdlYnJ0Yy5pb1xuXG5pbXBvcnQge1BlZXJ9IGZyb20gJy4vcGVlcic7XG5cbnZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyksXG4gICAgaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8nKTtcblxubW9kdWxlLmV4cG9ydHMgPSAobG9nLCBlbWl0dGVyLCBzaWduYWxlcikgPT4ge1xuICBpZiAoIWxvZykgbG9nID0gcmVxdWlyZSgnLi4vbG9nJyk7XG4gIGlmICghZW1pdHRlcikgZW1pdHRlciA9IHJlcXVpcmUoJy4uL2VtaXR0ZXInKSgpO1xuICBpZiAoIXNpZ25hbGVyKSBzaWduYWxlciA9IHJlcXVpcmUoJy4vc2lnbmFsZXInKSgpO1xuXG4gIHZhciBzaWduYWw7XG5cbiAgdmFyIHtlbWl0OiBmaXJlLCBvbiwgb2ZmfSA9IGVtaXR0ZXIoKTtcblxuICByZXR1cm4gc2VydmVyID0+IHtcbiAgICBpZiAoc2lnbmFsID09PSB1bmRlZmluZWQpIHNpZ25hbCA9IGNvbm5lY3RUb1NpZ25hbChzZXJ2ZXIpO1xuXG4gICAgaWYgKHNpZ25hbC5yZWFkeSkgc2V0VGltZW91dCgoKSA9PiBmaXJlKCdyZWFkeScsIHNpZ25hbC5teUlEKSwgMCk7IC8vIG9vZiwgZ2V0IG1lICh0aGlzIGxpbmUgb2YgY29kZSkgb3V0IG9mIGhlcmVcblxuICAgIHJldHVybiBzaWduYWw7XG4gIH07XG5cbiAgLypcbiAgKyAgU2lnbmFsbGluZ1xuICAqL1xuICBmdW5jdGlvbiBjb25uZWN0VG9TaWduYWwoc2VydmVyKSB7XG4gICAgdmFyIHNpZ25hbCA9IHtcbiAgICAgIG9uOiBvbixcbiAgICAgIG9mZjogb2ZmLFxuICAgICAgam9pblJvb206IGpvaW5Sb29tLFxuICAgICAgbGVhdmVSb29tOiBsZWF2ZVJvb20sXG4gICAgICBsZWF2ZVJvb21zOiBsZWF2ZVJvb21zLFxuICAgICAgYWRtaW5Sb29tOiBhZG1pblJvb20sXG4gICAgICBjdXJyZW50Um9vbXM6IHt9LFxuICAgICAgY2xvc2U6IGNsb3NlXG4gICAgfTtcblxuICAgIHZhciB7Y3VycmVudFJvb21zOiByb29tc30gPSBzaWduYWw7XG5cbiAgICB2YXIgcGVlcnMgPSBbXSxcbiAgICAgICAgcGVlcnNIYXNoID0ge307XG5cbiAgICB2YXIgc2lnbmFsZXJFbWl0dGVyID0gZW1pdHRlcigpO1xuXG4gICAgdmFyIHNvY2tldCA9IGlvKHNlcnZlciArICcvc2lnbmFsJyk7XG5cbiAgICB2YXIgZW1pdCA9IChldmVudCwgZGF0YSkgPT4gc29ja2V0LmVtaXQoZXZlbnQsIGRhdGEpO1xuICAgIHZhciBzb2NrZXRTaWduYWxlciA9IHNpZ25hbGVyKHtcbiAgICAgICAgZW1pdDogKG5hbWUsIGRhdGEpID0+IGVtaXQoJ3BlZXIgJyArIG5hbWUsIGRhdGEpLFxuICAgICAgICBvbjogc2lnbmFsZXJFbWl0dGVyLm9uXG4gICAgICB9KTtcblxuICAgIHNvY2tldC5vbignZXJyb3InLCAoLi4uYXJncykgPT4gbG9nLmVycm9yKCdGYWlsZWQgdG8gY29ubmVjdCBzb2NrZXQuaW8nLCAuLi5hcmdzKSk7XG5cbiAgICAvLyBUaGVzZSBhcmUgdGhlIG1lc3NhZ2VzIHdlIHJlY2VpdmUgZnJvbSB0aGUgc2lnbmFsIGFuZCB0aGVpciBoYW5kbGVyc1xuICAgIF8uZWFjaCh7XG4gICAgICAnY29ubmVjdCc6ICAgICAgKCkgPT4gbG9nLmluZm8oJ0Nvbm5lY3RlZCB0byBzZXJ2ZXInKSxcbiAgICAgICd5b3VyX2lkJzogICAgbXlJRCA9PiBnb3RJRChteUlEKSxcblxuICAgICAgJ3Jvb20nOiAgICAgICBkYXRhID0+IHVwZGF0ZVJvb20oZGF0YSksXG5cbiAgICAgICdwZWVyIGpvaW4nOiAgZGF0YSA9PiBzb2NrZXRTaWduYWxlci5tYW5hZ2VQZWVyKG5ld1BlZXIoZGF0YS5pZCkpLFxuICAgICAgJ3BlZXIgbGVhdmUnOiBkYXRhID0+IHNvY2tldFNpZ25hbGVyLmRyb3BQZWVyKHJlbW92ZVBlZXJCeUlEKGRhdGEuaWQpKSwgLy8gV2hhdCBoYXBwZW5zIGlmIGlkIGlzIG5vbi1leGlzdGVudD9cblxuICAgICAgJ3BlZXIgb2ZmZXInOiAgICAgIGRhdGEgPT4gc2lnbmFsZXJFbWl0dGVyLmVtaXQoJ29mZmVyJywgZGF0YSksXG4gICAgICAncGVlciBhbnN3ZXInOiAgICAgZGF0YSA9PiBzaWduYWxlckVtaXR0ZXIuZW1pdCgnYW5zd2VyJywgZGF0YSksXG4gICAgICAncGVlciBjYW5kaWRhdGVzJzogZGF0YSA9PiBzaWduYWxlckVtaXR0ZXIuZW1pdCgnY2FuZGlkYXRlcycsIGRhdGEpLFxuXG4gICAgICAnYnJvYWRjYXN0IHJlYWR5JzogZGF0YSA9PiBmaXJlKCdicm9hZGNhc3RfcmVhZHknLCBzb2NrZXRTaWduYWxlci5tYW5hZ2VQZWVyKG5ld1BlZXIoZGF0YS5icm9hZGNhc3RlcklEKSkpLCAvLyB0aGluayBvZiBiZXR0ZXIgZXZlbnQgbmFtZXMgZm9yIHRoaXM/XG4gICAgICAnYnJvYWRjYXN0IGVycm9yJzogZGF0YSA9PiBmaXJlKCdicm9hZGNhc3RfZXJyb3InLCBkYXRhKSxcblxuICAgICAgJ2Vycm9yJzogZXJyb3IgPT4gbG9nLmVycm9yKGVycm9yKVxuICAgIH0sIChoYW5kbGVyLCBuYW1lKSA9PiBzb2NrZXQub24obmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBmaXJlKG5hbWUsIC4uLmFyZ3VtZW50cyk7XG4gICAgfSkpO1xuXG4gICAgZnVuY3Rpb24gZ290SUQobXlJRCkge1xuICAgICAgbG9nKCdHb3QgSUQnLCBteUlEKTtcblxuICAgICAgc2lnbmFsLm15SUQgPSBteUlEO1xuXG4gICAgICBzaWduYWwucmVhZHkgPSB0cnVlO1xuICAgICAgZmlyZSgncmVhZHknLCBteUlEKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVSb29tKGRhdGEpIHtcbiAgICAgIHZhciByb29tID0gcm9vbXNbZGF0YS5yb29tTmFtZV0gfHwge307XG4gICAgICBfLmV4dGVuZChyb29tLCBkYXRhKTsgLy8gY2FuIGRvIGJldHRlciB0aGFuIHRoaXMhXG4gICAgICBjb25zb2xlLmxvZygnZ290IHJvb20nLCByb29tKTtcbiAgICAgIGlmIChyb29tLmJyb2FkY2FzdGVySUQpIHNvY2tldFNpZ25hbGVyLm1hbmFnZVBlZXIobmV3UGVlcihyb29tLmJyb2FkY2FzdGVySUQsIHtpc0V4aXN0aW5nUGVlcjogdHJ1ZX0pKTtcbiAgICAgIGVsc2UgXy5lYWNoKGRhdGEucGVlcklEcywgcGVlcklEID0+IHNvY2tldFNpZ25hbGVyLm1hbmFnZVBlZXIobmV3UGVlcihwZWVySUQsIHtpc0V4aXN0aW5nUGVlcjogdHJ1ZX0pKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV3UGVlcihpZCwgY29uZmlnKSB7XG4gICAgICBjb25maWcgPSBjb25maWcgfHwge2lzRXhpc3RpbmdQZWVyOiBmYWxzZX07XG5cbiAgICAgIHZhciBwZWVyID0gbmV3IFBlZXIoaWQsIGNvbmZpZyk7XG4gICAgICBwZWVycy5wdXNoKHBlZXIpO1xuICAgICAgcGVlcnNIYXNoW2lkXSA9IHBlZXI7XG5cbiAgICAgIGZpcmUoJ3BlZXIgYWRkJywgcGVlcik7XG5cbiAgICAgIHJldHVybiBwZWVyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbW92ZVBlZXJCeUlEKGlkKSB7XG4gICAgICB2YXIgcGVlciA9IGdldFBlZXIoaWQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgcGVlci5jbG9zZSgpO1xuICAgICAgICBfLnJlbW92ZShwZWVycywgcGVlciA9PiB7IHJldHVybiBwZWVyLmlkID09PSBpZDsgfSk7XG4gICAgICAgIGRlbGV0ZSBwZWVyc0hhc2hbaWRdO1xuICAgICAgICBmaXJlKCdwZWVyIHJlbW92ZScsIHBlZXIpO1xuICAgICAgICByZXR1cm4gcGVlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBqb2luUm9vbShyb29tTmFtZSkge1xuICAgICAgcm9vbXNbcm9vbU5hbWVdID0gcm9vbXNbcm9vbU5hbWVdIHx8IHtyb29tTmFtZTogcm9vbU5hbWV9O1xuICAgICAgZW1pdCgncm9vbSBqb2luJywgcm9vbU5hbWUpO1xuICAgICAgZmlyZSgncm9vbSBqb2luJywgcm9vbU5hbWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxlYXZlUm9vbShyb29tTmFtZSkge1xuICAgICAgZGVsZXRlIHJvb21zW3Jvb21OYW1lXTtcblxuICAgICAgZW1pdCgncm9vbSBsZWF2ZScsIHJvb21OYW1lKTtcbiAgICAgIGZpcmUoJ3Jvb20gbGVhdmUnLCByb29tTmFtZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGVhdmVSb29tcygpIHtcbiAgICAgIGZvciAodmFyIGkgPSByb29tcy5sZW5ndGggLTE7IGkgPj0gMDsgaS0tKSBsZWF2ZVJvb20ocm9vbXNbaV0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkbWluUm9vbShyb29tTmFtZSwgY29tbWFuZCkge1xuICAgICAgbG9nKCdhZG1pbmluZycsIHJvb21OYW1lLCBjb21tYW5kKTtcbiAgICAgIGVtaXQoJ3Jvb20gYWRtaW4nLCBfLmV4dGVuZCh7cm9vbU5hbWV9LCBjb21tYW5kKSk7XG4gICAgICAvL1Nob3VsZCB3ZSBjaGVjayBmb3IgcmVzcG9uc2VzIG9yIHNvbWV0aGluZz9cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjbG9zZSgpIHtcbiAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgICAgXy5lYWNoKHBlZXJzLCBwZWVyID0+IHBlZXIuY2xvc2UoKSk7XG4gICAgICBzaWduYWwgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UGVlcihpZCkge1xuICAgICAgcmV0dXJuIHBlZXJzSGFzaFtpZF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpZ25hbDtcbiAgfVxuICAvKlxuICAtICBTaWduYWxsaW5nXG4gICovXG59OyIsIm1vZHVsZS5leHBvcnRzID0gZW1pdHRlciA9PiB7XG4gIGlmICghZW1pdHRlcikgZW1pdHRlciA9IHJlcXVpcmUoJy4uL2VtaXR0ZXInKSgpOyAvLyBwbGVhc2UsIHBsZWFzZSwgcGxlYXNlIGdldCByaWQgb2YgdGhpc1xuXG4gIHJldHVybiB0cmFuc3BvcnQgPT4ge1xuICAgIHZhciB7ZW1pdCwgb24sIG9mZn0gPSBlbWl0dGVyKCk7XG5cbiAgICB2YXIgc2lnbmFsZXIgPSB7XG4gICAgICBwZWVyczoge30sXG4gICAgICBwZWVyQ291bnQ6IDAsXG5cbiAgICAgIG1hbmFnZVBlZXI6IG1hbmFnZVBlZXIsXG4gICAgICBkcm9wUGVlcjogZHJvcFBlZXIsXG5cbiAgICAgIG1hbmFnZXNQZWVyOiBtYW5hZ2VzUGVlclxuICAgIH07XG5cbiAgICB0cmFuc3BvcnQub24oe1xuICAgICAgJ29mZmVyJzogICAgICBkYXRhID0+IHJlY2VpdmVPZmZlcihkYXRhLnBlZXJJRCwgZGF0YS5vZmZlciksXG4gICAgICAnYW5zd2VyJzogICAgIGRhdGEgPT4gcmVjZWl2ZUFuc3dlcihkYXRhLnBlZXJJRCwgZGF0YS5hbnN3ZXIpLFxuICAgICAgJ2NhbmRpZGF0ZXMnOiBkYXRhID0+IHJlY2VpdmVJY2VDYW5kaWRhdGVzKGRhdGEucGVlcklELCBkYXRhLmNhbmRpZGF0ZXMpXG4gICAgfSk7XG5cbiAgICB2YXIge3BlZXJzfSA9IHNpZ25hbGVyO1xuICAgIHZhciB7ZW1pdDogc2VuZH0gPSB0cmFuc3BvcnQ7XG5cbiAgICBmdW5jdGlvbiBtYW5hZ2VQZWVyKHBlZXIpIHtcbiAgICAgIHZhciBwZWVySUQgPSBwZWVyLmlkLFxuICAgICAgICAgIGNhbmRpZGF0ZXMgPSBbXTtcblxuICAgICAgcGVlcnNbcGVlcklEXSA9IHBlZXI7XG4gICAgICBzaWduYWxlci5wZWVyQ291bnQrKztcblxuICAgICAgcGVlci5vbih7XG4gICAgICAgICdvZmZlciByZWFkeSc6IG9mZmVyID0+IHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnb2ZmZXIgcmVhZHknKTtcbiAgICAgICAgICBzZW5kKCdvZmZlcicsIHtwZWVySUQsIG9mZmVyfSk7XG4gICAgICAgICAgZW1pdCgnc2VuZCBvZmZlcicsIHBlZXIsIG9mZmVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpY2VfY2FuZGlkYXRlOiBldmVudCA9PiB7XG4gICAgICAgICAgdmFyIGNhbmRpZGF0ZSA9IGV2ZW50LmNhbmRpZGF0ZTtcblxuICAgICAgICAgIGlmIChjYW5kaWRhdGUpIHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZXMucHVzaChjYW5kaWRhdGUpO1xuICAgICAgICAgICAgc2VuZEljZUNhbmRpZGF0ZXMoKTtcbiAgICAgICAgICAgIGVtaXQoJ2ljZV9jYW5kaWRhdGUnLCBwZWVyLCBjYW5kaWRhdGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBJcyB0aGlzIHRoZSBiZXN0IHdheSB0byBkbyB0aGlzP1xuICAgICAgdmFyIHNlbmRJY2VDYW5kaWRhdGVzID0gXy50aHJvdHRsZSgoKSA9PiB7XG4gICAgICAgIHNlbmQoJ2NhbmRpZGF0ZXMnLCB7cGVlcklELCBjYW5kaWRhdGVzfSk7XG4gICAgICAgIGNhbmRpZGF0ZXMuc3BsaWNlKDApO1xuICAgICAgfSwgMCk7XG5cbiAgICAgIHJldHVybiBwZWVyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyb3BQZWVyKHBlZXIpIHtcbiAgICAgIHZhciBzdG9yZWRQZWVyID0gcGVlcnNbcGVlci5pZF07XG4gICAgICBpZiAoc3RvcmVkUGVlcikge1xuICAgICAgICBzdG9yZWRQZWVyLm9mZigpO1xuICAgICAgICBkZWxldGUgcGVlcnNbcGVlci5pZF07XG4gICAgICAgIHNpZ25hbGVyLnBlZXJDb3VudC0tO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGVlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWNlaXZlT2ZmZXIocGVlcklELCBvZmZlcikge1xuICAgICAgdmFyIHBlZXIgPSBnZXRQZWVyKHBlZXJJRCk7XG5cbiAgICAgIGVtaXQoJ3BlZXIgcmVjZWl2ZSBvZmZlcicsIHBlZXIsIG9mZmVyKTtcbiAgICAgIHBlZXJcbiAgICAgICAgLnJlY2VpdmVPZmZlcihvZmZlcilcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgYW5zd2VyID0+IHtcbiAgICAgICAgICAgIHNlbmQoJ2Fuc3dlcicsIHtwZWVySUQsIGFuc3dlcn0pO1xuICAgICAgICAgICAgZW1pdCgnc2VuZCBhbnN3ZXInLCBwZWVyLCBhbnN3ZXIpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgLi4uZXJyb3IgPT4gZW1pdCgnZXJyb3Igb2ZmZXInLCBwZWVyLCBhbnN3ZXIsIC4uLmVycm9yKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVjZWl2ZUFuc3dlcihwZWVySUQsIGFuc3dlcikge1xuICAgICAgdmFyIHBlZXIgPSBnZXRQZWVyKHBlZXJJRCk7XG5cbiAgICAgIGVtaXQoJ3BlZXIgcmVjZWl2ZSBhbnN3ZXInLCBwZWVyLCBhbnN3ZXIpO1xuICAgICAgcGVlclxuICAgICAgICAucmVjZWl2ZUFuc3dlcihhbnN3ZXIpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICgpID0+ICAgICAgIGVtaXQoJ2FjY2VwdGVkIGFuc3dlcicsIHBlZXIsIGFuc3dlciksXG4gICAgICAgICAgLi4uZXJyb3IgPT4gZW1pdCgnZXJyb3IgYW5zd2VyJywgcGVlciwgYW5zd2VyLCAuLi5lcnJvcikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlY2VpdmVJY2VDYW5kaWRhdGVzKHBlZXJJRCwgY2FuZGlkYXRlcykge1xuICAgICAgdmFyIHBlZXIgPSBnZXRQZWVyKHBlZXJJRCk7XG5cbiAgICAgIGVtaXQoJ3BlZXIgcmVjZWl2ZSBjYW5kaWRhdGVzJywgcGVlciwgY2FuZGlkYXRlcyk7XG4gICAgICBwZWVyXG4gICAgICAgIC5hZGRJY2VDYW5kaWRhdGVzKGNhbmRpZGF0ZXMpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICgpID0+ICAgICAgIGVtaXQoJ2FjY2VwdGVkIGNhbmRpZGF0ZXMnLCBwZWVyLCBjYW5kaWRhdGVzKSxcbiAgICAgICAgICAuLi5lcnJvciA9PiBlbWl0KCdlcnJvciBjYW5kaWRhdGVzJywgcGVlciwgY2FuZGlkYXRlcywgLi4uZXJyb3IpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRQZWVyKGlkKSB7XG4gICAgICB2YXIgcGVlciA9IHBlZXJzW2lkXTtcblxuICAgICAgaWYgKHBlZXIpIHJldHVybiBwZWVyO1xuXG4gICAgICB0aHJvdyAnVHJpZWQgdG8gZ2V0IG5vbi1leGlzdGVudCBwZWVyISc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFuYWdlc1BlZXIoaWQpIHtcbiAgICAgIHJldHVybiBwZWVyc1tpZF0gIT0gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gc2lnbmFsZXI7XG4gIH07XG59OyIsImNsYXNzIFN0cmVhbSB7XG4gIGNvbnN0cnVjdG9yKHBlZXIsIHN0cmVhbSwgc3RyZWFtTGlzdGVuZXJzKSB7XG4gICAgdGhpcy5fcGVlciA9IHBlZXI7XG4gICAgdGhpcy5fc3RyZWFtID0gc3RyZWFtO1xuICAgIHRoaXMuX2lkID0gc3RyZWFtLmlkO1xuXG4gICAgLy8gdGhpcy5vbihzdHJlYW1MaXN0ZW5lcnMpO1xuICB9XG5cbiAgZ2V0IHN0cmVhbSgpIHsgcmV0dXJuIHRoaXMuX3N0cmVhbTsgfVxuICBnZXQgaWQoKSB7IHJldHVybiB0aGlzLl9pZDsgfVxuICBnZXQgcGVlcigpIHsgcmV0dXJuIHRoaXMuX3BlZXI7IH1cblxuICAvLyAvKlxuICAvLyArICBFdmVudCBIYW5kbGluZ1xuICAvLyAqL1xuICAvLyBvbihldmVudCwgbGlzdGVuZXIpIHtcbiAgLy8gICBpZiAodHlwZW9mIGV2ZW50ID09ICdvYmplY3QnKSB7XG4gIC8vICAgICBmb3IgKHZhciBldmVudE5hbWUgaW4gZXZlbnQpIHRoaXMub24oZXZlbnROYW1lLCBldmVudFtldmVudE5hbWVdKTtcbiAgLy8gICAgIHJldHVybjtcbiAgLy8gICB9XG5cbiAgLy8gICB0aGlzLnN0cmVhbS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudCA9PiBsaXN0ZW5lcih0aGlzLCBldmVudCkpO1xuXG4gIC8vICAgcmV0dXJuIHRoaXM7XG4gIC8vIH1cbiAgLy8gLypcbiAgLy8gLSAgRXZlbnQgSGFuZGxpbmdcbiAgLy8gKi9cbn1cblxuZXhwb3J0IHtTdHJlYW19OyJdfQ==
