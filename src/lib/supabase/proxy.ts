// Supabase-sesjons-refresh i middleware.
// Kalles fra src/proxy.ts. Refresher access token automatisk og
// oppdaterer cookies på request + response.
//
// CSP må også følge forespørselen: Next leser nonce derfra og setter den
// på egne skript. x-nonce alene gjør ikke dette. Bevares ved cookie-refresh.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest, nonce: string, csp: string) {
  // Overskriv eventuelle klientverdier med serverens policy og nonce.
  function buildReqHeaders(): Headers {
    const h = new Headers(request.headers);
    h.set("x-nonce", nonce);
    h.set("Content-Security-Policy", csp);
    // Path for RootLayout tema (SSR) — unngår inline <script> / hydration-støy
    h.set("x-pathname", request.nextUrl.pathname);
    return h;
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: buildReqHeaders() },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Gjenskaper response med oppdatert nonce-header etter cookie-refresh.
          supabaseResponse = NextResponse.next({
            request: { headers: buildReqHeaders() },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // VIKTIG: getUser() — ikke getSession() — i middleware.
  // getSession() leser fra cookies uten å validere mot Supabase Auth.
  // En utløpt/ugyldig refresh-token (f.eks. etter passord-reset) kan kaste
  // AuthApiError her i stedet for å returnere et error-objekt — fang den så
  // brukeren faller tilbake til "ikke innlogget" og redirectes til login av
  // route-guarden, i stedet for at siden krasjer med en generisk feil.
  try {
    await supabase.auth.getUser();
  } catch (err) {
    console.error("[proxy] Supabase getUser() feilet — behandler som ikke innlogget", err);
  }

  return supabaseResponse;
}
