// pages/admin/studio.tsx
import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient"; // adjust if needed
import type { User } from "@supabase/supabase-js";

// ---------- Icons ----------
interface IconProps {
  size?: number;
  className?: string;
}

const Download = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const ImageIcon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const Wand2 = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
    <path d="m14 7 3 3" />
    <path d="M5 6v4" />
    <path d="M19 14v4" />
    <path d="M10 2v2" />
    <path d="M7 8H3" />
    <path d="M21 16h-4" />
    <path d="M11 3H9" />
  </svg>
);

const AlertCircle = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </svg>
);

const UploadCloud = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);

const Trash2 = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const Sun = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
);

const Moon = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Info = ({ size = 24, className = "" }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// ---------- Configs (easy to extend) ----------

const ASPECT_RATIOS = [
  { label: "1:1", width: 1024, height: 1024 },
  { label: "16:9", width: 1280, height: 720 },
  { label: "9:16", width: 720, height: 1280 },
  { label: "4:3", width: 1024, height: 768 },
];

type ModelConfig = {
  id: string;
  name: string;
  description: string;
  bytezModelId: string;
};

const MODELS: ModelConfig[] = [

  {
    id: "imagen-standard",
    name: "Imagen 4",
    description: "Balanced quality and speed",
    bytezModelId: "google/imagen-4.0-generate-001",
  },
  {
    id: "imagen-fast",
    name: "Imagen 4 Fast",
    description: "Fast, high quality text-to-image",
    bytezModelId: "google/imagen-4.0-fast-generate-001",
  },
  {
    id: "imagen-ultra",
    name: "Imagen 4 Ultra",
    description: "Highest quality, slower, more detailed",
    bytezModelId: "google/imagen-4.0-ultra-generate-001",
  },
  {
    id: "nsfw1",
    name: "NSFW-gen-v2.1",
    description: "Balanced quality and speed",
    bytezModelId: "UnfilteredAI/NSFW-gen-v2.1",
  },
  {
    id: "nsfw2",
    name: "NSFW-GEN-ANIME",
    description: "Balanced quality and speed",
    bytezModelId: "UnfilteredAI/NSFW-GEN-ANIME",
  },
  // 👇 You can add more Bytez models here, for example:
  // {
  //   id: "my-custom-model",
  //   name: "My Custom Model",
  //   description: "Whatever you want",
  //   bytezModelId: "YourVendor/YourModelName",
  // },
];

type StyleConfig = {
  id: string;
  name: string;
  promptAdd: string;
};

const STYLES: StyleConfig[] = [
  { id: "none", name: "No Style", promptAdd: "" },
  {
    id: "cinematic",
    name: "Cinematic",
    promptAdd: "cinematic lighting, 8k movie still, highly detailed, volumetric light",
  },
  {
    id: "fantasy",
    name: "Fantasy Art",
    promptAdd:
      "high fantasy illustration, epic composition, magical atmosphere, detailed armor, dragons, castles, ethereal lighting, painterly",
  },
  {
    id: "photoreal",
    name: "Photorealistic",
    promptAdd:
      "photorealistic, ultra-detailed, dslr, 50mm lens, global illumination, natural skin tones",
  },
  {
    id: "anime",
    name: "Anime",
    promptAdd: "anime style, sharp lineart, cel-shaded, vibrant colors",
  },
  {
    id: "digital-art",
    name: "Digital Art",
    promptAdd:
      "digital illustration, concept art, smooth brush strokes, high contrast, artstation trending",
  },
  {
    id: "isometric",
    name: "Isometric",
    promptAdd:
      "isometric view, clean lines, soft shading, game asset, detailed environment",
  },
  {
    id: "lowpoly",
    name: "Low Poly",
    promptAdd:
      "low poly 3d, flat shading, simple geometry, stylized, minimalism",
  },
  {
    id: "lineart",
    name: "Line Art",
    promptAdd:
      "clean black and white line art, inking, no shading, detailed outlines",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    promptAdd:
      "soft watercolor painting, pastel colors, flowing paint, paper texture",
  },
  {
    id: "neon",
    name: "Neon / Cyber",
    promptAdd:
      "neon lights, cyberpunk, glowing edges, futuristic city, rain, reflections",
  },
];

// public for optional client redirect UX
const NEXT_PUBLIC_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export default function AdminStudio() {
  // --- Core state ---
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"txt2img" | "img2img">("txt2img");
  const [refImageUrl, setRefImageUrl] = useState("");
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedModelId, setSelectedModelId] = useState(MODELS[0].id);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [seed, setSeed] = useState(0);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const router = useRouter();

  // --- Theme handling ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldUseDark = stored ? stored === "dark" : prefersDark;
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // --- Admin check (client-side guard) ---
  useEffect(() => {
    let cancelled = false;

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      if (
        NEXT_PUBLIC_ADMIN_EMAIL &&
        user.email?.toLowerCase() !== NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase()
      ) {
        router.replace("/");
        return;
      }

      setUser(user);
      setCheckingUser(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (!session?.user) router.replace("/admin/login");
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  // --- File upload (for img2img UI; Bytez call is still txt2img) ---
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setRefImageUrl(localUrl);

    setIsUploading(true);
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(",")[1];
        if (!base64data) throw new Error("Failed to encode image");

        const response = await fetch("/api/imgbb-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64data }),
        });

        const data = await response.json();

        if (data.success) {
          setRefImageUrl(data.url);
        } else {
          throw new Error(data.error || "Upload failed");
        }
        setIsUploading(false);
      };

      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
    } catch (err) {
      console.error("Secure upload error:", err);
      setError("Failed to upload image. Ensure your local server is running.");
      setIsUploading(false);
    }
  };

  // --- Generate with Bytez via our API ---
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setGeneratedImage("");

    const newSeed = Math.floor(Math.random() * 1_000_000);
    setSeed(newSeed);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw new Error(sessionError.message);
      if (!session || !session.access_token) {
        throw new Error("No active session. Please log in again.");
      }

      const accessToken = session.access_token;
      const modelConfig = MODELS.find((m) => m.id === selectedModelId);
      if (!modelConfig) throw new Error("Invalid model selection");

      const res = await fetch("/api/admin/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          prompt,
          stylePromptAdd: selectedStyle.promptAdd,
          modelId: modelConfig.bytezModelId,
          // You could also send width/height here if Bytez supports it
          // width: selectedRatio.width,
          // height: selectedRatio.height,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedImage(data.imageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to generate image");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mythflair-${seed}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed", err);
      alert("Could not download image directly. You can right-click and Save As.");
    }
  };

  if (checkingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Checking admin access…</p>
        </div>
      </div>
    );
  }

  // ---------- Layout (similar to your original) ----------
  return (
    <div className="min-h-screen transition-colors duration-300 bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                <Wand2 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                  MythFlair Studio (Admin)
                </h1>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium tracking-wide uppercase">
                  High Quality • Fast • Admin Only
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-medium max-w-[180px] truncate">
                  {user.email}
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-300">
                  Admin
                </span>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Sign out
            </button>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Right: Preview */}
          <div className="lg:col-span-8 lg:order-last flex flex-col">
            <div className="flex-1 bg-neutral-200/50 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 lg:p-8 flex items-center justify-center min-h-[320px] lg:min-h-[520px] relative overflow-hidden group">
              <div
                className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(currentColor 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-600 dark:text-red-200 p-4 rounded-xl text-sm flex items-start gap-2 z-20">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {generatedImage ? (
                <div className="relative w-full flex flex-col items-center justify-center">
                  <div className="relative bg-white dark:bg-neutral-950 p-2 sm:p-4 rounded shadow-2xl shadow-neutral-400/20 dark:shadow-black ring-1 ring-neutral-200 dark:ring-neutral-800 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedImage}
                      alt="Generated Artwork"
                      className="max-w-full max-h-[60vh] lg:max-h-[70vh] rounded-sm object-contain"
                    />
                    <div className="absolute inset-0 ring-1 ring-black/5 dark:ring-white/10 rounded pointer-events-none" />
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={downloadImage}
                      className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold shadow-xl hover:bg-neutral-700 dark:hover:bg-neutral-200 transition"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center max-w-md mx-auto opacity-60">
                  <div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon size={48} className="text-neutral-500 dark:text-neutral-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Ready to Create
                  </h3>
                  <p className="text-neutral-500 dark:text-neutral-500 text-sm">
                    Describe your idea, pick a style and model will turn it
                    into pixels.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-purple-600 dark:text-purple-300 font-medium animate-pulse">
                    Synthesizing pixels...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-600">
              AI  Powered • Models: Create Image Fast / Ultra (configurable)
            </div>
          </div>

          {/* Left: Controls */}
          <div className="lg:col-span-4 lg:order-first space-y-8">
            {/* Mode toggle */}
            <div className="bg-neutral-200/50 dark:bg-neutral-900/50 p-1 rounded-xl flex border border-neutral-300 dark:border-neutral-800">
              <button
                onClick={() => setMode("txt2img")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "txt2img"
                    ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                Text to Image
              </button>
              <button
                onClick={() => setMode("img2img")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "img2img"
                    ? "bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
              >
                Image to Image
              </button>
            </div>

            {/* Prompt + ref image */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Creative Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your imagination... (e.g., A futuristic cyberpunk city in neon rain)"
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 h-32 resize-none"
                />
              </div>

              {mode === "img2img" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Reference Image (UI only)
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full py-3 border border-dashed border-neutral-400 dark:border-neutral-700 rounded-xl flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-white hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-neutral-500 border-t-purple-500 rounded-full animate-spin" />
                    ) : (
                      <UploadCloud
                        size={16}
                        className="group-hover:scale-110 transition-transform"
                      />
                    )}
                    <span>{isUploading ? "Uploading..." : "Upload Local Image"}</span>
                  </button>

                  {refImageUrl && (
                    <div className="relative w-full h-24 bg-neutral-200 dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-800 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={refImageUrl}
                        alt="Reference Preview"
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                      <button
                        onClick={() => setRefImageUrl("")}
                        className="absolute top-2 right-2 bg-white/60 dark:bg-black/60 hover:bg-red-500 dark:hover:bg-red-500 p-1.5 rounded-lg text-neutral-800 dark:text-white hover:text-white transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/70 dark:border-amber-700/60 rounded px-2 py-1">
                    Note: this UI is for your workflow only. Current Bytez call is
                    text-to-image; you can extend the API later to support img2img.
                  </p>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading || isUploading || !prompt.trim()}
                className="w-full py-4 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dreaming...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    <span>Generate Masterpiece</span>
                  </>
                )}
              </button>
            </div>

            {/* Aspect ratio + model + styles */}
            <div className="space-y-6">
              {/* Aspect ratio */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                  Aspect Ratio (UI)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.label}
                      onClick={() => setSelectedRatio(ratio)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs transition-all ${
                        selectedRatio.label === ratio.label
                          ? "bg-purple-100 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300"
                          : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <div
                        className={`border-2 border-current rounded-sm mb-1 ${
                          ratio.label === "1:1"
                            ? "w-4 h-4"
                            : ratio.label === "16:9"
                            ? "w-6 h-3.5"
                            : ratio.label === "9:16"
                            ? "w-3.5 h-6"
                            : "w-5 h-4"
                        }`}
                      />
                      <span>{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model & styles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    Model
                  </label>
                  <div className="space-y-2">
                    {MODELS.map((m) => {
                      const selected = selectedModelId === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedModelId(m.id)}
                          className={`w-full text-left p-2 rounded-lg border text-xs transition-all ${
                            selected
                              ? "bg-purple-100 dark:bg-purple-900/20 border-purple-500"
                              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <div className="font-semibold truncate">
                            {m.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate">
                            {m.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Style selection */}
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    Style
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                    {STYLES.map((s) => {
                      const selected = selectedStyle.id === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStyle(s)}
                          className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left truncate ${
                            selected
                              ? "bg-purple-100 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300"
                              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About section */}
        <section className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <Info size={20} />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                About MythFlair Admin Studio
              </h2>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              This admin-only studio runs only for admin for developing and Reasearch with G 4 series. All
              generation calls are authenticated through Supabase and locked to
              admin account, so only Admin can use private models.
              
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-500">
              <span className="bg-neutral-200 dark:bg-neutral-900 px-3 py-1 rounded-full">
                Admin-only Access
              </span>
              <span className="bg-neutral-200 dark:bg-neutral-900 px-3 py-1 rounded-full">
                Configurable Models
              </span>
              <span className="bg-neutral-200 dark:bg-neutral-900 px-3 py-1 rounded-full">
                Prompt Style Presets
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
