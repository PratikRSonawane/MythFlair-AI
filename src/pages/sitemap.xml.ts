import { GetServerSideProps } from "next";

const domain = "https://ai.mythflair.com";

const staticRoutes = [
  "",
  "/about",
  "/contact",
  "/privacy-policy"
  // Add more static pages here
];

// Example dynamic paths:
// Fetch from API or database if available
async function getDynamicRoutes() {
  // const res = await fetch(`${domain}/api/tools`);
  // const data = await res.json();
  // return data.map((tool: any) => `/tools/${tool.slug}`);
  return []; // Return empty for now
}

function generateXml(urls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `
  <url>
    <loc>${domain}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === "" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const dynamicRoutes = await getDynamicRoutes();
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const sitemap = generateXml(allRoutes);

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
