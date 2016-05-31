
BEGIN;

  CREATE TABLE date_utc (
    iso_8601 TEXT PRIMARY KEY,
    yyyy TEXT NOT NULL,
    yy TEXT NOT NULL,
    mmmm TEXT NOT NULL,
    mmm TEXT NOT NULL,
    mm TEXT NOT NULL,
    dd TEXT NOT NULL,
    ddd TEXT NOT NULL,
    dddd TEXT NOT NULL,
    q TEXT NOT NULL
  );

  CREATE TABLE date_user (
    iso_8601 TEXT PRIMARY KEY,
    yyyy TEXT NOT NULL,
    yy TEXT NOT NULL,
    mmmm TEXT NOT NULL,
    mmm TEXT NOT NULL,
    mm TEXT NOT NULL,
    dd TEXT NOT NULL,
    ddd TEXT NOT NULL,
    dddd TEXT NOT NULL,
    q TEXT NOT NULL
  );

COMMIT;
