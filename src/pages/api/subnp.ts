import type { NextApiRequest, NextApiResponse } from "next";

const allowedModels = new Set(["turbo", "flux", "flux-schnell", "magic", "wan", "default"]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, model } = req.body;
    const selectedModel =
      typeof model === "string" && allowedModels.has(model) ? model : "magic";

    const response = await fetch(
      "https://subnp.com/api/free/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "User-Agent": "Mozilla/5.0",
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
        }),
      }
    );

    if (!response.body) {
      return res.status(500).json({
        error: "No response body",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      res.write(Buffer.from(value));
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server Error",
    });
  }
}
