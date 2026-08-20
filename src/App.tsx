import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { VirtualDesktop } from "./components/VirtualDesktop";
import { OperatorControlPanel } from "./components/OperatorControlPanel";
import { TerminalLogs } from "./components/TerminalLogs";
import { ScreenshotUploadModal } from "./components/ScreenshotUploadModal";
import { 
  Monitor, 
  Compass, 
  Terminal as TerminalIcon,
  Layers,
  Sparkles,
  Play,
  RotateCcw
} from "lucide-react";
import { 
  VirtualDesktopWindow, 
  MouseCursorState, 
  OperatingSession, 
  AgentStepRecord, 
  SOMElement, 
  ExecutionMode, 
  ModelOption,
  Operation
} from "./types";

const DEFAULT_WINDOWS: VirtualDesktopWindow[] = [
  {
    id: "browser",
    title: "Web Browser",
    app: "browser",
    icon: "Globe",
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    x: 5,
    y: 6,
    width: 62,
    height: 78
  },
  {
    id: "terminal",
    title: "Terminal — bash",
    app: "terminal",
    icon: "Terminal",
    isOpen: true,
    isMinimized: false,
    isMaximized: false,
    zIndex: 12,
    x: 48,
    y: 32,
    width: 48,
    height: 58
  },
  {
    id: "notes",
    title: "Notes & Scratchpad",
    app: "notes",
    icon: "FileText",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 8,
    x: 20,
    y: 12,
    width: 58,
    height: 72
  },
  {
    id: "store",
    title: "TechStore Hardware",
    app: "store",
    icon: "ShoppingBag",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 9,
    x: 15,
    y: 8,
    width: 68,
    height: 80
  },
  {
    id: "settings",
    title: "System Preferences",
    app: "settings",
    icon: "Settings",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 7,
    x: 25,
    y: 15,
    width: 50,
    height: 65
  },
  {
    id: "files",
    title: "File Manager",
    app: "files",
    icon: "Folder",
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 6,
    x: 10,
    y: 20,
    width: 52,
    height: 62
  }
];

