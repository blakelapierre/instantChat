module.exports = (log, router, signalStats, broadcastController) => {
  log('Mounting /stats');

  router.get('/stats', (req, res) => {
    res.json({
      sockets: signalStats.sockets.length(),
      rooms: signalStats.rooms.length(),
      broadcaster: broadcastController.broadcasters.length()
    });
  });
};