"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const SUPER_MODEL_ID = "onnx-community/Supertonic-TTS-ONNX";

type VoiceId = "F1" | "F2" | "M2" | "M1";

type SupertonicVoice = {
  id: VoiceId;
  label: string;
  description: string;
  url: string;
};

const SUPER_TONIC_VOICES: SupertonicVoice[] = [
  {
    id: "F1",
    label: "F1 – Neutral Female",
    description: "Warm, general-purpose narration voice.",
    url: "https://huggingface.co/onnx-community/Supertonic-TTS-ONNX/resolve/main/voices/F1.bin",
  },
  {
    id: "F2",
    label: "F2 – Bright Female",
    description: "Slightly brighter, good for announcements.",
    url: "https://huggingface.co/onnx-community/Supertonic-TTS-ONNX/resolve/main/voices/F2.bin",
  },
  {
    id: "M1",
    label: "M1 – Neutral Male",
    description: "Balanced male voice, great for audiobooks.",
    url: "https://huggingface.co/onnx-community/Supertonic-TTS-ONNX/resolve/main/voices/M1.bin",
  },
  {
    id: "M2",
    label: "M2 – Deep Male",
    description: "Slightly deeper, radio-style delivery.",
    url: "https://huggingface.co/onnx-community/Supertonic-TTS-ONNX/resolve/main/voices/M2.bin",
  },
];

type Engine = "model" | "google";

type StatusKind = "idle" | "loading" | "ready" | "generating" | "error" | "info";

type StatusState = {
  kind: StatusKind;
  message: string;
};

