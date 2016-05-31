
BEGIN;

  CREATE TABLE viewing_facts (
    id SERIAL PRIMARY KEY, -- doing this for MassiveJS
    date_utc TEXT NOT NULL REFERENCES date_utc(iso_8601),
    time_utc TEXT NOT NULL REFERENCES time_utc(iso_8601),
    date_user TEXT NOT NULL REFERENCES date_user(iso_8601),
    time_user TEXT NOT NULL REFERENCES time_user(iso_8601),
    visitor_id INTEGER NOT NULL REFERENCES visitors(id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    session_key TEXT NOT NULL, -- Degenerate. Could be a dimension with start stop time and percentage viewed etc...
    enter INTEGER DEFAULT 0,  -- not currently implemented
    exit INTEGER DEFAULT 0,   -- not currently implemented
    viewing_seconds INTEGER DEFAULT 1
  );

COMMIT;
