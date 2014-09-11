var Peer = require('../util/rtc/peer').Peer,
    Signaler = require('../util/rtc/signaler')(),
    Broadcaster = require('../util/broadcaster/broadcaster'),
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

signal.on('peer offer', data => {
  if (!signaler.managesPeer(data.peerID)) {
    var peer = new Peer(data.peerID);

    signaler.managePeer(peer); // terrible placement here, but it gets the job done for now

    Broadcaster.addChannelListener(channelName, peer);
  }
  signalerEmitter.emit('offer', data);
});
signal.on('peer answer', data => signalerEmitter.emit('answer', data));
signal.on('peer candidates', data => signalerEmitter.emit('candidates', data));

socket.on('connect', () => {
  log('connected!');
  emit('register', {token: '9999'});
});

socket.on('your_id', myID => {
  log('myID:', myID);
});

socket.on('add source', data => {
  log('add source', data);

  var {channelName, peerID} = data;

  var peer = new Peer(peerID);

  signaler.managePeer(peer);
  Broadcaster.addChannelSource(channelName, peer);

  peer.connect().then(peer => log(peer), error => log.error(error));

  emit('source add', data);
});