"use strict";
module.exports = (function(log, router, signalStats, broadcastController) {
  log('Mounting /stats');
  router.get('/stats', (function(req, res) {
    res.json({
      sockets: signalStats.sockets.length(),
      rooms: signalStats.rooms.length(),
      broadcaster: broadcastController.broadcasters.length()
    });
  }));
});
