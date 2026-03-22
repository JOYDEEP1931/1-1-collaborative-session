import React, { useEffect, useRef, useState } from 'react';
import { initializeSocket, getSocket, disconnectSocket } from '../lib/socket';
import {
  initializeWebRTC,
  createOffer,
  handleOffer,
  handleAnswer,
  handleICECandidate,
  toggleMediaTrack,
  cleanupWebRTC,
} from '../lib/webrtc';

interface VideoCallProps {
  sessionId: string;
  token: string;
}

export default function VideoCall({ sessionId, token }: VideoCallProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeCall = async () => {
      try {
        setError(null);

        const socket = initializeSocket(token);

        socket.emit('join-session', sessionId, (response: any) => {
          if (!response.success) {
            if (isMounted) setError(response.error || 'Failed to join session');
            return;
          }
          if (isMounted) console.log('✅ Joined session:', sessionId);
        });

        if (!socket.connected) {
          await new Promise<void>((resolve) => {
            socket.once('connect', () => resolve());
          });
        }

        if (localVideoRef.current && remoteVideoRef.current) {
          await initializeWebRTC(localVideoRef.current, remoteVideoRef.current);
          if (isMounted) setIsInitialized(true);
        }

        await createOffer();

        socket.on('webrtc-offer', async (data: any) => {
          try {
            const { offer } = data;
            console.log('📨 Received offer');
            await handleOffer(offer);
            if (isMounted) setConnectionStatus('connected');
          } catch (err) {
            console.error('Error handling offer:', err);
            if (isMounted) setError('Failed to handle offer');
          }
        });

        socket.on('webrtc-answer', async (data: any) => {
          try {
            const { answer } = data;
            console.log('📨 Received answer');
            await handleAnswer(answer);
            if (isMounted) setConnectionStatus('connected');
          } catch (err) {
            console.error('Error handling answer:', err);
            if (isMounted) setError('Failed to handle answer');
          }
        });

        socket.on('webrtc-candidate', async (data: any) => {
          try {
            const { candidate } = data;
            await handleICECandidate(candidate);
          } catch (err) {
            console.error('Error handling ICE candidate:', err);
          }
        });

        socket.on('user-joined', (data: any) => {
          console.log('👤 User joined:', data.userId);
        });

        socket.on('user-disconnected', (data: any) => {
          console.log('👤 User disconnected:', data.userId);
          if (isMounted) setConnectionStatus('disconnected');
        });
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          setError(errorMsg);
          console.error('Failed to initialize call:', err);
        }
      }
    };

    initializeCall();

    return () => {
      isMounted = false;
      cleanupWebRTC();
      disconnectSocket();
    };
  }, [sessionId, token]);

  const handleToggleAudio = () => {
    const newState = !isAudioOn;
    toggleMediaTrack('audio', newState);
    setIsAudioOn(newState);
  };

  const handleToggleVideo = () => {
    const newState = !isVideoOn;
    toggleMediaTrack('video', newState);
    setIsVideoOn(newState);
  };

  const handleEndCall = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('leave-session', (response: any) => {
        if (response.success) {
          console.log('✅ Left session');
        }
      });
    }
    cleanupWebRTC();
    disconnectSocket();
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      <div className="grid grid-cols-2 gap-4 flex-1 mb-4">
        {/* Local Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm text-white">
            You
          </div>
        </div>

        {/* Remote Video */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm text-white">
            {connectionStatus === 'connected' ? 'Connected' : 'Waiting...'}
          </div>
        </div>
      </div>

      {/* Status & Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="text-center mb-4 text-gray-300 text-sm">
        Status: <span className="font-semibold">{connectionStatus}</span>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleToggleAudio}
          className={`p-3 rounded-full transition-colors text-xl ${
            isAudioOn
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title="Toggle audio"
        >
          {isAudioOn ? '🎤' : '🔇'}
        </button>

        <button
          onClick={handleToggleVideo}
          className={`p-3 rounded-full transition-colors text-xl ${
            isVideoOn
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          title="Toggle video"
        >
          {isVideoOn ? '📹' : '📴'}
        </button>

        <button
          onClick={handleEndCall}
          className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors text-xl"
          title="End call"
        >
          ☎️
        </button>
      </div>
    </div>
  );
}
