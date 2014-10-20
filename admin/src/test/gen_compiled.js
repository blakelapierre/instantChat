function* loopUntilEmpty(q) {
  console.log(q);
  var queue = {q: q},
      next = 0;
  queue.remove = (function(obj) {
    var index = q.indexOf(obj);
    if (index != -1) {
      q.splice(index, 1);
      if (next >= index) {
        next = next == 0 ? q.length - 1 : next - 1;
      }
    } else
      throw Error('Tried to remove object that is not in q', obj, q);
  });
  queue.add = (function(index, obj) {
    q.splice(index, 0, obj);
    if (index < next) {
      next = next + 1;
    }
  });
  yield queue;
  while (q.length > 0) {
    next = next % q.length;
    yield q[next];
    next = next + 1;
  }
}
var q = [clusterMachineGenerator(10, 'sfo1-'), clusterMachineGenerator(5, 'nyc3-'), clusterMachineGenerator(7, 'lon1-')];
function* clusterMachineGenerator(machineCount, prefix) {
  prefix = prefix || '';
  for (var i = 0; i < machineCount; i++)
    yield generateMachine(i);
  function generateMachine(number) {
    return {id: prefix + i.toString()};
  }
}
function* generator2() {
  var loop = loopUntilEmpty(q),
      queue = loop.next().value;
  var generatorResult;
  do {
    generatorResult = loop.next();
    if (generatorResult.done)
      return;
    else {
      var machineGenerator = generatorResult.value,
          machineResult = machineGenerator.next();
      if (machineResult.done)
        queue.remove(machineGenerator);
      else
        yield machineResult.value;
    }
  } while (!generatorResult.done);
}
var gen = generator2();
var i = 0,
    result;
do {
  result = gen.next();
  if (!result.done)
    console.log(i++, result.value);
} while (!result.done);

//# sourceMappingURL=gen_compiled.map
