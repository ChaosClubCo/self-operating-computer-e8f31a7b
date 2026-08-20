import React, { useState } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Search, 
  Globe, 
  ExternalLink, 
  Bookmark, 
  Sparkles,
  Newspaper,
  Share2,
  Lock
} from "lucide-react";

interface BrowserAppProps {
  onRegisterElement?: (el: HTMLElement | null, tag: string, label: string) => void;
}

export const BrowserApp: React.FC<BrowserAppProps> = () => {
  const [url, setUrl] = useState("https://google.search.internal/news");
  const [searchQuery, setSearchQuery] = useState("latest AI agent developments");
  const [hasSearched, setHasSearched] = useState(true);
  const [activeArticle, setActiveArticle] = useState<number | null>(null);

  const searchResults = [
    {
      id: 1,
      title: "Multimodal AI Breakthrough: Vision Models Operating Computer Interfaces",
      source: "TechPulse AI Review • 2h ago",
      snippet: "Researchers demonstrate next-generation multimodal models operating operating system software using human-like mouse and keyboard actions with high coordinate precision.",
      url: "https://technews.internal/articles/multimodal-agents-ui",
      tag: "AI Research"
    },
    {
      id: 2,
      title: "Set-of-Mark Prompting Dramatically Enhances Vision Agent Accuracy",
      source: "Autonomous Systems Journal • 5h ago",
      snippet: "By overlaying visual bounding boxes and unique alphanumeric identifiers on interactive elements, vision models can achieve over 95% click accuracy on desktop apps.",
      url: "https://som-research.internal/breakthroughs",
      tag: "Computer Vision"
    },
    {
      id: 3,
      title: "Gemini 2.5 Flash: Real-Time Multimodal Reasoning at Scale",
      source: "Google DeepMind Blog • 1d ago",
      snippet: "The new lightweight flagship model brings ultra-fast latency for real-time video stream reasoning, UI navigation, and complex desktop workflows.",
      url: "https://deepmind.google/gemini-updates",
      tag: "Model Releases"
    }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setHasSearched(true);
    setActiveArticle(null);
    setUrl(`https://google.search.internal/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const selectedArticle = searchResults.find(a => a.id === activeArticle);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans text-xs">
      {/* Navigation Bar */}
      <div className="bg-zinc-900/95 border-b border-zinc-800 px-2 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="flex items-center gap-0.5 sm:gap-1 text-zinc-400 shrink-0">
          <button 
            type="button"
            onClick={() => setActiveArticle(null)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Back to Search Results"
            data-som="browser-back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            className="p-1.5 rounded-lg text-zinc-600 cursor-not-allowed hidden sm:block"
            title="Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={() => { setHasSearched(true); }}
            className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
            title="Reload Page"
            data-som="browser-reload"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Address / Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center min-w-0">
          <div className="w-full bg-zinc-950 border border-zinc-800 focus-within:border-emerald-500/50 rounded-lg px-2 sm:px-2.5 py-1 flex items-center gap-1.5 sm:gap-2 text-xs transition-all">
            <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or enter URL..."
              data-som="browser-url-input"
              className="w-full bg-transparent border-none outline-none text-zinc-200 placeholder-zinc-500 text-[11px] sm:text-xs truncate font-mono"
            />
            <button
              type="submit"
              data-som="browser-search-btn"
              className="text-zinc-400 hover:text-emerald-400 p-0.5 shrink-0"
              title="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        <button
          type="button"
          data-som="browser-bookmark-btn"
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 shrink-0 hidden sm:block"
          title="Bookmark Page"
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Browser Viewport */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-zinc-950">
        {selectedArticle ? (
          /* Full Article Reader View */
          <article className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {selectedArticle.tag}
              </span>
              <span className="text-[11px] text-zinc-500">{selectedArticle.source}</span>
            </div>

            <h1 className="text-base sm:text-xl font-bold text-zinc-100 leading-snug">
              {selectedArticle.title}
            </h1>

            <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-300 leading-relaxed text-xs sm:text-sm space-y-3">
              <p>{selectedArticle.snippet}</p>
              <p>
                Autonomous computer operating frameworks leverage state-of-the-art vision models to perceive user interface elements directly from screenshot frames. By predicting precise coordinate anchors and keystroke dispatches, multimodal agents can execute complex end-to-end user workflows without requiring brittle backend API integrations.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                data-som="browser-back-to-results"
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Search Results</span>
              </button>
            </div>
          </article>
        ) : (
          /* Search Results Listing */
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 text-[11px] text-zinc-500">
              <span>Showing results for <strong className="text-zinc-300">"{searchQuery}"</strong></span>
              <span className="font-mono">About 14,200 results (0.12s)</span>
            </div>

            <div className="space-y-3">
              {searchResults.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActiveArticle(item.id)}
                  data-som={`browser-article-${item.id}`}
                  className="group p-3 sm:p-3.5 rounded-xl border border-zinc-800/90 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-emerald-500/40 transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors truncate">
                      {item.source}
                    </span>
                  </div>

                  <h3 className="font-semibold text-xs sm:text-sm text-emerald-400 group-hover:text-emerald-300 group-hover:underline leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[11px] sm:text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>

                  <div className="text-[10px] text-zinc-500 font-mono pt-1 truncate">
                    {item.url}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
