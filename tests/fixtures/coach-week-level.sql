-- Synthetic upstream stand-in, only inside the guarded random local schema.
-- This tests HQ's projection/locks, not the production pipeline implementation.
CREATE TABLE profile_links (id bigserial PRIMARY KEY, hq_user_id text NOT NULL, status text NOT NULL);
CREATE TABLE profile_niva_fixture (user_id text PRIMARY KEY, profile jsonb NOT NULL);
CREATE FUNCTION player_profile_for_user(player_id text, include_golf_id boolean)
RETURNS jsonb LANGUAGE sql STABLE AS $$
  SELECT profile FROM profile_niva_fixture WHERE user_id = player_id
    AND EXISTS (SELECT 1 FROM profile_links WHERE hq_user_id = player_id AND status = 'confirmed')
$$;
