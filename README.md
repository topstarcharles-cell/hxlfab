# HXLFAB website and secure RFQ upload

This branch contains the redesigned HXLFAB manufacturing website and a Cloudflare Pages Functions backend for private PCB design-file uploads.

## Architecture

- `public/` — static website, quote configurator, drag-and-drop uploader
- `scripts/generate-seo-pages.mjs` — source data and shared template for product landing pages
- `functions/` — RFQ creation, streamed upload, completion email and protected download endpoints
- Cloudflare R2 binding `RFQ_FILES` — private Gerber/ODB++ archives
- Cloudflare D1 binding `RFQ_DB` — RFQ and file metadata
- Cloudflare Send Email binding `RFQ_EMAIL` — notification to `sales@hxlfab.com`

Customer files are never added to Git. The R2 bucket must remain private.

## SEO landing pages

Product and capability landing pages are generated into `public/<slug>/index.html`. After editing the page data or shared template, regenerate them with:

```bash
npm run generate:seo
```

Keep every canonical page in `public/sitemap.xml` and use the root domain `https://hxlfab.com/` as the only canonical host.

## Production provisioning

1. Create the R2 bucket and D1 database:

   ```bash
   npx wrangler r2 bucket create hxlfab-rfq-files
   npx wrangler d1 create hxlfab-rfq
   ```

2. Replace `REPLACE_AFTER_PROVISIONING` in `wrangler.jsonc` with the returned D1 database ID.

3. Apply the database migration:

   ```bash
   npx wrangler d1 migrations apply hxlfab-rfq --remote
   ```

4. Add a 60-day R2 lifecycle rule:

   ```bash
   npx wrangler r2 bucket lifecycle add hxlfab-rfq-files --expire-days 60
   ```

5. In Cloudflare Email Routing, verify `sales@hxlfab.com` as the allowed destination and enable the `RFQ_EMAIL` Send Email binding.

6. Configure the existing Cloudflare Pages project to use `public` as its build output directory, then deploy a preview branch before merging to `main`.

7. Regenerate bindings and validate:

   ```bash
   npx wrangler types worker-configuration.d.ts
   npm run typecheck
   ```

## Upload controls

- Same-origin API requests only
- Cryptographically random RFQ, upload and download tokens
- SHA-256 token storage and timing-safe comparison
- Extension allowlist for PCB production files and archives
- 100 MB per file, 200 MB per RFQ, 10 files maximum
- Streamed uploads to avoid buffering customer files in application memory
- Private, non-cacheable downloads
- 60-day R2 lifecycle deletion
- Structured operational logs without file contents or token values

ODB++ folders should be compressed into ZIP or 7Z before upload. Uploaded archives remain untrusted input and should be scanned by endpoint security before engineers open them.
