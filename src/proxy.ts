// Next.js 16 proxy (tidligere "middleware" — renamet i v16).
// Refresher Supabase-sesjonen, genererer CSP-nonce, og beskytter
// /portal og /admin mot uautentisert tilgang.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/proxy";

// Permanent redirects fra gamle ruter til ny samle-side /admin/innboks.
const INNBOKS_REDIRECTS: Record<string, string> = {
  "/admin/queue": "oppfolging",
  "/admin/approvals": "godkjennelser",
  "/admin/messages": "meldinger",
};

// Demo/preview-ruter med mock-data — gates bak auth før launch (ikke offentlig).
const DEMO_PREFIXES = [
  "/demo",
  "/hull-demo",
  "/kalender-demo",
  "/kalender-maaned-demo",
  "/lokasjoner-demo",
  "/sesjon-opptak-demo",
  "/talent-kohort-demo",
  "/talent-region-pipeline-demo",
  "/talent-sammenlign-to-demo",
  "/talent-spiller-360-demo",
  "/coach-preview",
  "/portal-preview",
  "/v2-preview",
];

// Stats-sider som fortsatt har hardkodede design-/prototypedata (fabrikkerte
// spillere). Skjules i PRODUKSJON (redirect → /stats) til de er wired til ekte
// data. Lokalt/dev forblir de tilgjengelige for utvikling. Ekte sider beholdes:
// /stats (hub), /stats/norske, /stats/turneringer, /stats/aargang (hub).
const STATS_PROTOTYPE_PREFIXES = [
  "/stats/leaderboards",
  "/stats/regions",
  "/stats/klubber",
  "/stats/pga",
  "/stats/tour",
  "/stats/spillere",
  "/stats/verktoy",
  "/stats/sok",
];

/**
 * Bygg Content-Security-Policy-header med nonce.
 *
 * script-src bruker 'nonce-{nonce}' + 'strict-dynamic' slik at Next.js
 * inline-hydration-scripts passerer uten 'unsafe-inline'.
 * style-src tillater 'unsafe-inline' fordi Tailwind v4 + CSS custom props
 * bruker inline-stiler i komponent-kode.
 */
function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // Next.js hydration + Vercel Analytics + Stripe.js
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://vitals.vercel-insights.com`,
    // Tailwind v4 / React inline styles
    "style-src 'self' 'unsafe-inline'",
    // Supabase Storage + data-URI + blob (fil-previews)
    "img-src 'self' blob: data: https://eljkjqvggsmnbbszzbpj.supabase.co",
    // next/font serverer fonter fra self
    "font-src 'self'",
    // Fetch / WebSocket: Supabase Realtime, Stripe API, Vercel
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://vitals.vercel-insights.com",
    // Stripe embedded UI + same-origin (kreves av /admin/godkjenn-portal iframe)
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    // Klikkaperting-vern: tillat iframe fra samme domene (kreves av godkjenn-portal)
    "frame-ancestors 'self'",
    // Forhindre base-tag-injection
    "base-uri 'self'",
    // Forhindre skjema-kapring
    "form-action 'self'",
    // Blokker Flash/Java
    "object-src 'none'",
    // Tving HTTPS for sub-ressurser
    "upgrade-insecure-requests",
  ]
    .join("; ")
    .trim();
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Innboks-redirects trenger ikke CSP (redirect-responses rendrer ingen HTML).
  const innboksTab = INNBOKS_REDIRECTS[path];
  if (innboksTab) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/innboks";
    url.searchParams.set("tab", innboksTab);
    return NextResponse.redirect(url);
  }

  // Skjul prototype-stats-sider (hardkodede fake-spillere) i PRODUKSJON til de
  // er wired til ekte data. Redirect → /stats. Gjelder også /stats/aargang/<aar>
  // (per-årgang-detalj med fake roster), men ikke /stats/aargang-hub-en.
  if (process.env.VERCEL_ENV === "production") {
    const erStatsPrototype =
      STATS_PROTOTYPE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`)) ||
      // /stats/aargang-hub er ekte (re-aktivert), men per-årgang-detalj har fake roster.
      /^\/stats\/aargang\/.+/.test(path);
    if (erStatsPrototype) {
      const url = request.nextUrl.clone();
      url.pathname = "/stats";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // Generer per-request nonce — base64-encodet UUID, kryptografisk tilfeldig.
  // Sendes til updateSession slik at x-nonce-headeren er tilgjengelig i RSCs.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const response = await updateSession(request, nonce);

  const erDemo = DEMO_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
  const erBeskyttet =
    path.startsWith("/portal") ||
    path.startsWith("/admin") ||
    path.startsWith("/intern") ||
    erDemo;

  if (erBeskyttet) {
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
  }

  // Sett CSP på alle HTML-responses (ikke på redirects ovenfor).
  // Rolle-sjekk for /admin/* gjøres i src/app/admin/layout.tsx (RSC) via
  // requirePortalUser({ allow: ["ADMIN","COACH"] }) for å unngå Prisma-kall
  // her i proxy-laget. Proxy-en stopper kun uautentiserte requests.
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
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
