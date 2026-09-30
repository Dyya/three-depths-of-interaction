-- One row per finished version of a study. Numbers only; no identity.
CREATE TABLE IF NOT EXISTS runs (
  id         TEXT PRIMARY KEY,          -- server-side uuid
  created_at TEXT NOT NULL,             -- ISO time, server clock
  run        TEXT NOT NULL,             -- client uuid for one reader's session; links the versions and both studies
  study      INTEGER NOT NULL,          -- 1 save for later, 2 book a table
  version    TEXT NOT NULL,             -- study 1: A B C; study 2: fixed, generated, generated-rules
  seq        INTEGER,                   -- order in which this version was finished within the study, 1..n
  build      TEXT,                      -- demo build tag, so later changes can be told apart
  embed      INTEGER,                   -- 1 inside the article, 0 standalone
  pointer    TEXT,                      -- coarse, fine, unknown
  vw         INTEGER,                   -- viewport width rounded to 100
  is_repeat  INTEGER,                   -- 1 if this browser had already sent this study in an earlier session
  metrics    TEXT NOT NULL              -- JSON, whitelisted keys only
);
CREATE INDEX IF NOT EXISTS runs_run   ON runs (run);
CREATE INDEX IF NOT EXISTS runs_study ON runs (study, version);
