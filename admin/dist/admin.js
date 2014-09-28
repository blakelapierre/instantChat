"use strict";
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    request = require('request'),
    traceur = require('traceur-runtime');
var doWrapper = require('do-wrapper');
var doProvider = require('./providers/digitalocean')({token: process.env.DO_TOKEN});
var dummyProvider = require('./providers/dummy')();
var provider = doProvider;
var launcher = require('./launcher')(provider, (function() {
  var $__2;
  for (var args = [],
      $__0 = 0; $__0 < arguments.length; $__0++)
    args[$__0] = arguments[$__0];
  return ($__2 = console).log.apply($__2, $traceurRuntime.spread([new Date()], args));
}));
var hogan = require('hogan.js');
var uuid = require('node-uuid');
var _ = require('lodash');
var keys = ['40:85:f0:9b:28:ad:5d:25:b5:51:2e:ad:f3:b3:31:98'];
var baseDir = path.join(__dirname, '..');
var cloud_config = fs.readFileSync(path.join(baseDir, 'cloud-config')).toString();
var bootstrapTemplate = fs.readFileSync(path.join(baseDir, 'bootstrap.sh.template')).toString();
cloud_config = hogan.compile(cloud_config);
bootstrapTemplate = hogan.compile(bootstrapTemplate);
var service_files = glob.sync('../services/**/*.service');
var services = _.reduce(service_files, (function(result, fileName) {
  var name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.service'));
  result[name] = {
    name: name,
    command: 'start',
    content: fs.readFileSync(fileName).toString()
  };
  return result;
}), {});
var log = (function() {
  var $__2;
  for (var args = [],
      $__1 = 0; $__1 < arguments.length; $__1++)
    args[$__1] = arguments[$__1];
  return ($__2 = console).log.apply($__2, $traceurRuntime.spread(args));
});
launchCluster(provider, log).then((function(machines) {
  return console.log('launched', machines.length, 'machines');
}), (function(error) {
  return console.log('error', error);
}));
function launchCluster(provider, log) {
  return new Promise((function(resolve, reject) {
    request('https://discovery.etcd.io/new', (function(error, response, discovery_url) {
      if (error) {
        console.log('Error getting discovery url!');
        return false;
      }
      log('seed', discovery_url);
      var create = (function(count, role) {
        var location = 'sfo1',
            size = '512mb',
            image = 'coreos-alpha',
            then = (function() {});
        var launch = (function() {
          return _.map(_.range(count), (function(i) {
            var id = uuid.v4();
            var metadata = _.map({
              provider: provider.name,
              location: location,
              role: role,
              image: image,
              size: size,
              id: id
            }, (function(value, key) {
              return key + '=' + value;
            })).join(',');
            var files = getFiles(role.split('|'));
            var userData = cloud_config.render({
              'discovery_url': discovery_url,
              'metadata': metadata,
              'files': files
            });
            return {
              id: id,
              provider: provider.name,
              location: location,
              size: size,
              image: image,
              keys: keys,
              userData: userData
            };
          }));
        });
        var chain = ((function() {
          return (function(fn) {
            fn();
            return chain;
          });
        }))();
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
        chain.then = (function(t) {
          return chain((function() {
            return then = t;
          }));
        });
        chain.launch = launch;
        return chain;
      });
      var machines = _.flatten([create(1, 'influxdb').at('sfo1').launch(), create(1, 'grafana').at('sfo1').launch(), create(2, 'broadcaster').at('sfo1').launch()]);
      launcher.launch(machines).then((function(machines) {
        console.log('All machines launched', machines);
        fs.writeFileSync(path.join(baseDir, 'cloud.machines'), JSON.stringify(machines));
        resolve(machines);
      }), (function(error) {
        return reject(error);
      })).catch((function(error) {
        return reject(error);
      }));
    }));
  }));
}
var roleServices = {
  'core': ['cadvisor'],
  'influxdb': ['cadvisor', 'influxdb'],
  'grafana': ['cadvisor', 'grafana'],
  'broadcaster': ['cadvisor', 'broadcaster@']
};
function getFiles(roles) {
  var services = _.flatten(_.map(roles, (function(role) {
    return roleServices[role];
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
  var service = services[serviceName];
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
//# sourceMappingURL=admin.js.map
