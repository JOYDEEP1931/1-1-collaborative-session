import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket';

interface Message {
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  role: 'mentor' | 'student';
}
export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessage = (msgData: Message) => {
      setMessages((prev) => [...prev, msgData]);
      setError(null);
    };

    socket.on('chat-message', handleMessage);

    return () => {
      socket.off('chat-message', handleMessage);
    };
  }, []);

  const validateMessage = (msg: string): boolean => {
    if (!msg || msg.trim().length === 0) {
      setError('Message cannot be empty');
      return false;
    }

    if (msg.length > 1000) {
      setError('Message is too long (max 1000 characters)');
      return false;
    }

    setError(null);
    return true;
  };

  const sendMessage = async () => {
    if (!validateMessage(input)) return;

    const socket = getSocket();
    if (!socket) {
      setError('Socket not connected');
      return;
    }

    try {
      setIsLoading(true);
      const sanitizedMessage = input.trim();

      socket.emit('chat-message', sanitizedMessage, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          setInput('');
          setError(null);
          //setMessages((prev) => [...prev, response.data]);
        } else {
          setError(response.error || 'Failed to send message');
        }
        setIsLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg p-4">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${
                msg.role === 'mentor' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  msg.role === 'mentor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {msg.role === 'mentor' ? 'M' : 'S'}
              </div>

              <div
                className={`flex-1 max-w-xs px-3 py-2 rounded-lg ${
                  msg.role === 'mentor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                <p className="text-xs font-semibold mb-1">{msg.userName}</p>
                <p className="text-sm break-words">{msg.message}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-2 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message... (Shift+Enter for new line)"
          className="flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500 resize-none text-sm"
          rows={3}
          disabled={isLoading}
          maxLength={1000}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors flex items-center justify-center gap-2 text-lg"
          title="Send message"
        >
          📤
        </button>
      </div>

      {/* Character count */}
      <div className="text-xs text-gray-500 mt-1 text-right">
        {input.length}/1000
      </div>
    </div>
  );
}
