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

var kvs = (() => {
    var kvs = {
      table: {},

      lookupCount: 0,
      updateCount: 0,

      lookup: lookup,
      update: update
    };

    var {table} = kvs;

    function lookup(key) {
      kvs.lookupCount++;
      return table[key];
    }

    function update(key, value) {
      kvs.updateCount++;
      table[key] = value;
    }

    return kvs;
})();

var server = net.createServer(socket => {
  socket.setEncoding('ascii');

  var stats = {};

  var kvsTransform = new KVSTransform(kvs, stats);

  socket
    .pipe(kvsTransform)
    .pipe(socket);

  socket.on('error', error => {
    console.log('socket error', error);
  });
});

server.on('error', error => console.log('server error', error));
server.on('close', () => console.log('server close'));

setInterval(() => console.log(new Date(), 'lookups', kvs.lookupCount, 'updates', kvs.updateCount), 1000);

var port = process.env.PORT || 9337;

server.listen(port);
console.log('KVS up on ' + port);


var Transform = require('stream').Transform,
    util = require('util');

function KVSTransform(kvs, stats) {
  stats.updateCount = 0;
  stats.lookupCount = 0;

  this.kvs = kvs;
  this.stats = stats;

  this.update = kvs.update;
  this.lookup = kvs.lookup;

  Transform.call(this, {decodeStrings: false});
}

util.inherits(KVSTransform, Transform);

KVSTransform.prototype._transform = function(chunk, encoding, callback) {
  // is there a better way to do this?
  // probably, just track indices and then do a bulk copy out of the buffer later?
  for (var i = 0; i < chunk.length; i++) {
    var c = chunk[i];
    switch (c) {
      case '<':
        this.mode = LOOKUP;
        this.key = '';
        this.value = '';
        this.seenKey = false;
        break;
      case '>':
        this.mode = UPDATE;
        this.key = '';
        this.value = '';
        this.seenKey = false;
        break;
      case ':':
        this.seenKey = true;
        break;
      case ';':
        if (this.mode == LOOKUP) {
          this.stats.lookupCount++;
          this.push('>' + this.key + ':' + this.lookup(this.key) + ';');
        }
        else {
          this.stats.updateCount++;
          this.update(this.key, this.value);
          this.push('>' + this.key + ':' + this.value + ';');
        }
        break;
      default:
        if (this.seenKey) this.value += c;
        else this.key += c;
        break;
    }
  }

  callback();
};

KVSTransform.prototype._flush = function(flushCompleteFn) {
  this.push(null);
  flushCompleteFn();
};