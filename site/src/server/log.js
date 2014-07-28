var mkdirp = require('mkdirp'),
    winston = require('winston');

mkdirp.sync('logs/server');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({
      name: 'file#error',
      level: 'error',
      filename: 'logs/server/errors.log',
      maxsize: 1024 * 1024
    }),
    new (winston.transports.File)({
      name: 'file#info',
      level: 'info',
      filename: 'logs/server/info.log',
      maxsize: 1024 * 1024
    })
  ]
});

function log(...args) {
  logger.info(...args);
}

logger.extend(log);

module.exports = log;