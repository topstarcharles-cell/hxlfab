import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const publicDir = new URL("../public/", import.meta.url).pathname;
const siteUrl = "https://hxlfab.com";
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
const canonicals = new Map();

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

  const fileRoute = relative(publicDir, file).replaceAll("\\", "/").replace(/index\.html$/, "");
  const expectedCanonical = `${siteUrl}/${fileRoute}`;
  if (canonical && canonical !== expectedCanonical) {
    errors.push(`${file}: canonical ${canonical} does not match ${expectedCanonical}`);
  }
  if (canonical && canonicals.has(canonical)) {
    errors.push(`${file}: duplicate canonical also used by ${canonicals.get(canonical)}`);
  }
  if (canonical) canonicals.set(canonical, file);

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
const sitemapSet = new Set(sitemapUrls);
const canonicalSet = new Set(canonicals.keys());
if (sitemapSet.size !== sitemapUrls.length) errors.push("sitemap contains duplicate URL entries");
for (const canonical of canonicalSet) {
  if (!sitemapSet.has(canonical)) errors.push(`sitemap is missing ${canonical}`);
}
for (const url of sitemapSet) {
  if (!canonicalSet.has(url)) errors.push(`sitemap contains an unknown page ${url}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${htmlFiles.length} pages, ${sitemapUrls.length} sitemap URLs and all local links.`);
