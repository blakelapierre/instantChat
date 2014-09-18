// A key:value TCP server
// Interprets as an ASCII stream
// Commands are:
//
// lookup: <key;
//    writes back: >key:value;
// update: >key:value;
//    writes back: >key:value;
var traceurRuntime = require('traceur-runtime');

var net = require('net');
var microtime = require('microtime');

var LOOKUP = Symbol();
var UPDATE = Symbol();

var table = {};

var globalLookupCount = 0,
    globalUpdateCount = 0;

var server = net.createServer(socket => {
  socket.setEncoding('ascii');

  var mode;

  var partialKey = '',
      partialValue = '';

  var lookupCount = 0,
      updateCount = 0;

  var open = true;

  socket.on('data', data => {
    //var start = microtime.now();

    var keyStart, valueStart;

    for (var i = 0; i < data.length; i++) {
      var c = data[i];

      switch(c) {
        case '<':
          mode = LOOKUP;
          keyStart = i + 1;
          valueStart = -1;
          break;
        case '>':
          mode = UPDATE;
          keyStart = i + 1;
          valueStart = -1;
          break;
        case ':':
          valueStart = i + 1;
          break;
        case ';':
          if (mode == LOOKUP) {
            var key = data.substring(keyStart, i);
            if (partialKey) key = partialKey + key;
            open = socket.write(lookup(key));
          }
          else {
            var key = data.substring(keyStart, valueStart - 1);
            if (partialKey) key = partialKey + key;

            var value = data.substring(valueStart, i);
            if (partialValue) value = partialValue + value;

            open = socket.write(update(key, value));
          }

          if (!open) {
            console.log('filled');
            socket.pause();
          }

          keyStart = -1;
          valueStart = -1;

          partialKey = null;
          partialValue = null;

          break;
        default:
          break;
      }
    }

    if (valueStart > -1) {
      if (valueStart < data.length) partialValue = data.substr(valueStart);
      else partialValue = '';
    }
    else if (keyStart > -1) {
      if (keyStart < data.length) partialKey = data.substr(keyStart);
      else partialKey = '';
    }

    //var end = microtime.now();

    //console.log(socket.remoteAddress, 'data of size', data.length, 'took', (end - start), 'micro seconds');
  });

  socket.on('drain', () => {
    console.log('drained');
    open = false;
    socket.resume();
  });

  socket.on('error', error => {
    console.log('socket error', error);
  });

  function lookup(key) {
    globalLookupCount++;
    lookupCount++;
    return '>' + key + ':' + table[key] + ';';
  }

  function update(key, value) {
    table[key] = value;
    globalUpdateCount++;
    updateCount++;
    return '>' + key + ':' + value + ';';
  }
});

server.on('error', error => console.log('server error', error));
server.on('close', () => console.log('server close'));

var previousLookupCount = 0,
    previousUpdateCount = 0,
    lookupsPerSecond = 0,
    updatesPerSecond = 0;

var lastCall = new Date().getTime();

var smoothingFactor = 0.9,
    threshold = 0.01;

setInterval(() => {
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

  if (lookupsPerSecond < threshold) lookupsPerSecond = 0;
  if (updatesPerSecond < threshold) updatesPerSecond = 0;

  previousLookupCount = globalLookupCount;
  previousUpdateCount = globalUpdateCount;

  console.log(
    now,
    'dt', dt,
    'lookups', globalLookupCount,
    'updates', globalUpdateCount,
    'lrate', lookupsPerSecond,
    'urate', updatesPerSecond,
    'dl', lookupChange,
    'du', updateChange
  );
}, 1000);

var port = process.env.PORT || 9337;

server.listen(port);
console.log('KVS up on ' + port);