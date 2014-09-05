module.exports = function(config, callback) {
  var _ = require('lodash'),
      path = require('path'),
      http = require('http'),
      https = require('https'),
      express = require('express'),
      bodyParser = require('body-parser'),
      io = require('socket.io'),
      log = require('./log'),
      clientLogger = require('./clientLogger'),
      broadcasters = require('./broadcasters'),
      images = require('./images'),
      rooms = require('./rooms'),
      signal = require('./signal/signal'),
      stats = require('./stats'),
      suggestions = require('./suggestions'),
      app = express();

  var distRoot = config.distRoot;

  app.use(express.static(path.join(distRoot, 'frontend')));
  app.use(bodyParser.json());

  var sslOptions = {
        ca: config.ca,
        key: config.key,
        cert: config.cert
      },
      redirectServer = createRedirectServer(),
      webserver = https.createServer(sslOptions, app),
      socketIO = io(webserver),
      signalStats = signal(log, socketIO),
      router = express.Router();

  clientLogger(log, router);
  broadcasters(log, socketIO);
  images(log, router, signalStats);
  rooms(log, router, signalStats);
  stats(log, router, signalStats);
  suggestions(log, router);

  app.use('/', router);

  webserver.listen(config.port);
  redirectServer.listen(config.httpPort);

  log('Server up on', config.publicAddress + ':' + config.port, '!');

  callback(webserver, redirectServer, signal);

  function createRedirectServer() {
    return http.createServer(function (req, res, next) {
      log('Redirecting');
      res.writeHead(302, {
        'Location': 'https://' + req.headers.host + req.url
      });
      res.end();
    });
  }
};