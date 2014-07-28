module.exports = (log, router) => {
  log('Mounting /stats');

  router.get('/stats', (req, res) => {
    res.json({
      sockets: signalStats.sockets.length(),
      rooms: signalStats.rooms.length()
    });
  });
};