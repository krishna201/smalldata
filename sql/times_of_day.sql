
BEGIN;

  CREATE TABLE time_utc (
    iso_8601 TEXT NOT NULL PRIMARY KEY,
    seconds_in_day INTEGER NOT NULL,
    HH TEXT NOT NULL,
    MM TEXT NOT NULL,
    SS TEXT NOT NULL,
    bucket TEXT NOT NULL
  );

  CREATE TABLE time_user (
    iso_8601 TEXT NOT NULL PRIMARY KEY,
    seconds_in_day INTEGER NOT NULL,
    HH TEXT NOT NULL,
    MM TEXT NOT NULL,
    SS TEXT NOT NULL,
    bucket TEXT NOT NULL
  );



COMMIT;