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
socket.on('data', keyValueEmitter(got));

function keyValueEmitter(emit) {
  return data => {
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
          emit(key, value);
          break;
        default:
          if (seenKey) key += c;
          else value += c;
          break;
      }
    }
  };
}

socket.on('error', error => console.log('socket error', error));

socket.setEncoding('ascii');

var outstanding = [],
    completed = [];

var start, end;

function runBenchmark() {
  start = microtime.now();

  var sent = 0;

  var drained = true;

  socket.on('drain', () => {
    drained = true;
    console.log('drained');
  });

  function send() {
    if (drained) {
      var stop = sent + 100;

      // console.log('Sending', sent, '-', stop, 'of', num_keys);

      if (stop > num_keys) stop = num_keys;

      for (sent; sent < stop; sent++ ) {
        if (!add(sent, sent)) {
          drained = false;
          console.log('filled');
          break;
        }
      }
    }

    if (sent < num_keys) setImmediate(send);
    else {
      var end = microtime.now();

      console.log('Sent', sent, 'updates in', calcTime(start, end));
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
    end = microtime.now();
    showResults(completed);
  }
}

function calcTime(start, end) {
  return ((end - start) / 1000000) + 's';
}

function showResults(completed) {
  console.log('computing results');

  var us_spent = end - start,
      seconds_spent = us_spent / 1000000;

  var response_times = _.map(completed, entry => entry[2] - entry[1]);

  var results = generateResults(response_times);

  results.us_spent_per_update = us_spent / num_keys;
  results.updates_per_second = num_keys / seconds_spent;

  console.log(results);

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