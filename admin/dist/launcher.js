"use strict";
module.exports = (function(provider, log) {
  var concurrentLaunches = 1,
      launches = {
        inProgress: 0,
        next: 0
      };
  return {launch: launch};
  function launch(machines) {
    return new Promise((function(resolve, reject) {
      while (launches.inProgress < concurrentLaunches && launches.next < machines.length)
        launchNext();
      function launchNext() {
        if (launches.next >= machines.length)
          return resolve(machines);
        var machine = machines[launches.next];
        launchMachine(machine).then((function(data) {
          console.log('launched', machine.id);
          machine.response = data;
          launches.inProgress--;
          launchNext();
        }), (function(error) {
          launches.inProgress--;
          launchNext();
        }));
        launches.next++;
        launches.inProgress++;
      }
      function launchMachine(machine) {
        return new Promise((function(resolve, reject) {
          provider.createMachine(machine, resolve, reject);
        }));
      }
    }));
  }
});
//# sourceMappingURL=launcher.js.map
