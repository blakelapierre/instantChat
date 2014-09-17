var traceurRuntime = require('traceur-runtime');
var net = require('net');
var microtime = require('microtime');
var LOOKUP = Symbol();
var UPDATE = Symbol();
var table = {};
var globalLookupCount = 0,
    globalUpdateCount = 0;
var server = net.createServer((function(socket) {
  socket.setEncoding('ascii');
  var mode,
      seenKey,
      key,
      value;
  var lookupCount = 0,
      updateCount = 0;
  var open = true;
  socket.on('data', (function(data) {
    var start = microtime.now();
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
          open = socket.write(mode == LOOKUP ? lookup(key) : update(key, value));
          if (!open) {
            console.log('filled');
            socket.pause();
          }
          break;
        default:
          if (seenKey)
            value += c;
          else
            key += c;
      }
    }
    var end = microtime.now();
    console.log('data of size', data.length, 'took', (end - start), 'micro seconds');
  }));
  socket.on('drain', (function() {
    console.log('drained');
    open = false;
    socket.resume();
  }));
  socket.on('error', (function(error) {
    console.log('socket error', error);
  }));
  function lookup(key) {
    globalLookupCount++;
    lookupCount++;
    return '>' + key + ':' + table[$traceurRuntime.toProperty(key)] + ';';
  }
  function update(key, value) {
    $traceurRuntime.setProperty(table, key, value);
    globalUpdateCount++;
    updateCount++;
    return '>' + key + ':' + value + ';';
  }
}));
server.on('error', (function(error) {
  return console.log('server error', error);
}));
server.on('close', (function() {
  return console.log('server close');
}));
var previousLookupCount = 0,
    previousUpdateCount = 0,
    lookupsPerSecond = 0,
    updatesPerSecond = 0;
var lastCall = new Date().getTime();
var smoothingFactor = 0.9,
    threshold = 0.01;
setInterval((function() {
  var now = new Date(),
      time = now.getTime(),
      dt = time - lastCall;
  lastCall = time;
  var lookupChange = globalLookupCount - previousLookupCount,
      updateChange = globalUpdateCount - previousUpdateCount,
      lookupChangePerSecond = lookupChange / (dt / 1000);
  updateChangePerSecond = updateChange / (dt / 1000);
  lookupsPerSecond = smoothingFactor * lookupChangePerSecond + (1 - smoothingFactor) * lookupsPerSecond;
  updatesPerSecond = smoothingFactor * updateChangePerSecond + (1 - smoothingFactor) * updatesPerSecond;
  if (lookupsPerSecond < threshold)
    lookupsPerSecond = 0;
  if (updatesPerSecond < threshold)
    updatesPerSecond = 0;
  previousLookupCount = globalLookupCount;
  previousUpdateCount = globalUpdateCount;
  console.log(now, 'dt', dt, 'lookups', globalLookupCount, 'updates', globalUpdateCount, 'lrate', lookupsPerSecond, 'urate', updatesPerSecond, 'dl', lookupChange, 'du', updateChange);
}), 1000);
var port = process.env.PORT || 9337;
server.listen(port);
console.log('KVS up on ' + port);
