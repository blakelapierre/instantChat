var fs = require('fs'),
    path = require('path'),
    request = require('request');

var doWrapper = require('do-wrapper');
var hogan = require('hogan');
var uuid = require('node-uuid');

var api = new doWrapper(process.env.DO_TOKEN);

var keys = ['40:85:f0:9b:28:ad:5d:25:b5:51:2e:ad:f3:b3:31:98'];

var cloud_config = fs.readFileSync(path.join(__dirname, 'cloud-config')).toString();

cloud_config = hogan.compile(cloud_config);

// api.dropletsGetAll((err, droplets) => {
//   console.log(err);
//   console.log(droplets);
// });

// api.dropletsCreateNewDroplet('coreos-1', 'sfo1', '512mb', 'coreos-alpha',
//   {ssh_keys: keys, user_data: cloud_config},
//   (error, data) => {
//   if (error) console.log('error', error);
//   console.log(data);
// });


launchCluster();


function launchCluster() {
  request('https://discovery.etcd.io/new', (error, response, discovery_url) => {
    if (error) {
      console.log('Error getting discovery url!');
      return false;
    }

    create(3, 'core').at('sfo1');

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

          api.dropletsCreateNewDroplet(name, location, size, image,
            {ssh_keys: keys, user_data: user_data},
            (error, data) => {
            if (error) console.log('error', error);
            console.log(data);
          });

          console.log('launching', name);
        }
      }

      // This will cause launch to fire at the end of the chain
      setImmediate(launch);

      chain.at = l => chain(() => location = l);
      chain.size = s => chain(() => size = s);

      return chain;

      function chain(fn) {
        fn();
        return chain;
      }
    }
  });
}



