function historyTrackedAttribute(value) {
  var data = {
    currentValue: value,
    history: history(value)
  }

  return {
    get value() { return data.currentValue; },
    set value(v) { data.history.insert(v); }
    get at(t) { data.history.at(t); }
  }
}

function history(value, size) {
  var h = [],
      i = 0;

  size = size || 10;

  return { insert, at };

  function insert(value) {
    h[i] = value;
    i = (i + 1) % size;
  }

  function at(ago) {
    var index = i - ago;
    return index < 0 ? h[size - index] : h[index];
  }
}