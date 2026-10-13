import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function hentWangSupabaseKonfigurasjon() {
  const url = process.env.NEXT_PUBLIC_WANG_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_WANG_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("WANG-databasen er ikke konfigurert i dette miljøet.");
  }

  return { url, publishableKey };
}

export async function opprettWangServerKlient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = hentWangSupabaseKonfigurasjon();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          return;
        }
      },
    },
  });
}
