// src/lib/meg/supabase.ts
// Service-role-klient mot Meg-databasen (separat fra golf-DB).
// Returnerer null hvis Meg ikke er konfigurert — krasjer aldri appen.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readMegEnv } from "@/lib/meg/env";

let _client: SupabaseClient | null = null;

/** Service-role-klient mot Meg-databasen. Returnerer null hvis Meg ikke er konfigurert. */
export function megSupabase(): SupabaseClient | null {
  if (_client) return _client;
  const env = readMegEnv();
  if (!env) return null;
  _client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
