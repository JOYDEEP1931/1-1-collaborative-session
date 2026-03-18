"use client";
import VideoCall from "../../components/VideoCall";
import ChatBox from "../../components/ChatBox";
import CodeEditor from "../../components/CodeEditor";

export default function SessionPage() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="col-span-1">
        <VideoCall />
        <ChatBox />
      </div>
      <div className="col-span-1">
        <CodeEditor />
      </div>
    </div>
  );
}
