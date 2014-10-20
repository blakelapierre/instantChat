var generators = require('../util/generators');

var {depthFirst, gMap, toGenerator, makeNode} = generators;

function* test() {
  yield 1;
  yield 2;
  yield* toGenerator([4, 5, 6, 7]);
  //return null;
}

gMap(toGenerator([1, 2, 3]), value => console.log(value));

gMap(test(), value => {
  if (typeof value == 'function') {
    gMap(value(), v => console.log('v', v));
  }
  console.log('va', value);
});

console.log('\ndepth first, toGenerator');
gMap(depthFirst(makeNode(1, toGenerator([makeNode(2, toGenerator([makeNode(4)])), makeNode(3)]))), value => console.log('value', value));

console.log('\ndpeth firs 2');
gMap(depthFirst(makeNode(1, [makeNode(2, [makeNode(4)]), makeNode(3)])), value => console.log('value', value));

var addition = makeNode('+', function* () {
  yield makeNode(1);
  return makeNode(2);
});

console.log('\ndepthFirst addition');
gMap(depthFirst(addition), value => console.log('log', value));

console.log('\ndepthFirst addition2');
var addition2 = toGenerator(['+', toGenerator([1]), toGenerator([2])]);
gMap(depthFirst(addition2), value => console.log('log', value));


var tree = {
  'root': {
    '+': [1, 2],
    'names': {
      'five': 5,
      'six': 6
    }
  }
};

var treeNode = makeNode('root', [
                          makeNode('+', [makeNode(1), makeNode(2)]),
                          makeNode('names', [
                            makeNode('five', [makeNode(5)]),
                            makeNode('six',  [makeNode(6)])
                          ])
                        ]);
console.log('\ntreeNode');
print(depthFirst(treeNode));
gMap(depthFirst(treeNode), value => console.log('tr', value));

function print(generator) {
  gMap(generator, value => console.log('print', value));
}


function* toNode(obj, value) {
  value = value || '@@root';
  // how to handle arrays?
  for (var key in obj) {
    var childValue = obj[key],
        childrenFunction;

    if (typeof value == 'object') {
      childrenFunction = () => {

      }
    }
    yield node(value, () => toNode(childValue, childrenFunction));
  }
}


// var loop = generators.loop(clusterMachineGenerator(5));

// var result;

// for (var i = 0; i < 100; i++) {
//   result = loop.next();
//   console.log('result', result);
// }

var q = [
  clusterMachineGenerator(10, 'sfo1-'),
  clusterMachineGenerator(5, 'nyc3-'),
  clusterMachineGenerator(7, 'lon1-')
];

function* clusterMachineGenerator(machineCount, prefix) {
  prefix = prefix || '';
  for (var i = 0; i < machineCount; i++) yield generateMachine(i);

  function generateMachine(number) {
    return { id: prefix + i.toString() };
  }
}

function* generator2() {
  var loop = generators.loopUntilEmpty(q),
      queue = loop.next().value;
  var generatorResult;
  do {
    generatorResult = loop.next();

    if (generatorResult.done) return;
    else {
      var machineGenerator = generatorResult.value,
          machineResult = machineGenerator.next();

      if (machineResult.done) queue.remove(machineGenerator);
      else yield machineResult.value;
    }
  } while (!generatorResult.done);
}

var gen = generator2();

var i = 0,
    result;
do {
  // if (i == 21) q.remove(0);
  // if (i == 30) q.add(1, clusterMachineGenerator(4));
  result = gen.next();
  if (!result.done) console.log(i++, result.value);
} while (!result.done);