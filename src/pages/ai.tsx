import React, { useState } from "react";
import Bytez from "bytez.js";

const BYTEZ_KEY = "8342a85e649c268fc3d4f4878a6e8ae6";

// simple helper types
interface ImagenOutput {
  url?: string;
  images?: { url?: string }[];
  [key: string]: any;
}

const STYLES = [
  { label: "None", value: "" },
  { label: "Photorealistic", value: "photorealistic style" },
  { label: "Anime", value: "anime illustration style" },
  { label: "3D / Pixar", value: "3d pixar-style render" },
  { label: "Watercolor", value: "watercolor painting" },
];

const RATIOS = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Portrait (9:16)", value: "9:16" },
  { label: "Landscape (16:9)", value: "16:9" },
];

export default function App() {
  const [prompt, setPrompt] = useState("A cat wizard casting a spell");
  const [style, setStyle] = useState(STYLES[0].value);
  const [ratio, setRatio] = useState(RATIOS[0].value);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [rawOutput, setRawOutput] = useState("");

  const buildPrompt = () => {
    let p = prompt.trim();
    if (style) {
      p += `, ${style}`;
    }
    return p;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setErrorText("Prompt cannot be empty.");
      return;
    }
    if (!BYTEZ_KEY) {
      setErrorText(
        "VITE_BYTEZ_KEY is not set. Add it to your .env file and restart the dev server."
      );
      return;
    }

    setLoading(true);
    setErrorText("");
    setImageUrl(null);
    setRawOutput("");

    try {
      const sdk = new Bytez(BYTEZ_KEY);
      const model = sdk.model("google/imagen-4.0-fast-generate-001");

      const finalPrompt = buildPrompt();
      console.log("▶ Sending to Bytez:", { finalPrompt, ratio });

      // 🔴 IMPORTANT: Bytez expects `text` (see their HTTP reference),
      // not `prompt` – otherwise you get "Missing text content." :contentReference[oaicite:0]{index=0}
      const { error, output } = await model.run({
        text: finalPrompt,
        json: true,
        params: {
          aspect_ratio: ratio, // Imagen supports aspect_ratio like "1:1", "16:9", etc. :contentReference[oaicite:1]{index=1}
          // you can add more params here later (e.g. number_of_images)
        },
      });

      console.log("✅ Bytez response:", { error, output });

      if (error) {
        setErrorText(
          typeof error === "string" ? error : JSON.stringify(error, null, 2)
        );
      }

      setRawOutput(JSON.stringify(output, null, 2));

      // ── Try to extract image URL ──────────────────────────────────────
      let url: string | undefined;

      if (typeof output === "string") {
        // Bytez might return the URL directly as a string
        url = output;
      } else if ((output as ImagenOutput)?.url) {
        url = (output as ImagenOutput).url;
      } else if (
        Array.isArray((output as ImagenOutput)?.images) &&
        (output as ImagenOutput).images![0]?.url
      ) {
        url = (output as ImagenOutput).images![0].url;
      }

      if (url) {
        setImageUrl(url);
      } else {
        console.log(
          "No URL field found in output. Check raw JSON to see actual shape."
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "imagen-4-fast.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "#020617",
        color: "#e5e7eb",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1100,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
          gap: "1.5rem",
        }}
      >
        {/* LEFT: Controls + Preview */}
        <div
          style={{
            background: "#020617",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            border: "1px solid rgba(148,163,184,0.25)",
            boxShadow: "0 20px 45px rgba(15,23,42,0.8)",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 4 }}>
            Imagen 4 Fast Playground
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: 16 }}>
            Model: <code>google/imagen-4.0-fast-generate-001</code>
          </p>

          {!BYTEZ_KEY && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 0.9rem",
                borderRadius: "0.75rem",
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(234,179,8,0.4)",
                fontSize: "0.85rem",
              }}
            >
              <strong>Note:</strong> <code>VITE_BYTEZ_KEY</code> is missing. Add
              it to your <code>.env</code> file and restart dev server.
            </div>
          )}

          <form
            onSubmit={handleGenerate}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            {/* Prompt */}
            <div>
              <label
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.7rem 0.8rem",
                  borderRadius: "0.9rem",
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "#020617",
                  color: "#e5e7eb",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Style + Ratio */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr",
                gap: "0.75rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Style
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem",
                    borderRadius: "0.9rem",
                    border: "1px solid rgba(148,163,184,0.4)",
                    background: "#020617",
                    color: "#e5e7eb",
                    fontSize: "0.85rem",
                  }}
                >
                  {STYLES.map((s) => (
                    <option key={s.label} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Aspect ratio
                </label>
                <select
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.6rem",
                    borderRadius: "0.9rem",
                    border: "1px solid rgba(148,163,184,0.4)",
                    background: "#020617",
                    color: "#e5e7eb",
                    fontSize: "0.85rem",
                  }}
                >
                  {RATIOS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Generate button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                alignSelf: "flex-start",
                padding: "0.55rem 1.3rem",
                borderRadius: 999,
                border: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
                background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                color: "#020617",
              }}
            >
              {loading ? "Generating…" : "Generate image"}
            </button>
          </form>

          {errorText && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.75rem 0.9rem",
                borderRadius: "0.75rem",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(248,113,113,0.4)",
                fontSize: "0.85rem",
                whiteSpace: "pre-wrap",
              }}
            >
              <strong style={{ color: "#fca5a5" }}>Error:</strong> {errorText}
            </div>
          )}

          {/* Preview + Download */}
          {imageUrl && (
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  marginBottom: "0.75rem",
                }}
              >
                Preview
              </h2>
              <div
                style={{
                  borderRadius: "1rem",
                  overflow: "hidden",
                  border: "1px solid rgba(148,163,184,0.4)",
                  maxWidth: 512,
                  marginBottom: "0.75rem",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Generated by Imagen 4 Fast"
                  style={{ display: "block", width: "100%", height: "auto" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: 999,
                    border: "none",
                    background: "#22c55e",
                    color: "#022c22",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Download PNG
                </button>
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: 999,
                    border: "1px solid rgba(148,163,184,0.6)",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    color: "#e5e7eb",
                  }}
                >
                  Open in new tab
                </a>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Raw JSON */}
        <div
          style={{
            background: "#020617",
            borderRadius: "1.5rem",
            padding: "1.5rem",
            border: "1px solid rgba(31,41,55,0.9)",
            maxHeight: "calc(100vh - 4rem)",
            overflow: "auto",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 500,
              marginBottom: "0.6rem",
            }}
          >
            Raw output
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginBottom: 8 }}>
            Inspect this to see the exact response shape from Bytez/Imagen.
          </p>
          <pre
            style={{
              fontSize: "0.78rem",
              lineHeight: 1.4,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {loading
              ? "Waiting for response…"
              : rawOutput || "No output yet. Generate an image to see the JSON here."}
          </pre>
        </div>
      </div>
    </div>
  );
}
