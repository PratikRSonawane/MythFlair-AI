// pages/index.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

// 🎨 Showcase rows with themes
const showcaseRows: { label: string; images: string[] }[] = [
  {
    label: "Anime",
    images: [
      "https://i.ibb.co/7QpKsCX/example-anime-1.jpg",
      "https://i.ibb.co/1RS1Q8c/example-anime-2.jpg",
      "https://i.ibb.co/gZV10d3/example-anime-3.jpg",
      "https://i.ibb.co/7QpKsCX/example-anime-4.jpg",
    ],
  },
  {
    label: "Fantasy",
    images: [
      "https://i.ibb.co/2FxZkz0/example-fantasy-1.jpg",
      "https://i.ibb.co/F4Zt6Yp/example-fantasy-2.jpg",
      "https://i.ibb.co/HC2wH6G/example-fantasy-3.jpg",
      "https://i.ibb.co/2FxZkz0/example-fantasy-4.jpg",
    ],
  },
  {
    label: "Real",
    images: [
      "https://i.ibb.co/kJmP2wH/example-real-1.jpg",
      "https://i.ibb.co/9ZP3h5Y/example-real-2.jpg",
      "https://i.ibb.co/ZVGz0L5/example-real-3.jpg",
      "https://i.ibb.co/kJmP2wH/example-real-4.jpg",
    ],
  },
  {
    label: "Painting",
    images: [
      "https://i.ibb.co/8D0FHk8/example-paint-1.jpg",
      "https://i.ibb.co/HC2wH6G/example-paint-2.jpg",
      "https://i.ibb.co/7QpKsCX/example-paint-3.jpg",
      "https://i.ibb.co/8D0FHk8/example-paint-4.jpg",
    ],
  },
  {
    label: "Cyberpunk",
    images: [
      "https://i.ibb.co/4Nb920b/example-cyber-1.jpg",
      "https://i.ibb.co/85FTSzr/example-cyber-2.jpg",
      "https://i.ibb.co/4Nb920b/example-cyber-3.jpg",
      "https://i.ibb.co/85FTSzr/example-cyber-4.jpg",
    ],
  },
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeIndexes, setActiveIndexes] = useState<number[]>(
    () => showcaseRows.map(() => 0)
  );

  // Load user and track auth state
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (!error) setUser(data?.user ?? null);
        else setUser(null);
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

  // 🔁 Rotate images in each row every 4 seconds
  useEffect(() => {
    if (!showcaseRows.length) return;

    const interval = setInterval(() => {
      setActiveIndexes((prev) =>
        prev.map((idx, rowIndex) => {
          const count = showcaseRows[rowIndex].images.length || 1;
          return count <= 1 ? idx : (idx + 1) % count;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <Head>
  {/* Basic SEO */}
  <title>MythFlair AI – Free AI Image Generator & Voice Studio</title>
  <meta
    name="description"
    content="MythFlair AI is a creative studio for generating AI images, anime, fantasy art and text-to-speech audio. Use our free AI image generator and Voice Studio online."
  />
  <meta
    name="robots"
    content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"
  />
  <link rel="canonical" href="https://ai.mythflair.com/" />

  {/* Open Graph (Facebook, LinkedIn, etc.) */}
  <meta property="og:title" content="MythFlair AI – Free AI Image Generator & Voice Studio" />
  <meta
    property="og:description"
    content="Turn your ideas into instant visuals and immersive audio with MythFlair AI. Generate images, anime, fantasy art and realistic voices right in your browser."
  />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ai.mythflair.com/" />
  <meta
    property="og:image"
    content="https://ai.mythflair.com/thumbnail.png"
  />
  <meta property="og:site_name" content="MythFlair AI" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="MythFlair AI – Free AI Image Generator & Voice Studio" />
  <meta
    name="twitter:description"
    content="Create AI-generated images and lifelike voices using MythFlair AI's free tools."
  />
  <meta
    name="twitter:image"
    content="https://ai.mythflair.com/thumbnail.png"
  />

  {/* Optional: keywords (not very important, but harmless) */}
  <meta
    name="keywords"
    content="AI image generator, free AI art, anime AI, fantasy AI, text to speech, AI voice, MythFlair"
  />

  {/* JSON-LD structured data for Google & Bing */}
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "MythFlair AI",
        url: "https://ai.mythflair.com/",
        description:
          "MythFlair AI is an online creative studio for AI-generated images, art, and text-to-speech audio.",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://ai.mythflair.com/?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }),
    }}
  />
</Head>


      <div
        data-theme={theme}
        style={{
          minHeight: "100vh",
          background: "var(--bg-color)",
          backgroundImage: "var(--bg-gradient)",
          color: "var(--text-primary)",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          overflowX: "hidden",
        }}
      >
        <style jsx global>{`
          :root {
            --bg-color: #020617;
            --bg-gradient: radial-gradient(
              circle at 50% 0%,
              #1e1b4b 0%,
              #020617 40%,
              #000 100%
            );
            --header-bg: rgba(2, 6, 23, 0.7);
            --header-border: rgba(255, 255, 255, 0.06);
            --text-primary: #e2e8f0;
            --text-muted: #94a3b8;
            --card-bg: linear-gradient(
              180deg,
              rgba(30, 41, 59, 0.4) 0%,
              rgba(15, 23, 42, 0.6) 100%
            );
            --card-border: rgba(255, 255, 255, 0.08);
            --footer-bg: #020617;
            --footer-border: rgba(255, 255, 255, 0.05);
          }

          [data-theme="light"] {
            --bg-color: #f9fafb;
            --bg-gradient: radial-gradient(
              circle at 50% 0%,
              #bfdbfe 0%,
              #f9fafb 40%,
              #e5e7eb 100%
            );
            --header-bg: rgba(255, 255, 255, 0.9);
            --header-border: rgba(148, 163, 184, 0.3);
            --text-primary: #0f172a;
            --text-muted: #64748b;
            --card-bg: linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.9) 0%,
              rgba(241, 245, 249, 0.9) 100%
            );
            --card-border: rgba(148, 163, 184, 0.4);
            --footer-bg: #e5e7eb;
            --footer-border: rgba(148, 163, 184, 0.5);
          }

          body {
            margin: 0;
            padding: 0;
          }

          .glass-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            transition: transform 0.3s ease, box-shadow 0.3s ease,
              border-color 0.3s ease;
          }
          .glass-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 30px -5px rgba(0, 0, 0, 0.3);
            border-color: rgba(96, 165, 250, 0.7) !important;
          }

          .brand-logo {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            background: linear-gradient(
              135deg,
              #a855f7 0%,
              #ec4899 50%,
              #f97316 100%
            );
            display: flex;
            align-items: center;
            justifyContent: center;
            box-shadow: 0 0 16px rgba(236, 72, 153, 0.3);
            font-weight: 900;
            font-size: 16px;
            color: white;
          }

          .brand-title {
            font-weight: 800;
            font-size: 18px;
            letter-spacing: -0.5px;
          }

          .brand-subtitle {
            font-size: 10px;
            opacity: 0.6;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          .main-header {
            padding: 12px 16px;
          }

          .options-grid {
            display: grid;
            gap: 20px;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          }

          .option-card {
            border-radius: 20px;
            padding: 20px;
          }

          .showcase-grid {
            display: grid;
            gap: 12px;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          }

          @keyframes pulse {
            0%,
            100% {
              height: 20%;
              opacity: 0.5;
            }
            50% {
              height: 100%;
              opacity: 1;
            }
          }

          @media (max-width: 640px) {
            .main-header {
              padding: 6px 10px;
            }
            .brand-logo {
              width: 30px;
              height: 30px;
              font-size: 14px;
            }
            .brand-title {
              font-size: 16px;
            }
            .brand-subtitle {
              font-size: 9px;
            }

            .options-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            }

            .option-card {
              border-radius: 14px;
              padding: 14px;
            }

            .showcase-grid {
              gap: 8px;
            }

            body {
              font-size: 14px;
            }
          }
        `}</style>

        {/* Header */}
        <header
          className="main-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--header-border)",
            background: "var(--header-bg)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <img
    src="/mythflair-logo.png"
    alt="MythFlair Logo"
    style={{
      width: 42,
      height: 42,
      borderRadius: "8px",
      objectFit: "cover",
    }}
  />

  <div>
              <div className="brand-title">MythFlair</div>
              <div className="brand-subtitle">AI Creative Studio</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid var(--card-border)",
                background: "rgba(15,23,42,0.2)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontSize: 11,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{theme === "dark" ? "☀️" : "🌙"}</span>
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>

            {user ? (
              <>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {user.email?.split("@")[0]}
                  </div>
                  <Link
                    href="/profile"
                    style={{
                      fontSize: 11,
                      color: "#c084fc",
                      textDecoration: "none",
                    }}
                  >
                    Profile & Credits
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 99,
                    border: "1px solid var(--card-border)",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontSize: 12,
                    transition: "0.2s",
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  style={{
                    textDecoration: "none",
                    color: "var(--text-muted)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  Sign in
                </Link>
                <Link href="/signup" style={{ textDecoration: "none" }}>
                  <button
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      background: "white",
                      border: "none",
                      color: "black",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 13,
                      boxShadow: "0 0 12px rgba(255,255,255,0.15)",
                    }}
                  >
                    Sign up
                  </button>
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main
          style={{
            flex: 1,
            padding: "32px 16px 72px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "100%", maxWidth: 1200 }}>
            {/* Hero Section */}
            <section style={{ textAlign: "center", marginBottom: 48 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: 11,
                  marginBottom: 16,
                  color: "var(--text-muted)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    boxShadow: "0 0 8px #4ade80",
                  }}
                />
                No download • No setup • Just pure creation
              </div>

              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 52px)",
                  fontWeight: 800,
                  marginBottom: 12,
                  letterSpacing: -1,
                  lineHeight: 1.1,
                }}
              >
                MythFlair AI – Turn your ideas into <br />
                <span
                  style={{
                    background:
                      "linear-gradient(to right, #a855f7, #ec4899, #f97316)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  instant visuals.
                </span>
              </h1>
              <p
                style={{
                  maxWidth: 560,
                  margin: "0 auto",
                  fontSize: 14,
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                Choose a free image generator powered by open-source models, or
                unlock premium features like video generation and ad-powered
                boosts.
              </p>
            </section>

            {/* Options Container (Image + Video) */}
            <section className="options-grid" style={{ marginBottom: 64 }}>
              {/* Free Option */}
              <Link href="/ai-image" style={{ textDecoration: "none" }}>
                <div
                  className="glass-card option-card"
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    position: "relative",
                    overflow: "hidden",
                    color: "var(--text-primary)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0.15,
                      backgroundImage:
                        "radial-gradient(circle at top left, #60a5fa, transparent 60%)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                      zIndex: 1,
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#16a34a",
                          fontSize: 12,
                          fontWeight: 600,
                          marginBottom: 6,
                          letterSpacing: 0.5,
                        }}
                      >
                        FREE PLAN
                      </div>
                      <h2
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          margin: 0,
                        }}
                      >
                        Image Generation
                      </h2>
                    </div>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        background: "rgba(255,255,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      🎨
                    </div>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                      zIndex: 1,
                    }}
                  >
                    Use MythFlair&apos;s free AI image creator, powered by
                    Flux.1, Turbo and Stable Diffusion.
                  </p>

                  <ul
                    style={{
                      padding: 0,
                      margin: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--text-muted)",
                      zIndex: 1,
                    }}
                  >
                    <li style={{ display: "flex", gap: 6 }}>
                      <span>✓</span> Text to Image & Image to Image
                    </li>
                    <li style={{ display: "flex", gap: 6 }}>
                      <span>✓</span> Multiple aspect ratios & styles
                    </li>
                    <li
                      style={{
                        display: "flex",
                        gap: 6,
                        color: "var(--text-primary)",
                        fontWeight: 500,
                      }}
                    >
                      <span>✓</span> No account limits for now
                    </li>
                  </ul>

                  <div style={{ marginTop: "auto", paddingTop: 10, zIndex: 1 }}>
                    <span
                      style={{
                        borderBottom: "1px solid #60a5fa",
                        paddingBottom: 2,
                        fontSize: 13,
                        color: "#60a5fa",
                      }}
                    >
                      Start Creating Free &rarr;
                    </span>
                  </div>
                </div>
              </Link>

              {/* Premium Option */}
              <div
                className="glass-card option-card"
                onClick={() => alert("Premium area is coming soon.")}
                style={{
                  cursor: "pointer",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  position: "relative",
                  overflow: "hidden",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0.15,
                    backgroundImage:
                      "radial-gradient(circle at top right, #ec4899, transparent 60%)",
                    pointerEvents: "none",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    zIndex: 1,
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#f97373",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                        letterSpacing: 0.5,
                      }}
                    >
                      PREMIUM • COMING SOON
                    </div>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      Video Generation
                    </h2>
                  </div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      background:
                        "linear-gradient(135deg, #f43f5e, #e11d48)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    🎬
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                    zIndex: 1,
                  }}
                >
                  Create short AI-powered videos and earn extra premium minutes
                  by watching ads.
                </p>

                <ul
                  style={{
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--text-muted)",
                    zIndex: 1,
                  }}
                >
                  <li style={{ display: "flex", gap: 6 }}>
                    <span>⚡</span> Turn prompts into dynamic video scenes
                  </li>
                  <li
                    style={{
                      display: "flex",
                      gap: 6,
                      color: "var(--text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    <span>⚡</span> Watch ads to unlock more render time
                  </li>
                  <li style={{ display: "flex", gap: 6 }}>
                    <span>⚡</span> Higher resolution & priority queue
                  </li>
                </ul>

                <div style={{ marginTop: "auto", paddingTop: 10, zIndex: 1 }}>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#fda4af",
                      opacity: 0.9,
                    }}
                  >
                    Join Waitlist &rarr;
                  </span>
                </div>
              </div>
            </section>

            {/* TTS Section */}
            <section style={{ marginBottom: 64 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
              >
                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  Voice Studio
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    padding: "4px 8px",
                    background: "#2dd4bf",
                    color: "#0f172a",
                    borderRadius: 4,
                    fontWeight: 700,
                  }}
                >
                  NEW
                </span>
              </div>

              <Link
                href="/TTS"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="glass-card"
                  style={{
                    width: "100%",
                    minHeight: 160,
                    borderRadius: 20,
                    border: "1px solid rgba(45, 212, 191, 0.4)",
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    padding: 20,
                    gap: 20,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ flex: 1, zIndex: 1, minWidth: 240 }}>
                    <h3
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        marginBottom: 8,
                      }}
                    >
                      AI Powered Text-to-Speech
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        marginBottom: 14,
                      }}
                    >
                      Transform your written stories into immersive audio
                      experiences. Select from multiple lifelike voices and
                      export your audio instantly.
                    </p>
                    <span
                      style={{
                        padding: "8px 18px",
                        background: "#2dd4bf",
                        color: "#134e4a",
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 13,
                        display: "inline-block",
                      }}
                    >
                      Open Voice Studio &rarr;
                    </span>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      height: 90,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      opacity: 0.8,
                      minWidth: 180,
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: 5,
                          height: Math.random() * 60 + 20 + "%",
                          background: "#2dd4bf",
                          borderRadius: 4,
                          animation: `pulse 1s infinite ${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </section>

            {/* Gallery / Showcase Section */}
            <section style={{ marginTop: 16 }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>
                  Built with MythFlair
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  Explore different styles you can generate
                </p>
              </div>

              {showcaseRows.map((row, rowIndex) => (
                <div key={rowIndex} style={{ marginBottom: 36 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-primary)",
                        fontSize: 16,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        margin: 0,
                      }}
                    >
                      {row.label}
                    </h3>
                    <span
                      style={{
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 999,
                        border: "1px solid rgba(148,163,184,0.6)",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Style
                    </span>
                  </div>

                  <div className="showcase-grid">
                    {row.images.map((_, imgIndex) => {
                      const activeIndex = activeIndexes[rowIndex] ?? 0;
                      const src =
                        row.images[
                          (activeIndex + imgIndex) % row.images.length
                        ];

                      return (
                        <div
                          key={imgIndex}
                          className="glass-card"
                          style={{
                            borderRadius: 14,
                            overflow: "hidden",
                            aspectRatio: "1/1",
                            position: "relative",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <img
                            src={src}
                            alt={`${row.label} example`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "opacity 0.4s, transform 0.4s",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              left: 0,
                              right: 0,
                              padding: 8,
                              background:
                                "linear-gradient(transparent, rgba(0,0,0,0.75))",
                              fontSize: 11,
                              fontWeight: 600,
                              color: "white",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>{row.label}</span>
                            <span
                              style={{
                                fontSize: 9,
                                opacity: 0.8,
                                textTransform: "uppercase",
                              }}
                            >
                              Auto-rotating
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <p
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 10,
                }}
              >
                * These are sample images showcasing different styles. Replace
                them with your own ImgBB URLs to match your brand.
              </p>
            </section>
          </div>
        </main>

        <footer
          style={{
            padding: "24px 16px",
            background: "var(--footer-bg)",
            borderTop: "1px solid var(--footer-border)",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 11,
          }}
        >
          &copy; {new Date().getFullYear()} MythFlair. All rights reserved.
        </footer>
      </div>
    </>
  );
}
