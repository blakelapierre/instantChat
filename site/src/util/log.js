var _ = require('lodash');

module.exports = () => {
  var methods = {log, debug, info, status, warn, error};

  function log(...args) {
    console.log(...args);
  }

  function debug(...args) {
    console.log('DEBUG:', ...args);
    send('debug', new Date(), ...args);
  }

  function info(...args) {
    console.log('INFO:', ...args);
    send('info', new Date(), ...args);
  }

  function status(...args) {
    console.log('STATUS:', ...args);
    send('status', new Date(), ...args);
  }

  function warn(...args) {
    console.log('WARN:', ...args);
    send('warn', new Date(), ...args);
  }

  function error(...args) {
    console.log('ERROR:', ...args);
    send('error', new Date(), ...args);
  }

  function send(level, ...args) {
    // buffer.push({level, args});
    // debouncedSend();
  }

  var debouncedSend = _.debounce(() => {
    Log.save({logs: buffer}, () => {
      buffer.splice(0);
    });

    buffer = [];
  }, 100, {maxWait: 500});

  return _.extend(methods.log, methods);
};