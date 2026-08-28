import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const outputUrl = new URL("../public/data/industry-pulse.json", import.meta.url);
const feeds = [
  { name: "Global Electronics Association", url: process.env.IPC_FEED_URL || "https://www.ipc.org/rss.xml", hosts: ["electronics.org", "ipc.org"] },
  { name: "PCEA", url: process.env.PCEA_FEED_URL || "https://pcea.net/feed/", hosts: ["pcea.net"] },
];
const copperUrl = process.env.COPPER_SOURCE_URL || "https://fred.stlouisfed.org/graph/fredgraph.csv?id=PCOPPUSDM";

async function fetchText(url) {
  if (url.startsWith("file:")) return readFile(new URL(url), "utf8");
  const response = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml, text/csv;q=0.9, */*;q=0.8", "User-Agent": "HXLFAB-industry-pulse/1.0 (+https://hxlfab.com/)" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

function decodeXml(value = "") {
  return value
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ").trim();
}

function tag(block, name) {
  return block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] || "";
}

function safeArticleUrl(value, allowedHosts) {
  try {
    const url = new URL(decodeXml(value));
    const allowed = allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    if (url.protocol !== "https:" || !allowed) return null;
    [...url.searchParams.keys()].filter((key) => key.toLowerCase().startsWith("utm_")).forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.href;
  } catch { return null; }
}

function parseFeed(xml, feed) {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map((match) => {
    const block = match[1];
    const title = decodeXml(tag(block, "title"));
    const url = safeArticleUrl(tag(block, "link"), feed.hosts);
    const published = new Date(decodeXml(tag(block, "pubDate") || tag(block, "dc:date")));
    if (!title || !url || Number.isNaN(published.valueOf())) return null;
    return { title: title.slice(0, 180), url, source: feed.name, publishedAt: published.toISOString() };
  }).filter(Boolean);
}

function parseCopper(csv) {
  const rows = csv.trim().split(/\r?\n/).slice(1).map((line) => {
    const [date, rawValue] = line.split(",");
    const value = Number(rawValue);
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(value) ? { date, value: Number(value.toFixed(2)) } : null;
  }).filter(Boolean).slice(-8);
  if (rows.length < 2) throw new Error("Copper series did not contain enough valid observations");
  const first = rows[0].value;
  const latest = rows.at(-1).value;
  return {
    seriesId: "PCOPPUSDM",
    benchmark: "Global copper price",
    currency: "USD",
    unit: "metric ton",
    frequency: "monthly",
    latest,
    latestPeriod: rows.at(-1).date,
    changePct: Number((((latest - first) / first) * 100).toFixed(2)),
    trend: rows,
    source: { name: "FRED / International Monetary Fund", url: "https://fred.stlouisfed.org/series/PCOPPUSDM" },
  };
}

function dedupeAndSortNews(items) {
  const seen = new Set();
  return items.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}

async function readExisting() {
  try { return JSON.parse(await readFile(outputUrl, "utf8")); }
  catch { return null; }
}

async function main() {
  const existing = await readExisting();
  const results = await Promise.allSettled([fetchText(copperUrl), ...feeds.map((feed) => fetchText(feed.url))]);
  const warnings = [];

  let copper = existing?.copper;
  if (results[0].status === "fulfilled") copper = parseCopper(results[0].value);
  else warnings.push(`copper: ${results[0].reason.message}`);

  const freshNews = [];
  feeds.forEach((feed, index) => {
    const result = results[index + 1];
    if (result.status === "fulfilled") freshNews.push(...parseFeed(result.value, feed));
    else warnings.push(`${feed.name}: ${result.reason.message}`);
  });
  const news = dedupeAndSortNews(freshNews.length ? freshNews : (existing?.news || []));
  if (!copper || news.length < 2) throw new Error(`Unable to build a complete industry pulse. ${warnings.join(" | ")}`);

  const sourceDates = [copper.latestPeriod, ...news.map((item) => item.publishedAt)].map((value) => new Date(value)).filter((date) => !Number.isNaN(date.valueOf()));
  const payload = {
    schemaVersion: 1,
    updatedAt: new Date(Math.max(...sourceDates.map((date) => date.valueOf()))).toISOString(),
    copper,
    news,
    newsSources: feeds.map((feed) => feed.name),
  };

  await mkdir(dirname(fileURLToPath(outputUrl)), { recursive: true });
  await writeFile(outputUrl, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Industry pulse updated: ${news.length} headlines, copper through ${copper.latestPeriod}.`);
  warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
}

await main();
