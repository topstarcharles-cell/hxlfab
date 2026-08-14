const encoder = new TextEncoder();

export type RfqRow = {
  id: string;
  email: string;
  company: string;
  name: string;
  quote_json: string;
  upload_token_hash: string;
  access_token_hash: string;
  status: "draft" | "complete";
  file_count: number;
  total_bytes: number;
};

export type RfqFileRow = {
  id: string;
  original_name: string;
  object_key: string;
  content_type: string;
  size_bytes: number;
};

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, maxLength) : "";
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function makeToken(bytes = 32): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return Array.from(data, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function makeRfqId(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `HXL-${date}-${makeToken(4).toUpperCase()}`;
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function tokenMatches(token: string, expectedHash: string): Promise<boolean> {
  const actualHash = await hashToken(token);
  return crypto.subtle.timingSafeEqual(encoder.encode(actualHash), encoder.encode(expectedHash));
}

export function bearerToken(request: Request): string {
  const header = request.headers.get("Authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

const allowedExtensions = new Set([
  ".zip", ".7z", ".rar", ".tgz", ".gz", ".tar",
  ".gbr", ".ger", ".pho", ".art", ".drl", ".xln",
  ".odb", ".brd", ".pcb", ".fab", ".txt", ".pdf",
]);

export function safeFileName(value: string): string {
  const base = value.split(/[\\/]/).pop() || "";
  return base.replace(/[^a-zA-Z0-9._()\-+ ]/g, "_").slice(0, 180);
}

export function fileExtension(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".tar.gz")) return ".gz";
  const index = lower.lastIndexOf(".");
  return index >= 0 ? lower.slice(index) : "";
}

export function isAllowedFile(name: string): boolean {
  return allowedExtensions.has(fileExtension(name));
}

export function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function readRfq(env: Env, id: string): Promise<RfqRow | null> {
  return env.RFQ_DB.prepare(
    "SELECT id, email, company, name, quote_json, upload_token_hash, access_token_hash, status, file_count, total_bytes FROM rfqs WHERE id = ?",
  ).bind(id).first<RfqRow>();
}
