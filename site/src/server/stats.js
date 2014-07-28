module.exports = router => {
  router.get('/stats', (req, res) => {
    res.json({
      sockets: signalStats.sockets.length(),
      rooms: signalStats.rooms.length()
    });
  });
};