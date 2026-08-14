// Generated binding surface for local validation. Regenerate with `wrangler types`
// after Cloudflare resource IDs are provisioned.
interface Env {
  RFQ_DB: D1Database;
  RFQ_FILES: R2Bucket;
  PUBLIC_SITE_URL: string;
  RFQ_FROM_EMAIL: string;
  RFQ_NOTIFY_EMAIL: string;
  CF_ACCOUNT_ID: string;
  CF_EMAIL_API_TOKEN: string;
  MAX_FILE_BYTES: string;
  MAX_TOTAL_BYTES: string;
  MAX_FILE_COUNT: string;
}
