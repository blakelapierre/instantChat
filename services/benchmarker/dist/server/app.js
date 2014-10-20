"use strict";
var path = require('path'),
    benchmarker = require('./benchmarker');
benchmarker({
  distRoot: path.join(__dirname, '../../dist'),
  httpPort: 2771,
  etcd: {
    host: process.env.ETCD_HOST || '127.0.0.1',
    port: process.env.ETCD_PORT || '4001'
  }
});
//# sourceMappingURL=app.js.map
