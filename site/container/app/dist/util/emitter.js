"use strict";
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
