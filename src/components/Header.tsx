import React, { useState } from "react";
import { 
  Monitor, 
  Cpu, 
  Layers, 
  Sliders, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Scan, 
  Key,
  ShieldCheck,
  ChevronDown,
  Activity,
  Maximize2,
  Terminal,
  Settings2
} from "lucide-react";
import { ExecutionMode, ModelOption } from "../types";

interface HeaderProps {
  models: ModelOption[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  mode: ExecutionMode;
  onSelectMode: (mode: ExecutionMode) => void;
  hasGeminiKey: boolean;
  isRunning: boolean;
  onToggleRun: () => void;
  onResetSession: () => void;
  showSOMOverlay: boolean;
  onToggleSOMOverlay: () => void;
  stepCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  models,
  selectedModel,
  onSelectModel,
  mode,
  onSelectMode,
  hasGeminiKey,
  isRunning,
  onToggleRun,
  onResetSession,
  showSOMOverlay,
  onToggleSOMOverlay,
  stepCount
}) => {
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/90 text-xs select-none shadow-md">
      {/* Primary Top Bar */}
      <div className="px-3 sm:px-4 lg:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand & Framework Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
            <Monitor className="w-4 h-4" />
            {isRunning && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>

          <div className="min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-zinc-100 tracking-tight text-xs sm:text-sm truncate">
                Self-Operating Computer
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
                v1.5
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-normal hidden md:block truncate">
              Autonomous Multimodal OS Agent
            </p>
          </div>
        </div>

        {/* Desktop Controls (Hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Model Selector Pill */}
          <div className="relative">
            <button
              type="button"
              id="desktop-model-selector-btn"
              aria-label="Select AI Model"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              disabled={isRunning}
              className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-200 transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[36px]"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium text-xs">
                {currentModel?.name || selectedModel}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
            </button>

            {showModelDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowModelDropdown(false)} 
                />
                <div className="absolute left-0 mt-1.5 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-mono uppercase text-zinc-500 font-semibold border-b border-zinc-800/80">
                    Multimodal Reasoning Engine
                  </div>
                  {models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onSelectModel(m.id);
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                        selectedModel === m.id
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                          : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <div className="font-semibold flex items-center justify-between">
                        <span>{m.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{m.provider}</span>
                      </div>
                      {m.description && (
                        <span className="text-[10px] text-zinc-400 font-normal line-clamp-1">
                          {m.description}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Operating Mode Switcher */}
          <div 
            className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-0.5 text-xs"
            role="radiogroup"
            aria-label="Vision Mode"
          >
            <button
              type="button"
              role="radio"
              aria-checked={mode === "som"}
              onClick={() => onSelectMode("som")}
              disabled={isRunning}
              title="Set-Of-Mark Mode: Overlays numbered IDs (~1, ~2) on UI elements"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium text-[11px] min-h-[30px] ${
                mode === "som"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>SOM (Marks)</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={mode === "ocr"}
              onClick={() => onSelectMode("ocr")}
              disabled={isRunning}
              title="OCR Mode: Text recognition with visual bounding coordinates"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium text-[11px] min-h-[30px] ${
                mode === "ocr"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Scan className="w-3 h-3 text-blue-400" />
              <span>OCR</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={mode === "vision"}
              onClick={() => onSelectMode("vision")}
              disabled={isRunning}
              title="Pure Vision Mode: Direct relative percentage coordinates"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-medium text-[11px] min-h-[30px] ${
                mode === "vision"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="w-3 h-3 text-purple-400" />
              <span>Direct</span>
            </button>
          </div>

          {/* Toggle SOM Labels Overlay */}
          <button
            type="button"
            id="desktop-toggle-som-overlay-btn"
            onClick={onToggleSOMOverlay}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-all min-h-[36px] ${
              showSOMOverlay
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
            title="Toggle visibility of Set-Of-Mark labels on the desktop canvas"
          >
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>Marks: {showSOMOverlay ? "ON" : "OFF"}</span>
          </button>

          {/* API Key Status Indicator */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] min-h-[36px]"
            title={hasGeminiKey ? "Gemini API Key active" : "Demo Simulation mode"}
          >
            <Key className={`w-3 h-3 ${hasGeminiKey ? "text-emerald-400" : "text-amber-400"}`} />
            <span className={`font-mono font-medium ${hasGeminiKey ? "text-emerald-300" : "text-amber-300/90"}`}>
              {hasGeminiKey ? "Live" : "Demo"}
            </span>
          </div>
        </div>

        {/* Action Controls (Both Mobile & Desktop) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Quick Options Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileSettings(!showMobileSettings)}
            className={`lg:hidden p-2 rounded-xl border text-xs transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
              showMobileSettings 
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-850"
            }`}
            aria-label="Toggle Agent Vision & Model Settings"
            title="Vision Mode & Model Config"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Reset Button */}
          <button
            type="button"
            id="header-reset-session-btn"
            onClick={onResetSession}
            disabled={isRunning}
            aria-label="Reset Session"
            className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors disabled:opacity-40 min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Reset desktop session and history"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Run / Pause CTA */}
          <button
            type="button"
            id="header-toggle-run-btn"
            onClick={onToggleRun}
            className={`flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl font-semibold text-xs transition-all shadow-sm min-h-[40px] ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{stepCount > 0 ? "Resume" : "Run Agent"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Settings Drawer / Secondary Bar */}
      {showMobileSettings && (
        <div className="lg:hidden border-t border-zinc-800/80 bg-zinc-900/90 px-3 py-2.5 space-y-2.5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Mobile Model Selector */}
            <div className="relative flex-1 min-w-[140px]">
              <button
                type="button"
                id="mobile-model-selector-btn"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                disabled={isRunning}
                className="w-full flex items-center justify-between gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-200 text-[11px] min-h-[36px]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{currentModel?.name || selectedModel}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
              </button>

              {showModelDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowModelDropdown(false)} 
                  />
                  <div className="absolute left-0 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                    {models.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSelectModel(m.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex flex-col ${
                          selectedModel === m.id
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                            : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        <span className="font-semibold">{m.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{m.provider}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Marks Toggle */}
            <button
              type="button"
              onClick={onToggleSOMOverlay}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium min-h-[36px] ${
                showSOMOverlay
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              <Layers className="w-3 h-3 text-rose-400" />
              <span>Marks: {showSOMOverlay ? "ON" : "OFF"}</span>
            </button>

            {/* API Status */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] min-h-[36px]">
              <Key className={`w-3 h-3 ${hasGeminiKey ? "text-emerald-400" : "text-amber-400"}`} />
              <span className={`font-mono text-[10px] ${hasGeminiKey ? "text-emerald-300" : "text-amber-300"}`}>
                {hasGeminiKey ? "Live Key" : "Demo Mode"}
              </span>
            </div>
          </div>

          {/* Mobile Vision Mode Segmented Controller */}
          <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => onSelectMode("som")}
              className={`py-1 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 min-h-[32px] ${
                mode === "som"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400"
              }`}
            >
              <Layers className="w-3 h-3 text-emerald-400" />
              <span>SOM Marks</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMode("ocr")}
              className={`py-1 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 min-h-[32px] ${
                mode === "ocr"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-zinc-400"
              }`}
            >
              <Scan className="w-3 h-3 text-blue-400" />
              <span>OCR</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectMode("vision")}
              className={`py-1 rounded-lg font-medium text-[11px] flex items-center justify-center gap-1 min-h-[32px] ${
                mode === "vision"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-zinc-400"
              }`}
            >
              <Eye className="w-3 h-3 text-purple-400" />
              <span>Direct</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
