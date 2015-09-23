require('angular');

import network from '../network';

module.exports = {
  'ui': angular.module('ui', ['instant-chat', 'network'])
    .directive('contacts', require('./contacts/directive'))
      .directive('inviteSomeone', require('./contacts/inviteSomeone/directive'))

    .directive('generating', require('./generating/directive'))
    .directive('mainStage', require('./mainStage/directive'))
    .directive('networkStatus', require('./networkStatus/directive'))
    .directive('uisettings', require('./settings/directive'))
    .directive('status', require('./status/directive'))
};