export type OperationType = 'click' | 'write' | 'press' | 'hotkey' | 'done' | 'scroll' | 'wait';

export interface Operation {
  thought: string;
  operation: OperationType;
  x?: string | number; // percentage (0.0 to 1.0) or pixel
  y?: string | number; // percentage (0.0 to 1.0) or pixel
  label?: string; // e.g. "~1", "~14" for SOM mode
  content?: string; // For 'write'
  keys?: string[]; // For 'press' or 'hotkey'
  summary?: string; // For 'done'
  direction?: 'up' | 'down';
}

export interface SOMElement {
  id: string; // "~1", "~2"
  label: string;
  role?: string;
  tag?: string;
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  width: number; // percentage
  height: number; // percentage
  text?: string;
}

export interface AgentStepRecord {
  id: string;
  stepNumber: number;
  timestamp: string;
  screenshot?: string;
  somLabels?: SOMElement[];
  thought: string;
  operation: Operation;
  executionStatus: 'success' | 'executing' | 'failed';
  resultMessage?: string;
  durationMs?: number;
}

export type ExecutionMode = 'vision' | 'som' | 'ocr';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  isAvailable: boolean;
  isDefault?: boolean;
}

export interface OperatingSession {
  id: string;
  objective: string;
  model: string;
  mode: ExecutionMode;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentStep: number;
  maxSteps: number;
  steps: AgentStepRecord[];
  startTime: number;
  endTime?: number;
  completionSummary?: string;
  errorMessage?: string;
}

export interface VirtualDesktopWindow {
  id: string;
  title: string;
  app: 'browser' | 'notes' | 'terminal' | 'store' | 'settings' | 'files';
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number; // percentage or px
  y: number;
  width: number;
  height: number;
}

export interface MouseCursorState {
  x: number; // 0 to 100 percent
  y: number; // 0 to 100 percent
  isClicking: boolean;
  isTyping?: boolean;
  trail: Array<{ x: number; y: number }>;
}
