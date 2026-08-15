# HXLFAB website and secure RFQ upload

This branch contains the redesigned HXLFAB manufacturing website and a Cloudflare Pages Functions backend for private PCB design-file uploads.

## Architecture

- `public/` — static website, quote configurator, drag-and-drop uploader
- `scripts/generate-seo-pages.mjs` — source data and shared template for product landing pages
- `scripts/generate-trust-pages.mjs` — source and templates for quality, factory, commercial-process, team, contact and privacy pages
- `functions/` — RFQ creation, streamed upload, completion email and protected download endpoints
- Cloudflare R2 binding `RFQ_FILES` — private Gerber/ODB++ archives
- Cloudflare D1 binding `RFQ_DB` — RFQ and file metadata
- Cloudflare Email Service API — RFQ notification using project secrets

Customer files are never added to Git. The R2 bucket must remain private.

## SEO landing pages

Product, capability and trust pages are generated into `public/<slug>/index.html`. After editing either shared template, regenerate all generated pages and the sitemap with:

```bash
npm run generate
```

Keep every canonical page in `public/sitemap.xml` and use the root domain `https://hxlfab.com/` as the only canonical host.

## Production provisioning

1. Create the R2 bucket and D1 database:

   ```bash
   npx wrangler r2 bucket create hxlfab-rfq-files
   npx wrangler d1 create hxlfab-rfq
   ```

2. Put the returned D1 database ID in `wrangler.jsonc`.

3. Apply the database migration:

   ```bash
   npx wrangler d1 migrations apply hxlfab-rfq --remote
   ```

4. Add a 60-day R2 lifecycle rule:

   ```bash
   npx wrangler r2 bucket lifecycle add hxlfab-rfq-files --expire-days 60
   ```

5. Configure these encrypted Pages production secrets for RFQ notifications:

   - `CF_ACCOUNT_ID`
   - `CF_EMAIL_API_TOKEN`
   - `RFQ_FROM_EMAIL`
   - `RFQ_NOTIFY_EMAIL`

   The API token must be scoped to the Cloudflare Email Sending API, and the sender/destination must be valid for the account.

6. Configure the existing Cloudflare Pages project to use `public` as its build output directory, then deploy a preview branch before merging to `main`.

7. Regenerate bindings and validate:

   ```bash
   npx wrangler types worker-configuration.d.ts
   npm run validate:site
   npm run typecheck
   npm run check
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
