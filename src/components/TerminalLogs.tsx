import React, { useRef, useEffect, useState } from "react";
import { 
  Terminal, 
  Copy, 
  Trash2, 
  Check, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Filter,
  Search,
  MousePointer,
  Keyboard,
  Compass
} from "lucide-react";
import { AgentStepRecord } from "../types";

interface TerminalLogsProps {
  logs: string[];
  steps: AgentStepRecord[];
  model: string;
  onClearLogs: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({
  logs,
  steps,
  model,
  onClearLogs,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "thoughts" | "actions" | "raw">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, steps, filterMode]);

  const handleCopyLogs = () => {
    const text = logs.join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const totalDurationMs = steps.reduce((acc, s) => acc + (s.durationMs || 0), 0);

  const filteredSteps = steps.filter(step => {
    if (filterMode === "thoughts" && !step.thought) return false;
    if (filterMode === "actions" && !step.operation) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchThought = step.thought?.toLowerCase().includes(q);
      const matchOp = step.operation.operation?.toLowerCase().includes(q);
      const matchContent = step.operation.content?.toLowerCase().includes(q);
      const matchLabel = step.operation.label?.toLowerCase().includes(q);
      return matchThought || matchOp || matchContent || matchLabel;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden font-mono text-xs select-text shadow-xl">
      {/* Terminal Title Bar */}
      <div className="bg-zinc-900/95 border-b border-zinc-800/80 px-3.5 py-2 flex items-center justify-between text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Terminal className="w-3 h-3" />
          </div>
          <span className="text-[11px] font-semibold text-zinc-200 font-sans">
            Live Stream Console
          </span>
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">[{model}]</span>
        </div>

        {/* Console Action Tools */}
        <div className="flex items-center gap-1.5">
          {/* Quick Filter Pill */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-2 py-0.5 rounded transition-all ${
                filterMode === "all" ? "bg-zinc-800 text-zinc-200 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("thoughts")}
              className={`px-2 py-0.5 rounded transition-all ${
                filterMode === "thoughts" ? "bg-fuchsia-500/20 text-fuchsia-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Thoughts
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("actions")}
              className={`px-2 py-0.5 rounded transition-all ${
                filterMode === "actions" ? "bg-sky-500/20 text-sky-300 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Actions
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 transition-colors text-zinc-400"
            title="Copy all logs to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 transition-colors text-zinc-400"
            title="Clear console logs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-zinc-950/95 leading-relaxed">
        {/* Startup initialization header */}
        <div className="text-zinc-500 border-b border-zinc-900 pb-2 space-y-0.5 text-[11px]">
          <div className="text-emerald-400 font-semibold font-sans">Self-Operating Computer Autonomous Agent</div>
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-[10px]">
            <span>Model: {model}</span>
            <span>•</span>
            <span>Total Steps: {steps.length}</span>
            {totalDurationMs > 0 && (
              <>
                <span>•</span>
                <span>Latency: {totalDurationMs}ms</span>
              </>
            )}
          </div>
        </div>

        {/* Step-by-step trace */}
        {filteredSteps.map((step) => (
          <div 
            key={step.id} 
            className="border-l-2 border-emerald-500/50 pl-3 py-1 space-y-1.5 bg-zinc-900/20 rounded-r-lg"
          >
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-emerald-400 font-bold font-sans text-[10px] uppercase tracking-wider">
                Step #{step.stepNumber}
              </span>
              <span className="text-zinc-600">|</span>
              <span className="text-fuchsia-400 font-medium text-[11px]">{model}</span>
              {step.durationMs && (
                <span className="text-[10px] text-zinc-500 font-mono">({step.durationMs}ms)</span>
              )}
            </div>

            {/* Model Thought */}
            {step.thought && (
              <div className="text-fuchsia-300/90 text-xs italic pl-1 font-sans leading-relaxed">
                "{step.thought}"
              </div>
            )}

            {/* Structured Operation Action */}
            <div className="flex items-center flex-wrap gap-2 text-xs pt-0.5">
              <span className="text-sky-400 font-semibold font-sans">Action:</span>
              <span className="text-zinc-200 font-mono uppercase px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold">
                {step.operation.operation}
              </span>

              {step.operation.operation === "click" && (
                <span className="text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                  <MousePointer className="w-3 h-3 text-sky-400" />
                  {step.operation.label ? `Target [${step.operation.label}]` : `At (${(Number(step.operation.x) * 100).toFixed(0)}%, ${(Number(step.operation.y) * 100).toFixed(0)}%)`}
                </span>
              )}

              {step.operation.operation === "write" && (
                <span className="text-emerald-300 font-mono text-[11px] truncate max-w-sm flex items-center gap-1">
                  <Keyboard className="w-3 h-3 text-emerald-400 shrink-0" />
                  "{step.operation.content}"
                </span>
              )}

              {step.operation.operation === "press" && (
                <span className="text-amber-300 font-mono text-[11px]">
                  Keys: [{step.operation.keys?.join(" + ")}]
                </span>
              )}

              {step.operation.operation === "done" && (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Objective Reached: {step.operation.summary}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Freeform CLI logs */}
        {logs.map((log, index) => (
          <div key={index} className="text-zinc-400 text-xs whitespace-pre-wrap font-mono">
            {log}
          </div>
        ))}

        <div ref={scrollRef} />
      </div>
    </div>
  );
};
