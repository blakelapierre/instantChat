var mkdirp = require('mkdirp'),
    winston = require('winston');

module.exports = (log, router) => {
  mkdirp.sync('logs/clients');

  var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.File)({
        level: 'error',
        filename: 'logs/clients/errors.log',
        maxsize: 1024 * 1024
      })
    ]
  });

  log('Mounting /log');
  router.post('/log', (req, res) => {
    var level = req.body.level,
        args = req.body.args;

    console.log('Got from browser:', level, args);
    logger.log(level, ...args);
  });
};