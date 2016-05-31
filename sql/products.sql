
BEGIN;

  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    media_id TEXT NOT NULL,
    second INTEGER NOT NULL,
    length_in_seconds INTEGER NOT NULL,
    title TEXT NOT NULL,
    name TEXT NOT NULL,
    decile INTEGER NOT NULL,
    quartile INTEGER NOT NULL,
    transition TEXT NOT NULL
  );

COMMIT;
