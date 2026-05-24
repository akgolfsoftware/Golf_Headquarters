// Supabase service-role klient — KUN for server-side admin-handlinger.
// Bruker SUPABASE_SERVICE_ROLE_KEY som har full DB-tilgang.
// Aldri eksponer denne klienten mot browser eller Client Components.
import "server-only";

import { createClient } from "@supabase/supabase-js";

let _admin: ReturnType<typeof createClient> | null = null;

export function supabaseAdmin() {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL mangler");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY mangler");
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}
