"use strict";
var mkdirp = require('mkdirp'),
    winston = require('winston');
mkdirp.sync('logs/server');
var logger = new (winston.Logger)({transports: [new (winston.transports.Console)(), new (winston.transports.File)({
    name: 'file#error',
    level: 'error',
    filename: 'logs/server/errors.log',
    maxsize: 1024 * 1024
  }), new (winston.transports.File)({
    name: 'file#info',
    level: 'info',
    filename: 'logs/server/info.log',
    maxsize: 1024 * 1024
  })]});
function log() {
  var $__1;
  for (var args = [],
      $__0 = 0; $__0 < arguments.length; $__0++)
    args[$__0] = arguments[$__0];
  ($__1 = logger).info.apply($__1, $traceurRuntime.spread(args));
}
logger.extend(log);
module.exports = log;
