import React, { useState, useRef, useEffect } from "react";
import { 
  Globe, 
  FileText, 
  Terminal as TerminalIcon, 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Folder,
  Minus,
  Square,
  X,
  Wifi,
  Battery,
  Volume2,
  Sparkles,
  MousePointer,
  Crosshair,
  Maximize2,
  LayoutGrid,
  Columns
} from "lucide-react";
import { BrowserApp } from "./apps/BrowserApp";
import { NotesApp } from "./apps/NotesApp";
import { TerminalApp } from "./apps/TerminalApp";
import { StoreApp } from "./apps/StoreApp";
import { SettingsApp } from "./apps/SettingsApp";
import { FilesApp } from "./apps/FilesApp";
import { SOMElement, VirtualDesktopWindow, MouseCursorState } from "../types";

interface VirtualDesktopProps {
  windows: VirtualDesktopWindow[];
  onUpdateWindows: (windows: VirtualDesktopWindow[]) => void;
  cursor: MouseCursorState;
  showSOMOverlay: boolean;
  somLabels: SOMElement[];
  onRunTerminalObjective?: (cmd: string) => void;
  activeAppId: string;
  onFocusApp: (id: string) => void;
}

export const VirtualDesktop: React.FC<VirtualDesktopProps> = ({
  windows,
  onUpdateWindows,
  cursor,
  showSOMOverlay,
  somLabels,
  onRunTerminalObjective,
  activeAppId,
  onFocusApp
}) => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [timeStr, setTimeStr] = useState("11:00 AM");
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const [windowLayoutMode, setWindowLayoutMode] = useState<"standard" | "focus" | "split">("standard");

  // Screen size detection
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsCompactScreen(window.innerWidth < 768);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Clock in Menu Bar
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCloseWindow = (id: string) => {
    onUpdateWindows(windows.map(w => w.id === id ? { ...w, isOpen: false } : w));
  };

  const handleToggleMinimize = (id: string) => {
    onUpdateWindows(windows.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const handleToggleMaximize = (id: string) => {
    onUpdateWindows(windows.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const handleBringToFront = (id: string) => {
    onFocusApp(id);
    const highestZ = Math.max(...windows.map(w => w.zIndex), 10);
    onUpdateWindows(windows.map(w => w.id === id ? { ...w, zIndex: highestZ + 1, isMinimized: false } : w));
  };

  const handleLaunchApp = (id: string) => {
    const target = windows.find(w => w.id === id);
    if (!target) return;

    const highestZ = Math.max(...windows.map(w => w.zIndex), 10);
    if (!target.isOpen) {
      onUpdateWindows(windows.map(w => w.id === id ? { ...w, isOpen: true, isMinimized: false, zIndex: highestZ + 1 } : w));
    } else if (target.isMinimized) {
      onUpdateWindows(windows.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: highestZ + 1 } : w));
    } else {
      handleBringToFront(id);
    }
    onFocusApp(id);
  };

  const dockApps = [
    { id: "browser", label: "Browser", icon: Globe, color: "text-blue-400 border-blue-500/30" },
    { id: "terminal", label: "Terminal", icon: TerminalIcon, color: "text-purple-400 border-purple-500/30" },
    { id: "notes", label: "Notes", icon: FileText, color: "text-emerald-400 border-emerald-500/30" },
    { id: "store", label: "Store", icon: ShoppingBag, color: "text-amber-400 border-amber-500/30" },
    { id: "files", label: "Files", icon: Folder, color: "text-indigo-400 border-indigo-500/30" },
    { id: "settings", label: "Settings", icon: SettingsIcon, color: "text-zinc-400 border-zinc-500/30" }
  ];

  return (
    <div 
      ref={desktopRef}
      id="soc-virtual-desktop-stage"
      className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] bg-zinc-950 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-2xl flex flex-col select-none"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 15%, rgba(16, 185, 129, 0.08) 0%, transparent 60%), radial-gradient(circle at 90% 85%, rgba(59, 130, 246, 0.05) 0%, transparent 50%), linear-gradient(to bottom, #09090b, #040405)`
      }}
    >
      {/* OS Top Menu Bar */}
      <div className="h-8 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800/80 px-3 flex items-center justify-between text-xs text-zinc-300 z-50 shrink-0 select-none">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] tracking-wide">OperateOS</span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">|</span>

          {/* Active App Badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-[11px] text-zinc-200 truncate">
            {activeAppId === "browser" && <Globe className="w-3 h-3 text-blue-400 shrink-0" />}
            {activeAppId === "terminal" && <TerminalIcon className="w-3 h-3 text-purple-400 shrink-0" />}
            {activeAppId === "notes" && <FileText className="w-3 h-3 text-emerald-400 shrink-0" />}
            {activeAppId === "store" && <ShoppingBag className="w-3 h-3 text-amber-400 shrink-0" />}
            {activeAppId === "settings" && <SettingsIcon className="w-3 h-3 text-zinc-400 shrink-0" />}
            {activeAppId === "files" && <Folder className="w-3 h-3 text-indigo-400 shrink-0" />}
            <span className="font-medium capitalize truncate">{activeAppId || "Desktop"}</span>
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-400 shrink-0">
          {/* Layout Mode Switcher on Desktop */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setWindowLayoutMode(windowLayoutMode === "focus" ? "standard" : "focus")}
              className={`px-1.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                windowLayoutMode === "focus" ? "bg-zinc-800 text-zinc-100 font-semibold" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Toggle Single Focus vs Floating Multi-window Mode"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              <span>{windowLayoutMode === "focus" ? "Focus Mode" : "Multi-Window"}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
            <Crosshair className="w-3 h-3" />
            <span>AI: ACTIVE</span>
          </div>

          <Wifi className="w-3.5 h-3.5 hidden md:block" />
          <Battery className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] text-zinc-300 font-medium">{timeStr}</span>
        </div>
      </div>

      {/* Desktop Workspace (Windows container) */}
      <div className="relative flex-1 p-1.5 sm:p-3 overflow-hidden">
        {windows.map((win) => {
          const isOpen = win.isOpen && !win.isMinimized;
          const isActive = activeAppId === win.id && isOpen;
          
          // On mobile or focus mode, active window expands to full width & height
          const isMobileFullscreen = isCompactScreen || windowLayoutMode === "focus";
          const isMax = win.isMaximized || isMobileFullscreen;

          // Compute responsive window positioning
          const stylePos: React.CSSProperties = {
            zIndex: isActive ? 30 : win.zIndex,
            top: isMax ? "0%" : `${win.y}%`,
            left: isMax ? "0%" : `${win.x}%`,
            width: isMax ? "100%" : `${win.width}%`,
            height: isMax ? "100%" : `${win.height}%`,
          };

          return (
            <div
              key={win.id}
              data-window-closed={!isOpen}
              onClick={() => handleBringToFront(win.id)}
              style={stylePos}
              className={`absolute flex flex-col overflow-hidden border shadow-2xl transition-[opacity,transform,top,left,width,height,box-shadow,border-color,filter] duration-250 ease-out ${
                isMax ? "rounded-none" : "rounded-xl"
              } ${
                isOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                  : "opacity-0 scale-95 translate-y-3 pointer-events-none invisible"
              } ${
                isActive
                  ? "border-zinc-700/90 bg-zinc-950 ring-1 ring-emerald-500/30 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.85)] brightness-100"
                  : isMobileFullscreen 
                    ? "hidden" // Hide background windows on mobile focus mode to eliminate clutter
                    : "border-zinc-800/80 bg-zinc-950/95 ring-0 shadow-lg brightness-90 opacity-80 hover:opacity-100 hover:border-zinc-700/60"
              }`}
            >
              {/* Window Titlebar */}
              <div 
                className={`h-8 border-b px-2.5 sm:px-3 flex items-center justify-between cursor-default shrink-0 select-none transition-colors duration-200 ${
                  isActive ? "bg-zinc-900 border-zinc-800" : "bg-zinc-900/70 border-zinc-800/70"
                }`}
                onDoubleClick={() => handleToggleMaximize(win.id)}
              >
                {/* Traffic light control dots with accessible hit targets */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleCloseWindow(win.id); }}
                    className="w-3.5 h-3.5 rounded-full bg-rose-500/80 hover:bg-rose-500 active:scale-90 flex items-center justify-center text-zinc-950 group transition-all"
                    title="Close Window"
                    data-som={`win-close-${win.id}`}
                  >
                    <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleMinimize(win.id); }}
                    className="w-3.5 h-3.5 rounded-full bg-amber-500/80 hover:bg-amber-500 active:scale-90 flex items-center justify-center text-zinc-950 group transition-all"
                    title="Minimize Window"
                    data-som={`win-min-${win.id}`}
                  >
                    <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleToggleMaximize(win.id); }}
                    className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 active:scale-90 flex items-center justify-center text-zinc-950 group transition-all"
                    title={isMax ? "Restore Window" : "Maximize Window"}
                    data-som={`win-max-${win.id}`}
                  >
                    <Maximize2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>

                {/* Window App Title */}
                <div className="text-xs font-medium text-zinc-200 flex items-center gap-1.5 truncate px-2">
                  {win.app === "browser" && <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  {win.app === "notes" && <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {win.app === "terminal" && <TerminalIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                  {win.app === "store" && <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  {win.app === "settings" && <SettingsIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
                  {win.app === "files" && <Folder className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  <span className="truncate">{win.title}</span>
                </div>

                {/* Window state indicator */}
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-950/60 border border-zinc-800/50">
                    {isMax ? "100%" : `${Math.round(win.width)}%`}
                  </span>
                </div>
              </div>

              {/* Window App Content Canvas */}
              <div className="flex-1 overflow-hidden relative bg-zinc-950">
                {win.app === "browser" && <BrowserApp />}
                {win.app === "notes" && <NotesApp />}
                {win.app === "terminal" && <TerminalApp onRunObjective={onRunTerminalObjective} />}
                {win.app === "store" && <StoreApp />}
                {win.app === "settings" && <SettingsApp />}
                {win.app === "files" && <FilesApp />}
              </div>
            </div>
          );
        })}

        {/* SET-OF-MARK (SOM) VISUAL OVERLAY */}
        {showSOMOverlay && somLabels.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {somLabels.map((lbl) => (
              <div
                key={lbl.id}
                style={{
                  top: `${lbl.y}%`,
                  left: `${lbl.x}%`,
                  width: `${lbl.width}%`,
                  height: `${lbl.height}%`,
                }}
                className="absolute border border-rose-500/70 bg-rose-500/10 rounded transition-all pointer-events-none"
              >
                <div className="absolute -top-3 -left-1 bg-rose-600 text-white font-mono text-[9px] font-bold px-1 rounded shadow-md border border-rose-400 z-10">
                  {lbl.id}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIRTUAL AGENT MOUSE CURSOR */}
        <div
          style={{
            top: `${cursor.y}%`,
            left: `${cursor.x}%`,
            transition: "top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
          className="absolute z-50 pointer-events-none transform -translate-x-1 -translate-y-1"
        >
          <div className="relative">
            <MousePointer 
              className={`w-5 h-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-transform duration-150 ${
                cursor.isClicking 
                  ? "text-rose-400 fill-rose-500 scale-90" 
                  : "text-emerald-400 fill-emerald-500"
              }`} 
            />

            {/* Click Ripple Wave */}
            {cursor.isClicking && (
              <div className="absolute -top-2 -left-2 w-9 h-9 rounded-full border-2 border-rose-400/80 animate-ping" />
            )}

            {/* Typing tooltip indicator */}
            {cursor.isTyping && (
              <div className="absolute top-4 left-4 bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-lg flex items-center gap-1 animate-pulse">
                <span>typing...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OS Bottom Dock Bar */}
      <div className="h-14 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 sm:px-4 flex items-center justify-center z-30 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl px-2 sm:px-3 py-1.5 shadow-2xl overflow-x-auto max-w-full">
          {dockApps.map((app) => {
            const win = windows.find((w) => w.id === app.id);
            const isOpen = win ? win.isOpen && !win.isMinimized : false;
            const isActive = activeAppId === app.id && isOpen;

            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleLaunchApp(app.id)}
                data-som={`dock-${app.id}`}
                title={`Launch ${app.label}`}
                className={`group relative p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 hover:-translate-y-1 active:translate-y-0 min-h-[44px] min-w-[44px] shrink-0 ${
                  isActive
                    ? "bg-zinc-800 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-105"
                    : "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850"
                }`}
              >
                <app.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 ${app.color.split(" ")[0]}`} />
                
                {/* Active Dot Indicator */}
                <div 
                  className={`absolute -bottom-1 h-1.5 rounded-full transition-all duration-300 ${
                    isOpen 
                      ? isActive 
                        ? "w-4 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" 
                        : "w-1.5 bg-zinc-400" 
                      : "w-0 bg-transparent opacity-0"
                  }`} 
                />

                {/* Hover App Label Tooltip */}
                <span className="absolute -top-7 px-2 py-0.5 rounded bg-zinc-900 text-zinc-200 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-y-1 group-hover:translate-y-0 pointer-events-none border border-zinc-800 shadow-md whitespace-nowrap hidden sm:inline-block">
                  {app.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
