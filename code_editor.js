"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import socket from "../lib/socket";

// Dynamically import Monaco Editor (disable SSR)
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

export default function CodeEditor() {
  const [code, setCode] = useState("// Start coding...");

  useEffect(() => {
    const handleCodeUpdate = (newCode) => {
      setCode(newCode);
    };

    socket.on("code-update", handleCodeUpdate);

    return () => {
      socket.off("code-update", handleCodeUpdate);
    };
  }, []);

  // Monaco's onChange passes (value, event)
  const handleChange = (value) => {
    const updatedCode = value || "";
    setCode(updatedCode);
    socket.emit("code-update", updatedCode);
  };

  return (
    <Editor
      height="400px"
      language="javascript"
      value={code}        // ✅ controlled component
      onChange={handleChange}
      theme="vs-dark"
    />
  );
}
