import { cleanText, hashToken, isEmail, json, makeRfqId, makeToken } from "../_shared";

type CreateRfqBody = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  targetDate?: unknown;
  productType?: unknown;
  notes?: unknown;
  quote?: unknown;
  website?: unknown;
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    return json({ error: "Expected JSON request." }, 415);
  }

  let body: CreateRfqBody;
  try {
    body = await request.json<CreateRfqBody>();
  } catch {
    return json({ error: "Invalid JSON request." }, 400);
  }

  if (cleanText(body.website, 120)) {
    return json({ error: "Request rejected." }, 400);
  }

  const name = cleanText(body.name, 100);
  const email = cleanText(body.email, 254).toLowerCase();
  const company = cleanText(body.company, 160);
  const targetDate = cleanText(body.targetDate, 20);
  const productType = cleanText(body.productType, 100);
  const notes = cleanText(body.notes, 3000);

  if (!name || !company || !productType || !isEmail(email)) {
    return json({ error: "Name, company, work email and product type are required." }, 400);
  }
  if (!body.quote || typeof body.quote !== "object" || Array.isArray(body.quote)) {
    return json({ error: "A complete PCB configuration is required." }, 400);
  }

  const quoteJson = JSON.stringify(body.quote);
  if (quoteJson.length > 16_000) {
    return json({ error: "PCB configuration is too large." }, 413);
  }

  const id = makeRfqId();
  const uploadToken = makeToken();
  const accessToken = makeToken();
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 60 * 24 * 60 * 60 * 1000);

  try {
    await env.RFQ_DB.prepare(
      `INSERT INTO rfqs (
        id, created_at, expires_at, status, name, email, company, target_date,
        product_type, quote_json, notes, upload_token_hash, access_token_hash
      ) VALUES (?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      id,
      createdAt.toISOString(),
      expiresAt.toISOString(),
      name,
      email,
      company,
      targetDate || null,
      productType,
      quoteJson,
      notes || null,
      await hashToken(uploadToken),
      await hashToken(accessToken),
    ).run();
  } catch (error) {
    console.error(JSON.stringify({ event: "rfq_create_failed", id, error: String(error) }));
    return json({ error: "Unable to create the RFQ. Please try again." }, 500);
  }

  console.log(JSON.stringify({ event: "rfq_created", id }));
  return json({ id, uploadToken, accessToken, expiresAt: expiresAt.toISOString() }, 201);
};
