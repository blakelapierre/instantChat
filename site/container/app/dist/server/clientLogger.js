"use strict";
var _ = require('lodash'),
    mkdirp = require('mkdirp'),
    winston = require('winston');
module.exports = (function(log, router) {
  mkdirp.sync('logs/clients');
  var logger = new (winston.Logger)({transports: [new (winston.transports.File)({
      level: 'error',
      filename: 'logs/clients/errors.log',
      maxsize: 1024 * 1024
    })]});
  log('Mounting /log');
  router.post('/log', (function(req, res) {
    var logs = req.body.logs;
    _.each(logs, (function(log) {
      var $__0;
      var level = log.level,
          args = log.args;
      console.log('Got from browser:', level, args);
      ($__0 = logger).log.apply($__0, $traceurRuntime.spread([level], args));
    }));
    res.end();
  }));
});
