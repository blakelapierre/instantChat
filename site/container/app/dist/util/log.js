"use strict";
var _ = require('lodash');
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
    ($__7 = console).log.apply($__7, $traceurRuntime.spread(args));
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
