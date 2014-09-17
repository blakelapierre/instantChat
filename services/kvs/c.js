var traceurRuntime = require('traceur-runtime');
var net = require('net');
var LOOKUP = Symbol();
var UPDATE = Symbol();
var server = net.createServer((function(socket) {
  socket.setEncoding('ascii');
  var mode,
      key,
      value;
  socket.on('data', (function(data) {
    for (var i = 0; i < data.length; i++) {
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
          var c = data[$traceurRuntime.toProperty(i)];
          if (seenKey)
            value += c;
          else
            key += c;
      }
    }
  }));
  var table = {};
  function lookup(key) {
    return '>' + key + ':' + table[$traceurRuntime.toProperty(key)] + ';';
  }
  function update(key, value) {
    $traceurRuntime.setProperty(table, key, value);
    return '>' + key + ':' + value + ';';
  }
}));
server.listen(process.env.PORT);
