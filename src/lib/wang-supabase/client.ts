"use client";

import { createBrowserClient } from "@supabase/ssr";

export function opprettWangNettleserKlient() {
  const url = process.env.NEXT_PUBLIC_WANG_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_WANG_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("WANG-databasen er ikke konfigurert i dette miljøet.");
  }

  return createBrowserClient(url, publishableKey);
}
