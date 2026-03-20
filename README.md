# 🚀 Mentor-Student 1-on-1 Collaboration Platform

A real-time web-based platform for 1-on-1 mentorship sessions with **video calls**, **real-time chat**, and **collaborative code editing**.

## ✨ Features

✅ **Real-time Video Conferencing** - WebRTC peer-to-peer video/audio calls with STUN servers
✅ **Live Chat** - Session-based messaging with timestamps
✅ **Collaborative Code Editor** - Monaco Editor with real-time sync and 11+ languages
✅ **Session Management** - Mentor creates sessions, student joins via Session ID
✅ **Role-based Access** - Mentor and Student roles
✅ **Security** - JWT authentication, input validation, CORS protection
✅ **Responsive UI** - Tailwind CSS with dark mode
✅ **Error Handling** - Comprehensive error management and logging

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)              │
│  (Video Call, Chat, Code Editor - Tailwind CSS)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Socket.io + HTTP
                     │
┌────────────────────▼────────────────────────────────────┐
│              Backend (Express.js + Node.js)             │
│  (WebRTC Signaling, Session Management, Auth)           │
└─────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
mentor-student-platform/
├── backend/
│   ├── server.js              # Main Express + Socket.io server
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── main.tsx           # React entry point
│   │   ├── index.css          # Global Tailwind styles
│   │   ├── components/
│   │   │   ├── VideoCall.tsx  # WebRTC video component
│   │   │   ├── ChatBox.tsx    # Real-time chat component
│   │   │   └── CodeEditor.tsx # Monaco editor component
│   │   └── lib/
│   │       ├── socket.ts      # Socket.io client
│   │       └── webrtc.ts      # WebRTC utilities
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript config
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS config
│   ├── index.html             # HTML entry point
│   ├── package.json           # Frontend dependencies
│   ├── .env                   # Environment variables
│   └── .gitignore
│
└── README.md                  # This file
```

## 🛠️ Tech Stack

### Frontend
- **Vite** - Lightning-fast build tool
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - VS Code-based editor
- **Socket.io Client** - Real-time communication
- **Lucide React** - Icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **JWT** - Authentication
- **CORS** - Cross-origin resource sharing
- **UUID** - Session ID generation

## 📋 Prerequisites

- **Node.js** >= 16.x
- **npm** or **yarn**
- Modern browser with WebRTC support (Chrome, Firefox, Edge, Safari)

## 🚀 Quick Start

### 1️⃣ Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2️⃣ Configure Environment Variables

**Backend (.env):**
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-this-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

### 3️⃣ Start the Servers

**Terminal 1 - Backend (Port 3001):**
```bash
cd backend
npm start
# or npm run dev (if available)
```

**Terminal 2 - Frontend (Port 5173):**
```bash
cd frontend
npm run dev
```

### 4️⃣ Access the Application

Open your browser and go to: **http://localhost:5173**

## 📖 Usage Guide

### For Mentor 👨‍🏫

1. Open the platform
2. Click **"Create Session"**
3. Enter your name and click **"Create Session as Mentor"**
4. Share the generated **Session ID** with your student
5. Wait for the student to join
6. Start the mentoring session!

### For Student 👨‍💻

1. Open the platform
2. Click **"Join Session"**
3. Enter your name
4. Paste the **Session ID** (provided by mentor)
5. Click **"Join Session as Student"**
6. Start collaborating!

## 🔧 API Endpoints

### Health Check
```
GET /health
```

### Create Session
```
POST /api/sessions
Response: { success: true, sessionId: "uuid" }
```

### Get Active Sessions (for debugging)
```
GET /api/sessions
```

### Generate JWT Token
```
POST /api/auth/token
Body: { id: "user-id", name: "User Name", role: "mentor|student" }
Response: { success: true, token: "jwt-token" }
```

## 🔌 Socket.io Events

### Emitted by Client
- `join-session` - Join a session
- `webrtc-offer` - Send WebRTC offer
- `webrtc-answer` - Send WebRTC answer
- `webrtc-candidate` - Send ICE candidate
- `chat-message` - Send chat message
- `code-update` - Send code update
- `cursor-move` - Send cursor position (optional)
- `leave-session` - Leave session

### Received by Client
- `user-joined` - User joined the session
- `user-left` - User left the session
- `user-disconnected` - User disconnected
- `webrtc-offer` - Received WebRTC offer
- `webrtc-answer` - Received WebRTC answer
- `webrtc-candidate` - Received ICE candidate
- `chat-message` - Received chat message
- `code-update` - Received code update
- `cursor-move` - Received cursor position

## 🔒 Security Features

✅ **JWT Authentication** - All socket connections require valid JWT tokens
✅ **CORS Protection** - Restricted to configured origins only
✅ **Input Validation** - All user inputs are sanitized and validated
✅ **Error Handling** - Comprehensive error messages without exposing internals
✅ **Rate Limiting Ready** - Structure supports adding rate limiting middleware
✅ **Disconnect Handling** - Proper cleanup on user disconnect

## ⚠️ Important Notes

- **JWT Secret** - Change `JWT_SECRET` in production to a strong, random key
- **CORS Origins** - Update `ALLOWED_ORIGINS` for production deployment
- **WebRTC** - Uses free public STUN servers (Google). For production, consider private STUN/TURN servers
- **Session Storage** - Currently in-memory. For production, use PostgreSQL + Supabase

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Build
npm run build

# Deploy to Vercel
vercel
```

### Backend (Railway/Render)
```bash
# Set environment variables on platform
# Push to Git and deploy
```

## 📊 Performance Optimizations

- ✅ **Throttled Code Updates** - 500ms throttle to prevent excessive socket emissions
- ✅ **Remote Update Prevention** - Avoids redundant state updates
- ✅ **Lazy Loading** - Monaco Editor loaded dynamically
- ✅ **Efficient Re-renders** - React.memo and useCallback where needed

## 🐛 Troubleshooting

### Video not working?
- Check browser permissions for camera/microphone
- Ensure WebRTC is supported in your browser
- Check STUN server connectivity

### Chat not syncing?
- Verify socket connection status in browser console
- Check JWT token expiration
- Ensure socket URL is correct

### Code editor freezing?
- Clear browser cache
- Check network latency
- Restart the session

## 📝 Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | http://localhost:3001 | Backend API URL |
| `VITE_SOCKET_URL` | http://localhost:3001 | Socket.io server URL |
| `PORT` | 3001 | Backend server port |
| `JWT_SECRET` | change-me | JWT signing secret |
| `ALLOWED_ORIGINS` | http://localhost:5173 | CORS allowed origins |

## 🎯 Future Enhancements

- 🎥 Screen sharing
- 📝 Session recordings
- 🤖 AI code suggestions
- 🔄 Code execution sandbox
- 📊 Session analytics
- 🌙 Dark/Light theme toggle
- 📱 Mobile app support

## 📄 License

MIT License - feel free to use this project for personal and commercial purposes.

## 👨‍💻 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions, please check:
1. Browser console for error messages
2. Backend logs for socket errors
3. Network tab in DevTools for API calls

---

**Built with ❤️ for 1-on-1 collaboration**
