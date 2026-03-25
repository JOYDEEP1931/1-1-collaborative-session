import { getSocket } from "./socket";

let peerConnection: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;

// ✅ STUN servers for NAT traversal
const STUN_SERVERS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
  "stun:stun2.l.google.com:19302",
  "stun:stun3.l.google.com:19302",
];

export async function initializeWebRTC(
  localVideoEl: HTMLVideoElement,
  remoteVideoEl: HTMLVideoElement,
) {
  try {
    peerConnection = new RTCPeerConnection({
      iceServers: STUN_SERVERS.map((url) => ({ urls: url })),
    });

    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: { echoCancellation: true, noiseSuppression: true },
    });

    localVideoEl.srcObject = localStream;

    localStream.getTracks().forEach((track) => {
      if (peerConnection && localStream) {
        peerConnection.addTrack(track, localStream);
      }
    });

    remoteStream = new MediaStream();
    remoteVideoEl.srcObject = remoteStream;

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      if (remoteStream) {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream!.addTrack(track);
        });
      }
    };

    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        const socket = getSocket();
        if (socket) {
          socket.emit("webrtc-candidate", { candidate: event.candidate });
        }
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state: ${peerConnection?.connectionState}`);
      // Notify UI of connection state changes
      const socket = getSocket();
      if (socket) {
        socket.emit("connection-status", {
          state: peerConnection?.connectionState,
        });
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state: ${peerConnection?.iceConnectionState}`,
      );
    };

    return { localStream, remoteStream };
  } catch (err) {
    console.error("Failed to initialize WebRTC:", err);
    throw new Error(`WebRTC initialization failed: ${err}`);
  }
}

export async function createOffer() {
  try {
    if (!peerConnection) throw new Error("Peer connection not initialized");

    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await peerConnection.setLocalDescription(offer);

    const socket = getSocket();
    if (socket) {
      socket.emit("webrtc-offer", offer, (response: any) => {
        if (!response.success) {
          console.error("Failed to send offer:", response.error);
        }
      });
    }

    return offer;
  } catch (err) {
    console.error("Failed to create offer:", err);
    throw err;
  }
}

export async function handleOffer(offer: RTCSessionDescriptionInit) {
  try {
    if (!peerConnection) throw new Error("Peer connection not initialized");

    if (!offer.type || offer.type !== "offer" || !offer.sdp) {
      throw new Error("Invalid offer format");
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    const socket = getSocket();
    if (socket) {
      socket.emit("webrtc-answer", answer, (response: any) => {
        if (!response.success) {
          console.error("Failed to send answer:", response.error);
        }
      });
    }

    return answer;
  } catch (err) {
    console.error("Failed to handle offer:", err);
    throw err;
  }
}

export async function handleAnswer(answer: RTCSessionDescriptionInit) {
  try {
    if (!peerConnection) throw new Error("Peer connection not initialized");

    if (!answer.type || answer.type !== "answer" || !answer.sdp) {
      throw new Error("Invalid answer format");
    }

    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer),
    );
  } catch (err) {
    console.error("Failed to handle answer:", err);
    throw err;
  }
}

export async function handleICECandidate(candidate: RTCIceCandidateInit) {
  try {
    if (!peerConnection) throw new Error("Peer connection not initialized");

    if (!candidate.candidate) {
      console.warn("Empty candidate received");
      return;
    }

    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.warn("Failed to add ICE candidate:", err);
  }
}

export function toggleMediaTrack(kind: "audio" | "video", enabled: boolean) {
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      if (track.kind === kind) {
        track.enabled = enabled;
      }
    });
  }
}

export function cleanupWebRTC() {
  try {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      localStream = null;
    }

    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }

    remoteStream = null;
  } catch (err) {
    console.error("Error during WebRTC cleanup:", err);
  }
}
