CREATE TABLE IF NOT EXISTS rfqs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'complete')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  target_date TEXT,
  product_type TEXT NOT NULL,
  quote_json TEXT NOT NULL,
  notes TEXT,
  upload_token_hash TEXT NOT NULL,
  access_token_hash TEXT NOT NULL,
  file_count INTEGER NOT NULL DEFAULT 0,
  total_bytes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rfq_files (
  id TEXT PRIMARY KEY,
  rfq_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  etag TEXT NOT NULL,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rfq_files_rfq_id ON rfq_files(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON rfqs(created_at);
