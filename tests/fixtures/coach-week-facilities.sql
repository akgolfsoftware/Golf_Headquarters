-- Separate synthetic schema only; never a migration or production data.
CREATE TABLE player_facilities (
  id text PRIMARY KEY,
  "userId" text NOT NULL REFERENCES users(id),
  name text NOT NULL,
  notes text,
  capabilities text[] NOT NULL DEFAULT ARRAY[]::text[]
);
