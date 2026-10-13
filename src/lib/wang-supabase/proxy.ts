import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";

export type WangProxySession =
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

export async function oppdaterWangProxySesjon(
  request: NextRequest,
  response: NextResponse,
): Promise<WangProxySession> {
  const url = process.env.NEXT_PUBLIC_WANG_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_WANG_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return { status: "unavailable" };

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("WANG auth timeout")), 3000),
      ),
    ]);

    if (!result.data.user) return { status: "unauthenticated" };
    return { status: "authenticated", user: result.data.user };
  } catch {
    return { status: "unavailable" };
  }
}
