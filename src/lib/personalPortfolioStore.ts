import { promises as fs } from "fs";
import path from "path";

import {
  defaultPersonalPortfolio,
  ensurePortfolioData,
  type PersonalPortfolioData,
} from "@/lib/personalPortfolio";

const portfolioFilePath = path.join(
  process.cwd(),
  "src",
  "data",
  "personalPortfolio.json"
);

export async function readPersonalPortfolio(): Promise<PersonalPortfolioData> {
  try {
    const file = await fs.readFile(portfolioFilePath, "utf8");
    return ensurePortfolioData(JSON.parse(file));
  } catch {
    return ensurePortfolioData(defaultPersonalPortfolio);
  }
}

export async function writePersonalPortfolio(
  data: unknown
): Promise<PersonalPortfolioData> {
  const safeData = ensurePortfolioData(data);
  const finalData: PersonalPortfolioData = {
    ...safeData,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(
    portfolioFilePath,
    `${JSON.stringify(finalData, null, 2)}\n`,
    "utf8"
  );

  return finalData;
}
