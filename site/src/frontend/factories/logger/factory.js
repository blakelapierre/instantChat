var _ = require('lodash');

module.exports = ['$resource', ($resource) => {
  var Log = $resource('/log');

  var methods = {
    log: log,
    warn: warn
  };

  function log(...args) {
    console.log(...args);
  }

  function warn(...args) {
    console.log('WARN:', ...args);
    Log.save({
      level: 'warn',
      args: args
    });
  }

  return _.extend(methods.log, methods);
}];