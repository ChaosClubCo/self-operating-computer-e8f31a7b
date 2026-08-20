import React, { useState } from "react";
import { Folder, FileText, Image as ImageIcon, Code, HardDrive, Download, ChevronRight } from "lucide-react";

export const FilesApp: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<string>("Documents");
  const [selectedFile, setSelectedFile] = useState<string | null>("meeting_notes.txt");

  const files = [
    { name: "meeting_notes.txt", type: "text", size: "4.2 KB", folder: "Documents", date: "Today 10:45 AM" },
    { name: "soc_architecture.png", type: "image", size: "840 KB", folder: "Pictures", date: "Yesterday" },
    { name: "benchmark_results.json", type: "code", size: "18.5 KB", folder: "Documents", date: "Aug 18" },
    { name: "system_config.yaml", type: "code", size: "2.1 KB", folder: "Configuration", date: "Aug 15" }
  ];

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100 font-sans select-none overflow-hidden text-xs">
      {/* Sidebar Folders */}
      <div className="w-44 border-r border-zinc-800 bg-zinc-900/40 p-2 space-y-1">
        <div className="text-[10px] uppercase font-mono text-zinc-500 px-2 py-1">Places</div>
        {["Documents", "Pictures", "Configuration", "Downloads"].map((folder) => (
          <button
            key={folder}
            type="button"
            onClick={() => setCurrentFolder(folder)}
            data-som={`files-folder-${folder}`}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all ${
              currentFolder === folder
                ? "bg-zinc-800 text-emerald-400 font-semibold"
                : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span className="truncate">{folder}</span>
          </button>
        ))}
      </div>

      {/* Main Files View */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumb Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-2 flex items-center gap-1 text-zinc-400 text-[11px]">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Computer</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-200 font-medium">{currentFolder}</span>
        </div>

        {/* File items list */}
        <div className="flex-1 p-3 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {files
              .filter((f) => f.folder === currentFolder || currentFolder === "Documents")
              .map((file) => (
                <div
                  key={file.name}
                  onClick={() => setSelectedFile(file.name)}
                  data-som={`files-item-${file.name}`}
                  className={`p-2.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                    selectedFile === file.name
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                      : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center mb-1.5 text-zinc-400">
                    {file.type === "image" ? (
                      <ImageIcon className="w-5 h-5 text-purple-400" />
                    ) : file.type === "code" ? (
                      <Code className="w-5 h-5 text-blue-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <span className="font-medium text-[11px] truncate w-full">{file.name}</span>
                  <span className="text-[10px] text-zinc-500 mt-0.5">{file.size}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
