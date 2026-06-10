import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useMemo, useRef } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatContent } from "@/components/ChatContent";

type ChatModel = {
  id: string;
  label: string;
  note: string;
  accent: string;
  api: "chat";
};

const chatModels: ChatModel[] = [
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    note: "Lightweight, high-speed, general purpose",
    accent: "#10b981",
    api: "chat",
  },
  {
    id: "gpt-4o",
    label: "GPT-4o",
    note: "Advanced reasoning and deep logical analysis",
    accent: "#3b82f6",
    api: "chat",
  },
  {
    id: "claude-3-5-sonnet",
    label: "Claude 3.5 Sonnet",
    note: "Highest quality writing, coding, and comprehension",
    accent: "#8b5cf6",
    api: "chat",
  },
  {
    id: "deepseek-chat",
    label: "DeepSeek Chat",
    note: "DeepSeek-V3 powerful cost-effective reasoning",
    accent: "#0ea5e9",
    api: "chat",
  },
  {
    id: "gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash Image",
    note: "Google's fast multimodal vision & image generation",
    accent: "#f59e0b",
    api: "chat",
  },
  {
    id: "qvq-max",
    label: "QVQ Max",
    note: "Alibaba's reasoning vision model",
    accent: "#ec4899",
    api: "chat",
  },
  {
    id: "llama-3.1-70b",
    label: "Llama 3.1 70B",
    note: "Robust meta-model open instructions",
    accent: "#a855f7",
    api: "chat",
  },
];

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  images?: {
    image_url: {
      url: string;
    };
  }[];
};

export default function TextStudioPage() {
  const [isDark, setIsDark] = useState(true);
  const [selectedModel, setSelectedModel] = useState(chatModels[0].id);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AI assistant. Select a model and start chatting. You can also upload images and generate visual content." },
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPuterLoaded, setIsPuterLoaded] = useState(false);
  const [puterModels, setPuterModels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [testMode, setTestMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const fetchPuterModels = async () => {
    try {
      const puter = (window as any).puter;
      if (puter) {
        const list = await puter.ai.listModels();
        if (Array.isArray(list)) {
          const filtered = list.filter(m => {
            const outputMods = m.modalities?.output || [];
            return outputMods.includes("text") || m.id.includes("gpt") || m.id.includes("claude") || m.id.includes("llama");
          });
          setPuterModels(filtered);
        }
      }
    } catch (err) {
      console.error("Failed to load Puter registry list:", err);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("mythflair.pollinations.theme");
      if (savedTheme === "light") {
        setIsDark(false);
      }

      const checkPuter = () => {
        const puter = (window as any).puter;
        if (puter) {
          setIsPuterLoaded(true);
          fetchPuterModels();
          return true;
        }
        return false;
      };

      if (!checkPuter()) {
        const interval = setInterval(() => {
          if (checkPuter()) clearInterval(interval);
        }, 500);
        return () => clearInterval(interval);
      }
    }
  }, []);

  const selectedModelMetadata = useMemo(() => {
    const featured = chatModels.find(m => m.id === selectedModel);
    if (featured) {
      const raw = puterModels.find(m => m.id === selectedModel || m.puterId === selectedModel);
      return {
        label: featured.label,
        provider: raw?.provider || (featured.id.includes("gpt") ? "openai" : featured.id.includes("claude") ? "anthropic" : featured.id.includes("gemini") ? "google" : "meta"),
        context: raw?.context || null,
        maxTokens: raw?.max_tokens || null,
        accent: featured.accent,
        note: featured.note,
      };
    }
    const raw = puterModels.find(m => m.id === selectedModel || m.puterId === selectedModel);
    if (raw) {
      return {
        label: raw.name || raw.id,
        provider: raw.provider || "Puter Custom",
        context: raw.context || null,
        maxTokens: raw.max_tokens || null,
        accent: "#a855f7",
        note: `Registry loaded model`,
      };
    }
    return {
      label: selectedModel,
      provider: "Puter Engine",
      context: null,
      maxTokens: null,
      accent: "#ec4899",
      note: "Universal workspace chat model",
    };
  }, [selectedModel, puterModels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const puter = (window as any).puter;
    if (!puter) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Puter SDK is not loaded yet. Please wait for active connection." }]);
      return;
    }

    const userMsg = input.trim();
    setInput("");
    const updatedHistory: Message[] = [...messages, { role: "user", content: userMsg }];
    setMessages(updatedHistory);
    setIsGenerating(true);

    try {
      const response = await puter.ai.chat(updatedHistory, testMode, {
        model: selectedModel,
      });

      if (response?.message) {
        const aiMsg: Message = {
          role: "assistant",
          content: response.message.content || "",
        };
        if (response.message.images && response.message.images.length > 0) {
          aiMsg.images = response.message.images;
        }
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Invalid output received from Puter API.");
      }
    } catch (err: any) {
      console.error("Chat generation failed:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err?.message || err || "Could not retrieve model output."}` }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  return (
    <>
      <Head>
        <title>Dialogue Studio - MythFlair AI</title>
      </Head>

      <Script
        src="https://js.puter.com/v2/"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Puter SDK loaded");
          setIsPuterLoaded(true);
          fetchPuterModels();
        }}
        onError={() => {
          console.error("Puter load failure");
        }}
      />

      <main className={`relative h-screen overflow-hidden transition-colors duration-300 font-sans flex flex-col ${
        isDark ? "bg-[#0a0e27] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}>
        {/* Header */}
        <header className={`border-b transition-all ${isDark ? "border-white/5 bg-[#0a0e27]/95 backdrop-blur-md" : "border-slate-200 bg-white/95 backdrop-blur-md"}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`lg:hidden p-2 rounded-lg border transition-all ${
                    isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link href="/puter-ai" className="flex items-center gap-2">
                  <img src="/mythflair-logo.png" alt="MythFlair" className="h-8 w-8 rounded-md object-cover" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold leading-none">Dialogue Studio</p>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                      AI Chat
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`hidden xs:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  isPuterLoaded 
                    ? (isDark ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700")
                    : (isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-400 animate-pulse" : "border-amber-200 bg-amber-50 text-amber-700 animate-pulse")
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isPuterLoaded ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="hidden sm:inline">{isPuterLoaded ? "Connected" : "Connecting"}</span>
                </div>

                <button
                  onClick={() => {
                    const newTheme = !isDark;
                    setIsDark(newTheme);
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem("mythflair.pollinations.theme", newTheme ? "dark" : "light");
                    }
                  }}
                  className={`p-2 rounded-lg border transition-all ${
                    isDark ? "border-white/10 hover:bg-white/5 text-yellow-400" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  {isDark ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                <Link
                  href="/puter-ai"
                  className={`p-2 rounded-lg border transition-all hidden sm:block ${
                    isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Exit"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <ChatSidebar
            isDark={isDark}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            testMode={testMode}
            setTestMode={setTestMode}
            chatModels={chatModels}
            puterModels={puterModels}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedModelMetadata={selectedModelMetadata}
          />

          <ChatContent
            isDark={isDark}
            messages={messages}
            isGenerating={isGenerating}
            input={input}
            setInput={setInput}
            onSubmit={handleSubmit}
            isPuterLoaded={isPuterLoaded}
            testMode={testMode}
            selectedModelLabel={selectedModelMetadata.label}
            onSuggestionClick={handleSuggestionClick}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </main>
    </>
  );
}
