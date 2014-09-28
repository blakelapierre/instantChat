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
    console.log(machineDescription);
    api.dropletsCreateNewDroplet(id, location, size, image, {
      ssh_keys: keys,
      user_data: userData
    }, (function(error, data) {
      console.log(error, data);
      if (error)
        reject(error, data);
      else
        resolve(data);
    }));
  }
  function destroyMachine(machineID, resolve, reject) {
    var api = new DOWrapper(config.token);
    api.dropletsDeleteDroplet(machineID, (function(error, data) {
      if (error)
        reject(error, data);
      else
        resolve(data);
    }));
  }
});
//# sourceMappingURL=do.js.map
