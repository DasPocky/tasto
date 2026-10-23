-- Tipp-Tests: der vorgegebene Text eines Tests
CREATE TABLE tests (
  id TEXT PRIMARY KEY,
  language TEXT NOT NULL,
  period INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Ergebnisse (ein Test kann mehrfach gespielt werden, z. B. als Challenge)
CREATE TABLE performances (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL REFERENCES tests(id),
  score INTEGER NOT NULL,
  wpm REAL NOT NULL,
  cpm REAL NOT NULL,
  accuracy REAL NOT NULL,
  fixed INTEGER NOT NULL,
  -- Tastenprotokoll als JSON: [[key, code, ms], …]
  events TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX performances_score ON performances (score DESC);
CREATE INDEX performances_created ON performances (created_at DESC);
