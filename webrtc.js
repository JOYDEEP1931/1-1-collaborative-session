import socket from "../lib/socket";

let peerConnection;
let localStream;
let remoteStream;

/**
 * Initialize WebRTC connection
 * @param {HTMLVideoElement} localVideo - video element for local stream
 * @param {HTMLVideoElement} remoteVideo - video element for remote stream
 */
export async function initWebRTC(localVideo, remoteVideo) {
  // Create peer connection
  peerConnection = new RTCPeerConnection();

  // Get local media (audio + video)
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  // Add local tracks to peer connection
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // Handle remote stream
  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  peerConnection.ontrack = event => {
    event.streams[0].getTracks().forEach(track => {
      remoteStream.addTrack(track);
    });
  };

  // ICE candidate handling
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", event.candidate);
    }
  };

  // Listen for signaling events
  socket.on("offer", async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", answer);
  });

  socket.on("answer", async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on("candidate", async (candidate) => {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error("Error adding received ICE candidate", err);
    }
  });
}

/**
 * Start a call (mentor initiates)
 */
export async function startCall() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer);
}
