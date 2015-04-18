"use strict";
var Benchmark = require('benchmark'),
    _ = require('lodash'),
    microtime = require('microtime');
global.HashList = require('../util/hashList');
var suite = new Benchmark.Suite();
for (var i = 0; i < 32; i++) {
  var itemCount = 1 << i;
  suite.add('push ' + itemCount, {
    setup: function() {
      var hashList = new HashList(),
          itemCount = itemCount;
    },
    teardown: function() {},
    fn: function() {
      console.log(itemCount);
      for (var i = 0; i < itemCount; i++)
        hashList.push(i);
    },
    onComplete: function() {
      console.log('b:', this.toString());
    },
    onError: function(error) {
      console.log('ERROR:', error);
    }
  });
}
function time(fn) {
  var start = microtime.now();
  fn();
  var end = microtime.now();
  return end - start;
}
function toString(time) {
  return (time * 1000000) + 's';
}
var hashList = new HashList(),
    max = 100000,
    samples = new Array(max);
for (var i = 0; i < max; i++) {
  samples.push(time(function() {
    addItem(i);
  }));
}
function addItem(item) {
  hashList.push(item);
}
console.log(samples);
