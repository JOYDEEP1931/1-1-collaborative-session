import React, { useEffect, useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { getSocket } from "../lib/socket";

interface CodeUpdate {
  code: string;
  language: string;
  userId: string;
  userName: string;
  timestamp: string;
}

const SUPPORTED_LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "go",
  "rust",
  "html",
  "css",
  "sql",
];

function throttle(func: Function, delay: number) {
  let lastCall = 0;
  return function (...args: any[]) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

export default function CodeEditor() {
  const [code, setCode] = useState("// Start coding...\n");
  const [language, setLanguage] = useState("javascript");
  const [error, setError] = useState<string | null>(null);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const editorRef = useRef<any>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledEmitCodeUpdate = useRef(
    throttle((codeData: { code: string; language: string }) => {
      const socket = getSocket();
      if (!socket || !socket.connected) {
        console.warn("⚠️  Socket not connected, cannot emit code update");
        return;
      }

      console.log("📤 Emitting code update...");
      socket.emit("code-update", codeData, (response: any) => {
        if (!response.success) {
          setError(response.error || "Failed to sync code");
        } else {
          setError(null);
        }
      });
    }, 500),
  ).current;

  useEffect(() => {
  let socket: any;
  let handleCodeUpdate: any;

  const setupListener = async () => {
    let retries = 0;
    const maxRetries = 15;

    while (retries < maxRetries) {
      socket = getSocket();
      if (socket && socket.connected) {
        console.log("📝 Socket ready, setting up code-update listener");

        handleCodeUpdate = (update: CodeUpdate) => {
          console.log("📨 Received code update from", update.userName);
          setIsRemoteUpdate(true);
          setCode(update.code);
          setLanguage(update.language);
          setLastUpdatedBy(update.userName);
          setLastUpdateTime(new Date(update.timestamp).toLocaleTimeString());

          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            setIsRemoteUpdate(false);
          }, 100);
        };

        socket.off("code-update");
        socket.on("code-update", handleCodeUpdate);
        return;
      }

      retries++;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.warn("⚠️ Failed to set up code listener after retries");
  };

  setupListener();

  return () => {
    if (socket && handleCodeUpdate) {
      socket.off("code-update", handleCodeUpdate);
    }
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
  };
}, []);

  const handleCodeChange = (value: string | undefined) => {
    if (isRemoteUpdate) return;

    const newCode = value || "";
    setCode(newCode);
    setError(null);

    throttledEmitCodeUpdate({
      code: newCode,
      language: language,
    });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);

    const socket = getSocket();
    if (socket && socket.connected) {
      console.log("🔄 Emitting code update with language:", newLanguage);
      socket.emit("code-update", {
        code: code,
        language: newLanguage,
      });
    } else {
      console.warn("⚠️  Socket not connected, cannot emit code update");
    }
  };

  const handleClearCode = () => {
    if (confirm("Are you sure? This will clear the code for both users.")) {
      setCode("");
      const socket = getSocket();
      if (socket && socket.connected) {
        console.log("🗑️ Clearing code");
        socket.emit("code-update", {
          code: "",
          language: language,
        });
      } else {
        console.warn("⚠️  Socket not connected, cannot emit code update");
      }
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setError(null);
      const el = document.getElementById("copy-feedback");
      if (el) {
        el.style.display = "block";
        setTimeout(() => {
          el.style.display = "none";
        }, 2000);
      }
    } catch (err) {
      setError("Failed to copy code");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">Code Editor</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-1"
              title="Copy code"
            >
              📋 Copy
            </button>
            <button
              onClick={handleClearCode}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-1"
              title="Clear code"
            >
              🗑️ Clear
            </button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-300">Language:</label>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Info */}
        {lastUpdatedBy && (
          <div className="mt-2 text-xs text-gray-400">
            Last updated by:{" "}
            <span className="text-gray-300">{lastUpdatedBy}</span>
            {lastUpdateTime && <span> at {lastUpdateTime}</span>}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-500 bg-opacity-20 border-b border-red-500 text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Copy Feedback */}
      <div
        id="copy-feedback"
        style={{ display: "none" }}
        className="px-4 py-2 bg-green-500 bg-opacity-20 border-b border-green-500 text-green-200 text-sm"
      >
        ✅ Code copied to clipboard!
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          onMount={(editor) => {
            editorRef.current = editor;
          }}
          height="100%"
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: 14,
            tabSize: 2,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            formatOnPaste: true,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
}
