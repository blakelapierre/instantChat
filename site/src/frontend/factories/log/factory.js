var _ = require('lodash');

module.exports = ['$resource', ($resource) => {
  var Log = $resource('/log');

  var methods = {log, debug, info, warn, error};

  function log(...args) {
    console.log(...args);
  }

  function debug(...args) {
    console.log('DEBUG:', ...args);
    send('debug', ...args);
  }

  function info(...args) {
    console.log('INFO:', ...args);
    send('info', ...args);
  }

  function warn(...args) {
    console.log('WARN:', ...args);
    send('warn', ...args);
  }

  function error(...args) {
    console.log('ERROR:', ...args);
    send('error', ...args);
  }

  function send(level, ...args) {
    Log.save({level, args});
  }

  return _.extend(methods.log, methods);
}];