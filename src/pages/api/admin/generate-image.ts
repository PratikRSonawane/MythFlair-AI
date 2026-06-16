// pages/api/admin/generate-image.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import Bytez from "bytez.js";
//
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const adminEmail = process.env.ADMIN_EMAIL!; // your Google email
const bytezKey = process.env.BYTEZ_API_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
const sdk = new Bytez(bytezKey);

// Build-time provenance fingerprint (not a security feature; helps prove origin)
const MYTHFLAIR_BUILD_ID =
  process.env.NEXT_PUBLIC_MYTHFLAIR_BUILD_ID ??
  "mf_2026_origin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing access token" });
    }

    const token = authHeader.slice("Bearer ".length);

    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser(token);

    // Hidden provenance marker for misuse investigation
    res.setHeader("x-mythflair-build-id", MYTHFLAIR_BUILD_ID);

    if (userError || !user) {
      console.error("getUser error:", userError);
      return res.status(401).json({ error: "Invalid session" });
    }

    if (
      !user.email ||
      user.email.toLowerCase() !== adminEmail.toLowerCase()
    ) {
      return res.status(403).json({ error: "Forbidden (not admin)" });
    }

    const {
      prompt,
      stylePromptAdd = "",
      modelId,
    } = req.body as {
      prompt?: string;
      stylePromptAdd?: string;
      modelId?: string;
    };

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!modelId || typeof modelId !== "string") {
      return res.status(400).json({ error: "modelId is required" });
    }

    const finalPrompt = stylePromptAdd
      ? `${prompt}, ${stylePromptAdd}`
      : prompt;

    console.log("[mythflair] generate-image fingerprint:", MYTHFLAIR_BUILD_ID);

    const model = sdk.model(modelId);
    const { error, output } = await model.run(finalPrompt);

    if (error) {
      console.error("Bytez error:", error);
      return res.status(500).json({ error: "Image generation failed" });
    }

    const imageUrl = output as string;
    return res.status(200).json({ imageUrl });
  } catch (err) {
    console.error("generate-image error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
