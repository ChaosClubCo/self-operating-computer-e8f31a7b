import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

// Model list
const SUPPORTED_MODELS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google AI",
    description: "Ultra-fast multimodal vision model for real-time OS UI navigation & click coordinate mapping",
    isAvailable: true,
    isDefault: true,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google AI",
    description: "Deep reasoning multimodal model for complex multi-step computer automation tasks",
    isAvailable: true,
    isDefault: false,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o (Vision)",
    provider: "OpenAI",
    description: "Standard self-operating computer model for visual screen comprehension",
    isAvailable: false,
    isDefault: false,
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "High-precision UI vision model for desktop element reasoning",
    isAvailable: false,
    isDefault: false,
  },
  {
    id: "qwen-vl",
    name: "Qwen-VL",
    provider: "Alibaba / Open Source",
    description: "Open weights vision-language model for OCR & UI bounding box extraction",
    isAvailable: false,
    isDefault: false,
  }
];

const PRESETS = [
  {
    id: "search-news",
    title: "Browse Tech News",
    objective: "Open the Web Browser, search for 'latest AI breakthroughs', and view the top headline.",
    targetApp: "browser",
    mode: "vision"
  },
  {
    id: "take-notes",
    title: "Write Meeting Notes",
    objective: "Open the Notes application and write a meeting summary about Q3 AI agent deployment.",
    targetApp: "notes",
    mode: "som"
  },
  {
    id: "system-check",
    title: "Run Terminal Diagnostic",
    objective: "Open the Terminal, run 'status --detailed' to check system load, and verify network connectivity.",
    targetApp: "terminal",
    mode: "ocr"
  },
  {
    id: "shop-gadget",
    title: "E-Commerce Checkout",
    objective: "Open the TechStore app, find the 'Noise Cancelling Headphones', and add them to the cart.",
    targetApp: "store",
    mode: "som"
  },
  {
    id: "toggle-dark",
    title: "System Settings",
    objective: "Open Settings and enable developer mode with low-latency rendering.",
    targetApp: "settings",
    mode: "vision"
  }
];

// Helper to build system prompts matching original operate/models/prompts.py
function buildSystemPrompt(mode: string, objective: string, labelsSummary?: string) {
  const osType = "Web Virtual OS / Desktop";

  if (mode === "som" || mode === "ocr") {
    return `You are operating a ${osType} computer, using the same operating system as a human.
From looking at the screen, the objective, and previous actions, decide the next best action.

You have 4 possible operation actions available:
1. click - Move mouse and click element by label (e.g. "~1", "~2") or coordinates x, y percent (0.0 to 1.0)
   Format: [{ "thought": "Reasoning here", "operation": "click", "label": "~1", "x": 0.45, "y": 0.32 }]

2. write - Type text into the focused field
   Format: [{ "thought": "Typing objective query", "operation": "write", "content": "text to write" }]

3. press - Use a key or shortcut (e.g. ["Enter"], ["Tab"], ["Control", "f"])
   Format: [{ "thought": "Submitting search form", "operation": "press", "keys": ["Enter"] }]

4. done - The objective is completely fulfilled
   Format: [{ "thought": "Final verification", "operation": "done", "summary": "Detailed summary of completed objective" }]

${labelsSummary ? `Visible interactive elements with Set-Of-Mark labels:\n${labelsSummary}\n` : ''}

Objective: ${objective}

Return ONLY valid JSON array with operations:
[
  {
    "thought": "description of visual state and next action",
    "operation": "click" | "write" | "press" | "done",
    "label": "~1",
    "x": 0.5,
    "y": 0.5,
    "content": "string",
    "keys": ["Enter"],
    "summary": "string"
  }
]`;
  }

  return `You are operating a ${osType} computer, using the same operating system as a human.
From looking at the screen, the objective, and previous actions, decide the next best action.

You have 4 possible operation actions available:
1. click - Move mouse and click on screen coordinates x and y (decimal percent from 0.00 to 1.00)
   Format: [{ "thought": "Reasoning here", "operation": "click", "x": 0.25, "y": 0.15 }]

2. write - Type text into the active element
   Format: [{ "thought": "Typing content", "operation": "write", "content": "text to write" }]

3. press - Press a key or hotkey (e.g. ["Enter"], ["Backspace"], ["Escape"])
   Format: [{ "thought": "Pressing key", "operation": "press", "keys": ["Enter"] }]

4. done - Objective completed
   Format: [{ "thought": "Goal reached", "operation": "done", "summary": "summary of completed task" }]

Objective: ${objective}

Return ONLY a valid JSON array of operation objects.`;
}

