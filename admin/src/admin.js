var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    request = require('request'),
    traceur = require('traceur-runtime');

var doWrapper = require('do-wrapper');

var doProvider = require('./providers/digitalocean')({token: process.env.DO_TOKEN});
var dummyProvider = require('./providers/dummy')();

var provider = doProvider;
// var provider = dummyProvider;

var launcher = require('./launcher')(provider, (...args) => console.log(new Date(), ...args));

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

var services = _.reduce(service_files, (result, fileName) => {
  var name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.service'));

  result[name] = {
    name: name,
    command: 'start',
    content: fs.readFileSync(fileName).toString()
  };

  return result;
}, {});

var log = (...args) => console.log(...args);

// launchCluster(doProvider);
launchCluster(provider, log)
  .then(machines => console.log('launched', machines.length, 'machines'),
        error => console.log('error', error));

function launchCluster(provider, log) {
  return new Promise((resolve, reject) => {
    request('https://discovery.etcd.io/new', (error, response, discovery_url) => {
      if (error) {
        console.log('Error getting discovery url!');
        return false;
      }

      log('seed', discovery_url);

      var create = (count, role) => {
        var location = 'sfo1',
            size = '512mb',
            image = 'coreos-alpha',
            then = () => {};

        var launch = () => {
          return _.map(_.range(count), i => {

            var id = uuid.v4();

            var machine = {
              provider: provider.name,
              location,
              role,
              image,
              size,
              id
            };

            var metadata = _.map(machine, (value, key) => key + '=' + value).join(',');

            var files = getFiles(machine);

            var userData = cloud_config.render({discovery_url, metadata, files});

            return {
              id,
              provider: provider.name,
              location,
              size,
              image,
              keys,
              userData
            };
          });
        };

        // This will cause launch to fire at the end of the chain
        //setImmediate(launch);

        var chain = (() => {
          return fn => {
            fn();
            return chain;
          };
        })();

        chain.at = l => chain(() => location = l);
        chain.size = s => chain(() => size = s);
        chain.then = t => chain(() => then = t);
        chain.launch = launch;

        return chain;
      };

      var machines = _.flatten([
        create(1, 'influxdb').at('sfo1').launch(),
        create(1, 'grafana').at('sfo1').launch(),
        create(1, 'benchmarker').at('sfo1').launch(),
        create(7, 'broadcaster').at('sfo1').launch()
      ]);

      // how do we generate the machines on demand instead of all up front?
      launcher.launch(machines).then(machines => {
        console.log('All machines launched!');
        fs.writeFileSync(path.join(baseDir, 'cloud.machines'), JSON.stringify(machines));
        resolve(machines);
      }, error => reject(error))
      .catch(error => reject(error));
    });
  });
}

var roleServices = {
  'core': [
    'cadvisor'
  ],
  'influxdb': [
    'cadvisor',
    'influxdb'
  ],
  'grafana': [
    'cadvisor',
    'grafana'
  ],
  'broadcaster': [
    'cadvisor',
    'broadcaster@'
  ],
  'benchmarker': [
    'cadvisor',
    'benchmarker'
  ]
};

function getFiles(machine) {
  var {id, role} = machine;

  var services = roleServices[role];

  var bootstrap = {
    path: '/home/core/bootstrap.sh',
    owner: 'core',
    permissions: '0700',
    content: indent(bootstrapTemplate.render({services: _.map(services, serviceName => {return {fileName: serviceName + '.service', name: serviceName + (serviceName.indexOf('@') >= 0 ? id : '')};})}), '      ')
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

// function chainable(launch, methods) {

//   setImmediate(launch);

//   for (var name in methods) {
//     chain[name] = (args...) => chain(methods[name]);
//   }

//   return chain;

//   function chain(fn) {
//     fn();
//     return chain;
//   }
// }