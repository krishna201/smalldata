
BEGIN;

  CREATE TABLE visitors (
    id SERIAL PRIMARY KEY,
    visitor_key TEXT NOT NULL,
    created_at TEXT,
    load_count INTEGER,
    play_count INTEGER,
    browser TEXT,
    browser_version TEXT,
    platform TEXT,
    mobile TEXT
  );

COMMIT;
