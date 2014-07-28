module.exports = function(router, signalStats) {
  var sockets = signalStats.sockets;

  router.post('/images', function(req, res) {
    var data = req.body,
        socket = sockets.getByID(data.id);

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
};