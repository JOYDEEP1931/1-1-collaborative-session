const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware for JWT auth
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.user);

  socket.on("offer", (offer) => socket.broadcast.emit("offer", offer));
  socket.on("answer", (answer) => socket.broadcast.emit("answer", answer));
  socket.on("candidate", (candidate) => socket.broadcast.emit("candidate", candidate));

  socket.on("chat-message", (msg) => socket.broadcast.emit("chat-message", msg));
  socket.on("code-update", (code) => socket.broadcast.emit("code-update", code));
});

server.listen(3001, () => console.log("Signaling server running on port 3001"));
