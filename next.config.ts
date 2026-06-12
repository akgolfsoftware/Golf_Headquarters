import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Lås Turbopack-root til denne katalogen — uten dette feiler CSS-resolve
  // og dev-server kan havne i compile/render-loop (jf. CLAUDE.md gotcha).
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    remotePatterns: [
      // Supabase Storage (profilbilder)
      {
        protocol: "https",
        hostname: "eljkjqvggsmnbbszzbpj.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  // Konsolidering av duplikat-ruter i CoachHQ — norsk vinner.
  // Disse redirects fanger gamle URL-er (engelsk variant) og sender til
  // den kanoniske norske ruten. Kun root-path matches — subroutes som
  // /admin/bookings/ny beholdes uendret for å unngå å bryte interne lenker.
  async redirects() {
    return [
      // CoachHQ duplikatkonsolidering — engelsk → norsk, deltagamle → kanoniske.
      // Sub-paths (:path*) inkludert for å fange opp underruter etter sletting.
      { source: "/admin/bookings", destination: "/admin/bookinger", permanent: true },
      { source: "/admin/bookings/:path*", destination: "/admin/bookinger/:path*", permanent: true },
      { source: "/admin/groups", destination: "/admin/grupper", permanent: true },
      { source: "/admin/groups/:path*", destination: "/admin/grupper/:path*", permanent: true },
      { source: "/admin/elever", destination: "/admin/spillere", permanent: true },
      { source: "/admin/elever/:path*", destination: "/admin/spillere/:path*", permanent: true },
      { source: "/admin/calendar", destination: "/admin/kalender", permanent: true },
      { source: "/admin/calendar/:path*", destination: "/admin/kalender/:path*", permanent: true },
      { source: "/admin/capacity", destination: "/admin/kapasitet", permanent: true },
      { source: "/admin/capacity/:path*", destination: "/admin/kapasitet/:path*", permanent: true },
      { source: "/admin/analytics", destination: "/admin/analysere", permanent: true },
      { source: "/admin/analytics/:path*", destination: "/admin/analysere/:path*", permanent: true },
      // /admin/analyse: Stall-analyse-skjermen (fasit-port juni 2026) — redirecten
      // til /admin/analysere er fjernet (sidebar «Stall-analyse» peker hit).
      { source: "/admin/audit", destination: "/admin/audit-log", permanent: true },
      { source: "/admin/audit/:path*", destination: "/admin/audit-log/:path*", permanent: true },

      // Tilleggsredirects per plan Del 2 (canonical-ruter)
      { source: "/admin/locations", destination: "/admin/anlegg", permanent: true },
      { source: "/admin/facilities", destination: "/admin/anlegg", permanent: true },
      { source: "/admin/facilities/:id", destination: "/admin/anlegg/:id", permanent: true },
      { source: "/admin/approvals", destination: "/admin/godkjenninger", permanent: true },
      // /admin/plan-templates er nå kanonisk skjerm (fasit-port juni 2026) —
      // redirecten til /admin/plans/templates er fjernet.
      { source: "/admin/notion-prosjekter", destination: "/admin/workspace/notion", permanent: true },
      { source: "/admin/notion-prosjekter/:path*", destination: "/admin/workspace/notion/:path*", permanent: true },
      { source: "/admin/notion-oppgaver", destination: "/admin/workspace/oppgaver", permanent: true },
      { source: "/admin/notion-oppgaver/:path*", destination: "/admin/workspace/oppgaver/:path*", permanent: true },
      { source: "/admin/messages", destination: "/admin/innboks", permanent: true },
      { source: "/admin/meg", destination: "/admin/profile", permanent: true },
      { source: "/admin/meg/:path*", destination: "/admin/profile/:path*", permanent: true },

      // PlayerHQ IA-restrukturering 2026-05-22 (master-plan)
      // Gamle ruter -> nye hovedseksjoner under /portal
      { source: "/portal/innsikt", destination: "/portal/analysere", permanent: true },
      { source: "/portal/innsikt/:path*", destination: "/portal/analysere/:path*", permanent: true },
      { source: "/portal/analyse", destination: "/portal/analysere", permanent: true },
      { source: "/portal/analyse/:path*", destination: "/portal/analysere/:path*", permanent: true },
      { source: "/portal/profil", destination: "/portal/meg", permanent: true },
      { source: "/portal/profil/:path*", destination: "/portal/meg/:path*", permanent: true },
      { source: "/portal/coach/notater", destination: "/portal/coach/notes", permanent: true },
      { source: "/portal/coach/notater/:path*", destination: "/portal/coach/notes/:path*", permanent: true },
      // /portal/statistikk: v10-side m/ full implementasjon (juni 2026) — redirect fjernet.
      // IA 2026-06-01 (dedikerte sider): skyggende redirects fjernet — menyen peker nå rett på de
      // ekte sidene. /portal/mal (930l), /portal/kalender, /portal/tren/teknisk-plan (419l) og
      // /portal/tren/turneringer er nå direkte tilgjengelige (var skjult bak ?tab=-redirects).
      { source: "/portal/tren/ovelser", destination: "/portal/drills", permanent: true },
      { source: "/portal/tren/ovelser/:path*", destination: "/portal/drills/:path*", permanent: true },
      // /portal/tren/tester: dedikert test-batteri-skjerm (redesign 2026-06-01) — loop-redirect fjernet.
      { source: "/portal/tren/kalender", destination: "/portal/gjennomfore?tab=kalender", permanent: true },
      { source: "/portal/tren/kalender/:path*", destination: "/portal/gjennomfore?tab=kalender", permanent: true },
      { source: "/portal/tren", destination: "/portal/planlegge?tab=treningsplan", permanent: true },
      // /portal/talent er nå egen hub (Del 32 — Manglende hubs hand-off 2026-05-24)
      // Underruter beholdes for talent-detalj-flow
      { source: "/portal/talent/:path*", destination: "/portal/talent/:path*", permanent: false },
      { source: "/portal/trackman", destination: "/portal/analysere?tab=trackman", permanent: true },
      { source: "/portal/trackman/:path*", destination: "/portal/analysere?tab=trackman", permanent: true },
      // /portal/booking: dedikert booking-hub m/ credits (redesign 2026-06-01) — loop-redirect fjernet.
      { source: "/portal/ny-okt", destination: "/portal/gjennomfore/ny-okt", permanent: true },

      // ============================================================
      // Nye IA-URL-er → eksisterende ruter (2026-05-23)
      // Holder master-plan-IA fungerende uten å duplisere kode
      // ============================================================

      // PlayerHQ Analysere
      { source: "/portal/analysere/runder/:id", destination: "/portal/mal/runder/:id", permanent: false },
      { source: "/portal/analysere/runder/:id/del", destination: "/portal/statistikk/runder/:id/del", permanent: false },
      { source: "/portal/analysere/runder/ny", destination: "/portal/mal/runder/ny", permanent: false },
      { source: "/portal/analysere/tester/:id", destination: "/portal/tren/tester/:id", permanent: false },
      { source: "/portal/analysere/sammenlign", destination: "/portal/statistikk/sammenlign", permanent: false },
      { source: "/portal/analysere/metric/:metric", destination: "/portal/statistikk/:metric", permanent: false },

      // PlayerHQ Gjennomføre — booking-flyt
      { source: "/portal/gjennomfore/booking/coach/:id", destination: "/portal/booking/coach/:id", permanent: false },
      { source: "/portal/gjennomfore/booking/anlegg/:id", destination: "/portal/booking/anlegg/:id", permanent: false },
      { source: "/portal/gjennomfore/booking/:id", destination: "/portal/booking/:id", permanent: false },
      { source: "/portal/gjennomfore/onskeligokt/bekreftet", destination: "/portal/onskeligokt/bekreftet", permanent: false },
      { source: "/portal/gjennomfore/ny-okt", destination: "/portal/ny-okt", permanent: false },

      // PlayerHQ Planlegge
      { source: "/portal/planlegge/turnering/:id", destination: "/portal/tren/turneringer/:id", permanent: false },

      // CoachHQ sub-routes
      { source: "/admin/planlegge/grupper/:id", destination: "/admin/grupper/:id", permanent: false },
      { source: "/admin/gjennomfore/bookinger/ny", destination: "/admin/bookinger/ny", permanent: false },
      { source: "/admin/gjennomfore/anlegg/:id", destination: "/admin/anlegg/:id", permanent: false },
      { source: "/admin/stall/caddie/:spillerId", destination: "/admin/agencyos/caddie/aktivitet", permanent: false },
      { source: "/admin/analysere/godkjenninger/:id", destination: "/admin/godkjenninger", permanent: false },
    ];
  },

  // Security headers (P15 — kritisk for launch per datasikkerhets-audit)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // SAMEORIGIN tillater iframe fra samme domene (kreves av
          // /admin/godkjenn-portal for å vise live portal-sider i iframe).
          // Eksternt iframe-bruk blokkeres fortsatt av frame-ancestors i CSP.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

// PWA service worker via Serwist. Genererer /sw.js fra src/app/sw.ts.
// Disabled i dev for å unngå caching-overraskelser ved HMR.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(withMDX(nextConfig));
