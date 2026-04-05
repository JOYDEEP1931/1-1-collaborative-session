import { useState, useEffect } from 'react';
import VideoCall from './components/VideoCall';
import ChatBox from './components/ChatBox';
import CodeEditor from './components/CodeEditor';
import axios, { AxiosError } from 'axios';
import { initializeSocket, disconnectSocket } from "./lib/socket";

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'mentor' | 'student'>('student');
  const [userName, setUserName] = useState<string>('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  // const API_BASE = "https://one-1-collaborative-session.onrender.com";
  // 🔴 VERY IMPORTANT — JOIN SESSION HERE
  useEffect(() => {
  if (!token || !sessionId) return;

  const socket = initializeSocket(token);

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    socket.emit("join-session", sessionId, (response: any) => {
      console.log("Join session response:", response);
      setSocketReady(true);
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
    setSocketReady(false);
  });

  return () => {
    socket.emit("leave-session");
    disconnectSocket();
  };
}, [token, sessionId]);

  const handleStartSession = async (role: 'mentor' | 'student', name: string) => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      let newSessionId = sessionId;
      if (role === 'mentor' && !sessionId) {
        const sessionRes = await axios.post(`${apiUrl}/api/sessions`);
        console.log("Session created:", sessionRes.data);
        newSessionId = sessionRes.data.sessionId;
        setSessionId(newSessionId);
      }

      const tokenRes = await axios.post(`${apiUrl}/api/auth/token`, {
        id: `user-${Date.now()}`,
        name: name,
        role: role,
      });

      setToken(tokenRes.data.token);
      setUserRole(role);
      setUserName(name);
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? (err as AxiosError<{ error: string }>).response?.data?.error || err.message
        : 'Failed to start session';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinSessionId.trim()) {
      setError('Please enter a session ID');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      const tokenRes = await axios.post(`${apiUrl}/api/auth/token`, {
        id: `user-${Date.now()}`,
        name: userName || `Student-${Date.now()}`,
        role: 'student',
      });

      setToken(tokenRes.data.token);
      setSessionId(joinSessionId);
      setUserRole('student');
    } catch (err) {
      const errorMsg = axios.isAxiosError(err)
        ? (err as AxiosError<{ error: string }>).response?.data?.error || err.message
        : 'Failed to join session';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setSessionId(null);
    setUserName('');
    setJoinSessionId('');
    setError(null);
  };

  if (token && sessionId && socketReady) {
    return (
      <div className="w-full h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Mentor-Student Session</h1>
              <p className="text-gray-400 mt-1">
                Session ID: <span className="text-blue-400 font-mono">{sessionId}</span>
              </p>
              <p className="text-gray-400">
                Role: <span className="text-green-400 font-semibold">{userRole.toUpperCase()}</span>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              🚪 Logout
            </button>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
            <div className="col-span-1 flex flex-col gap-6">
              <div className="flex-1 min-h-0">
                <VideoCall sessionId={sessionId} token={token} />
              </div>
              <div className="flex-1 min-h-0">
                <ChatBox />
              </div>
            </div>

            <div className="col-span-2 min-h-0">
              <CodeEditor />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mentor Hub</h1>
          <p className="text-gray-400">Real-time 1-on-1 Collaboration Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsCreatingSession(false)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              !isCreatingSession
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Join Session
          </button>
          <button
            onClick={() => setIsCreatingSession(true)}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              isCreatingSession
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Create Session
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {isCreatingSession ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Create New Session</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={() => handleStartSession('mentor', userName)}
                disabled={isLoading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Session as Mentor'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                ✨ Share the Session ID with your student to let them join
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white mb-4">Join Existing Session</h2>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Session ID
                </label>
                <input
                  type="text"
                  value={joinSessionId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setJoinSessionId(e.target.value)}
                  placeholder="Paste the Session ID"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={handleJoinSession}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Joining...' : 'Join Session as Student'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-4">
                📎 Ask your mentor for the Session ID to join
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">📹</div>
            <p className="text-xs text-gray-400">HD Video Call</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💬</div>
            <p className="text-xs text-gray-400">Real-time Chat</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💻</div>
            <p className="text-xs text-gray-400">Code Editor</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
