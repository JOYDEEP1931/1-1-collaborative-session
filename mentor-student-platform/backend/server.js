// require("dotenv").config();
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const { v4: uuidv4 } = require("uuid");
// const app = express();
// const server = http.createServer(app);

// // ✅ SECURITY: Restrict CORS to trusted domains
// const allowedOrigins = (
//   process.env.ALLOWED_ORIGINS ||"http://localhost:3001"
// ).split(",");

// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigins,
//     credentials: true,
//     methods: ["GET", "POST"],
//   },
//   transports: ["websocket"],
//   pingInterval: 25000,
//   pingTimeout: 20000,
// });

// // Middleware
// app.use(cors({ origin: allowedOrigins }));
// app.use(express.json());

// // ✅ SECURITY: Socket.io authentication middleware
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;

//   if (!token) {
//     return next(new Error("Missing authentication token"));
//   }

//   try {
//     const user = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "your-secret-key-change-this",
//     );
//     socket.userId = user.id;
//     socket.userRole = user.role; // 'mentor' or 'student'
//     socket.userName = user.name;
//     next();
//   } catch (err) {
//     console.error("Auth error:", err.message);
//     next(new Error("Invalid token"));
//   }
// });

// // ✅ Track active sessions and users
// const activeSessions = new Map();
// const userSessions = new Map();

// // ✅ Input validation helper
// function validateInput(data, maxLength = 10000) {
//   if (typeof data === "string") {
//     return data.substring(0, maxLength).trim();
//   }
//   return data;
// }

// io.on("connection", (socket) => {
//   console.log(
//     `✅ User connected: ${socket.userId} (${socket.userRole}) - Socket: ${socket.id}`,
//   );

//   // ✅ Join session room
//   socket.on("join-session", (sessionId, callback) => {
//     const validSessionId = validateInput(sessionId, 100);

//     if (!validSessionId) {
//       return callback({ success: false, error: "Invalid session ID" });
//     }

//     // Join socket to room
//     socket.join(validSessionId);
//     userSessions.set(socket.id, validSessionId);

//     // Track session
//     if (!activeSessions.has(validSessionId)) {
//       activeSessions.set(validSessionId, []);
//     }
//     activeSessions.get(validSessionId).push({
//       userId: socket.userId,
//       userName: socket.userName,
//       role: socket.userRole,
//       socketId: socket.id,
//       joinedAt: new Date(),
//     });

//     console.log(`📍 User ${socket.userId} joined session ${validSessionId}`);

//     // Notify others in room
//     socket.to(validSessionId).emit("user-joined", {
//       userId: socket.userId,
//       userName: socket.userName,
//       role: socket.userRole,
//       timestamp: new Date(),
//     });

//     const sessionUsers = activeSessions.get(validSessionId) || [];
//     const userCount = sessionUsers.length;
//     const isInitiator = userCount === 1; // first user in room waits for offer

//     callback({
//       success: true,
//       message: "Joined session",
//       userCount,
//       isInitiator,
//     });
//   });

//   // ✅ WebRTC: Offer
//   socket.on("webrtc-offer", (data, callback) => {
//     const sessionId = userSessions.get(socket.id);
//     if (!sessionId) {
//       return callback({ success: false, error: "Not in session" });
//     }

//     try {
//       // ✅ Validate offer structure (basic check)
//       if (!data || !data.type || data.type !== "offer") {
//         return callback({ success: false, error: "Invalid offer format" });
//       }

//       socket.to(sessionId).emit("webrtc-offer", {
//         offer: data,
//         from: socket.userId,
//         fromName: socket.userName,
//       });

//       callback({ success: true });
//     } catch (err) {
//       console.error("Offer error:", err);
//       callback({ success: false, error: "Failed to send offer" });
//     }
//   });

//   // ✅ WebRTC: Answer
//   socket.on("webrtc-answer", (data, callback) => {
//     const sessionId = userSessions.get(socket.id);
//     if (!sessionId) {
//       return callback({ success: false, error: "Not in session" });
//     }

