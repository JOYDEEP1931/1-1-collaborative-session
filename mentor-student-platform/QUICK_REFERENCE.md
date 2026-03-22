# 🚀 QUICK REFERENCE CARD

## Installation (One-Time Setup)

```bash
# Option 1: Automated (Windows)
setup.bat

# Option 2: Manual
cd backend && npm install
cd ../frontend && npm install
```

## Running the Application

### Method 1: Batch Scripts (Windows)
```bash
# Terminal 1
start-backend.bat

# Terminal 2  
start-frontend.bat
```

### Method 2: Manual Commands
```bash
# Terminal 1 - Backend (Port 3001)
cd backend
npm start

# Terminal 2 - Frontend (Port 5173)
cd frontend
npm run dev
```

### Method 3: Build for Production
```bash
# Frontend build
cd frontend
npm run build
# Output: dist/ folder ready for deployment

# Backend runs with: npm start
```

## Testing the App

1. Open: **http://localhost:5173**
2. **Mentor**: Click "Create Session" → Share Session ID
3. **Student**: Click "Join Session" → Enter Session ID
4. Test: Video → Chat → Code Editor

## Environment Variables

### Backend (backend/.env)
```
PORT=3001
JWT_SECRET=change-this-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (frontend/.env)
```
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## API Endpoints

```
GET  /health                          # Health check
POST /api/sessions                    # Create session
GET  /api/sessions                    # List sessions
POST /api/auth/token                  # Generate JWT token
```

## Socket Events

**Client → Server:**
- `join-session` - Join mentoring session
- `webrtc-offer` - Send WebRTC offer
- `webrtc-answer` - Send WebRTC answer
- `webrtc-candidate` - Send ICE candidate
- `chat-message` - Send chat message
- `code-update` - Sync code changes
- `leave-session` - Leave session

**Server → Client:**
- `user-joined` - User joined session
- `webrtc-offer` - Received WebRTC offer
- `webrtc-answer` - Received WebRTC answer
- `webrtc-candidate` - Received ICE candidate
- `chat-message` - Received message
- `code-update` - Received code update
- `user-disconnected` - User disconnected

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port already in use | Change PORT in .env or kill process |
| "Cannot find module" | Run `npm install` again |
| Video not working | Check camera permissions |
| Socket won't connect | Verify backend is running on 3001 |
| TypeScript errors | Delete node_modules and reinstall |

## File Sizes

| Component | Lines | Size |
|-----------|-------|------|
| server.js | 350+ | Full WebRTC + Socket.io |
| App.tsx | 300+ | Session management |
| VideoCall.tsx | 150+ | WebRTC video |
| ChatBox.tsx | 150+ | Real-time chat |
| CodeEditor.tsx | 200+ | Code sync |
| **Total** | **1,370+** | **Production Ready** |

## Key Features

✅ Real-time HD video calls (WebRTC P2P)
✅ Live chat with timestamps
✅ Collaborative code editor (11+ languages)
✅ JWT authentication
✅ Session-based rooms
✅ Input validation & security
✅ Responsive UI (Tailwind CSS)
✅ Error handling throughout

## Deployment URLs

After deployment, update these:

**Frontend** (Vercel):
```
VITE_API_URL=https://your-backend-url
VITE_SOCKET_URL=https://your-backend-url
```

**Backend** (Railway/Render):
```
ALLOWED_ORIGINS=https://your-frontend-url
JWT_SECRET=<strong-random-key>
NODE_ENV=production
```

---

**Ready to run! 🎉**
