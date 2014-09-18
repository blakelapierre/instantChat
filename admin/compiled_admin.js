var fs = require('fs'),
    path = require('path'),
    request = require('request');
var doWrapper = require('do-wrapper');
var hogan = require('hogan');
var uuid = require('node-uuid');
var api = new doWrapper('9bb398fe89444391e550be407d79029845f5c69c979556a6415c593c755497d1');
var keys = ['40:85:f0:9b:28:ad:5d:25:b5:51:2e:ad:f3:b3:31:98'];
var cloud_config = fs.readFileSync(path.join(__dirname, 'cloud-config')).toString();
cloud_config = hogan.compile(cloud_config);
launchCluster();
function launchCluster() {
  request('https://discovery.etcd.io/new', (function(error, response, discovery_url) {
    if (error) {
      console.log('Error getting discovery url!');
      return false;
    }
    create(3, 'broadcaster').at('sfo1');
    function create(count, metadata) {
      var location = 'sfo1',
          size = '512mb',
          image = 'coreos-alpha';
      function launch() {
        var user_data = cloud_config.render({
          'discovery_url': discovery_url,
          'metadata': metadata
        });
        console.log(user_data);
        for (var i = 0; i < count; i++) {
          var name = uuid.v4();
          console.log('launching', name);
        }
      }
      setImmediate(launch);
      chain.at = (function(l) {
        return chain((function() {
          return location = l;
        }));
      });
      chain.size = (function(s) {
        return chain((function() {
          return size = s;
        }));
      });
      return chain;
      function chain(fn) {
        fn();
        return chain;
      }
    }
  }));
}