//     try {
//       if (!data || !data.type || data.type !== "answer") {
//         return callback({ success: false, error: "Invalid answer format" });
//       }

//       socket.to(sessionId).emit("webrtc-answer", {
//         answer: data,
//         from: socket.userId,
//         fromName: socket.userName,
//       });

//       callback({ success: true });
//     } catch (err) {
//       console.error("Answer error:", err);
//       callback({ success: false, error: "Failed to send answer" });
//     }
//   });

//   // ✅ WebRTC: ICE Candidate
//   socket.on("webrtc-candidate", (data, callback) => {
//     const sessionId = userSessions.get(socket.id);
//     if (!sessionId) {
//       return callback({ success: false, error: "Not in session" });
//     }

//     try {
//       if (!data || !data.candidate) {
//         return callback({ success: false, error: "Invalid candidate" });
//       }

//       socket.to(sessionId).emit("webrtc-candidate", {
//         candidate: data,
//         from: socket.userId,
//       });

//       callback?.({ success: true });
//     } catch (err) {
//       console.error("Candidate error:", err);
//       callback?.({ success: false, error: "Failed to send candidate" });
//     }
//   });

//   // ✅ Chat: Send message with validation
//   socket.on("chat-message", (message, callback) => {
//     console.log("CHAT RECEIVED:", message);

//     const sessionId = userSessions.get(socket.id);
//     console.log("SESSION:", sessionId);
//     if (!sessionId) {
//       return callback({ success: false, error: "Not in session" });
//     }

//     try {
//       const sanitizedMsg = validateInput(message, 1000);

//       if (!sanitizedMsg) {
//         return callback({ success: false, error: "Empty message" });
//       }

//       const msgData = {
//         id: uuidv4(),
//         userId: socket.userId,
//         userName: socket.userName,
//         message: sanitizedMsg,
//         timestamp: new Date().toISOString(),
//         role: socket.userRole,
//       };

//       // Broadcast to session
//       io.to(sessionId).emit("chat-message", msgData);
//       callback({ success: true, data: msgData });
//     } catch (err) {
//       console.error("Chat error:", err);
//       callback({ success: false, error: "Failed to send message" });
//     }
//   });

//   // ✅ Code Editor: Send code update with throttling consideration
//   socket.on("code-update", (codeData, callback) => {
//     const sessionId = userSessions.get(socket.id);
//     if (!sessionId) {
//       return callback({ success: false, error: "Not in session" });
//     }

//     try {
//       const sanitizedCode = validateInput(codeData.code, 50000);

//       const update = {
//         code: sanitizedCode,
//         language: validateInput(codeData.language, 50),
//         userId: socket.userId,
//         userName: socket.userName,
//         timestamp: new Date().toISOString(),
//       };

//       // Broadcast to session (last-write-wins strategy)
//       socket.to(sessionId).emit("code-update", update);
//       callback({ success: true });
//     } catch (err) {
//       console.error("Code update error:", err);
//       callback({ success: false, error: "Failed to update code" });
//     }
//   });

//   // ✅ Cursor sync (optional enhancement)
//   socket.on("cursor-move", (cursorData, callback) => {
//     const sessionId = userSessions.get(socket.id);
//     if (!sessionId) return;

//     try {
//       socket.to(sessionId).emit("cursor-move", {
//         userId: socket.userId,
//         line: parseInt(cursorData.line) || 0,
//         column: parseInt(cursorData.column) || 0,
//       });

//       callback?.({ success: true });
//     } catch (err) {
//       console.error("Cursor error:", err);
//     }
//   });

//   // ✅ Leave session
//   socket.on("leave-session", (callback) => {
//     const sessionId = userSessions.get(socket.id);

//     if (sessionId) {
//       socket.leave(sessionId);

