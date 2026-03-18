"use client";
import React, { useEffect, useRef } from "react";
import socket from "../lib/socket";

export default function VideoCall() {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    peerConnection.current = new RTCPeerConnection();

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }
        stream.getTracks().forEach(track => {
          peerConnection.current.addTrack(track, stream);
        });
      });

    peerConnection.current.ontrack = event => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
      }
    };

    socket.on("offer", async (offer) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", answer);
    });

    socket.on("answer", async (answer) => {
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("candidate", async (candidate) => {
      await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        socket.emit("candidate", event.candidate);
      }
    };
  }, []);

  return (
    <div>
      <video ref={localVideo} autoPlay muted playsInline />
      <video ref={remoteVideo} autoPlay playsInline />
    </div>
  );
}
