var RTCPeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);

module.exports = () => {
  return {
    hasRTCPeerConnection: () => { return RTCPeerConnection != null; }
  };
};