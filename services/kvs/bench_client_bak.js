var traceurRuntime = require('traceur-runtime');

var net = require('net'),
    microtime = require('microtime'),
    _ = require('lodash'),
    ss = require('simple-statistics');

var port = process.env.PORT || 9337,
    host = process.env.HOST || 'localhost';

var num_keys = process.env.NUM_KEYS || 100000;

var socket = net.createConnection(port, host, () => runBenchmark());

var seenKey, key, value;
socket.on('data', data => {
  for (var i = 0; i < data.length; i++) {
    var c = data[i];

    switch(c) {
      case '>':
        seenKey = false;
        key = '';
        value = '';
        break;
      case ':':
        seenKey = true;
        break;
      case ';':
        got(key, value);
        break;
      default:
        if (seenKey) key += c;
        else value += c;
        break;
    }
  }
});

socket.on('error', error => console.log('socket error', error));

socket.setEncoding('ascii');

var outstanding = [],
    completed = [];

var start, end;

function runBenchmark() {
  start = microtime.now();

  var sent = 0;

  function send() {
    var stop = sent + 10000;
    if (stop > num_keys) stop = num_keys;

    for (sent; sent < stop; sent++) {
      add(sent, sent);
    }

    console.log('sent', sent);

    // if (stop < num_keys) process.nextTick(send);
    if (stop < num_keys) setTimeout(send, 1);
    else {
      end = microtime.now();
      console.log('Sent', sent, 'in', calcTime(start, end));
    }
  }

  send();
}

function add(key, value) {
  outstanding.push([key, microtime.now()]);
  return socket.write('>' + key + ':' + value + ';');
}

function got(key, value) {
  var request = outstanding.shift(1);

  // Sanity check
  if (!request || request[0] != key) {
    console.log('key error', request[0], key);
    process.exit();
  }

  request.push(microtime.now());
  completed.push(request);

  if (completed.length % 10000 == 0) console.log('outstanding', outstanding.length, 'completed', completed.length);

  if (completed.length == num_keys) {
    showResults(completed);
  }
}

function calcTime(start, end) {
  return ((end - start) / 1000000) + 's';
}

function showResults(completed) {
  console.log('computing results');

  var response_times = _.map(completed, entry => entry[2] - entry[1]);

  console.log(generateResults(response_times));

  process.exit();
}

function generateResults(response_times) {
  return _.reduce([
    'min',
    'max',
    'mean',
    'median',
    'mode',
    'variance',
    'standard_deviation',
    'median_absolute_deviation',
    'geometric_mean',
    'harmonic_mean'
  ], (result, stat) => {
    result[stat] = ss[stat](response_times) / 1000000;
    return result;
  }, {});
}