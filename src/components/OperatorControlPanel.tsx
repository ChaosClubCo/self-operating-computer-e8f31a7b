import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Upload, 
  ChevronRight,
  Compass,
  ArrowRight,
  Activity,
  Layers
} from "lucide-react";
import { OperatingSession, ExecutionMode } from "../types";

interface OperatorControlPanelProps {
  session: OperatingSession;
  onSetObjective: (obj: string) => void;
  onStartAgent: () => void;
  onStepAgent: () => void;
  onPauseAgent: () => void;
  onStopAgent: () => void;
  onSelectPreset: (preset: any) => void;
  presets: any[];
  maxSteps: number;
  onChangeMaxSteps: (val: number) => void;
  stepDelay: number;
  onChangeStepDelay: (val: number) => void;
  onOpenUploadModal: () => void;
}

const QUICK_ACTIONS = [
  { label: "Search AI News", icon: "🌐", prompt: "Open the browser and search for recent AI developments, then open the top article." },
  { label: "Draft Meeting Notes", icon: "📝", prompt: "Open the notes app and draft sprint meeting action items." },
  { label: "Shop Hardware", icon: "🛒", prompt: "Open TechStore and add the Mechanical Keyboard to the shopping cart." },
  { label: "Run CLI Health Check", icon: "💻", prompt: "Open terminal and run system status diagnostic." }
];

export const OperatorControlPanel: React.FC<OperatorControlPanelProps> = ({
  session,
  onSetObjective,
  onStartAgent,
  onStepAgent,
  onPauseAgent,
  onStopAgent,
  onSelectPreset,
  presets,
  maxSteps,
  onChangeMaxSteps,
  stepDelay,
  onChangeStepDelay,
  onOpenUploadModal
}) => {
  const isRunning = session.status === "running";
  const [customInput, setCustomInput] = useState(session.objective);
  const [showSettings, setShowSettings] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onSetObjective(customInput);
    if (!isRunning) {
      onStartAgent();
    }
  };

  const progressPercent = Math.min(100, Math.round((session.steps.length / maxSteps) * 100));

  return (
    <div className="flex flex-col h-full bg-zinc-900/90 border border-zinc-800/90 rounded-2xl overflow-hidden font-sans text-xs select-none shadow-xl">
      {/* Panel Header */}
      <div className="bg-zinc-900 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-zinc-100 leading-tight">
              Mission Control
            </h2>
            <div className="text-[10px] text-zinc-400 font-mono">
              Agent State: <span className={isRunning ? "text-emerald-400 font-semibold" : "text-zinc-300"}>{session.status.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="open-upload-modal-btn"
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[11px] font-medium transition-all"
            title="Upload custom screen capture to test SOM element labeling"
          >
            <Upload className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Upload Screen</span>
          </button>
        </div>
      </div>

      {/* Main Controls Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Progress bar if agent has stepped */}
        {session.steps.length > 0 && (
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Execution Loop Progress</span>
              </span>
              <span className="font-mono text-zinc-200">
                Step <strong className="text-emerald-400">{session.steps.length}</strong> / {maxSteps}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Objective Input Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <label htmlFor="agent-objective-input" className="block text-zinc-200 font-semibold text-xs">
            Goal or Task Instruction
          </label>
          <div className="relative">
            <textarea
              id="agent-objective-input"
              rows={3}
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                onSetObjective(e.target.value);
              }}
              placeholder="e.g. Open the browser, search for latest AI research, and click the top article headline..."
              disabled={isRunning}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/60 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed transition-all focus-visible:ring-1 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Quick Action Chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setCustomInput(action.prompt);
                  onSetObjective(action.prompt);
                }}
                disabled={isRunning}
                className="px-2 py-1 rounded-lg bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[10px] font-medium transition-all flex items-center gap-1"
              >
                <span>{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {isRunning ? (
              <button
                type="button"
                id="pause-agent-btn"
                onClick={onPauseAgent}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause Loop</span>
              </button>
            ) : (
              <button
                type="button"
                id="execute-agent-btn"
                onClick={() => {
                  onSetObjective(customInput);
                  onStartAgent();
                }}
                disabled={!customInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all active:scale-[0.98]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{session.steps.length > 0 ? "Resume Autonomous Loop" : "Execute Autonomous Agent"}</span>
              </button>
            )}

            <button
              type="button"
              id="step-1x-btn"
              onClick={onStepAgent}
              disabled={isRunning || !customInput.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-medium text-xs flex items-center gap-1.5 border border-zinc-700 transition-all"
              title="Execute a single next step"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Step 1x</span>
            </button>

            <button
              type="button"
              id="reset-mission-btn"
              onClick={onStopAgent}
              disabled={session.steps.length === 0 && !isRunning}
              className="px-3 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 disabled:opacity-40 font-medium text-xs flex items-center gap-1.5 border border-zinc-800 transition-all"
              title="Reset current mission"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Benchmarks & Presets */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Task Presets</span>
            <span className="text-[10px] text-zinc-500 font-normal">Click to load</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                id={`preset-${preset.id}`}
                onClick={() => {
                  setCustomInput(preset.objective);
                  onSelectPreset(preset);
                }}
                disabled={isRunning}
                className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all group active:scale-[0.99]"
              >
                <div className="font-semibold text-xs text-zinc-200 group-hover:text-emerald-400 flex items-center justify-between">
                  <span className="truncate mr-1">{preset.title}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-normal">
                  {preset.objective}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Execution Settings Toggle & Sliders */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 space-y-3">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-zinc-300"
          >
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Execution Parameters</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {showSettings ? "Hide" : "Customize"}
            </span>
          </button>

          {showSettings && (
            <div className="space-y-3 pt-2 border-t border-zinc-800/80">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Max Step Limit:</span>
                  <span className="font-mono font-bold text-emerald-400">{maxSteps} steps</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="25"
                  value={maxSteps}
                  onChange={(e) => onChangeMaxSteps(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Step Interval Delay:</span>
                  <span className="font-mono font-bold text-emerald-400">{stepDelay}ms</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="3000"
                  step="200"
                  value={stepDelay}
                  onChange={(e) => onChangeStepDelay(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Completion Confirmation Banner */}
        {session.status === "completed" && session.completionSummary && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Goal Accomplished</span>
            </div>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              {session.completionSummary}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
