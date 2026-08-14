import { bearerToken, json, readRfq, tokenMatches } from "../../_shared";
import type { RfqFileRow } from "../../_shared";

type CompleteBody = { accessToken?: unknown };

type Notification = {
  id: string;
  customerEmail: string;
  company: string;
  text: string;
};

async function sendRfqNotification(env: Env, notification: Notification): Promise<void> {
  const accountId = env.CF_ACCOUNT_ID.trim();
  const apiToken = env.CF_EMAIL_API_TOKEN.trim();
  const from = env.RFQ_FROM_EMAIL.trim();
  const to = env.RFQ_NOTIFY_EMAIL.trim();

  if (!accountId || !apiToken || !from || !to) {
    throw new Error("RFQ email notification secrets are not fully configured.");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/email/sending/send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { address: from, name: "HXLFAB RFQ" },
        to,
        reply_to: notification.customerEmail,
        subject: `[${notification.id}] New PCB RFQ from ${notification.company}`,
        text: notification.text,
      }),
    },
  );

  await response.body?.cancel();
  if (!response.ok) {
    throw new Error(`Cloudflare Email Service returned HTTP ${response.status}.`);
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const id = String(params.id || "");
  const rfq = await readRfq(env, id);
  if (!rfq || !(await tokenMatches(bearerToken(request), rfq.upload_token_hash))) {
    return json({ error: "RFQ not found or completion permission expired." }, 404);
  }

  let body: CompleteBody = {};
  try {
    body = await request.json<CompleteBody>();
  } catch {
    return json({ error: "Invalid completion request." }, 400);
  }
  const accessToken = typeof body.accessToken === "string" ? body.accessToken : "";
  if (!(await tokenMatches(accessToken, rfq.access_token_hash))) {
    return json({ error: "Invalid access token." }, 403);
  }
  if (rfq.file_count < 1) {
    return json({ error: "Upload at least one design file before completing the RFQ." }, 400);
  }

  const { results: files } = await env.RFQ_DB.prepare(
    "SELECT id, original_name, object_key, content_type, size_bytes FROM rfq_files WHERE rfq_id = ? ORDER BY created_at",
  ).bind(id).all<RfqFileRow>();

  await env.RFQ_DB.prepare(
    "UPDATE rfqs SET status = 'complete', completed_at = ? WHERE id = ?",
  ).bind(new Date().toISOString(), id).run();

  const siteUrl = env.PUBLIC_SITE_URL.replace(/\/$/, "");
  const quote = JSON.parse(rfq.quote_json) as Record<string, unknown>;
  const fileLines = files.map((file) => {
    const link = `${siteUrl}/api/rfqs/${encodeURIComponent(id)}/download/${encodeURIComponent(file.id)}?token=${encodeURIComponent(accessToken)}`;
    return `- ${file.original_name} (${(file.size_bytes / 1_048_576).toFixed(2)} MB)\n  ${link}`;
  });
  const quoteLines = Object.entries(quote).map(([key, value]) => `${key}: ${String(value)}`);
  const text = [
    `New HXLFAB RFQ: ${id}`,
    "",
    `Customer: ${rfq.name}`,
    `Company: ${rfq.company}`,
    `Email: ${rfq.email}`,
    "",
    "PCB configuration",
    ...quoteLines,
    "",
    "Private design files (links expire when stored files are deleted)",
    ...fileLines,
    "",
    "Do not forward file links outside the HXLFAB quotation team.",
  ].join("\n");

  context.waitUntil(
    sendRfqNotification(env, {
      id,
      customerEmail: rfq.email,
      company: rfq.company,
      text,
    }).then(
      () => console.log(JSON.stringify({ event: "rfq_notification_sent", id })),
      (error) => console.error(JSON.stringify({ event: "rfq_notification_failed", id, error: String(error) })),
    ),
  );

  return json({ id, status: "complete", files: files.map(({ id: fileId, original_name, size_bytes }) => ({ fileId, name: original_name, size: size_bytes })) });
};
