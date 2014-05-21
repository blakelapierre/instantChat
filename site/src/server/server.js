module.exports = function(config, callback) {
  var https = require('https'),
      http = require('http'),
      path = require('path'),
      express = require('express'),
      webRTC = require('./lib/webrtc.io'),
      app = express();

  var redirectServer = http.createServer(function requireHTTPS(req, res, next) {
    if (!req.secure) {
      res.writeHead(302, {
        'Location': 'https://' + req.headers['host'] + req.url
      });
      res.end();
      return;
    }
    next();
  });

  
  var serverRoot = config.serverRoot;

  app.use(express.static(path.join(serverRoot, '..', 'dist')));

  var sslOptions = {
        key: config.key,
        cert: config.cert
      },
      webserver = https.createServer(sslOptions, app),
      rtcManager = webRTC.listen(webserver);

  var router = express.Router();

  router.get('/stats', function(req, res) {
    var socketCount = 0,
        roomCount = 0;

    for (var socket in rtcManager.rtc.sockets) socketCount++;
    for (var room in rtcManager.rtc.rooms) roomCount++;

    res.json({
      sockets: socketCount,
      rooms: roomCount,
      r: rtcManager.rtc.rooms
    });
  });

  app.use('/', router);

  webserver.listen(config.port);
  redirectServer.listen(config.httpPort);

  callback(webserver, rtcManager, redirectServer);
};