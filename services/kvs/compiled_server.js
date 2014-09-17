var traceurRuntime = require('traceur-runtime');
var net = require('net');
var LOOKUP = Symbol();
var UPDATE = Symbol();
var globalLookupCount = 0;
var globalUpdateCount = 0;
var server = net.createServer((function(socket) {
  socket.setEncoding('ascii');
  var mode,
      seenKey,
      key,
      value;
  var lookupCount = 0;
  var updateCount = 0;
  socket.on('data', (function(data) {
    for (var i = 0; i < data.length; i++) {
      var c = data[$traceurRuntime.toProperty(i)];
      switch (c) {
        case '<':
          mode = LOOKUP;
          key = '';
          value = '';
          seenKey = false;
          break;
        case '>':
          mode = UPDATE;
          key = '';
          value = '';
          seenKey = false;
          break;
        case ':':
          seenKey = true;
          break;
        case ';':
          socket.write(mode == LOOKUP ? lookup(key) : update(key, value));
          break;
        default:
          if (seenKey)
            value += c;
          else
            key += c;
      }
    }
  }));
  socket.on('error', (function(error) {
    console.log('socket error', error);
  }));
  var table = {};
  function lookup(key) {
    globalLookupCount++;
    lookupCount++;
    return '>' + key + ':' + table[$traceurRuntime.toProperty(key)] + ';';
  }
  function update(key, value) {
    globalUpdateCount++;
    updateCount++;
    $traceurRuntime.setProperty(table, key, value);
    return '>' + key + ':' + value + ';';
  }
}));
server.on('error', (function(error) {
  return console.log('server error', error);
}));
server.on('close', (function() {
  return console.log('server close');
}));
setInterval((function() {
  return console.log(new Date(), 'lookups', globalLookupCount, 'updates', globalUpdateCount);
}), 1000);
var port = process.env.PORT || 9337;
server.listen(port);
console.log('KVS up on ' + port);