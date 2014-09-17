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

var LOOKUP = Symbol();
var UPDATE = Symbol();

var globalLookupCount = 0;
var globalUpdateCount = 0;

var server = net.createServer(socket => {
  socket.setEncoding('ascii');

  var mode, seenKey, key, value;

  var lookupCount = 0;
  var updateCount = 0;

  socket.on('data', data => {
    // is there a better way to do this?
    // probably, just track indices and then do a bulk copy out of the buffer later?
    for (var i = 0; i < data.length; i++) {
      var c = data[i];

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
          if (seenKey) value += c;
          else key += c;
      }
    }
  });

  socket.on('error', error => {
    console.log('socket error', error);
  });

  var table = {};

  function lookup(key) {
    globalLookupCount++;
    lookupCount++;
    return '>' + key + ':' + table[key] + ';';
  }

  function update(key, value) {
    globalUpdateCount++;
    updateCount++;
    table[key] = value;
    return '>' + key + ':' + value + ';';
  }
});

server.on('error', error => console.log('server error', error));
server.on('close', () => console.log('server close'));

setInterval(() => console.log(new Date(), 'lookups', globalLookupCount, 'updates', globalUpdateCount), 1000);

var port = process.env.PORT || 9337;

server.listen(port);
console.log('KVS up on ' + port);