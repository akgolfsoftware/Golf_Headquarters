// Next.js 16 proxy (tidligere "middleware" — renamet i v16).
// Refresher Supabase-sesjonen og beskytter /portal og /admin mot uautentisert tilgang.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/proxy";

// Permanent redirects fra gamle ruter til ny samle-side /admin/innboks.
const INNBOKS_REDIRECTS: Record<string, string> = {
  "/admin/queue": "oppfolging",
  "/admin/approvals": "godkjennelser",
  "/admin/messages": "meldinger",
};

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Sidemeny-redirect for samle-sider (kun eksakt match — dyperuter består).
  const innboksTab = INNBOKS_REDIRECTS[path];
  if (innboksTab) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/innboks";
    url.searchParams.set("tab", innboksTab);
    return NextResponse.redirect(url);
  }

  const erBeskyttet =
    path.startsWith("/portal") || path.startsWith("/admin");
  if (!erBeskyttet) return response;

  // Sjekk auth-status via samme cookies som updateSession nettopp refresjet.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {
          // Ikke nødvendig her — updateSession har allerede skrevet cookies.
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Rolle-sjekk for /admin/* gjøres i src/app/admin/page.tsx (RSC) for å
  // unngå Prisma-kall i proxy. Proxy-en stopper kun uautentiserte requests.
  return response;
}

export const config = {
  matcher: [
    /*
     * Match alle paths UNNTATT:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, robots.txt, sitemap.xml
     * - statiske bildefiler
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
