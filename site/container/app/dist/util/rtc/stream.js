"use strict";
Object.defineProperties(exports, {
  Stream: {get: function() {
      return Stream;
    }},
  __esModule: {value: true}
});
var Stream = function Stream(peer, stream, streamListeners) {
  this._peer = peer;
  this._stream = stream;
  this._id = stream.id;
};
($traceurRuntime.createClass)(Stream, {
  get stream() {
    return this._stream;
  },
  get id() {
    return this._id;
  },
  get peer() {
    return this._peer;
  }
}, {});
;
