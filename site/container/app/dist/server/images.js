"use strict";
module.exports = (function(log, router, signalStats) {
  var sockets = signalStats.sockets;
  log('Mounting post /images');
  router.post('/images', (function(req, res) {
    var data = req.body,
        socket = sockets.getByID(data.id);
    if (socket) {
      socket.image = data.data;
    }
    res.json({success: true});
  }));
  log('Mounting get /images/:id');
  router.get('/images/:id', (function(req, res) {
    var socket = sockets.getByID(req.params.id);
    if (socket) {
      res.json({data: socket.image});
      return;
    }
    log('Request for non-existant image');
    res.json({success: false});
  }));
});