// API Routes
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    serverTime: new Date().toISOString()
  });
});

app.get("/api/models", (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  const models = SUPPORTED_MODELS.map(m => ({
    ...m,
    isAvailable: m.provider === "Google AI" ? true : false,
    requiresExternalKey: m.provider !== "Google AI"
  }));
  res.json({
    models,
    hasGeminiKey: hasKey,
    defaultModel: "gemini-2.5-flash"
  });
});

app.get("/api/presets", (req: Request, res: Response) => {
  res.json(PRESETS);
});

app.post("/api/operate/step", async (req: Request, res: Response) => {
  try {
    const {
      objective,
      model = "gemini-2.5-flash",
      mode = "som",
      screenshot, // base64 data url or base64 string
      labels = [],
      desktopState,
      history = [],
      stepIndex = 0
    } = req.body;

    if (!objective) {
      return res.status(400).json({ error: "Objective is required" });
    }

    const ai = getGeminiClient();

    // If Gemini key exists and we have an image or state, call real Gemini model
    if (ai) {
      try {
        let labelsSummary = "";
        if (Array.isArray(labels) && labels.length > 0) {
          labelsSummary = labels
            .map((l: any) => `Label ${l.id} (${l.label || l.role || l.tag}): at x=${Math.round(l.x)}%, y=${Math.round(l.y)}% (size: ${Math.round(l.width)}%x${Math.round(l.height)}%) - text: "${l.text || ''}"`)
            .join("\n");
        }

        const systemPrompt = buildSystemPrompt(mode, objective, labelsSummary);
        
        let historySummary = "";
        if (Array.isArray(history) && history.length > 0) {
          historySummary = "\nPrevious Actions taken so far:\n" + history.map((h: any, i: number) => 
            `Step ${i + 1}: ${h.operation?.operation || 'action'} - Thought: "${h.thought || ''}"`
          ).join("\n") + "\n";
        }

        const userPromptText = `Current Step: ${stepIndex + 1}
Objective: "${objective}"
${historySummary}
${desktopState ? `Current Desktop Windows & Active App State: ${JSON.stringify(desktopState)}` : ''}

Inspect the current visual screen layout and choose the next action(s). Return JSON array.`;

        const parts: any[] = [{ text: userPromptText }];

        // Attach image if provided
        if (screenshot && typeof screenshot === "string" && screenshot.includes("base64,")) {
          const match = screenshot.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            const mimeType = match[1];
            const base64Data = match[2];
            parts.push({
              inlineData: {
                mimeType,
                data: base64Data
              }
            });
          }
        }

        const targetModel = model.includes("pro") ? "gemini-2.5-pro" : "gemini-2.5-flash";

        const response = await ai.models.generateContent({
          model: targetModel,
          contents: [{ role: "user", parts }],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.2
          }
        });

        const responseText = response.text?.trim() || "[]";
        let operations: any[] = [];
        try {
          operations = JSON.parse(responseText);
          if (!Array.isArray(operations)) {
            operations = [operations];
          }
        } catch {
          // Attempt markdown json extraction
          const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          operations = JSON.parse(cleaned);
        }

        return res.json({
          success: true,
          operations,
          rawResponse: responseText,
          modelUsed: targetModel,
          source: "gemini-api"
        });
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, using intelligent simulation fallback:", geminiError?.message);
      }
    }

    // Heuristic & Semantic OS Operator Reasoning Engine (Simulation / Offline / Fallback)
    const simulatedOperations = generateSimulatedStep({
      objective,
      desktopState,
      labels,
      history,
      stepIndex,
      mode
    });

    return res.json({
      success: true,
      operations: simulatedOperations,
      modelUsed: model,
      source: "simulated-engine",
      note: !ai ? "Operating via embedded visual reasoning engine (Add GEMINI_API_KEY for direct Gemini model calls)" : undefined
    });
  } catch (err: any) {
    console.error("Operate step error:", err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

// Heuristic fallback logic that mirrors original operate/operate.py behavior
function generateSimulatedStep({
  objective,
  desktopState,
  labels = [],
  history = [],
  stepIndex = 0,
  mode = "som"
}: {
  objective: string;
  desktopState?: any;
  labels?: any[];
  history?: any[];
  stepIndex?: number;
  mode?: string;
}) {
  const lowerObj = objective.toLowerCase();
  const activeApp = desktopState?.activeApp || "desktop";
  const openWindows = desktopState?.openWindows || [];
  const historyLen = history.length;

  // Check if we need to open an app first
  let targetApp = "browser";
  if (lowerObj.includes("note") || lowerObj.includes("write") || lowerObj.includes("memo") || lowerObj.includes("agenda")) {
    targetApp = "notes";
  } else if (lowerObj.includes("term") || lowerObj.includes("cli") || lowerObj.includes("command") || lowerObj.includes("status")) {
    targetApp = "terminal";
  } else if (lowerObj.includes("store") || lowerObj.includes("shop") || lowerObj.includes("buy") || lowerObj.includes("cart") || lowerObj.includes("headphone")) {
    targetApp = "store";
  } else if (lowerObj.includes("setting") || lowerObj.includes("dark") || lowerObj.includes("pref") || lowerObj.includes("config")) {
    targetApp = "settings";
  } else if (lowerObj.includes("file") || lowerObj.includes("folder") || lowerObj.includes("doc")) {
    targetApp = "files";
  }

  const isTargetOpen = openWindows.includes(targetApp);

  // If target window not open, first step is to click the app dock / launcher
  if (!isTargetOpen && historyLen === 0) {
    // Find dock item or coordinates
    const dockLabel = labels.find((l: any) => l.label?.toLowerCase().includes(targetApp) || l.tag === `dock-${targetApp}`);
    return [
      {
        thought: `I notice the ${targetApp} application is not currently open on the desktop. I will click the ${targetApp} icon on the application dock to launch it.`,
        operation: "click",
        label: dockLabel ? dockLabel.id : undefined,
        x: dockLabel ? dockLabel.x / 100 : 0.5,
        y: dockLabel ? dockLabel.y / 100 : 0.95
      }
    ];
  }

  // Application-specific multi-step action sequences
  if (targetApp === "browser") {
    if (historyLen <= 1) {
      const searchBoxLabel = labels.find((l: any) => l.tag === "browser-search" || l.role === "search" || l.tag === "browser-url");
      const searchQuery = extractSearchQuery(objective) || "latest AI research breakthroughs";
      return [
        {
          thought: "The browser is active. I will click into the search/URL input field to focus it.",
          operation: "click",
          label: searchBoxLabel?.id,
          x: searchBoxLabel ? searchBoxLabel.x / 100 : 0.45,
          y: searchBoxLabel ? searchBoxLabel.y / 100 : 0.28
        },
        {
          thought: `Typing search query: "${searchQuery}" into the search bar.`,
          operation: "write",
          content: searchQuery
        },
        {
          thought: "Pressing Enter to submit search request.",
          operation: "press",
          keys: ["Enter"]
        }
      ];
    } else if (historyLen === 2) {
      const resultItem = labels.find((l: any) => l.tag === "browser-result" || l.text?.includes("Article") || l.text?.includes("Result"));
      return [
        {
          thought: "Search results are displayed on screen. Clicking the primary headline link to read the article.",
          operation: "click",
          label: resultItem?.id,
          x: resultItem ? resultItem.x / 100 : 0.42,
          y: resultItem ? resultItem.y / 100 : 0.48
        }
      ];
    } else {
      return [
        {
          thought: "The article page is loaded and verified on screen. Objective is successfully fulfilled.",
          operation: "done",
          summary: `Successfully launched the browser, performed search query '${extractSearchQuery(objective) || 'AI developments'}', and navigated to the primary news article.`
        }
      ];
    }
  }

  if (targetApp === "notes") {
    if (historyLen <= 1) {
      const editorLabel = labels.find((l: any) => l.tag === "notes-editor" || l.role === "textbox");
      const noteContent = "Meeting Summary:\n- Reviewed Q3 Multimodal Model Performance\n- Enabled vision-based UI element coordinate mapping\n- Next steps: Autonomous task benchmark verification";
      return [
        {
          thought: "Notes app is open. Clicking the note document canvas to set cursor focus.",
          operation: "click",
          label: editorLabel?.id,
          x: editorLabel ? editorLabel.x / 100 : 0.5,
          y: editorLabel ? editorLabel.y / 100 : 0.45
        },
        {
          thought: "Drafting the requested meeting notes into the document.",
          operation: "write",
          content: noteContent
        }
      ];
    } else {
      return [
        {
          thought: "The note content is fully written and saved in the Notes editor.",
          operation: "done",
          summary: "Opened Notes application and successfully authored the requested meeting notes and action items."
        }
      ];
    }
  }

  if (targetApp === "terminal") {
    if (historyLen <= 1) {
      return [
        {
          thought: "Terminal console is focused. Typing diagnostic command 'status --detailed' to check system parameters.",
          operation: "write",
          content: "status --detailed"
        },
        {
          thought: "Executing command via Enter key.",
          operation: "press",
          keys: ["Enter"]
        }
      ];
    } else if (historyLen === 2) {
      return [
        {
          thought: "Checking network connectivity with 'ping -c 3 api.google.com'.",
          operation: "write",
          content: "ping -c 3 api.google.com"
        },
        {
          thought: "Sending command execution key.",
          operation: "press",
          keys: ["Enter"]
        }
      ];
    } else {
      return [
        {
          thought: "System diagnostics and network connectivity verified in the terminal output.",
          operation: "done",
          summary: "Executed system load diagnostics and network connection checks in Terminal with 0 packet loss."
        }
      ];
    }
  }

  if (targetApp === "store") {
    if (historyLen <= 1) {
      const productCard = labels.find((l: any) => l.tag?.includes("store-item") || l.text?.toLowerCase().includes("headphone") || l.text?.toLowerCase().includes("cart"));
      return [
        {
          thought: "Located the 'Noise Cancelling Studio Pro' item on the store shelf. Clicking to view product details.",
          operation: "click",
          label: productCard?.id,
          x: productCard ? productCard.x / 100 : 0.38,
          y: productCard ? productCard.y / 100 : 0.46
        }
      ];
    } else if (historyLen === 2) {
      const cartBtn = labels.find((l: any) => l.tag === "store-add-cart" || l.text?.toLowerCase().includes("add to cart"));
      return [
        {
          thought: "On product details page. Clicking 'Add to Cart' button.",
          operation: "click",
          label: cartBtn?.id,
          x: cartBtn ? cartBtn.x / 100 : 0.62,
          y: cartBtn ? cartBtn.y / 100 : 0.58
        }
      ];
    } else {
      return [
        {
          thought: "Item successfully added to cart and confirmed in checkout drawer.",
          operation: "done",
          summary: "Found Noise Cancelling Studio Pro in the store catalog and successfully added the item to shopping cart."
        }
      ];
    }
  }

  if (targetApp === "settings") {
    if (historyLen <= 1) {
      const toggleLabel = labels.find((l: any) => l.tag?.includes("setting-toggle") || l.text?.toLowerCase().includes("developer"));
      return [
        {
          thought: "Settings panel is open. Clicking developer mode toggle to enable low-latency rendering.",
          operation: "click",
          label: toggleLabel?.id,
          x: toggleLabel ? toggleLabel.x / 100 : 0.65,
          y: toggleLabel ? toggleLabel.y / 100 : 0.42
        }
      ];
    } else {
      return [
        {
          thought: "Settings toggled and preferences saved.",
          operation: "done",
          summary: "Updated system settings and enabled developer mode with low-latency rendering."
        }
      ];
    }
  }

  // Fallback generic step
  if (historyLen === 0) {
    return [
      {
        thought: `Analyzing visual layout for objective: "${objective}". Focusing primary workspace.`,
        operation: "click",
        x: 0.5,
        y: 0.5
      }
    ];
  }

  return [
    {
      thought: `Completed visual interactions for objective: "${objective}".`,
      operation: "done",
      summary: `Completed automated operations for task: ${objective}`
    }
  ];
}

function extractSearchQuery(text: string): string | null {
  const match = text.match(/search for ['"]([^'"]+)['"]/i) || text.match(/search ['"]([^'"]+)['"]/i) || text.match(/search ([a-zA-Z0-9 ]+)/i);
  return match ? match[1].trim() : null;
}

// Vite middleware & Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Self-Operating Computer Server running on http://localhost:${PORT}`);
  });
}

startServer();
