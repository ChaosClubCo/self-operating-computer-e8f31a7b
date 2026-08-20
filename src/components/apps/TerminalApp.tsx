import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Play, Sparkles } from "lucide-react";

interface TerminalAppProps {
  onRunObjective?: (cmd: string) => void;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({ onRunObjective }) => {
  const [lines, setLines] = useState<Array<{ text: string; type: "input" | "output" | "error" | "system" }>>([
    { text: "Self-Operating Computer Framework [CLI v1.5.0]", type: "system" },
    { text: "Type 'help' for available commands or 'operate' to run multimodal agent.", type: "system" },
    { text: "$ operate --status", type: "input" },
    { text: "Vision Engine: ONLINE | OCR: READY | SOM: ENABLED | Model: gemini-2.5-flash", type: "output" }
  ]);

  const [inputVal, setInputVal] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    const newLines = [...lines, { text: `$ ${cmd}`, type: "input" as const }];

    const lower = cmd.toLowerCase();
    if (lower === "clear" || lower === "cls") {
      setLines([]);
      setInputVal("");
      return;
    } else if (lower === "help") {
      newLines.push({
        text: "Available commands:\n  operate -m <model>    Launch agent with specified model\n  status --detailed     Display vision pipeline & memory state\n  ping <host>           Test network latency\n  ls                    List virtual directory contents\n  clear                 Clear terminal window\n  help                  Display this message",
        type: "output"
      });
    } else if (lower.startsWith("status")) {
      newLines.push({
        text: "[SYSTEM STATUS]\n  Agent Engine: ACTIVE\n  Multimodal Pipeline: Latency 140ms\n  Screen Resolution: 1920x1080 virtual buffer\n  Active Session: ID #soc-live-01\n  Memory Usage: 42.8 MB",
        type: "output"
      });
    } else if (lower.startsWith("ping")) {
      newLines.push({
        text: "PING api.google.com (142.250.190.46): 56 data bytes\n64 bytes: icmp_seq=0 ttl=118 time=14.2 ms\n64 bytes: icmp_seq=1 ttl=118 time=12.8 ms\n64 bytes: icmp_seq=2 ttl=118 time=13.1 ms\n--- api.google.com ping statistics ---\n3 packets transmitted, 3 packets received, 0.0% packet loss",
        type: "output"
      });
    } else if (lower === "ls") {
      newLines.push({
        text: "drwxr-xr-x  apps/      browser/    notes/     terminal/\n-rw-r--r--  config.json\n-rw-r--r--  README.md\n-rw-r--r--  session_log.json",
        type: "output"
      });
    } else if (lower.startsWith("operate")) {
      newLines.push({
        text: "[Self-Operating Computer] Initializing multimodal loop with objective dispatch...",
        type: "output"
      });
      if (onRunObjective) {
        onRunObjective("Operate terminal workflow and inspect diagnostics");
      }
    } else {
      newLines.push({
        text: `bash: command executed: ${cmd}`,
        type: "output"
      });
    }

    setLines(newLines);
    setInputVal("");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-200 font-mono text-xs select-none overflow-hidden">
      {/* Top Banner */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold text-zinc-300">bash — 80x24 (soc-session)</span>
        </div>
        <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Agent Attached
        </span>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-zinc-950/90 font-mono">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === "input"
                ? "text-emerald-400 font-semibold"
                : line.type === "system"
                ? "text-zinc-500"
                : line.type === "error"
                ? "text-rose-400"
                : "text-zinc-300"
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Command Input Bar */}
      <form onSubmit={handleCommand} className="bg-zinc-900 border-t border-zinc-800 p-2 flex items-center gap-2">
        <span className="text-emerald-400 font-bold">$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type command ('help', 'status', 'ping', 'clear')..."
          data-som="terminal-input"
          className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 focus:outline-none font-mono text-xs"
        />
        <button
          type="submit"
          data-som="terminal-send"
          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-[11px] flex items-center gap-1 font-sans"
        >
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
