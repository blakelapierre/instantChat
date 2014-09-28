module.exports = (provider, log) => {
  var concurrentLaunches = 1,
      launches = {inProgress: 0, next: 0};

  return { launch };

  // Currently can only have one of these running
  function launch(machines) {
    return new Promise((resolve, reject) => {
      while (launches.inProgress < concurrentLaunches && launches.next < machines.length) launchNext();

      function launchNext() {
        if (launches.next >= machines.length) return resolve(machines);

        var machine = machines[launches.next];

        launchMachine(machine).then(data => {
          console.log('launched', machine.id);
          machine.response = data;
          launches.inProgress--;
          launchNext();
        }, error => {
          launches.inProgress--;
          launchNext();
        });

        launches.next++;
        launches.inProgress++;
      }

      function launchMachine(machine) {
        return new Promise((resolve, reject) => {
          provider.createMachine(machine, resolve, reject);
        });
      }
    });
  }
};