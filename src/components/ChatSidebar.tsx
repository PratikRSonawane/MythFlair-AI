import React, { useMemo } from "react";

type ChatModel = {
  id: string;
  label: string;
  note: string;
  accent: string;
  api: "chat";
};

interface ChatSidebarProps {
  isDark: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  testMode: boolean;
  setTestMode: (mode: boolean) => void;
  chatModels: ChatModel[];
  puterModels: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedModelMetadata: {
    label: string;
    provider: string;
    context: number | null;
    maxTokens: number | null;
    accent: string;
    note: string;
  };
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isDark,
  sidebarOpen,
  setSidebarOpen,
  selectedModel,
  setSelectedModel,
  testMode,
  setTestMode,
  chatModels,
  puterModels,
  searchQuery,
  setSearchQuery,
  selectedModelMetadata,
}) => {
  const filteredModelsList = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return puterModels.filter(m => 
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (m.name && m.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.provider && m.provider.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, puterModels]);

  return (
    <>
      {/* Sidebar - Model Selection */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDark ? "border-r border-white/5 bg-[#0f1629]" : "border-r border-slate-200 bg-slate-100"}`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Close button */}
          <div className={`lg:hidden p-4 border-b flex justify-between items-center ${isDark ? "border-white/5" : "border-slate-200"}`}>
            <span className="font-bold text-sm">Models</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`p-1.5 rounded-lg border transition-all ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-300 hover:bg-slate-200"}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Model Selection Header */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-3">AI Models</p>

              {/* Main Model Selector */}
              <div className={`rounded-xl border p-4 transition-all ${
                isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-slate-200 bg-white/50 hover:bg-white/80"
              }`}>
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border-l-2 transition-all ${
                    isDark ? "bg-slate-900/50 border-l-violet-500" : "bg-white border-l-violet-500"
                  }`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Model</p>
                    <p className="font-bold text-sm">{selectedModelMetadata.label}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{selectedModelMetadata.note}</p>
                  </div>

                  {/* Model Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-white"}`}>
                      <p className="text-slate-500 text-[10px] font-bold uppercase">Provider</p>
                      <p className="font-bold capitalize mt-1">{selectedModelMetadata.provider}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${isDark ? "bg-white/5" : "bg-white"}`}>
                      <p className="text-slate-500 text-[10px] font-bold uppercase">Context</p>
                      <p className="font-bold mt-1">{selectedModelMetadata.context ? `${selectedModelMetadata.context}k` : "N/A"}</p>
                    </div>
                  </div>

                  {/* Test Mode Toggle */}
                  <div className={`p-3 rounded-lg flex items-center justify-between border ${
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                  }`}>
                    <div>
                      <p className="text-xs font-bold">Free Mode</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">No credit use</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestMode(!testMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        testMode ? "bg-violet-600" : (isDark ? "bg-slate-700" : "bg-slate-300")
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          testMode ? "translate-x-5.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Models */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Featured</p>
              <div className="space-y-2">
                {chatModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      setSelectedModel(model.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition-all ${
                      selectedModel === model.id
                        ? (isDark ? "border-violet-500/50 bg-violet-500/10" : "border-violet-400 bg-violet-50/70")
                        : (isDark ? "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10" : "border-slate-200 hover:border-slate-300 bg-white/50")
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: model.accent }} />
                      <span className="text-xs font-bold truncate">{model.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{model.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Puter Models */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Search Models</p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 500+ models..."
                className={`w-full rounded-lg border px-3 py-2 text-xs outline-none transition ${
                  isDark ? "border-white/10 bg-white/5 text-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25" : "border-slate-200 bg-white text-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
                }`}
              />
              {searchQuery && (
                <div className={`mt-2 space-y-1 max-h-60 overflow-y-auto rounded-lg border p-1 ${
                  isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                }`}>
                  {filteredModelsList.length === 0 ? (
                    <p className="text-[10px] text-slate-500 p-2 text-center">No models found</p>
                  ) : (
                    filteredModelsList.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(m.id);
                          setSearchQuery("");
                          setSidebarOpen(false);
                        }}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition hover:bg-violet-500/10 ${
                          selectedModel === m.id
                            ? (isDark ? "bg-violet-950/30 text-violet-400" : "bg-violet-50 text-violet-700")
                            : (isDark ? "text-slate-300" : "text-slate-700")
                        }`}
                      >
                        <span className="block font-bold truncate text-xs">{m.name || m.id}</span>
                        <span className="block text-[9px] opacity-60 uppercase">{m.provider}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className={`border-t p-4 space-y-2 ${isDark ? "border-white/5" : "border-slate-200"}`}>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">About Free Mode</p>
            <p className="text-xs leading-relaxed text-slate-400">
              Free mode lets you test models without consuming credits. Perfect for development and exploration. Check Puter's <a href="https://puter.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">terms of service</a> for details.
            </p>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 lg:hidden bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};
