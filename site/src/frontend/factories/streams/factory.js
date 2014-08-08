module.exports = ['$sce', 'emitter', ($sce, emitter) => {
  return participant => {
    console.log('participant', participant);
    var streams = [],
        nextOrdinal = 0,
        {emit, on, off} = emitter();

    _.extend(streams, {
      add: add,
      remove: remove,
      removeAll: removeAll,

      contains: contains,

      on: on,
      off: off
    });

    return streams;

    function add(rawStream) {
      console.log('adding stream', rawStream);
      var stream = createStream(rawStream);

      streams.push(stream);

      emit('add', stream);

      return stream;
    }

    function remove(stream) {
      stream.rawStream.__doneWithStream();
      _.remove(streams, {id: stream.id});
      emit('remove', stream);
    }

    function removeAll() {
      for (var i = streams.length - 1; i >= 0; i--) {
        remove(streams[i]);
      }
    }

    function contains(stream) {
      for (var i = 0; streams.length; i++) {
        if (streams[i].rawStream === stream) return true;
      }
      return false;
    }

    function createStream(rawStream) {
      return {
        ordinal: nextOrdinal++,
        id: rawStream.id,
        participant: participant,
        rawStream: rawStream,
        votes: [],
        src: $sce.trustAsResourceUrl(URL.createObjectURL(rawStream))
      };
    }
  };
}];