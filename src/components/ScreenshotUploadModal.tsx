import React, { useState, useRef } from "react";
import { X, Upload, Layers, Eye, Scan, Sparkles, Check, Image as ImageIcon } from "lucide-react";
import { SOMElement } from "../types";

interface ScreenshotUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzeImage: (imageDataUrl: string, objective: string) => void;
}

export const ScreenshotUploadModal: React.FC<ScreenshotUploadModalProps> = ({
  isOpen,
  onClose,
  onAnalyzeImage
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [testObjective, setTestObjective] = useState("Find and click the primary call to action button");
  const [detectedMarks, setDetectedMarks] = useState<SOMElement[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      generateDemoMarks();
    };
    reader.readAsDataURL(file);
  };

  const generateDemoMarks = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setDetectedMarks([
        { id: "~1", label: "Navigation Item", x: 12, y: 8, width: 14, height: 5, text: "Home" },
        { id: "~2", label: "Search Field", x: 40, y: 7, width: 28, height: 6, text: "Search catalog" },
        { id: "~3", label: "Primary Button", x: 78, y: 7, width: 15, height: 6, text: "Get Started" },
        { id: "~4", label: "Hero Card", x: 10, y: 22, width: 80, height: 40, text: "Featured Announcement" },
        { id: "~5", label: "Action Link", x: 45, y: 70, width: 20, height: 8, text: "Click to proceed" },
      ]);
      setIsProcessing(false);
    }, 600);
  };

  const handleRunAnalysis = () => {
    if (!imagePreview) return;
    onAnalyzeImage(imagePreview, testObjective);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none font-sans text-xs">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-zinc-100">
              Custom Screen Upload & Set-Of-Mark Inspector
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Upload Drop Area */}
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 bg-zinc-950/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold text-zinc-200">
                  Drop a screenshot here, or click to browse
                </div>
                <div className="text-zinc-500 text-[11px] mt-1">
                  Supports PNG, JPG, WebP desktop UI captures
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Preview with SOM Bounding Boxes */}
              <div className="relative border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 max-h-72 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="w-full h-auto object-contain max-h-72"
                />

                {/* Overlaid marks */}
                {detectedMarks.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      top: `${m.y}%`,
                      left: `${m.x}%`,
                      width: `${m.width}%`,
                      height: `${m.height}%`,
                    }}
                    className="absolute border border-rose-500/80 bg-rose-500/15 rounded pointer-events-none"
                  >
                    <span className="absolute -top-3 -left-1 bg-rose-600 text-white font-mono text-[9px] font-bold px-1 rounded shadow">
                      {m.id}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Detected {detectedMarks.length} Set-of-Mark interactive candidates</span>
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setDetectedMarks([]);
                  }}
                  className="text-rose-400 hover:underline"
                >
                  Clear & Choose another
                </button>
              </div>

              {/* Objective field for testing */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-zinc-300 font-semibold">
                  Test Objective for this screen:
                </label>
                <input
                  type="text"
                  value={testObjective}
                  onChange={(e) => setTestObjective(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-900 border-t border-zinc-800 px-4 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
          >
            Cancel
          </button>
          {imagePreview && (
            <button
              type="button"
              onClick={handleRunAnalysis}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Run Agent on Screen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
