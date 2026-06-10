import React from "react";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  images?: {
    image_url: {
      url: string;
    };
  }[];
};

interface ChatContentProps {
  isDark: boolean;
  messages: Message[];
  isGenerating: boolean;
  input: string;
  setInput: (input: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPuterLoaded: boolean;
  testMode: boolean;
  selectedModelLabel: string;
  onSuggestionClick: (text: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const promptSuggestions = [
  {
    title: "Explain Quantum Physics",
    desc: "Simple analogies for kids",
    text: "Explain quantum physics to a 10-year-old",
  },
  {
    title: "TypeScript API Retry",
    desc: "Robust network function",
    text: "Write a TypeScript function to fetch and retry APIs",
  },
  {
    title: "Draw a Cat with Hat",
    desc: "Image generation test",
    text: "Draw a cute cat wearing a top hat",
  },
  {
    title: "Philosophy Discussion",
    desc: "Deep intellectual analysis",
    text: "Evaluate: 'Nothing is true, everything is permitted'",
  },
];

export const ChatContent: React.FC<ChatContentProps> = ({
  isDark,
  messages,
  isGenerating,
  input,
  setInput,
  onSubmit,
  isPuterLoaded,
  testMode,
  selectedModelLabel,
  onSuggestionClick,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 pb-[220px]">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          {messages.length === 1 && messages[0].content.startsWith("Hello!") ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8">
              <div className="text-center space-y-2">
                <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent mb-2">
                  ✨
                </div>
                <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                  Welcome to Dialogue Studio
                </h1>
                <p className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Chat with AI models, get help with code, creative writing, and more.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {promptSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSuggestionClick(sug.text)}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] ${
                      isDark 
                        ? "border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5" 
                        : "border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50"
                    }`}
                  >
                    <span className={`block text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                      {sug.title}
                    </span>
                    <span className="block text-xs text-slate-400 mt-1">{sug.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === "user";
                return (
                  <div key={index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs sm:max-w-xl lg:max-w-2xl space-y-2 ${isUser ? "items-end" : "items-start"}`}>
                      {!isUser && (
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                          {selectedModelLabel}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm border transition-all ${
                          isUser
                            ? "bg-gradient-to-br from-violet-600 to-violet-700 border-violet-700/50 text-white rounded-br-none"
                            : (isDark ? "bg-white/10 border-white/10 text-slate-100 rounded-bl-none" : "bg-slate-100 border-slate-200 text-slate-900 rounded-bl-none")
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                        {msg.images && msg.images.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 gap-2 max-w-sm">
                            {msg.images.map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img.image_url.url}
                                alt="AI Generated Graphic"
                                className="rounded-xl max-w-full h-auto shadow-lg border border-white/10"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl rounded-bl-none px-4 py-3 text-sm flex items-center gap-1.5 shadow-sm border ${
                    isDark ? "bg-white/10 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}>
                    <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area (anchored inside this panel; no page scroll needed) */}
      <div
        className={`absolute left-0 right-0 bottom-0 z-10 border-t flex-shrink-0 w-full transition-colors ${
          isDark
            ? "border-white/5 bg-transparent"
            : "border-slate-200/10 bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-4xl p-3 sm:p-4">
          <div
            className={`rounded-2xl px-3 sm:px-4 py-3 ${
              isDark ? "bg-transparent border-transparent shadow-none" : "bg-transparent border-transparent shadow-none"
            }`}
          >
            <form onSubmit={onSubmit}>
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Chat with ${selectedModelLabel}...`}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all resize-none max-h-32 ${
                    isDark
                      ? "border-white/10 bg-transparent text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
                      : "border-slate-200/60 bg-transparent text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
                  }`}
                  disabled={!isPuterLoaded}
                />
                <button
                  type="submit"
                  disabled={isGenerating || !input.trim() || !isPuterLoaded}
                  className={`h-[48px] w-[48px] p-0 rounded-xl font-bold text-white transition-all flex-shrink-0 ${
                    isGenerating || !input.trim() || !isPuterLoaded
                      ? "bg-slate-600 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 active:scale-95 shadow-lg hover:shadow-violet-500/50"
                  }`}
                  aria-label="Send message"
                >
                  <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                {!isPuterLoaded && "Loading AI models..."}
                {isPuterLoaded && testMode && "Running in free mode"}
                {isPuterLoaded && !testMode && "Running with credits"}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
