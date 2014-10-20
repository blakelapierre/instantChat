module.exports = config => {
  var ETCD = require('node-etcd'),
      path = require('path'),
      http = require('http'),
      express = require('express'),
      socketIO = require('socket.io'),
      app = express(),
      _ = require('lodash');

  var etcd = new ETCD(config.etcd.host, config.etcd.port);
  var machineStats = {};

  app.use(express.static(path.join(config.distRoot, 'frontend')));
  console.log(path.join(config.distRoot, 'frontend'));

  app.get('/', (req, res) => {
    res.json(machineStats);
    res.end();
  });

  var webserver = http.createServer(app),
      io = socketIO(webserver);

  webserver.listen(config.httpPort);
  console.log('server up on', config.httpPort);

  io.on('connection', socket => {
    socket.emit('machines', _.map(machineStats, (machine, name) => { return {name, stats: machine}; }));
  });

  var machineWatcher = etcd.watcher('machines', 0, {recursive: true});

  machineWatcher.on('change', (body, header) => {
    var machine = processStatNode(body.node);

    io.emit('machines', [machine]);
  });
  machineWatcher.on('error', (error) => console.log('watcher_change', error));

  etcd.get('machines/', {recursive:true}, (err, body) => {
    if (err) {
      console.log(err);
      return;
    }

// uh....terrible
    var machines = _.flatten(body.node.nodes, machineNode => {
      return _.flatten(machineNode.nodes, statsNode => {
        return _.map(statsNode.nodes, processStatNode);
      });
    });


    io.emit('machines', machines);
  });

  function processStatNode(node) {
    console.log(node);
    var matches = /^\/machines\/(.*?)\/stats\/(.*?)$/.exec(node.key),
        machineName = matches[1],
        statName = matches[2];

    console.log('updating machine', machineName, ':', statName);

    var machine = machineStats[machineName] = machineStats[machineName] || {};

    machine[statName] = node.value;

    return {name: machineName, stats: machine};
  }

  function grabLastKey(key) {
    var index = key.lastIndexOf('/');

    return key.substring(index + 1);
  }
};