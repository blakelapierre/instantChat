module.exports = function(config, callback) {
  var _ = require('lodash'),
      path = require('path'),
      http = require('http'),
      https = require('https'),
      express = require('express'),
      bodyParser = require('body-parser'),
      io = require('socket.io'),
      images = require('./images'),
      log = require('./log'),
      rooms = require('./rooms'),
      signal = require('./signal'),
      stats = require('./stats'),
      suggestions = require('./suggestions'),
      app = express();

  var serverRoot = config.serverRoot;

  app.use(express.static(path.join(serverRoot, 'frontend')));
  app.use(bodyParser.json());

  var sslOptions = {
        ca: config.ca,
        key: config.key,
        cert: config.cert
      },
      redirectServer = createRedirectServer(),
      webserver = https.createServer(sslOptions, app),
      socketIO = io(webserver),
      signalStats = signal(socketIO),
      router = express.Router();

  log(router);
  images(router, signalStats);
  rooms(router, signalStats);
  stats(router);
  suggestions(router);

  app.use('/', router);

  webserver.listen(config.port);
  redirectServer.listen(config.httpPort);

  callback(webserver, redirectServer, signal);

  function createRedirectServer() {
    return http.createServer(function (req, res, next) {
      res.writeHead(302, {
        'Location': 'https://' + req.headers.host + req.url
      });
      res.end();
    });
  }
};