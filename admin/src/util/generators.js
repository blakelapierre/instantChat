

module.exports = {
  depthFirst,
  gMap,
  toGenerator,
  loop,
  loopUntilEmpty,
  makeNode
};

function gMap(g, fn) {
  while (true) {
    var result = g.next();
    console.log('gmap', result);
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
  console.log('enter depthFirst', node);
  var valueResult = node.next();
  console.log('valueResult', valueResult);

  if (valueResult.done) return valueResult.value;
  else {
    var i = 0;
    while (true) {
      var childResult = node.next();

      console.log('depthFirst yielding child', i, childResult);
      var childGenerator = depthFirst(childResult.value);
      while (true) {
        var childGeneratorResult = childGenerator.next();

        yield childGeneratorResult.value;
        if (childGeneratorResult.done) break;
      }
      console.log('depthFirst yielding child', i, 'done');

      i++;

      if (childResult.done) return valueResult.value;
    }
  }
}

function* transform(generator, fn) {
  while (true) {
    var result = generator.next();
        newValue = fn(result.value);

    console.log('transform', result);
    if (result.done) return newValue;
    else yield (fn(result.value));
  }
}

function* makeNode(value, children) {
  if (children) {
    yield value;

    if (children.length) children = toGenerator(children); // really we want to just do this for arrays
    if (typeof children == 'function') children = children();

    console.log('yielded', value);
    console.log('children', children);
    while (true) {
      var result = children.next();
      console.log('makeNode', result);
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

  console.log('toGenerator', length);
  var i;
  for (i = 0; i < length - 1; i++) yield array[i];
  console.log('i', i, array);
  console.log('returning', array[i]);
  return array[i];
}

function* node(value, childrenFunction) {

}


// Implementing and Traversing Trees Using Generators in JavaScript [ECMAScript 6]