//       // Remove from active sessions
//       const users = activeSessions.get(sessionId);
//       if (users) {
//         const idx = users.findIndex((u) => u.socketId === socket.id);
//         if (idx > -1) users.splice(idx, 1);

//         if (users.length === 0) {
//           activeSessions.delete(sessionId);
//         }
//       }

//       userSessions.delete(socket.id);

//       // Notify others
//       socket.to(sessionId).emit("user-left", {
//         userId: socket.userId,
//         userName: socket.userName,
//         timestamp: new Date(),
//       });

//       console.log(`📍 User ${socket.userId} left session ${sessionId}`);
//     }

//     callback?.({ success: true });
//   });

//   // ✅ Disconnect handler
//   socket.on("disconnect", (reason) => {
//     const sessionId = userSessions.get(socket.id);

//     if (sessionId) {
//       const users = activeSessions.get(sessionId);
//       if (users) {
//         const idx = users.findIndex((u) => u.socketId === socket.id);
//         if (idx > -1) users.splice(idx, 1);

//         if (users.length === 0) {
//           activeSessions.delete(sessionId);
//         }
//       }

//       io.to(sessionId).emit("user-disconnected", {
//         userId: socket.userId,
//         userName: socket.userName,
//         reason: reason,
//       });
//     }

//     userSessions.delete(socket.id);
//     console.log(`❌ User disconnected: ${socket.userId} (reason: ${reason})`);
//   });

//   // ✅ Error handler
//   socket.on("error", (error) => {
//     console.error(`Socket error for user ${socket.userId}:`, error);
//   });
// });

// // ============ REST ENDPOINTS ============

// // ✅ Health check endpoint
// app.get("/health", (req, res) => {
//   res.json({ status: "ok", timestamp: new Date() });
// });

// // ✅ Get active sessions (for debugging/monitoring)
// app.get("/api/sessions", (req, res) => {
//   const sessions = Array.from(activeSessions.entries()).map(([id, users]) => ({
//     sessionId: id,
//     userCount: users.length,
//     users: users.map((u) => ({
//       userId: u.userId,
//       userName: u.userName,
//       role: u.role,
//       joinedAt: u.joinedAt,
//     })),
//   }));
//   res.json(sessions);
// });

// // ✅ Create session endpoint (returns session ID)
// app.post("/api/sessions", (req, res) => {
//   try {
//     const sessionId = uuidv4();
//     activeSessions.set(sessionId, []);
//     console.log(`✅ New session created: ${sessionId}`);
//     res.json({ success: true, sessionId });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Failed to create session" });
//   }
// });

// // ✅ Generate JWT token (for testing/client)
// app.post("/api/auth/token", (req, res) => {
//   try {
//     const { id, name, role } = req.body;

//     if (!id || !name || !role) {
//       return res.status(400).json({ error: "Missing id, name, or role" });
//     }

//     const token = jwt.sign(
//       { id, name, role },
//       process.env.JWT_SECRET || "your-secret-key-change-this",
//       { expiresIn: "24h" },
//     );

//     res.json({ success: true, token });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Failed to generate token" });
//   }
// });

// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`🚀 Signaling server running on port ${PORT}`);
// });

// // Graceful shutdown
// process.on("SIGTERM", () => {
//   console.log("SIGTERM received, shutting down gracefully...");
//   server.close(() => {
//     console.log("Server closed");
//     process.exit(0);
//   });
// });
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

// ✅ FIX 1: Proper CORS handling (MOST IMPORTANT)
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  "http://localhost:3001,https://1-1-collaborative-session-zr5j.vercel.app"
).split(",");

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

// ✅ Apply CORS properly
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // preflight fix

app.use(express.json());

// ✅ FIX 2: Socket CORS also same logic
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket"],
  pingInterval: 25000,
  pingTimeout: 20000,
});

// ================================================================
// 📦 DATA STORAGE (In-memory for now, replace with DB if needed)
// ================================================================
const sessions = new Map();
const activeUsers = new Map();

