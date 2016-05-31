
BEGIN;

  CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    ip TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    lat DECIMAL,
    lon DECIMAL,
    org TEXT
  );

COMMIT;