function float32ToWavBlob(audio: Float32Array, sampleRate = 24000): Blob {
  const maxSample = 32767;
  const int16Data = new Int16Array(audio.length);
  for (let i = 0; i < audio.length; i++) {
    const sample = Math.max(-1, Math.min(1, audio[i]));
    int16Data[i] = sample * maxSample;
  }

  const buffer = new ArrayBuffer(44 + int16Data.length * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF header
  writeString(0, "RIFF");
  view.setUint32(4, 36 + int16Data.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, int16Data.length * 2, true);

  for (let i = 0; i < int16Data.length; i++) {
    view.setInt16(44 + i * 2, int16Data[i], true);
  }

  return new Blob([buffer], { type: "audio/wav" });
}

// 🔹 Split arbitrary long text into many small chunks
function splitTextIntoChunks(text: string, maxChars = 400): string[] {
  // Split by sentence boundaries first
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const candidate = (current ? current + " " : "") + sentence;

    if (candidate.length > maxChars) {
      if (current) {
        chunks.push(current.trim());
      }

      // If one sentence is still too big, hard-split it
      if (sentence.length > maxChars) {
        for (let i = 0; i < sentence.length; i += maxChars) {
          chunks.push(sentence.slice(i, i + maxChars));
        }
        current = "";
      } else {
        current = sentence;
      }
    } else {
      current = candidate;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

export default function FreeTTSPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accent, setAccent] = useState<"blue" | "pink">("blue");
  const [engine, setEngine] = useState<Engine>("google");
  const [text, setText] = useState(
    "Welcome to Free TTS by MultiFlair. Type your text here and listen with Google TTS or the high quality model."
  );
  const [charCount, setCharCount] = useState(text.length);

  const [selectedModelVoice, setSelectedModelVoice] = useState<VoiceId>("F1");

  const [googleVoices, setGoogleVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedGoogleVoiceName, setSelectedGoogleVoiceName] =
    useState<string>("");

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [webgpuAvailable, setWebgpuAvailable] = useState(false);

  const [status, setStatus] = useState<StatusState>({
    kind: "idle",
    message: "",
  });

  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // 🔹 progress state for the long generation
  const [generationProgress, setGenerationProgress] = useState<number | null>(
    null
  );

  const ttsRef = useRef<any | null>(null);

  // Theme from OS
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // WebGPU check
  useEffect(() => {
    if (typeof navigator !== "undefined" && "gpu" in navigator) {
      setWebgpuAvailable(true);
    }
  }, []);

  // Load model
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        setModelStatus("loading");
        setStatus({
          kind: "loading",
          message: "Loading…",
        });

        const { pipeline } = await import("@huggingface/transformers");

        const options: any = {};
        if (webgpuAvailable) {
          options.device = "webgpu";
        }

        const tts = await pipeline("text-to-speech", SUPER_MODEL_ID, options);
        if (cancelled) return;

        ttsRef.current = tts;
        setModelStatus("ready");
        setStatus({
          kind: "ready",
          message: "Ready. You can generate speech now.",
        });
      } catch (err: any) {
        console.error(err);
        if (!cancelled) {
          setModelStatus("error");
          setStatus({
            kind: "error",
            message: "Model failed to load. You can still use Google TTS.",
          });
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, [webgpuAvailable]);

  // Load Google TTS voices
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.speechSynthesis === "undefined"
    ) {
      return;
    }

    const synth = window.speechSynthesis;

    const updateVoices = () => {
      const voices = synth.getVoices();
      setGoogleVoices(voices);
      if (!selectedGoogleVoiceName && voices.length > 0) {
        setSelectedGoogleVoiceName(voices[0].name);
      }
    };

    updateVoices();
    synth.onvoiceschanged = updateVoices;

    return () => {
      synth.onvoiceschanged = null;
    };
  }, [selectedGoogleVoiceName]);

  // Cleanup audio URL
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // 🔹 CHUNKED, NON-STREAMING MODEL GENERATION
  async function handleGenerateModel() {
    const clean = text.trim();
    if (!clean) {
      setStatus({ kind: "error", message: "Please enter some text first." });
      return;
    }
    if (modelStatus !== "ready" || !ttsRef.current) {
      setStatus({
        kind: "error",
        message: "Model is not ready yet. Please wait a moment.",
      });
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      setStatus({
        kind: "generating",
        message: "Generating speech with the model…",
      });

      const tts = ttsRef.current;
      const voice = SUPER_TONIC_VOICES.find(
        (v) => v.id === selectedModelVoice
      );
      if (!voice) {
        setStatus({
          kind: "error",
          message: "Unknown voice selected.",
        });
        setGenerationProgress(null);
        return;
      }

      // break the full text into manageable chunks,
      // but process ALL of them (no artificial total limit)
      const chunks = splitTextIntoChunks(clean, 400); // adjust 400 if your machine can handle more
      const audioSegments: Float32Array[] = [];
      let sampleRate = 24000;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        const output = await tts(chunk, {
          speaker_embeddings: voice.url,
          num_inference_steps: 5,
          speed: 1.05,
        });

        const raw = output as any;
        const audioArray: Float32Array = raw.audio;
        const sr: number = raw.sampling_rate ?? 24000;
        sampleRate = sr;

        audioSegments.push(audioArray);

        const percent = Math.round(((i + 1) / chunks.length) * 100);
        setGenerationProgress(percent);
      }

      // glue all chunk audios into one long Float32Array
      const totalLength = audioSegments.reduce(
        (acc, arr) => acc + arr.length,
        0
      );
      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const segment of audioSegments) {
        merged.set(segment, offset);
        offset += segment.length;
      }

      // single big WAV for the whole text
      const blob = float32ToWavBlob(merged, sampleRate);
      const url = URL.createObjectURL(blob);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);

      setStatus({
        kind: "ready",
        message: "Audio ready. You can play or download it.",
      });
    } catch (err: any) {
      console.error(err);
      setStatus({
        kind: "error",
        message: err?.message || "Error while generating speech.",
      });
    } finally {
      setIsGenerating(false);
      // keep bar at 100% after success; if you want it to disappear, uncomment:
      // setGenerationProgress(null);
    }
  }

  function handleGenerateGoogle() {
    if (
      typeof window === "undefined" ||
      typeof window.speechSynthesis === "undefined"
    ) {
      setStatus({
        kind: "error",
        message: "Google TTS is not available in this browser.",
      });
      return;
    }

    const clean = text.trim();
    if (!clean) {
      setStatus({ kind: "error", message: "Please enter some text first." });
      return;
    }

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(clean);

    const voice = googleVoices.find((v) => v.name === selectedGoogleVoiceName);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setStatus({
        kind: "generating",
        message: "Speaking with Google TTS…",
      });
    };
    utterance.onend = () => {
      setStatus({
        kind: "ready",
        message: "Google TTS finished speaking.",
      });
    };
    utterance.onerror = (e) => {
      console.error(e);
      setStatus({
        kind: "error",
        message: "Error while speaking with Google TTS.",
      });
    };

    synth.cancel();
    synth.speak(utterance);
  }

  // Stop button for Google TTS
  function handleStopGoogle() {
    if (
      typeof window !== "undefined" &&
      typeof window.speechSynthesis !== "undefined"
    ) {
      window.speechSynthesis.cancel();
      setStatus({
        kind: "info",
        message: "Stopped Google TTS.",
      });
    }
  }

  function handleGenerate() {
    if (engine === "model") {
      handleGenerateModel();
    } else {
      handleGenerateGoogle();
    }
  }

  const statusColor =
    status.kind === "error"
      ? "var(--color-error)"
      : status.kind === "loading" || status.kind === "generating"
      ? "var(--color-warn)"
      : status.kind === "ready"
      ? "var(--color-success)"
      : status.kind === "info"
      ? "var(--color-info)"
      : "var(--color-muted)";

  const appClass = `app ${theme} ${accent}`;
  const showModelButton = modelStatus === "ready";

  return (
    <div className={appClass}>
      <div className="page">
        {/* Top header bar */}
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <span className="brand-logo">🔊</span>
              <span className="brand-text">
                <span className="brand-title">Free TTS</span>
                <span className="brand-subtitle">by MultiFlair</span>
              </span>
            </div>

            <div className="topbar-right">
              <Link href="/" className="back-link">
                Home
              </Link>

              {/* Accent color toggle */}
              <div className="color-toggle">
                <button
                  type="button"
                  className={`color-swatch blue ${
                    accent === "blue" ? "active" : ""
                  }`}
                  onClick={() => setAccent("blue")}
                  title="Blue accent"
                />
                <button
                  type="button"
                  className={`color-swatch pink ${
                    accent === "pink" ? "active" : ""
                  }`}
                  onClick={() => setAccent("pink")}
                  title="Pink accent"
                />
              </div>

              <button
                className="theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "☀ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
        </header>

        <main className="layout">
          <section className="main-column">
            {/* HERO */}
            <div className="hero glass-card">
              <h1>Free text-to-speech for your browser</h1>
              <p>
                Turn any text into natural-sounding speech directly on your
                device. Switch between{" "}
                <strong>Google TTS (system voices)</strong> and a{" "}
                <strong>local, high quality model</strong> without installing
                extra software.
              </p>

              <div className="hero-highlights">
                <div className="hero-pill">✨ No sign-up required</div>
                <div className="hero-pill">🔐 Runs in your browser</div>
                <div className="hero-pill">💾 Downloadable WAV from model</div>
              </div>

              <div className="engine-toggle">
                <button
                  className={`engine-btn ${
                    engine === "google" ? "active" : ""
                  }`}
                  onClick={() => setEngine("google")}
                >
                  Google TTS
                  <span className="engine-caption">Best for phones</span>
                </button>
                {showModelButton && (
                  <button
                    className={`engine-btn ${
                      engine === "model" ? "active" : ""
                    }`}
                    onClick={() => setEngine("model")}
                  >
                    High quality model
                    <span className="engine-caption">Best for desktop</span>
                  </button>
                )}
              </div>

              <p className="engine-hint">
                📱 On smartphones,{" "}
                <strong>the high quality model does not work</strong>. Please
                use <strong>Google TTS</strong> instead for a smooth
                experience.
              </p>
            </div>

            {/* MAIN CARD */}
            <div className="card glass-card">
              <label className="label-row">
                <span>Text to synthesize</span>
                <span className="char-count">{charCount} characters</span>
              </label>

              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                rows={10}
                className="textarea"
                placeholder="Type or paste text here and use the buttons below to listen."
              />

              <div className="controls-row">
                <button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating || (engine === "model" && modelStatus !== "ready")
                  }
                  className={`primary-btn ${
                    isGenerating ||
                    (engine === "model" && modelStatus !== "ready")
                      ? "disabled"
                      : ""
                  }`}
                >
                  {engine === "model" ? (
                    modelStatus === "loading" ? (
                      "Loading model…"
                    ) : modelStatus === "error" ? (
                      "Model unavailable"
                    ) : isGenerating ? (
                      "Generating…"
                    ) : (
                      "Generate with model"
                    )
                  ) : isGenerating ? (
                    "Speaking…"
                  ) : (
                    "Speak with Google TTS"
                  )}
                </button>

                {audioUrl && engine === "model" && (
                  <>
                    <button
                      className="secondary-btn"
                      onClick={() => {
                        const audio = document.getElementById(
                          "model-audio"
                        ) as HTMLAudioElement | null;
                        audio?.play();
                      }}
                    >
                      ▶ Play
                    </button>
                    <a
                      href={audioUrl}
                      download="tts-output.wav"
                      className="secondary-btn"
                    >
                      ⬇ Download WAV
                    </a>
                  </>
                )}

                {engine === "google" && (
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={handleStopGoogle}
                  >
                    ⏹ Stop
                  </button>
                )}
              </div>

              {/* 🔹 Progress bar for model generation */}
              {generationProgress !== null && engine === "model" && (
                <div className="progress-wrapper">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  <div className="progress-label">
                    {generationProgress}%
                  </div>
                </div>
              )}

              {engine === "google" && (
                <p className="small-note">
                  Google TTS in the browser uses built-in system voices. It
                  plays audio directly but does not provide downloadable audio
                  files. Download is only available for the local model.
                </p>
              )}

              {status.message && (
                <div className="status" style={{ color: statusColor }}>
                  {status.message}
                </div>
              )}
            </div>

            {audioUrl && engine === "model" && (
              <div className="audio-wrapper">
                <audio
                  id="model-audio"
                  controls
                  src={audioUrl}
                  className="audio"
                />
              </div>
            )}

            {/* AD / EXTRA SPACE */}
            <div className="ad-space glass-soft">
              <div className="ad-placeholder">
                <span className="ad-label">Optional space</span>
                <p>
                  Place your banner, helpful links, or a small product
                  promotion here. This block keeps the page visually balanced on
                  longer screens.
                </p>
              </div>
            </div>

            {/* EXTRA CONTENT – make page longer */}
            <div className="card glass-card info-card">
              <h2>About this site</h2>
              <p className="info-text">
                The <strong>high quality voice (beta testing)</strong> is
                powered by a local neural text-to-speech model loaded in your
                browser. It uses the{" "}
                <code>onnx-community/Supertonic-TTS-ONNX</code> model with
                WebGPU where available.
              </p>
              <p className="info-text">
                The <strong>Google TTS</strong> option uses the voices provided
                by your browser or operating system. It is ideal for smartphones
                and low-power devices.
              </p>
              <p className="info-text">
                Nothing you type here is sent to a server by this demo. All
                synthesis happens locally in your browser using browser APIs or
                ONNX models downloaded directly from Hugging Face.
              </p>
            </div>

            <div className="card glass-card info-card">
              <h2>How to use Free TTS effectively</h2>
              <ol className="steps-list">
                <li>
                  <strong>Choose the right engine.</strong> On mobile, stick to{" "}
                  <em>Google TTS</em>. On a desktop with a modern GPU, try the{" "}
                  <em>high quality model</em>.
                </li>
                <li>
                  <strong>Write clear sentences.</strong> Add punctuation like
                  commas and full stops so the voice sounds more natural.
                </li>
                <li>
                  <strong>Break long text into chunks.</strong> Extremely long
                  paragraphs can be harder to follow. Split them into logical
                  sections.
                </li>
                <li>
                  <strong>Experiment with different voices.</strong> Some
                  voices are better for narration, others for alerts or short
                  messages.
                </li>
                <li>
                  <strong>Use headphones for quality checks.</strong> If you
                  are preparing audio for a video or podcast, listen with good
                  headphones to catch issues early.
                </li>
              </ol>
            </div>

            <div className="card glass-card info-card">
              <h2>FAQ</h2>
              <div className="faq-item">
                <h3>Do you store my text anywhere?</h3>
                <p>
                  No. This is a purely client-side tool. Your text stays inside
                  your browser and is not uploaded by this page.
                </p>
              </div>
              <div className="faq-item">
                <h3>Why doesn&apos;t the model work on my phone?</h3>
                <p>
                  Modern TTS models are quite heavy. Mobile browsers usually
                  don&apos;t expose WebGPU in a stable way, so running the model
                  directly there isn&apos;t reliable yet.
                </p>
              </div>
              <div className="faq-item">
                <h3>Can I use this audio in my projects?</h3>
                <p>
                  This demo is for experimentation. If you use the audio in a
                  commercial project, please check the licenses of the voices,
                  models, and any platform you deploy to.
                </p>
              </div>
              <div className="faq-item">
                <h3>Why are the voices different on each device?</h3>
                <p>
                  Google TTS voices here come from your browser / OS. Each
                  platform (Windows, macOS, Android, etc.) has its own set of
                  installed voices.
                </p>
              </div>
            </div>
          </section>

          <section className="side-column">
            <div className="card glass-soft">
              <h2>Voice settings</h2>

              {engine === "model" ? (
                <>
                  <label className="field-label">Model voice</label>
                  <select
                    value={selectedModelVoice}
                    onChange={(e) =>
                      setSelectedModelVoice(e.target.value as VoiceId)
                    }
                    className="select"
                  >
                    {SUPER_TONIC_VOICES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.label}
                      </option>
                    ))}
                  </select>
                  <p className="help-text">
                    {
                      SUPER_TONIC_VOICES.find(
                        (v) => v.id === selectedModelVoice
                      )?.description
                    }
                  </p>
                  <p className="help-text">
                    This model runs locally in your browser and works best on
                    desktop with modern GPUs.
                  </p>
                </>
              ) : (
                <>
                  <label className="field-label">Google TTS voice</label>
                  <select
                    value={selectedGoogleVoiceName}
                    onChange={(e) => setSelectedGoogleVoiceName(e.target.value)}
                    className="select"
                  >
                    {googleVoices.length === 0 ? (
                      <option value="">No browser voices found</option>
                    ) : (
                      googleVoices.map((v) => (
                        <option key={v.name + v.lang} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))
                    )}
                  </select>
                  <p className="help-text">
                    These voices come from your browser / OS. They are usually
                    lighter and more reliable on mobile devices.
                  </p>
                </>
              )}
            </div>

            <div className="card glass-soft side-card">
              <h2>Quick presets</h2>
              <ul className="preset-list">
                <li>
                  <strong>Podcast intro:</strong> 2–3 short sentences. Use a
                  deeper voice like M2 for a radio-style feel.
                </li>
                <li>
                  <strong>Tutorial voice-over:</strong> Use F1 or M1 and keep
                  sentences short, with clear steps.
                </li>
                <li>
                  <strong>Notification sound:</strong> Just a few words, bright
                  voice like F2 works nicely.
                </li>
              </ul>
            </div>

            <div className="card glass-soft side-card">
              <h2>Tips for better pronunciation</h2>
              <ul className="tips-list">
                <li>
                  Add <code>...</code> to indicate natural pauses.
                </li>
                <li>
                  Write out acronyms with spaces, like{" "}
                  <code>U S B drive</code>, if the voice says them strangely.
                </li>
                <li>
                  Use phonetic spellings for tricky names until you get the
                  sound you like.
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        :root {
          --radius-card: 18px;
        }

        .app {
          min-height: 100vh;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        /* base theme vars */
        .app.dark {
          --bg-base: #020617;
          --bg-card-solid: #020617;
          --card-bg-elevated: rgba(15, 23, 42, 0.9);
          --card-bg-soft: rgba(15, 23, 42, 0.75);
          --topbar-bg: linear-gradient(
            to right,
            rgba(15, 23, 42, 0.9),
            rgba(15, 23, 42, 0.85)
          );
          --topbar-border: rgba(148, 163, 184, 0.45);
          --border-subtle: #1f2937;
          --text-primary: #f9fafb;
          --text-muted: #9ca3af;
          --btn-bg-muted: #4b5563;
          --color-error: #fecaca;
          --color-warn: #fed7aa;
          --color-success: #bbf7d0;
          --color-info: #bfdbfe;
          --color-muted: #9ca3af;
        }

        .app.light {
          --bg-base: #f9fafb;
          --bg-card-solid: #ffffff;
          --card-bg-elevated: rgba(255, 255, 255, 0.99);
          --card-bg-soft: rgba(255, 255, 255, 0.97);
          --topbar-bg: linear-gradient(
            to right,
            rgba(255, 255, 255, 0.98),
            rgba(255, 255, 255, 0.96)
          );
          --topbar-border: rgba(209, 213, 219, 0.9);
          --border-subtle: #e5e7eb;
          --text-primary: #0f172a;
          --text-muted: #4b5563;
          --btn-bg-muted: #9ca3af;
          --color-error: #b91c1c;
          --color-warn: #b45309;
          --color-success: #166534;
          --color-info: #1d4ed8;
          --color-muted: #6b7280;
        }

        /* accent variants – blue / pink */
        .app.blue {
          --accent: #2563eb;
          --accent-soft: rgba(37, 99, 235, 0.14);
          --accent-soft-strong: rgba(59, 130, 246, 0.22);
          --card-tint: rgba(37, 99, 235, 0.08);
          --card-tint-strong: rgba(37, 99, 235, 0.18);
          --btn-bg: #2563eb;
        }

        .app.pink {
          --accent: #ec4899;
          --accent-soft: rgba(236, 72, 153, 0.14);
          --accent-soft-strong: rgba(236, 72, 153, 0.24);
          --card-tint: rgba(236, 72, 153, 0.08);
          --card-tint-strong: rgba(236, 72, 153, 0.18);
          --btn-bg: #ec4899;
        }

        .page {
          min-height: 100vh;
          padding: 16px 12px 40px;
          color: var(--text-primary);
          background:
            radial-gradient(
              1000px 500px at 8% 8%,
              var(--accent-soft-strong),
              transparent
            ),
            radial-gradient(
              700px 350px at 92% 92%,
              var(--accent-soft),
              transparent
            ),
            radial-gradient(
              circle at top,
              #0f172a 0,
              var(--bg-base) 42%,
              var(--bg-base) 100%
            );
          overflow-x: hidden;
        }

        .app.light .page {
          background:
            radial-gradient(
              1000px 500px at 8% 8%,
              var(--accent-soft-strong),
              transparent
            ),
            radial-gradient(
              700px 350px at 92% 92%,
              var(--accent-soft),
              transparent
            ),
            radial-gradient(circle at top, #e5e7eb 0, #f9fafb 40%, #ffffff 100%);
        }

        .topbar {
          width: 100%;
          margin-bottom: 18px;
          position: sticky;
          top: 8px;
          z-index: 20;
        }

        .topbar-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-radius: 999px;
          background: var(--topbar-bg);
          border: 1px solid var(--topbar-border);
          backdrop-filter: blur(16px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .brand-logo {
          font-size: 22px;
          flex-shrink: 0;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .brand-title {
          font-weight: 700;
          font-size: 18px;
        }

        .brand-subtitle {
          font-size: 11px;
          opacity: 0.8;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
        }

        .back-link {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          white-space: nowrap;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        .theme-toggle {
          border-radius: 999px;
          border: 1px solid var(--border-subtle);
          padding: 6px 12px;
          background: var(--card-bg-soft);
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
        }

        .color-toggle {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .color-swatch {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          background: transparent;
        }

        .color-swatch.blue {
          background: linear-gradient(to bottom right, #60a5fa, #2563eb);
        }

        .color-swatch.pink {
          background: linear-gradient(to bottom right, #f9a8d4, #ec4899);
        }

        .color-swatch.active {
          border-color: white;
          box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.5);
        }

        .layout {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr);
          gap: 20px;
        }

        .main-column,
        .side-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .glass-card {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.16),
            rgba(255, 255, 255, 0.08)
          );
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(20px);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.65);
        }

        .app.light .glass-card {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.99),
            rgba(255, 255, 255, 0.98)
          );
          border: 1px solid rgba(209, 213, 219, 0.95);
          box-shadow: 0 16px 40px rgba(148, 163, 184, 0.45);
        }

        .glass-soft {
          background: radial-gradient(
              circle at top left,
              var(--card-tint-strong),
              transparent
            ),
            var(--card-bg-soft);
          border: 1px solid rgba(148, 163, 184, 0.35);
          backdrop-filter: blur(18px);
        }

        .hero {
          padding: 20px 20px 18px;
          border-radius: 24px;
        }

        .hero h1 {
          margin: 0 0 8px;
          font-size: 26px;
          font-weight: 800;
          color: var(--text-primary);
        }

        .hero p {
          margin: 0;
          font-size: 14px;
          color: var(--text-muted);
        }

        .hero-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .hero-pill {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--accent-soft);
        }

        .engine-toggle {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }

        .engine-btn {
          flex: 1;
          min-width: 0;
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: var(--card-bg-soft);
          color: var(--text-primary);
          padding: 8px 10px;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }

        .engine-btn.active {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .engine-caption {
          font-size: 11px;
          color: var(--text-muted);
        }

        .engine-hint {
          margin-top: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .card {
          border-radius: 22px;
          padding: 14px 16px;
        }

        .info-card {
          margin-top: 18px;
        }

        .info-text {
          font-size: 12px;
          color: var(--text-muted);
          margin: 4px 0;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
          font-size: 13px;
          gap: 8px;
        }

        .char-count {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid rgba(148, 163, 184, 0.55);
          background: var(--card-bg-elevated);
          padding: 12px 14px;
          font-size: 14px;
          color: var(--text-primary);
          resize: vertical;
          min-height: 200px;
          line-height: 1.5;
          box-sizing: border-box;
        }

        .textarea::placeholder {
          color: var(--text-muted);
        }

        .controls-row {
          margin-top: 12px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .primary-btn {
          border-radius: 999px;
          border: none;
          padding: 9px 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          background: var(--btn-bg);
          color: white;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.7);
        }

        .primary-btn.disabled {
          background: var(--btn-bg-muted);
          cursor: not-allowed;
          box-shadow: none;
        }

        .secondary-btn {
          border-radius: 999px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          padding: 8px 16px;
          font-size: 13px;
          background: var(--card-bg-soft);
          color: var(--text-primary);
          cursor: pointer;
          text-decoration: none;
          white-space: nowrap;
        }

        .secondary-btn:hover {
          background: var(--accent-soft);
        }

        .small-note {
          margin-top: 8px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .status {
          margin-top: 12px;
          font-size: 12px;
        }

        .audio-wrapper {
          margin-top: 10px;
        }

        .audio {
          width: 100%;
        }

        .ad-space {
          margin-top: 20px;
          min-height: 80px;
          border-radius: 22px;
        }

        .ad-placeholder {
          padding: 12px 14px;
        }

        .ad-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          opacity: 0.7;
        }

        .ad-placeholder p {
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--text-muted);
        }

        .field-label {
          font-size: 13px;
          margin-bottom: 4px;
        }

        .select {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: var(--card-bg-elevated);
          padding: 8px 10px;
          font-size: 14px;
          color: var(--text-primary);
        }

        .select option {
          background: var(--bg-card-solid);
          color: var(--text-primary);
        }

        .help-text {
          margin-top: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .steps-list {
          padding-left: 18px;
          margin: 4px 0 0;
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .steps-list li strong {
          font-weight: 600;
        }

        .faq-item + .faq-item {
          margin-top: 10px;
        }

        .faq-item h3 {
          font-size: 13px;
          margin: 0 0 2px;
        }

        .faq-item p {
          margin: 0;
          font-size: 12px;
          color: var(--text-muted);
        }

        .side-card {
          margin-top: 10px;
        }

        .preset-list,
        .tips-list {
          margin: 6px 0 0;
          padding-left: 16px;
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .tips-list code,
        .steps-list code {
          font-size: 11px;
        }

        /* 🔹 Progress bar styles */
        .progress-wrapper {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          border-radius: 999px;
          background: rgba(148, 163, 184, 0.35);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: var(--accent);
          transition: width 0.2s ease-out;
        }

        .progress-label {
          font-size: 11px;
          color: var(--text-muted);
          min-width: 32px;
          text-align: right;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: minmax(0, 1.5fr) minmax(0, 1.1fr);
          }
        }

        @media (max-width: 768px) {
          .layout {
            grid-template-columns: minmax(0, 1fr);
          }

          .topbar {
            position: static;
          }

          .topbar-inner {
            padding: 6px 10px;
            border-radius: 999px;
            gap: 6px;
            flex-direction: row;
            align-items: center;
            flex-wrap: wrap;
          }

          .brand-title {
            font-size: 15px;
          }

          .brand-subtitle {
            display: none;
          }

          .topbar-right {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: nowrap;
          }

          .back-link {
            font-size: 12px;
          }

          .theme-toggle {
            padding: 4px 10px;
            font-size: 12px;
          }

          .color-toggle {
            gap: 4px;
          }

          .hero {
            padding: 14px 12px;
          }

          .controls-row {
            flex-direction: column;
            align-items: stretch;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .page {
            padding-inline: 10px;
          }

          .topbar-inner {
            padding-inline: 10px;
          }

          .brand-title {
            font-size: 15px;
          }

          .brand-subtitle {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
