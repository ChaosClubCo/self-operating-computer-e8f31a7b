import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Clock,
  Menu,
  ChevronLeft
} from "lucide-react";

export const NotesApp: React.FC = () => {
  const [notes, setNotes] = useState([
    {
      id: "note-1",
      title: "Self-Operating AI Objectives",
      content: "Multimodal Agent Action Loop:\n1. Capture screen raster buffer\n2. Compute Set-of-Mark visual labels (~1, ~2)\n3. Query Gemini 2.5 Flash with structured schema\n4. Execute virtual mouse click & keyboard writes",
      updatedAt: "Just now"
    },
    {
      id: "note-2",
      title: "Sprint Planning Notes",
      content: "Review automated UI benchmarks across macOS, Linux, and web desktop environments.\nOptimize latency between image prompt construction and token dispatch.",
      updatedAt: "Yesterday"
    }
  ]);

  const [selectedNoteId, setSelectedNoteId] = useState("note-1");
  const [isSaved, setIsSaved] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleUpdateContent = (newContent: string) => {
    setIsSaved(false);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === selectedNoteId
          ? {
              ...n,
              content: newContent,
              title: newContent.split("\n")[0].slice(0, 30) || "Untitled Note",
              updatedAt: "Just now"
            }
          : n
      )
    );
    setTimeout(() => setIsSaved(true), 400);
  };

  const handleCreateNote = () => {
    const newId = `note-${Date.now()}`;
    const newNote = {
      id: newId,
      title: "New Note",
      content: "",
      updatedAt: "Just now"
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newId);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (notes.length <= 1) return;
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id) {
      setSelectedNoteId(remaining[0].id);
    }
  };

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans text-xs">
      {/* Sidebar: Notes List */}
      <div className={`${sidebarOpen ? "w-44 sm:w-52" : "w-0 hidden"} border-r border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0 transition-all duration-200`}>
        <div className="p-2 sm:p-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-zinc-200 truncate">
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Notes</span>
          </div>
          <button
            type="button"
            onClick={handleCreateNote}
            data-som="notes-new-btn"
            className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
            title="Create New Note"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {notes.map((note) => {
            const isSelected = note.id === selectedNoteId;
            return (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                data-som={`notes-item-${note.id}`}
                className={`group p-2 rounded-xl cursor-pointer transition-all border ${
                  isSelected
                    ? "bg-zinc-800/90 border-emerald-500/30 text-zinc-100 shadow-sm"
                    : "border-transparent hover:bg-zinc-850/50 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs truncate max-w-[110px] sm:max-w-[140px]">
                    {note.title || "Untitled Note"}
                  </div>
                  {notes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-500 hover:text-rose-400 transition-opacity"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 line-clamp-1">
                  {note.content || "Empty note..."}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {/* Editor Toolbar */}
        <div className="h-9 border-b border-zinc-800 bg-zinc-900/30 px-2 sm:px-3 flex items-center justify-between text-zinc-400 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              title="Toggle Notes Sidebar"
            >
              <Menu className="w-3.5 h-3.5" />
            </button>
            <span className="font-medium text-zinc-300 truncate max-w-[120px] sm:max-w-[200px]">
              {activeNote?.title || "Untitled Note"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            {isSaved ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3 h-3" /> Saved
              </span>
            ) : (
              <span className="text-amber-400 animate-pulse">Editing...</span>
            )}
          </div>
        </div>

        {/* Note Textarea Area */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col">
          <textarea
            value={activeNote?.content || ""}
            onChange={(e) => handleUpdateContent(e.target.value)}
            placeholder="Type your notes or agent instructions here..."
            data-som="notes-editor-textarea"
            className="w-full flex-1 bg-transparent border-none outline-none resize-none text-zinc-200 placeholder-zinc-600 font-sans leading-relaxed text-xs sm:text-sm select-text focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
};
