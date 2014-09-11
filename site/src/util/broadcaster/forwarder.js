module.exports = function(dataChannel) {
  var forwarder = {
    addListener: addListener,
    removeListener: removeListener
  };

  return forwarder;


  function addListener(listener) {
    var forwardedChannel = listener.peerConnection.createDataChannel(peerID + '-' + dataChannel.label);

  }

  function removeListener(listener) {

  }
};