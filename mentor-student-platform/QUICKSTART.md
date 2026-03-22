# 🎯 Quick Start Guide

## Step 1: Install Dependencies

Open two terminals in your project root:

### Terminal 1 - Backend
```bash
cd backend
npm install
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
```

## Step 2: Start the Servers

### Terminal 1 - Start Backend (Port 3001)
```bash
cd backend
npm start
```

You should see:
```
🚀 Signaling server running on port 3001
```

### Terminal 2 - Start Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

## Step 3: Test the Application

1. **Open Browser**: Go to `http://localhost:5173`
2. **Create Session** (Mentor):
   - Click "Create Session"
   - Enter your name (e.g., "Mentor John")
   - Click "Create Session as Mentor"
   - Copy the Session ID

3. **Join Session** (Student):
   - Open another browser tab/window (or use Incognito/Private mode)
   - Go to `http://localhost:5173`
   - Click "Join Session"
   - Enter your name (e.g., "Student Alice")
   - Paste the Session ID
   - Click "Join Session as Student"

4. **Test Features**:
   - ✅ **Video**: Both users should see video feeds
   - ✅ **Audio**: Click mic/camera buttons to toggle
   - ✅ **Chat**: Send messages in the chat box
   - ✅ **Code**: Type or paste code in the editor - changes sync in real-time

## Troubleshooting

### Issue: "Connection refused"
- Ensure backend is running on port 3001
- Check if frontend .env has correct `VITE_SOCKET_URL`

### Issue: "Permission denied" for camera/microphone
- Check browser permissions
- Allow access when prompted

### Issue: "Socket connection error"
- Check browser console for errors
- Verify JWT token is being sent
- Ensure CORS is properly configured

### Issue: Code editor not loading
- Check browser console for errors
- Ensure Monaco Editor package is installed
- Clear browser cache and reload

## Next Steps

1. **Customize**: Update brand name, colors, and features
2. **Database**: Replace in-memory storage with PostgreSQL + Supabase
3. **Deploy**: Push to GitHub, deploy frontend to Vercel, backend to Railway
4. **Features**: Add screen sharing, recordings, or code execution

---

For detailed information, see [README.md](./README.md)
