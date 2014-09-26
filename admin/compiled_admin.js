var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    request = require('request'),
    traceur = require('traceur-runtime');
var doWrapper = require('do-wrapper');
var hogan = require('hogan.js');
var uuid = require('node-uuid');
var _ = require('lodash');
var api = new doWrapper(process.env.DO_TOKEN);
var keys = ['40:85:f0:9b:28:ad:5d:25:b5:51:2e:ad:f3:b3:31:98'];
var cloud_config = fs.readFileSync(path.join(__dirname, 'cloud-config')).toString();
var bootstrapTemplate = fs.readFileSync(path.join(__dirname, 'bootstrap.sh.template')).toString();
cloud_config = hogan.compile(cloud_config);
bootstrapTemplate = hogan.compile(bootstrapTemplate);
var service_files = glob.sync('../services/**/*.service');
var services = _.reduce(service_files, (function(result, fileName) {
  var name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.service'));
  $traceurRuntime.setProperty(result, name, {
    name: name,
    command: 'start',
    content: fs.readFileSync(fileName).toString()
  });
  return result;
}), {});
console.log(services);
launchCluster();
function launchCluster() {
  request('https://discovery.etcd.io/new', (function(error, response, discovery_url) {
    if (error) {
      console.log('Error getting discovery url!');
      return false;
    }
    create(1, 'core,collectd-influxdb-proxy,influxdb').at('sfo1');
    function create(count, roles) {
      var location = 'sfo1',
          size = '512mb',
          image = 'coreos-beta';
      var metadata = {roles: roles};
      function launch() {
        for (var i = 0; i < count; i++) {
          var name = uuid.v4();
          metadata.droplet_name = name;
          metadata.provider = 'digitalocean';
          metadata.location = location;
          metadata.image = image;
          metadata.size = size;
          metadata = _.map(metadata, (function(value, key) {
            return key + '=' + value;
          })).join(',');
          var files = getFiles(roles.split(','));
          var user_data = cloud_config.render({
            'discovery_url': discovery_url,
            'metadata': metadata,
            'files': files
          });
          console.log(user_data);
          api.dropletsCreateNewDroplet(name, location, size, image, {
            ssh_keys: keys,
            user_data: user_data
          }, (function(error, data) {
            if (error)
              console.log('error', error);
            console.log(data);
          }));
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
var roleServices = {
  'core': ['etcd-ambassador', 'collectd', 'collectd-dynamic-ambassador'],
  'collectd-influxdb-proxy': ['collectd-influxdb-proxy', 'collectd-influxdb-proxy-docker-register', 'collectd-influxdb-proxy-dynamic-ambassador'],
  'influxdb': ['influxdb', 'influxdb-docker-register']
};
function getFiles(roles) {
  var services = _.flatten(_.map(roles, (function(role) {
    return roleServices[$traceurRuntime.toProperty(role)];
  })));
  var bootstrap = {
    path: '/home/core/bootstrap.sh',
    owner: 'core',
    permissions: '0700',
    content: indent(bootstrapTemplate.render({services: _.map(services, (function(serviceName) {
        return {name: serviceName};
      }))}), '      ')
  };
  return [bootstrap].concat(_.map(services, makeFileRecord));
}
function makeFileRecord(serviceName) {
  var service = services[$traceurRuntime.toProperty(serviceName)];
  if (!service) {
    console.log(serviceName, 'not found!');
  }
  return {
    path: '/home/core/' + serviceName + '.service',
    owner: 'core',
    permissions: '0600',
    content: indent(service.content, '      ')
  };
}
function indent(s, i) {
  return s.replace(/^/gm, i);
}
