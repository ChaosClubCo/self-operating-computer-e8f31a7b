import React, { useState } from "react";
import { Settings, Sliders, Shield, Eye, Zap, Volume2, HardDrive, Check, Sparkles } from "lucide-react";

export const SettingsApp: React.FC = () => {
  const [developerMode, setDeveloperMode] = useState(true);
  const [somOpacity, setSomOpacity] = useState(85);
  const [cursorSpeed, setCursorSpeed] = useState(600);
  const [soundEffects, setSoundEffects] = useState(true);
  const [resolutionMode, setResolutionMode] = useState("1080p");
  const [savedBadge, setSavedBadge] = useState(false);

  const triggerSave = () => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 1200);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden text-xs">
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-sm tracking-tight text-zinc-100">System Preferences & AI Settings</span>
        </div>
        {savedBadge && (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <Check className="w-3 h-3" /> Preferences saved
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-xl">
        {/* Developer & Vision Controls */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3">
          <h4 className="font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agent Multimodal Pipeline</span>
          </h4>

          <div className="flex items-center justify-between py-1">
            <div>
              <div className="font-medium text-zinc-200">Developer Diagnostics Mode</div>
              <div className="text-[11px] text-zinc-400">Stream verbose thoughts & coordinate metadata in real time</div>
            </div>
            <button
              type="button"
              data-som="settings-dev-toggle"
              onClick={() => { setDeveloperMode(!developerMode); triggerSave(); }}
              className={`w-10 h-5 rounded-full transition-colors relative ${developerMode ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${developerMode ? "left-5" : "left-1"}`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <div className="font-medium text-zinc-200">Audio Feedback & Click SFX</div>
              <div className="text-[11px] text-zinc-400">Synthesize subtle audio feedback on mouse clicks and key writes</div>
            </div>
            <button
              type="button"
              data-som="settings-sfx-toggle"
              onClick={() => { setSoundEffects(!soundEffects); triggerSave(); }}
              className={`w-10 h-5 rounded-full transition-colors relative ${soundEffects ? "bg-emerald-500" : "bg-zinc-700"}`}
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${soundEffects ? "left-5" : "left-1"}`} />
            </button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-800">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-300">Set-of-Mark Overlay Opacity</span>
              <span className="font-mono text-emerald-400">{somOpacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={somOpacity}
              onChange={(e) => { setSomOpacity(Number(e.target.value)); triggerSave(); }}
              data-som="settings-som-slider"
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-zinc-300">Virtual Cursor Glide Duration</span>
              <span className="font-mono text-emerald-400">{cursorSpeed}ms</span>
            </div>
            <input
              type="range"
              min="200"
              max="1200"
              step="100"
              value={cursorSpeed}
              onChange={(e) => { setCursorSpeed(Number(e.target.value)); triggerSave(); }}
              data-som="settings-cursor-slider"
              className="w-full accent-emerald-500"
            />
          </div>
        </div>

        {/* System Specs & Environment */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-2">
          <h4 className="font-semibold text-xs text-zinc-200 flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-400" />
            <span>Virtual Environment Info</span>
          </h4>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
              <span className="text-zinc-500 block">OS Architecture</span>
              <span className="font-mono text-zinc-200 font-medium">Virtual Desktop (Linux x86_64)</span>
            </div>
            <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
              <span className="text-zinc-500 block">Multimodal Engine</span>
              <span className="font-mono text-emerald-400 font-medium">Google GenAI / Gemini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
