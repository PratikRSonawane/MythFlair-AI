import type { NextApiRequest, NextApiResponse } from "next";

import {
  readPersonalPortfolio,
  writePersonalPortfolio,
} from "@/lib/personalPortfolioStore";

function getHeaderValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const data = await readPersonalPortfolio();
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const configuredKey = process.env.PERSONAL_PORTFOLIO_EDITOR_KEY?.trim();
    const requestKey = getHeaderValue(req.headers["x-portfolio-key"]).trim();

    if (configuredKey && requestKey !== configuredKey) {
      return res.status(401).json({
        message:
          "Invalid editor key. Add PERSONAL_PORTFOLIO_EDITOR_KEY to .env.local and use the same key in the manage page.",
      });
    }

    try {
      const saved = await writePersonalPortfolio(req.body);
      return res.status(200).json(saved);
    } catch (error) {
      console.error("Failed to write personal portfolio data", error);

      return res.status(500).json({
        message:
          "Could not save the portfolio file in this environment. Local development works, but read-only hosting needs a database or CMS.",
      });
    }
  }

  res.setHeader("Allow", "GET, PUT");
  return res.status(405).json({ message: "Method not allowed." });
}
