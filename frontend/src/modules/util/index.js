require('angular');

module.exports = {
  'util': angular.module('util', [])
    .directive('rotator', require('./rotator/directive'))
    .directive('stage', require('./stage/directive'))
};