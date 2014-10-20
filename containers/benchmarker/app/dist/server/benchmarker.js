"use strict";
module.exports = (function(config) {
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
  app.get('/', (function(req, res) {
    res.json(machineStats);
    res.end();
  }));
  var webserver = http.createServer(app),
      io = socketIO(webserver);
  webserver.listen(config.httpPort);
  console.log('server up on', config.httpPort);
  io.on('connection', (function(socket) {
    socket.emit('machines', _.map(machineStats, (function(machine, name) {
      return {
        name: name,
        stats: machine
      };
    })));
  }));
  var machineWatcher = etcd.watcher('machines', 0, {recursive: true});
  machineWatcher.on('change', (function(body, header) {
    var machine = processStatNode(body.node);
    io.emit('machines', [machine]);
  }));
  machineWatcher.on('error', (function(error) {
    return console.log('watcher_change', error);
  }));
  etcd.get('machines/', {recursive: true}, (function(err, body) {
    if (err) {
      console.log(err);
      return;
    }
    var machines = _.flatten(body.node.nodes, (function(machineNode) {
      return _.flatten(machineNode.nodes, (function(statsNode) {
        return _.map(statsNode.nodes, processStatNode);
      }));
    }));
    io.emit('machines', machines);
  }));
  function processStatNode(node) {
    console.log(node);
    var matches = /^\/machines\/(.*?)\/stats\/(.*?)$/.exec(node.key),
        machineName = matches[1],
        statName = matches[2];
    console.log('updating machine', machineName, ':', statName);
    var machine = machineStats[machineName] = machineStats[machineName] || {};
    machine[statName] = node.value;
    return {
      name: machineName,
      stats: machine
    };
  }
  function grabLastKey(key) {
    var index = key.lastIndexOf('/');
    return key.substring(index + 1);
  }
});
//# sourceMappingURL=benchmarker.js.map
