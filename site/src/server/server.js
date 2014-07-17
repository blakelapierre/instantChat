module.exports = function(config, callback) {
  var https = require('https'),
      http = require('http'),
      path = require('path'),
      express = require('express'),
      bodyParser = require('body-parser'),
      _ = require('lodash'),
      io = require('socket.io'),
      signal = require('./signal'),
      app = express();

  var redirectServer = http.createServer(function requireHTTPS(req, res, next) {
    res.writeHead(302, {
      'Location': 'https://' + req.headers.host + req.url
    });
    res.end();
  });


  var serverRoot = config.serverRoot;

  app.use(express.static(path.join(serverRoot, '..', 'dist')));
  app.use(bodyParser.json());

  var sslOptions = {
        ca: config.ca,
        key: config.key,
        cert: config.cert
      },
      webserver = https.createServer(sslOptions, app),
      socketIO = io(webserver);

  var signalStats = signal(socketIO);

  var router = express.Router();

  router.get('/stats', function(req, res) {
    res.json({
      sockets: signalStats.sockets.length(),
      rooms: signalStats.rooms.length()
    });
  });

  var roomList = signalStats.rooms.asList();
  router.get('/rooms', function(req, res) {
    res.json({
      rooms: _.map(roomList, function(room) {
        return {
          name: room._roomName,
          participants: _.map(room.asList(), function(socket) {
            return {
              id: socket.id,
              image: socket.image
            };
          })
        };
      }) // horrible inefficient!
    });
  });

  var sockets = signalStats.sockets;
  router.post('/images', function(req, res) {
    var data = req.body,
        socket = sockets.getByID(data.id)

    if (socket) {
      socket.image = data.data;
    }
    res.json({success: true});
  });

  router.get('/images/:id', function(req, res) {
    var socket = sockets.getByID(req.params.id);

    if (socket) {
      res.json({data: socket.image});
    }
    res.json({success: false});
  });

  app.use('/', router);

  webserver.listen(config.port);
  redirectServer.listen(config.httpPort);

  callback(webserver, redirectServer, signal);
};