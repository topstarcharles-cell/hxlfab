import {
  bearerToken,
  fileExtension,
  isAllowedFile,
  json,
  positiveInt,
  readRfq,
  safeFileName,
  tokenMatches,
} from "../../_shared";

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = String(params.id || "");
  const rfq = await readRfq(env, id);
  if (!rfq || !(await tokenMatches(bearerToken(request), rfq.upload_token_hash))) {
    return json({ error: "RFQ not found or upload permission expired." }, 404);
  }
  if (rfq.status !== "draft") {
    return json({ error: "This RFQ is already complete." }, 409);
  }

  let decodedName = "";
  try {
    decodedName = decodeURIComponent(request.headers.get("X-File-Name") || "");
  } catch {
    return json({ error: "The file name is not valid UTF-8." }, 400);
  }
  const name = safeFileName(decodedName);
  const declaredSize = Number.parseInt(request.headers.get("X-File-Size") || request.headers.get("Content-Length") || "0", 10);
  const maxFileBytes = positiveInt(env.MAX_FILE_BYTES, 104_857_600);
  const maxTotalBytes = positiveInt(env.MAX_TOTAL_BYTES, 209_715_200);
  const maxFileCount = positiveInt(env.MAX_FILE_COUNT, 10);

  if (!name || !isAllowedFile(name)) {
    return json({ error: "Unsupported file type. Upload a PCB production file or a ZIP/7Z archive." }, 415);
  }
  if (!Number.isFinite(declaredSize) || declaredSize <= 0) {
    return json({ error: "A valid file size is required." }, 411);
  }
  if (declaredSize > maxFileBytes || rfq.total_bytes + declaredSize > maxTotalBytes || rfq.file_count >= maxFileCount) {
    return json({ error: "This upload exceeds the RFQ file limit." }, 413);
  }
  if (!request.body) {
    return json({ error: "File body is required." }, 400);
  }

  const fileId = crypto.randomUUID();
  const extension = fileExtension(name);
  const objectKey = `rfqs/${id}/${fileId}${extension}`;
  const contentType = (request.headers.get("Content-Type") || "application/octet-stream").slice(0, 120);

  try {
    const object = await env.RFQ_FILES.put(objectKey, request.body, {
      httpMetadata: { contentType, contentDisposition: "attachment" },
      customMetadata: { rfqId: id, fileId, originalName: name },
    });

    if (object.size !== declaredSize || object.size > maxFileBytes) {
      await env.RFQ_FILES.delete(objectKey);
      return json({ error: "Uploaded file size did not match the declared size." }, 400);
    }

    await env.RFQ_DB.batch([
      env.RFQ_DB.prepare(
        "INSERT INTO rfq_files (id, rfq_id, created_at, object_key, original_name, content_type, size_bytes, etag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      ).bind(fileId, id, new Date().toISOString(), objectKey, name, contentType, object.size, object.etag),
      env.RFQ_DB.prepare(
        "UPDATE rfqs SET file_count = file_count + 1, total_bytes = total_bytes + ? WHERE id = ?",
      ).bind(object.size, id),
    ]);

    console.log(JSON.stringify({ event: "rfq_file_uploaded", id, fileId, size: object.size }));
    return json({ fileId, name, size: object.size }, 201);
  } catch (error) {
    await env.RFQ_FILES.delete(objectKey).catch(() => undefined);
    console.error(JSON.stringify({ event: "rfq_upload_failed", id, fileId, error: String(error) }));
    return json({ error: "The file could not be stored. Please retry." }, 500);
  }
};
