import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const publicDir = new URL("../public/", import.meta.url).pathname;
const htmlFiles = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.name.endsWith(".html")) htmlFiles.push(path);
  }
}

walk(publicDir);
const errors = [];
const titles = new Map();

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/s)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/s)?.[1];
  const h1Count = (html.match(/<h1\b/g) || []).length;

  if (!title || !description || !canonical || h1Count !== 1) {
    errors.push(`${file}: expected one H1 plus title, description and canonical metadata`);
  }
  if (titles.has(title)) errors.push(`${file}: duplicate title also used by ${titles.get(title)}`);
  titles.set(title, file);

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); }
    catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const url = match[1].split("#")[0].split("?")[0];
    if (!url || url.startsWith("/api/")) continue;
    const target = url.endsWith("/") ? join(publicDir, url, "index.html") : join(publicDir, url);
    if (!existsSync(target)) errors.push(`${file}: missing local target ${url}`);
  }

  console.log(`${file.replace(publicDir, "public/")} | title ${title?.length ?? 0} | description ${description?.length ?? 0}`);
}

const sitemap = readFileSync(join(publicDir, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== htmlFiles.length || new Set(sitemapUrls).size !== sitemapUrls.length) {
  errors.push(`sitemap contains ${sitemapUrls.length} unique URL entries for ${htmlFiles.length} HTML pages`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages, ${sitemapUrls.length} sitemap URLs and all local links.`);
