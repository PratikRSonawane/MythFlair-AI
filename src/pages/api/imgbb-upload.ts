// pages/api/imgbb-upload.ts
import type { NextApiRequest, NextApiResponse } from "next";

type UploadResponse =
  | { success: true; url: string }
  | { success: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ success: false, error: "IMGBB_API_KEY is not configured on the server." });
  }

  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    return res
      .status(400)
      .json({ success: false, error: "imageBase64 is required in the request body." });
  }

  try {
    // ImgBB endpoint: accepts base64 string in 'image' parameter
    const formData = new URLSearchParams();
    formData.set("image", imageBase64);

    const uploadRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!uploadRes.ok) {
      const text = await uploadRes.text();
      console.error("ImgBB upload failed:", text);
      return res.status(500).json({
        success: false,
        error: "ImgBB upload failed. Check server logs for details.",
      });
    }

    const data = (await uploadRes.json()) as any;

    // ImgBB responds with { data: { url, display_url, ... }, success: true, ... }
    const url: string | undefined = data?.data?.url || data?.data?.display_url;

    if (!url) {
      console.error("Unexpected ImgBB response:", data);
      return res.status(500).json({
        success: false,
        error: "ImgBB did not return a URL. Response structure unexpected.",
      });
    }

    return res.status(200).json({ success: true, url });
  } catch (err) {
    console.error("ImgBB upload error:", err);
    return res.status(500).json({
      success: false,
      error: "Unexpected error while uploading to ImgBB.",
    });
  }
}
