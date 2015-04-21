//
var _ = require('lodash');

module.exports = ['emitter', 'localStorageService', (emitter, localStorageService) => {
  var {emit, on, off} = emitter();

  var storageKey = 'config',
      data = {};

  var config = _.extend({
    name: undefined,
    defaultStream: {
      audio: true,
      //video: true
      video: {
        mandatory: {
          minWidth: 320,
          maxWidth: 320,
          minHeight: 240,
          maxHeight: 240
        }
        // mandatory: {
        //   minWidth: 720,
        //   maxWidth: 720,
        //   minHeight: 540,
        //   maxHeight: 540
        // }
      }
    }
  }, localStorageService.get(storageKey) || {});

  _.each(config, (value, key) => {
    console.log('setting', value, key);
    Object.defineProperty(data, key, {
      enumerable: true,
      get: () => config[key],
      set: (value) => {
        config[key] = value;
        localStorageService.set(storageKey, config);
        emit(key, value);
        emit('$change', config);
      }
    });
  });

  // Allows listening to changes
  // Use properties so that they are not enumerated (eg. when serializaing to JSON)
  Object.defineProperties(data, {
    'on': {get: () => (...args) => on(...args)},
    'off': {get: () => (...args) => off(...args)}
  });

  return data;
}];