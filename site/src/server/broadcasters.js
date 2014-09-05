var hashList = require('./hashList'),
    _ = require('lodash');

module.exports = (log, io) => {
  var validTokens = [],
      registry = {
        broadcasters: {},
        broadcasterCount: 0
      };

  log('Mounting /broadcasters');
  io.of('/broadcasters').on('connection', socket => {
    socket.on('validate', data => {
      if (!validate(data.token)) {
        socket.close();
        return;
      }

      registry.broadcasters[socket.id] = {socket: socket, stats: {}};
      registry.broadcasterCount++;
    });

    socket.on('stats', data => {
      var broadcaster = registry.broadcasters[socket.id];

      if (!broadcaster) {
        log.warn('Tried to remove non-existent broadcaster!');
        return;
      }

      _.extend(broadcaster, data);
    });

    socket.on('disconnect', () => {
      delete registry.broadcasters[socket.id];
      broadcasterCount--;
    });
  });

  function validate(token) {
    return _.contains(validTokens, token);
  }

  return {
    validTokens: [], // Will be populated by someone else?
    registry: registry
  };
};