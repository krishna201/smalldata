
BEGIN;

  DROP TABLE IF EXISTS viewing_facts;
  DROP TABLE IF EXISTS date_utc;
  DROP TABLE IF EXISTS date_user;
  DROP TABLE IF EXISTS time_utc;
  DROP TABLE IF EXISTS time_user;
  DROP TABLE IF EXISTS products;
  DROP TABLE IF EXISTS locations;
  DROP TABLE IF EXISTS visitors;

COMMIT;
