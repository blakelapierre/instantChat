module.exports = () => {
  return () => {
    var events = {};

    return {
      emit: (...args) => emit(events, ...args),
      on: (...args) => on(events, ...args),
      off: (...args) => off(events, ...args)
    };
  };

  function emit(events, event) {
    var listeners = events[event] || [],
        args = Array.prototype.slice.call(arguments, 2);

    for (var i = 0; i < listeners.length; i++) {
      listeners[i].apply(null, args);
    }
  }

  function on(events, event, listener) {
    if (typeof event == 'object') {
      for (var eventName in event) on(events, eventName, event[eventName]);
      return;
    }

    events[event] = events[event] || [];
    events[event].push(listener);
  }

  function off(events, event, listener) {
    if (typeof event == 'object') {
      for (var eventName in event) off(events, eventName, event[eventName]);
      return;
    }

    var listeners = events[event];
    if (listeners && listeners.length > 0) {
      for (var i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
        }
      }
      if (listeners.length === 0) delete events[event];
    }
  }
};