"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// --- Icons (Inline SVGs) ---
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

const Sparkles = ({ size = 24, className = "" }: IconProps) => (
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
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 21l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M9 3v4" />
    <path d="M3 9h4" />
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

const Layers = ({ size = 24, className = "" }: IconProps) => (
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
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </svg>
);

const Zap = ({ size = 24, className = "" }: IconProps) => (
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
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const Share2 = ({ size = 24, className = "" }: IconProps) => (
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
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
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

// --- Constants & Configuration ---
const ASPECT_RATIOS = [
  { label: "1:1", width: 1024, height: 1024, icon: "Square" },
  { label: "16:9", width: 1280, height: 720, icon: "Landscape" },
  { label: "9:16", width: 720, height: 1280, icon: "Portrait" },
  { label: "4:3", width: 1024, height: 768, icon: "Standard" },
];

const MODELS = [
  { id: "flux", name: "Flux.1", description: "Realism", Icon: Sparkles },
  { id: "turbo", name: "Turbo", description: "Fast", Icon: Zap },
  {
    id: "stable-diffusion",
    name: "Stable",
    description: "Creative",
    Icon: Layers,
  },
];

const STYLES = [
  {
    id: "cinematic",
    name: "Cinematic",
    promptAdd: "cinematic lighting, movie scene, 8k, highly detailed",
  },
  {
    id: "photorealistic",
    name: "Photorealistic",
    promptAdd: "photorealistic, raw photo, 8k, ultra-detailed, dslr",
  },
  {
    id: "anime",
    name: "Anime",
    promptAdd: "anime style, studio ghibli, vibrantly colored, manga",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    promptAdd: "neon lights, cyberpunk city, futuristic, high tech, sci-fi",
  },
  {
    id: "fantasy",
    name: "Fantasy Art",
    promptAdd: "fantasy art, digital painting, magic, ethereal, intricate",
  },
  {
    id: "painting",
    name: "Oil Painting",
    promptAdd: "oil painting style, textured brushstrokes, van gogh style, artistic",
  },
  {
    id: "pixel",
    name: "Pixel Art",
    promptAdd: "pixel art, 16-bit, retro game, low res, sprite",
  },
  {
    id: "3d",
    name: "3D Render",
    promptAdd: "3d render, unreal engine 5, octane render, isometric",
  },
  {
    id: "comic",
    name: "Comic Book",
    promptAdd: "comic book style, graphic novel, bold lines, cel shaded",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    promptAdd: "watercolor painting, soft blend, artistic, pastel colors",
  },
  {
    id: "sketch",
    name: "Pencil Sketch",
    promptAdd: "pencil sketch, graphite, charcoal, black and white, rough",
  },
  { id: "none", name: "No Style", promptAdd: "" },
];

export default function App() {
  // --- State ---
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"txt2img" | "img2img">("txt2img");
  const [refImageUrl, setRefImageUrl] = useState("");
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [generatedImage, setGeneratedImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [seed, setSeed] = useState(0);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔒 Auth state
  const [user, setUser] = useState<User | null>(null);

  // Initialize theme from localStorage / system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const shouldUseDark = stored ? stored === "dark" : prefersDark;
    setIsDarkMode(shouldUseDark);
  }, []);

  // Apply theme to <html> element + persist
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

  // Load Supabase user + listen to auth changes
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!error) {
          setUser(data?.user ?? null);
        } else {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // --- Handlers ---
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (!user) {
      setError("Please sign in to generate images.");
      return;
    }

    if (mode === "img2img") {
      if (!refImageUrl) {
        setError("Please upload a reference image.");
        return;
      }
      if (refImageUrl.startsWith("blob:") && !isUploading) {
        setError("Image upload required. Please check your API key configuration.");
        return;
      }
    }

    setIsLoading(true);
    setError("");
    setGeneratedImage("");

    const newSeed = Math.floor(Math.random() * 1000000);
    setSeed(newSeed);

    try {
      const baseUrl = `https://image.pollinations.ai/prompt/`;
      const fullPrompt =
        selectedStyle.id !== "none"
          ? `${prompt}, ${selectedStyle.promptAdd}`
          : prompt;

      const encodedPrompt = encodeURIComponent(fullPrompt);

      let url = `${baseUrl}${encodedPrompt}?width=${selectedRatio.width}&height=${selectedRatio.height}&model=${selectedModel}&seed=${newSeed}&nologo=true`;

      if (mode === "img2img" && refImageUrl.trim()) {
        if (refImageUrl.startsWith("http")) {
          url += `&image=${encodeURIComponent(refImageUrl)}&strength=0.7`;
        }
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to generate image.");

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setGeneratedImage(objectUrl);
    } catch (err) {
      console.error(err);
      setError(
        "Generation failed. Please check your connection or try a different prompt."
      );
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

  // --- Render ---
  return (
    <div className="min-h-screen transition-colors duration-300 bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20">
                <Wand2 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
                  MythFlair
                </h1>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium tracking-wide uppercase">
                  AI Creative Studio
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-medium max-w-[160px] truncate">
                    {user.email ||
                      (user.user_metadata as any)?.full_name ||
                      "Signed in"}
                  </span>
                  <Link
                    href="/profile"
                    className="text-[11px] text-purple-600 dark:text-purple-300 hover:underline"
                  >
                    Profile
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Link
                  href="/signin"
                  className="px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white/70 dark:bg-neutral-900/70 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 rounded-full bg-purple-600 text-white text-xs sm:text-sm font-medium hover:bg-purple-500 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* RIGHT: Preview */}
          <div className="lg:col-span-8 lg:order-last flex flex-col">
            <div className="flex-1 bg-neutral-200/50 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 lg:p-8 flex items-center justify-center min-h-[300px] lg:min-h-[500px] relative overflow-hidden group transition-colors">
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
                <div className="relative animate-in zoom-in-95 duration-500 w-full flex flex-col items-center justify-center">
                  <div className="relative bg-white dark:bg-neutral-950 p-2 sm:p-4 rounded shadow-2xl shadow-neutral-400/20 dark:shadow-black ring-1 ring-neutral-200 dark:ring-neutral-800 inline-block transition-colors">
                    <img
                      src={generatedImage}
                      alt="Generated Artwork"
                      className="max-w-full max-h-[60vh] lg:max-h-[70vh] rounded-sm object-contain"
                      key={generatedImage}
                    />
                    <div className="absolute inset-0 ring-1 ring-black/5 dark:ring-white/10 rounded pointer-events-none" />
                  </div>

                  <div
                    className="
                      mt-4 relative opacity-100 z-10
                      lg:absolute lg:mt-0 lg:bottom-6 lg:left-0 lg:right-0 
                      lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:bottom-6 
                      flex justify-center transition-all duration-300
                    "
                  >
                    <button
                      onClick={downloadImage}
                      className="flex items-center gap-2 bg-neutral-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold shadow-xl hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
                    >
                      <Download size={18} />
                      Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center max-w-md mx-auto opacity-50">
                  <div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                    <ImageIcon
                      size={48}
                      className="text-neutral-500 dark:text-neutral-600"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                    Ready to Create
                  </h3>
                  <p className="text-neutral-500">
                    Enter a prompt and select your style. The AI will weave your words into a
                    visual reality.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="absolute inset-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center transition-colors">
                  <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <p className="text-purple-600 dark:text-purple-300 font-medium animate-pulse">
                    Synthesizing Pixels...
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-600">
              Powered by AI • Generated content is public domain
            </div>
          </div>

          {/* LEFT: Controls */}
          <div className="lg:col-span-4 lg:order-first space-y-8">
            <div className="bg-neutral-200/50 dark:bg-neutral-900/50 p-1 rounded-xl flex border border-neutral-300 dark:border-neutral-800 transition-colors">
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

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  Creative Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your imagination... (e.g., A futuristic cyberpunk city in neon rain)"
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none h-32"
                />
              </div>

              {mode === "img2img" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">
                    Reference Image
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
                    className="w-full py-3 border border-dashed border-neutral-400 dark:border-neutral-700 rounded-xl flex items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-white hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all text-sm group disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="relative w-full h-24 bg-neutral-200 dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-800 group animate-in fade-in zoom-in-95">
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
                      {refImageUrl.startsWith("blob:") && !isUploading && (
                        <div className="absolute bottom-0 left-0 right-0 bg-amber-500/90 text-black text-[10px] font-bold p-1 text-center backdrop-blur-md">
                          Upload Pending / Incomplete
                        </div>
                      )}
                    </div>
                  )}

                  {refImageUrl && refImageUrl.startsWith("blob:") && !isUploading && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-500 flex items-start gap-1 mt-1 bg-amber-100 dark:bg-amber-500/10 p-2 rounded">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      Please wait for upload to complete or check your API key.
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading || isUploading || !prompt.trim()}
                className="w-full py-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
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

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.label}
                      onClick={() => setSelectedRatio(ratio)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
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
                      <span className="text-[10px] font-medium">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    Model
                  </label>
                  <div className="space-y-2">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        className={`w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-2 rounded-xl border text-left transition-all ${
                          selectedModel === m.id
                            ? "bg-purple-100 dark:bg-purple-900/20 border-purple-500"
                            : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg shrink-0 ${
                            selectedModel === m.id
                              ? "bg-purple-600 text-white"
                              : "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          <m.Icon size={14} />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-semibold truncate ${
                              selectedModel === m.id
                                ? "text-purple-900 dark:text-white"
                                : "text-neutral-700 dark:text-neutral-300"
                            }`}
                          >
                            {m.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 truncate hidden xl:block">
                            {m.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">
                    Style
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {STYLES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStyle(s)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all text-left truncate ${
                          selectedStyle.id === s.id
                            ? "bg-purple-100 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300"
                            : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center lg:text-left transition-colors">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <Info size={20} />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                About MythFlair
              </h2>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              MythFlair is a cutting-edge AI creative studio powered by open-source models
              like Flux.1 and Stable Diffusion. Designed for speed and simplicity, it allows
              creators to visualize concepts instantly without complex setups. Whether you are
              sketching a cyberpunk city or rendering a cinematic portrait, MythFlair bridges
              the gap between imagination and pixel-perfect reality.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-500 justify-center lg:justify-start">
              <span className="bg-neutral-200 dark:bg-neutral-900 px-3 py-1 rounded-full">
                Fast Generation
              </span>
              <span className="bg-neutral-200 dark:bg-neutral-900 px-3 py-1 rounded-full">
                Secure Uploads
              </span>
              <span className="bg-neutral-200 dark:bg-neutral-900 px-3 py-1 rounded-full">
                No Registration Required
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}