// ================================================================
// 🔐 JWT VERIFICATION MIDDLEWARE
// ================================================================
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    return null;
  }
};

// ================================================================
// 🛣️ EXPRESS ROUTES
// ================================================================

// ✅ Health Check Endpoint (CRITICAL for Render deployment)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "✅ Server is running", timestamp: new Date() });
});

// ✅ Root Endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 1-1 Collaborative Session Server",
    status: "online",
    activeSessions: sessions.size,
    activeUsers: activeUsers.size,
  });
});

// ✅ Create Session Endpoint
app.post("/api/sessions", (req, res) => {
  try {
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({
        error: "Missing userId or userName",
      });
    }

    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      createdAt: new Date(),
      participants: [{ userId, userName }],
      documents: [],
      messages: [],
    };

    sessions.set(sessionId, session);

    console.log(`✅ Session created: ${sessionId}`);

    res.status(201).json({
      sessionId,
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get Session Endpoint
app.get("/api/sessions/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("❌ Error fetching session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get All Sessions (for debugging)
app.get("/api/sessions", (req, res) => {
  try {
    const allSessions = Array.from(sessions.entries()).map(([id, data]) => ({
      id,
      ...data,
      participantCount: data.participants.length,
    }));

    res.json({
      totalSessions: allSessions.length,
      sessions: allSessions,
    });
  } catch (error) {
    console.error("❌ Error fetching sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ================================================================
// 🔗 SOCKET.IO REAL-TIME EVENTS
// ================================================================

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // ✅ Join Session Event
  socket.on("join-session", (data) => {
    try {
      const { sessionId, userId, userName } = data;

      if (!sessionId || !userId || !userName) {
        socket.emit("error", { message: "Missing required fields" });
        return;
      }

      // Add user to active users
      activeUsers.set(socket.id, { userId, userName, sessionId });

      // Get or create session
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, {
          id: sessionId,
          createdAt: new Date(),
          participants: [],
          documents: [],
          messages: [],
        });
      }

      const session = sessions.get(sessionId);

      // Add participant if not already in session
      if (!session.participants.find((p) => p.userId === userId)) {
        session.participants.push({ userId, userName, joinedAt: new Date() });
      }

      // Join socket to room
      socket.join(sessionId);

      // Notify others in the session
      io.to(sessionId).emit("user-joined", {
        userId,
        userName,
        participants: session.participants,
        message: `${userName} joined the session`,
      });

      console.log(`✅ User ${userName} joined session ${sessionId}`);
    } catch (error) {
      console.error("❌ Error in join-session:", error);
      socket.emit("error", { message: "Error joining session" });
    }
  });

  // ✅ Send Message Event
  socket.on("send-message", (data) => {
    try {
      const { sessionId, userId, userName, message } = data;

      if (!sessionId || !message) {
        socket.emit("error", { message: "Missing sessionId or message" });
        return;
      }

      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      const messageObj = {
        id: uuidv4(),
        userId,
        userName,
        message,
        timestamp: new Date(),
      };

      session.messages.push(messageObj);

      // Broadcast to all users in the session
      io.to(sessionId).emit("receive-message", messageObj);

      console.log(`💬 Message in ${sessionId}: ${userName} - ${message}`);
    } catch (error) {
      console.error("❌ Error in send-message:", error);
      socket.emit("error", { message: "Error sending message" });
    }
  });

  // ✅ Document Update Event
  socket.on("update-document", (data) => {
    try {
      const { sessionId, documentId, content, userId, userName } = data;

      if (!sessionId || !documentId) {
        socket.emit("error", { message: "Missing sessionId or documentId" });
        return;
      }

      const session = sessions.get(sessionId);
      if (!session) {
        socket.emit("error", { message: "Session not found" });
        return;
      }

      // Find or create document
      let doc = session.documents.find((d) => d.id === documentId);
      if (!doc) {
        doc = {
          id: documentId,
          content: "",
          lastModifiedBy: { userId, userName },
          lastModifiedAt: new Date(),
        };
        session.documents.push(doc);
      }

      doc.content = content;
      doc.lastModifiedBy = { userId, userName };
      doc.lastModifiedAt = new Date();

      // Broadcast to all users in the session
      io.to(sessionId).emit("document-updated", {
        documentId,
        content,
        lastModifiedBy: { userId, userName },
      });

      console.log(`📄 Document ${documentId} updated in ${sessionId}`);
    } catch (error) {
      console.error("❌ Error in update-document:", error);
      socket.emit("error", { message: "Error updating document" });
    }
  });

  // ✅ User Typing Event
  socket.on("user-typing", (data) => {
    try {
      const { sessionId, userId, userName, isTyping } = data;

      io.to(sessionId).emit("user-typing-indicator", {
        userId,
        userName,
        isTyping,
      });
    } catch (error) {
      console.error("❌ Error in user-typing:", error);
    }
  });

  // ✅ Cursor Position Event
  socket.on("cursor-move", (data) => {
    try {
      const { sessionId, userId, x, y } = data;

      socket.to(sessionId).emit("cursor-position", {
        userId,
        x,
        y,
      });
    } catch (error) {
      console.error("❌ Error in cursor-move:", error);
    }
  });

  // ✅ Leave Session Event
  socket.on("leave-session", (data) => {
    try {
      const { sessionId, userId, userName } = data;

      socket.leave(sessionId);
      activeUsers.delete(socket.id);

      const session = sessions.get(sessionId);
      if (session) {
        session.participants = session.participants.filter(
          (p) => p.userId !== userId
        );

        // Notify others
        io.to(sessionId).emit("user-left", {
          userId,
          userName,
          participants: session.participants,
          message: `${userName} left the session`,
        });

        // Delete empty sessions (optional)
        if (session.participants.length === 0) {
          sessions.delete(sessionId);
          console.log(`🗑️ Empty session deleted: ${sessionId}`);
        }
      }

      console.log(`❌ User ${userName} left session ${sessionId}`);
    } catch (error) {
      console.error("❌ Error in leave-session:", error);
    }
  });

  // ✅ Disconnect Event
  socket.on("disconnect", () => {
    try {
      const user = activeUsers.get(socket.id);

      if (user) {
        const { sessionId, userId, userName } = user;
        const session = sessions.get(sessionId);

        if (session) {
          session.participants = session.participants.filter(
            (p) => p.userId !== userId
          );

          // Notify others
          io.to(sessionId).emit("user-disconnected", {
            userId,
            userName,
            participants: session.participants,
            message: `${userName} disconnected`,
          });

          // Delete empty sessions
          if (session.participants.length === 0) {
            sessions.delete(sessionId);
            console.log(`🗑️ Empty session deleted: ${sessionId}`);
          }
        }

        activeUsers.delete(socket.id);
      }

      console.log(`🔌 Client disconnected: ${socket.id}`);
    } catch (error) {
      console.error("❌ Error in disconnect:", error);
    }
  });

  // ✅ Error Handling for Socket Events
  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
});

// ================================================================
// 🚀 SERVER STARTUP
// ================================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🚀 1-1 Collaborative Session Server Started!          ║
║                                                            ║
║  🌐 Server: http://localhost:${PORT}                        
║  📊 Health: http://localhost:${PORT}/health              
║  🔌 WebSocket: ws://localhost:${PORT}                     
║                                                            ║
║  ✅ Environment: ${process.env.NODE_ENV || "development"}
║  ✅ CORS Origins: ${allowedOrigins.join(", ")}
║  ✅ Max Connections: Unlimited                            
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// ================================================================
// 🛡️ GRACEFUL SHUTDOWN
// ================================================================

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  SIGTERM received, shutting down gracefully...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// ================================================================
// 💥 ERROR HANDLING
// ================================================================

process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = server;