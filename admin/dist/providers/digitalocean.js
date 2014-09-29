"use strict";
var DOWrapper = require('do-wrapper');
module.exports = (function(config) {
  return {
    name: 'digitalocean',
    createMachine: createMachine,
    destroyMachine: destroyMachine
  };
  function createMachine(machineDescription, resolve, reject) {
    var api = new DOWrapper(config.token);
    var $__0 = machineDescription,
        id = $__0.id,
        location = $__0.location,
        size = $__0.size,
        image = $__0.image,
        keys = $__0.keys,
        userData = $__0.userData;
    api.dropletsCreateNewDroplet(id, location, size, image, {
      ssh_keys: keys,
      user_data: userData
    }, (function(error, data) {
      if (error)
        reject(error, data);
      else
        resolve(data);
    }));
  }
  function destroyMachine(machine, resolve, reject) {
    var api = new DOWrapper(config.token);
    api.dropletsDeleteDroplet(machine.response.droplet.id, (function(error, data) {
      if (error)
        reject(error, data);
      else
        resolve(data);
    }));
  }
});
//# sourceMappingURL=digitalocean.js.map
