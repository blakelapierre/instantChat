var _ = require('lodash'),
    hogan = require('hogan.js'),
    templates = require('./templates');

function launchMachines(provider, machines) {
  var concurrentLaunches = 2,
      launches = {inProgress: 0, next: 0};

  function launchNext() {
    if (launches.next >= machines.length) return false;

    var machine = machines[launches.next];

    launchMachine(machine).then(data => {
      launches.next++;
      launches.inProgress--;
      launchNext();
    }).error(error => {
      launches.inProgress--;
      launchNext();
    });

    launches.inProgress++;
  }

  function launchMachine(machine) {
    return new Promise((resolve, reject), () => {
      provider.createMachine(machine, resolve, reject);
    });
  }
}




var containers = [{
  container: 'google/cadvisor',
  linkTo: ['influxdb']

}];


  container: 'collectd',
  linkTo: ['collectd-influxdb-proxy:proxy']
},{
  container: 'collectd-influxdb-proxy',
  linkTo: ['influxdb:db'],

  env: {
    'DB_HOST': 'influxdb/ip',
    'DB_PORT': 'influxdb:db',
    'DB_USER': 'influxdb$user',
    'DB_PASSWORD': 'influxdb$password',
    'DB_DB': '$influxdb$database'
  },
  ports: {
    '8079': 'proxy'
  }
},{
  container: 'influxdb',
  variables: {
    'database': 'collectd',
    'user': 'root',
    'password': '@sha1goeshere?'
  },
  env: {
    'INFLUXDB_INIT_PWD': '$password',
    'PRE_CREATE_DB': '$databases'
  },
  ports: {
    '8083': 'db',
    '8086': 'http',
    '#8090': 'clustering stuff',
    '#8099': 'clustering stuff 2'
  }
},{
  container: 'broadcaster'
}];

var config = {
  name: 'instantchat',
  all: ['cadvisor'],
  machines: [{
    count: 1,
    service: 'grafana'
  },{
    count: 1,
    service: 'influxdb'
  }]
};

function generateCloudConfig(config) {



  return templates.cloudConfig.render({
    discovery_url: discovery
  });
}

function

function generateServiceFiles(definitions) {
  return _.map(serviceFileDefintions, generateService);
}

function generateService(definition) {
  return templates.service.render(definition);
}




function test() {
  at('sfo1', [
    create(3, 'etcd'),
    create(1, 'collectd-influxdb-proxy'),
    create(1, 'influxdb')
  ])

  at('sfo1').create([
    'etcd': 3,
    'collectd-influxdb-proxy': 1,
    'influxdb': 1
  ])

  function at(location) {

  }

  function create(number, role) {

  }
}