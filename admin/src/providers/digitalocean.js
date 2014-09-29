var DOWrapper = require('do-wrapper');


module.exports = config => {
  return { name: 'digitalocean', createMachine, destroyMachine };

  function createMachine(machineDescription, resolve, reject) {
    var api = new DOWrapper(config.token);

    var {id, location, size, image, keys, userData} = machineDescription;
    api.dropletsCreateNewDroplet(id, location, size, image,
      {ssh_keys: keys, user_data: userData},
      (error, data) => {
      if (error) reject(error, data);
      else resolve(data);
    });
  }

  function destroyMachine(machine, resolve, reject) {
    var api = new DOWrapper(config.token);

    api.dropletsDeleteDroplet(machine.response.droplet.id, (error, data) => {
      if (error) reject(error, data);
      else resolve(data);
    });
  }
};