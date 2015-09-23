require('angular');

module.exports = {
  'network': angular.module('network', [])
    .factory('stats', require('./stats/factory'))
};