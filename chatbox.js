"use client";
import React, { useState, useEffect } from "react";
import socket from "../lib/socket";

export default function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat-message", handleMessage);

    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() !== "") {
      socket.emit("chat-message", input);
      setInput("");
    }
  };

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
