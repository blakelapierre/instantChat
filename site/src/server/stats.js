module.exports = function(router) {
  router.get('/stats', function(req, res) {
    res.json({
      sockets: signalStats.sockets.length(),
      rooms: signalStats.rooms.length()
    });
  });
};