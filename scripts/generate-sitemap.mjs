import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const publicDir = new URL("../public/", import.meta.url).pathname;
const siteUrl = "https://hxlfab.com";
const htmlFiles = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name === "index.html") htmlFiles.push(path);
  }
}

function priority(pathname) {
  if (pathname === "/") return "1.0";
  if (["/pcb-manufacturing/", "/multilayer-pcb/", "/hdi-pcb/", "/high-frequency-pcb/", "/heavy-copper-pcb/", "/impedance-controlled-pcb/", "/pcb-prototype/"].includes(pathname)) return "0.9";
  if (pathname === "/help-center/" || ["/quality-certifications/", "/factory-process/", "/engineering-scenarios/", "/working-with-us/"].includes(pathname)) return "0.8";
  if (pathname.startsWith("/help-center/articles/")) return "0.6";
  if (pathname.startsWith("/help-center/")) return "0.7";
  if (pathname === "/privacy-file-handling/") return "0.4";
  return "0.7";
}

await walk(publicDir);
const urls = [];
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/s)?.[1];
  if (!canonical?.startsWith(`${siteUrl}/`)) throw new Error(`Missing or invalid canonical in ${file}`);
  urls.push(new URL(canonical));
}

urls.sort((a, b) => a.pathname === "/" ? -1 : b.pathname === "/" ? 1 : a.pathname.localeCompare(b.pathname));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url>\n    <loc>${url.href}</loc>\n    <lastmod>2026-08-15</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${priority(url.pathname)}</priority>\n  </url>`).join("\n")}\n</urlset>\n`;

await writeFile(join(publicDir, "sitemap.xml"), sitemap);
console.log(`Generated sitemap with ${urls.length} URLs.`);
