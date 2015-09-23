var Peer = require('../util/rtc/peer').Peer,
    Signaler = require('../util/rtc/signaler')(),
    Broadcaster = require('../util/broadcaster/broadcaster')(),
    log = require('../util/log')(),
    emitter = require('../util/emitter')(),
    io = require('socket.io');


var socket = io('https://' + window.location.host + '/broadcaster'),
    signal = io('https://' + window.location.host + '/signal');

var emit = (event, data) => socket.emit(event, data);

var signalerEmitter = emitter();

var signaler = Signaler({
  emit: (name, data) => signal.emit('peer ' + name, data),
  on: signalerEmitter.on
});

var token = window.location.search.split('=')[1];

on(signal, {
  'peer offer':      offer      => receiveOffer(offer),
  'peer answer':     answer     => signalerEmitter.emit('answer', answer),
  'peer candidates': candidates => signalerEmitter.emit('candidates', candidates)
});

on(socket, {
  'connect':    ()   => connected(),
  'your_id':    myID => recieveID(myID),
  'add source': data => addSource(data)
});

function on(obj, handlers) {
  _.each(handlers, (handler, name) => obj.on(name, handler));
}

function receiveOffer(offer) {
  if (!signaler.managesPeer(offer.to)) {
    var peer = new Peer(offer.to);

    signaler.managePeer(peer); // terrible placement here, but it gets the job done for now

    var firstChannel;
    for (var channel in Broadcaster.channels) {
      firstChannel = channel;
      break;
    }
    Broadcaster.addChannelListener(firstChannel, peer);
  }
  signalerEmitter.emit('offer', offer);
}


function connected() {
  log('connected!');
  emit('register', {token: token});
}

function recieveID(myID) {
  log('myID:', myID);
}

function addSource(data) {
  log('add source', data);

  var {channelName, peerID} = data;

  var peer = new Peer(peerID);

  signaler.managePeer(peer);
  Broadcaster.addChannelSource(channelName, peer);

  peer
    .connect()
      .then(peer => {
        setInterval(() => {
          peer.getStats().then(report => {
            var result = report.result();

            var final = _.reduce(result, (_r, r) => {
              _r[r.id] = _.reduce(r.names(), (stat, name) => {
                stat[name] = r.stat(name);
                return stat;
              }, {});
              return _r;
            }, {});

            socket.emit('stats', final);
          }).catch(error => log.error(error));
        }, 1000);
      })
      .catch(error => log.error(error));

  emit('source add', data);
}