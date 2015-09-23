require('angular');

module.exports = {
  'identity': angular.module('identity', [])
    .factory('identity', require('./factory.js'))
};