export default function App() {
  const [models, setModels] = useState<ModelOption[]>([
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      provider: "Google AI",
      description: "Fast multimodal vision for UI navigation",
      isAvailable: true,
      isDefault: true
    },
    {
      id: "gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      provider: "Google AI",
      description: "Deep reasoning multimodal model",
      isAvailable: true
    },
    {
      id: "gpt-4o",
      name: "GPT-4o (Vision)",
      provider: "OpenAI",
      description: "Multimodal desktop operator",
      isAvailable: false
    }
  ]);

  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [mode, setMode] = useState<ExecutionMode>("som");
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [showSOMOverlay, setShowSOMOverlay] = useState(true);
  const [presets, setPresets] = useState<any[]>([]);
  const [maxSteps, setMaxSteps] = useState(10);
  const [stepDelay, setStepDelay] = useState(1200);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"desktop" | "control" | "terminal">("desktop");
  const [somLabels, setSomLabels] = useState<SOMElement[]>([]);

  // Desktop State
  const [windows, setWindows] = useState<VirtualDesktopWindow[]>(DEFAULT_WINDOWS);
  const [activeAppId, setActiveAppId] = useState<string>("terminal");

  // Mouse Cursor State
  const [cursor, setCursor] = useState<MouseCursorState>({
    x: 50,
    y: 50,
    isClicking: false,
    isTyping: false,
    trail: []
  });

  // Operating Session State
  const [session, setSession] = useState<OperatingSession>({
    id: `soc-${Date.now()}`,
    objective: "Open the Web Browser, search for 'latest AI breakthroughs', and view the top headline.",
    model: "gemini-2.5-flash",
    mode: "som",
    status: "idle",
    currentStep: 0,
    maxSteps: 10,
    steps: [],
    startTime: Date.now()
  });

  const [logs, setLogs] = useState<string[]>([
    "[Self-Operating Computer] Ready. Multimodal reasoning initialized."
  ]);

  const isRunningRef = useRef(false);
  isRunningRef.current = session.status === "running";

  // Scan interactive elements on desktop to generate SOM bounding boxes
  const scanSOMMarks = useCallback(() => {
    const desktopStage = document.getElementById("soc-virtual-desktop-stage");
    if (!desktopStage) return [];

    const desktopRect = desktopStage.getBoundingClientRect();
    const somElements = desktopStage.querySelectorAll("[data-som]");
    const labels: SOMElement[] = [];

    let count = 1;
    somElements.forEach((el) => {
      // Ignore elements inside closed or minimized windows
      if (el.closest('[data-window-closed="true"]')) return;

      const rect = el.getBoundingClientRect();
      // Only include visible elements
      if (rect.width > 0 && rect.height > 0 && rect.bottom > desktopRect.top && rect.top < desktopRect.bottom) {
        const x = ((rect.left - desktopRect.left) / desktopRect.width) * 100;
        const y = ((rect.top - desktopRect.top) / desktopRect.height) * 100;
        const width = (rect.width / desktopRect.width) * 100;
        const height = (rect.height / desktopRect.height) * 100;
        const tag = el.getAttribute("data-som") || "";
        const text = (el as HTMLElement).innerText || (el as HTMLInputElement).value || (el as HTMLElement).getAttribute("placeholder") || "";

        labels.push({
          id: `~${count}`,
          label: tag,
          tag,
          role: el.tagName.toLowerCase(),
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
          width: Math.max(1, Math.min(100, width)),
          height: Math.max(1, Math.min(100, height)),
          text: text.slice(0, 40)
        });
        count++;
      }
    });

    setSomLabels(labels);
    return labels;
  }, []);

  // Fetch models & presets on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) => {
        if (data.hasGeminiKey) setHasGeminiKey(true);
      })
      .catch(() => {});

    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        if (data.models) setModels(data.models);
        if (data.hasGeminiKey) setHasGeminiKey(true);
      })
      .catch(() => {});

    fetch("/api/presets")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPresets(data);
      })
      .catch(() => {});
  }, []);

  // Re-scan marks when windows change
  useEffect(() => {
    const timer = setTimeout(scanSOMMarks, 200);
    return () => clearTimeout(timer);
  }, [windows, activeAppId, scanSOMMarks]);

  // Execute Agent Single Step
  const executeAgentStep = async (currentStepNumber: number): Promise<boolean> => {
    const marks = scanSOMMarks();
    const currentOpen = windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.id);

    const stepStart = Date.now();
    setLogs((prev) => [
      ...prev,
      `[Self-Operating Computer] Step #${currentStepNumber}: Querying multimodal model...`
    ]);

    try {
      const payload = {
        objective: session.objective,
        model: selectedModel,
        mode,
        labels: marks,
        desktopState: {
          activeApp: activeAppId,
          openWindows: currentOpen
        },
        history: session.steps,
        stepIndex: currentStepNumber - 1
      };

      const res = await fetch("/api/operate/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!data.success || !data.operations || data.operations.length === 0) {
        throw new Error(data.error || "No operation returned");
      }

      let isDone = false;

      // Process operations returned by the model
      for (const op of data.operations) {
        await executeSingleOperation(op, marks);

        const newStepRecord: AgentStepRecord = {
          id: `step-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          stepNumber: currentStepNumber,
          timestamp: new Date().toLocaleTimeString(),
          thought: op.thought || "Analyzing UI context",
          operation: op,
          executionStatus: "success",
          durationMs: Date.now() - stepStart
        };

        setSession((prev) => ({
          ...prev,
          currentStep: currentStepNumber,
          steps: [...prev.steps, newStepRecord]
        }));

        if (op.operation === "done") {
          isDone = true;
          setSession((prev) => ({
            ...prev,
            status: "completed",
            completionSummary: op.summary || "Objective reached successfully."
          }));
          setLogs((prev) => [
            ...prev,
            `[Self-Operating Computer] Objective Complete: ${op.summary || "Finished."}`
          ]);
          break;
        }
      }

      return !isDone;
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        `[Error in Step #${currentStepNumber}]: ${err.message || "Failed execution"}`
      ]);
      setSession((prev) => ({ ...prev, status: "failed" }));
      return false;
    }
  };

  // Perform physical action on Virtual Desktop
  const executeSingleOperation = async (op: Operation, marks: SOMElement[]) => {
    let targetX = 50;
    let targetY = 50;

    // Resolve target coordinates
    if (op.label) {
      const matched = marks.find((m) => m.id === op.label || m.tag === op.label);
      if (matched) {
        targetX = matched.x + matched.width / 2;
        targetY = matched.y + matched.height / 2;
      }
    } else if (op.x !== undefined && op.y !== undefined) {
      targetX = Number(op.x) * 100;
      targetY = Number(op.y) * 100;
    }

    // Animate cursor movement
    setCursor((prev) => ({
      ...prev,
      x: targetX,
      y: targetY,
      isClicking: false,
      isTyping: false
    }));

    await new Promise((r) => setTimeout(r, 450));

    if (op.operation === "click") {
      setCursor((prev) => ({ ...prev, isClicking: true }));
      await new Promise((r) => setTimeout(r, 200));

      // Trigger DOM element click if matched
      if (op.label) {
        const matched = marks.find((m) => m.id === op.label || m.tag === op.label);
        if (matched) {
          const domEl = document.querySelector(`[data-som="${matched.tag}"]`) as HTMLElement;
          if (domEl) {
            domEl.click();
            domEl.focus?.();
          }
        }
      }

      // Check if clicking dock apps
      if (op.label?.startsWith("dock-")) {
        const appId = op.label.replace("dock-", "");
        const targetWin = windows.find((w) => w.id === appId);
        if (targetWin) {
          const maxZ = Math.max(...windows.map((w) => w.zIndex), 10);
          setWindows((prev) =>
            prev.map((w) =>
              w.id === appId ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZ + 1 } : w
            )
          );
          setActiveAppId(appId);
        }
      }

      await new Promise((r) => setTimeout(r, 200));
      setCursor((prev) => ({ ...prev, isClicking: false }));
    } else if (op.operation === "write") {
      setCursor((prev) => ({ ...prev, isTyping: true }));
      const activeInput = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeInput && (activeInput.tagName === "INPUT" || activeInput.tagName === "TEXTAREA")) {
        activeInput.value = (activeInput.value || "") + (op.content || "");
        activeInput.dispatchEvent(new Event("input", { bubbles: true }));
        activeInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
      await new Promise((r) => setTimeout(r, 400));
      setCursor((prev) => ({ ...prev, isTyping: false }));
    } else if (op.operation === "press") {
      if (op.keys?.includes("ENTER")) {
        const activeInput = document.activeElement as HTMLElement;
        if (activeInput) {
          const form = activeInput.closest("form");
          if (form) {
            form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
          }
        }
      }
      await new Promise((r) => setTimeout(r, 300));
    }
  };

  // Autonomous loop execution runner
  const startAutonomousLoop = async () => {
    if (!session.objective.trim()) return;

    setSession((prev) => ({
      ...prev,
      status: "running",
      startTime: Date.now()
    }));

    setLogs((prev) => [
      ...prev,
      `[Self-Operating Computer] Starting execution for: "${session.objective}"`
    ]);

    let step = session.steps.length + 1;
    while (step <= maxSteps) {
      if (!isRunningRef.current && session.status !== "running") {
        break;
      }

      const shouldContinue = await executeAgentStep(step);
      if (!shouldContinue) {
        break;
      }

      step++;
      await new Promise((r) => setTimeout(r, stepDelay));
    }

    setSession((prev) =>
      prev.status === "running"
        ? {
            ...prev,
            status: "completed",
            completionSummary: "Step limit reached or mission finished."
          }
        : prev
    );
  };

  const handleStepOnce = async () => {
    const nextStep = session.steps.length + 1;
    await executeAgentStep(nextStep);
  };

  const handleToggleRun = () => {
    if (session.status === "running") {
      setSession((prev) => ({ ...prev, status: "paused" }));
    } else {
      startAutonomousLoop();
    }
  };

  const handleResetSession = () => {
    setSession({
      id: `soc-${Date.now()}`,
      objective: session.objective,
      model: selectedModel,
      mode,
      status: "idle",
      currentStep: 0,
      maxSteps: 10,
      steps: [],
      startTime: Date.now()
    });
    setLogs(["[Self-Operating Computer] Session reset. Viewport clear."]);
    setCursor({ x: 50, y: 50, isClicking: false, isTyping: false, trail: [] });
  };

  const handleSelectPreset = (preset: any) => {
    setSession((prev) => ({
      ...prev,
      objective: preset.objective,
      status: "idle",
      steps: [],
      currentStep: 0
    }));

    if (preset.mode) {
      setMode(preset.mode);
    }

    // Ensure target app is opened
    if (preset.targetApp) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === preset.targetApp
            ? { ...w, isOpen: true, isMinimized: false, zIndex: 20 }
            : w
        )
      );
      setActiveAppId(preset.targetApp);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <Header
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        mode={mode}
        onSelectMode={setMode}
        hasGeminiKey={hasGeminiKey}
        isRunning={session.status === "running"}
        onToggleRun={handleToggleRun}
        onResetSession={handleResetSession}
        showSOMOverlay={showSOMOverlay}
        onToggleSOMOverlay={() => setShowSOMOverlay(!showSOMOverlay)}
        stepCount={session.steps.length}
      />

      {/* Mobile/Tablet Segmented Viewport Switcher (Mobbin Pattern) */}
      <div className="xl:hidden px-3 pt-3">
        <div className="bg-zinc-900/90 border border-zinc-800 p-1 rounded-2xl flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => setMobileTab("desktop")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-all min-h-[40px] ${
              mobileTab === "desktop"
                ? "bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
            <span>Virtual OS</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("control")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-all min-h-[40px] ${
              mobileTab === "control"
                ? "bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mission Control</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("terminal")}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 font-medium transition-all min-h-[40px] ${
              mobileTab === "terminal"
                ? "bg-zinc-800 text-zinc-100 font-semibold shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Console</span>
            {session.steps.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-mono font-bold">
                {session.steps.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <main className="flex-1 p-3 md:p-4 max-w-[1700px] w-full mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Left / Center: Virtual Desktop Viewport & Console */}
        <div className={`xl:col-span-8 flex flex-col space-y-4 ${
          mobileTab !== "desktop" && mobileTab !== "terminal" ? "hidden xl:flex" : "flex"
        }`}>
          {/* Virtual Desktop */}
          <div className={mobileTab === "terminal" ? "hidden xl:block" : "block"}>
            <VirtualDesktop
              windows={windows}
              onUpdateWindows={setWindows}
              cursor={cursor}
              showSOMOverlay={showSOMOverlay}
              somLabels={somLabels}
              onRunTerminalObjective={(cmd) => {
                setSession((prev) => ({ ...prev, objective: cmd }));
              }}
              activeAppId={activeAppId}
              onFocusApp={setActiveAppId}
            />
          </div>

          {/* Real-time Streaming CLI Console */}
          <div className={`h-64 sm:h-72 xl:h-64 ${
            mobileTab === "desktop" ? "hidden xl:block" : "block"
          }`}>
            <TerminalLogs
              logs={logs}
              steps={session.steps}
              model={selectedModel}
              onClearLogs={() => setLogs([])}
            />
          </div>
        </div>

        {/* Right: Operator Control & Mission Panel */}
        <div className={`xl:col-span-4 flex flex-col space-y-4 ${
          mobileTab !== "control" ? "hidden xl:flex" : "flex"
        }`}>
          <OperatorControlPanel
            session={session}
            onSetObjective={(obj) => setSession((prev) => ({ ...prev, objective: obj }))}
            onStartAgent={startAutonomousLoop}
            onStepAgent={handleStepOnce}
            onPauseAgent={() => setSession((prev) => ({ ...prev, status: "paused" }))}
            onStopAgent={handleResetSession}
            onSelectPreset={handleSelectPreset}
            presets={presets}
            maxSteps={maxSteps}
            onChangeMaxSteps={setMaxSteps}
            stepDelay={stepDelay}
            onChangeStepDelay={setStepDelay}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        </div>
      </main>

      {/* Custom Screenshot Upload & SOM Inspector Modal */}
      <ScreenshotUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAnalyzeImage={(img, obj) => {
          setSession((prev) => ({
            ...prev,
            objective: obj,
            status: "idle",
            steps: []
          }));
          setLogs((prev) => [
            ...prev,
            `[Self-Operating Computer] Loaded custom screen capture for objective: "${obj}"`
          ]);
        }}
      />
    </div>
  );
}
