

function signaller(peers) {
  var

  _.reduce(peers, peer => {
    var symbol = new Symbol();
    peerMap[symbol] = peer;
    return symbol;
  });

  return {
    signal: (source, destination, payload) {
      var path = lookup(destination);
      if (path) {
        path.send(payload);
        cache(path);
      }
    }
  }

  function lookup(destination) {

  }

  function cache(path) {

  }
}