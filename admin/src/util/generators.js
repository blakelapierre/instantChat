

module.exports = {
  depthFirst,
  breadthFirst,
  gMap,
  toGenerator,
  loop,
  loopUntilEmpty,
  makeNode
};

function gMap(g, fn) {
  while (true) {
    var result = g.next();
    fn(result.value);
    if (result.done) return;
  }
}

function* loop(g) {
  var q = [],
      next = 0;

  var result;
  while(true) {
    var result = g.next();
    if (!result.done) {
      q.push(result.value);
      yield result.value;
    }
    else break;
  }

  while (true) {
    var result = g.next();
    if (!result.done) {
      q.push(result.value);
      yield result.value;
    }
    else {
      var value = q[next];
      yield value;
      next = (next + 1) % q.length;
    }
  }
}

// q: an array of generators
// A generator that loops through `q` in round-robin fashion,
// yielding the next value from each generator
// until all values have been generated
function* loopUntilEmpty(q) {
  var queue = {q},
      next = 0;

  queue.remove = obj => {
    var index = q.indexOf(obj);
    if (index != -1) {
      q.splice(index, 1);
      if (next >= index) {
        next = next == 0 ? q.length - 1 : next - 1;
      }
    }
    else throw Error('Tried to remove object that is not in q', obj, q);
  };

  queue.add = (index, obj) => {
    q.splice(index, 0, obj);
    if (index < next) {
      next = next + 1;
    }
  };

  yield queue; //yeah, we want to get rid of this

  while (q.length > 0) {
    next = next % q.length;
    yield q[next];
    next = next + 1;
  }
}

function* depthFirst(node) {
  if (!node) {
    console.log('undefined!');
  }

  var valueResult = node.next(),
      value = valueResult.value;
console.log('depthFirst', node, valueResult);
  if (valueResult.done) return value;

  while (true) {
    var child = node.next();
console.log('child', child);
    var childGenerator = depthFirst(child.value);
    while (true) {
      var childGeneratorResult = childGenerator.next();
console.log('childGenResult', childGeneratorResult, value);
      yield childGeneratorResult.value;

      if (childGeneratorResult.done) break;
    }

    if (child.done) return value;
  }
}

function* breadthFirst(node) {
  if (!node) {
    console.log('undefined');
  }

  var valueResult = node.next(),
      value = valueResult.value;

  if (valueResult.done) return value;

  yield value;

  // how can we do this with only generators?
  var children = toArray(transform(node, value => breadthFirst(value)));

  for (var i = 0; i < children.length; i++) {
    var result = children[i].next();
    if (result.done) {
      children.splice(i, 1);
      i--;
    }
    if (children.length == 0) return result.value;
    else yield result.value;
  }


  for (var i = 0; i < children.length - 1; i++) {
    yield* children[i];
  }

  var generator = children[i];
  while (true) {
    var result = generator.next();
    if (result.done) return result.value;
    else yield result.value;
  }
}

function* transform(generator, fn) {
  while (true) {
    var result = generator.next();
        newValue = fn(result.value);

    if (result.done) return newValue;
    else yield (fn(result.value));
  }
}

function* makeNode(value, children) {
  if (children) {
    yield value;

    if (children.length) children = toGenerator(children); // really we want to just do this for arrays
    if (typeof children == 'function') children = children();

    while (true) {
      var result = children.next();
      if (result.done) return result.value;
      else yield result.value;
    }
  }
  else return value;
}

function* toGenerator(array) {
  var length = array.length;

  if (length == 0) throw Error('What should we do here?');
  if (length == 1) return array[0];

  var i;
  for (i = 0; i < length - 1; i++) yield array[i];
  return array[i];
}

function toArray(generator) {
  var array = [];

  while (true) {
    var result = generator.next();
    array.push(result.value);
    if (result.done) return array;
  }
}



// Implementing and Traversing Trees Using Generators in JavaScript [ECMAScript 6]