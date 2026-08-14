import { json, readRfq, tokenMatches } from "../../../_shared";
import type { RfqFileRow } from "../../../_shared";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = String(params.id || "");
  const fileId = String(params.fileId || "");
  const token = new URL(request.url).searchParams.get("token") || "";
  const rfq = await readRfq(env, id);
  if (!rfq || !(await tokenMatches(token, rfq.access_token_hash))) {
    return json({ error: "File link is invalid or expired." }, 404);
  }

  const file = await env.RFQ_DB.prepare(
    "SELECT id, original_name, object_key, content_type, size_bytes FROM rfq_files WHERE id = ? AND rfq_id = ?",
  ).bind(fileId, id).first<RfqFileRow>();
  if (!file) return json({ error: "File not found." }, 404);

  const object = await env.RFQ_FILES.get(file.object_key);
  if (!object) return json({ error: "File has expired or was removed." }, 410);

  const encodedName = encodeURIComponent(file.original_name).replaceAll("'", "%27");
  return new Response(object.body, {
    headers: {
      "Content-Type": file.content_type || "application/octet-stream",
      "Content-Length": String(object.size),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
