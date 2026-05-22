import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
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
      { source: "/admin/bookings", destination: "/admin/bookinger", permanent: true },
      { source: "/admin/groups", destination: "/admin/grupper", permanent: true },
      { source: "/admin/elever", destination: "/admin/spillere", permanent: true },
      { source: "/admin/calendar", destination: "/admin/kalender", permanent: true },
      { source: "/admin/capacity", destination: "/admin/kapasitet", permanent: true },
      { source: "/admin/analytics", destination: "/admin/analyse", permanent: true },
      { source: "/admin/audit", destination: "/admin/audit-log", permanent: true },

      // PlayerHQ IA-restrukturering 2026-05-22 (master-plan)
      // Gamle ruter -> nye hovedseksjoner under /portal
      { source: "/portal/innsikt", destination: "/portal/analysere", permanent: true },
      { source: "/portal/statistikk", destination: "/portal/analysere?tab=statistikk", permanent: true },
      { source: "/portal/statistikk/:path*", destination: "/portal/analysere?tab=statistikk", permanent: true },
      { source: "/portal/mal", destination: "/portal/planlegge?tab=mal", permanent: true },
      { source: "/portal/kalender", destination: "/portal/gjennomfore?tab=kalender", permanent: true },
      { source: "/portal/tren/aarsplan", destination: "/portal/planlegge?tab=arsplan", permanent: true },
      { source: "/portal/tren/aarsplan/:path*", destination: "/portal/planlegge?tab=arsplan", permanent: true },
      { source: "/portal/tren/teknisk-plan", destination: "/portal/planlegge?tab=treningsplan", permanent: true },
      { source: "/portal/tren/teknisk-plan/:path*", destination: "/portal/planlegge?tab=treningsplan", permanent: true },
      { source: "/portal/tren/turneringer", destination: "/portal/planlegge?tab=turneringer", permanent: true },
      { source: "/portal/tren/turneringer/:path*", destination: "/portal/planlegge?tab=turneringer", permanent: true },
      { source: "/portal/tren/ovelser", destination: "/portal/planlegge?tab=drills", permanent: true },
      { source: "/portal/tren/ovelser/:path*", destination: "/portal/planlegge?tab=drills", permanent: true },
      { source: "/portal/tren/tester", destination: "/portal/analysere?tab=tester", permanent: true },
      { source: "/portal/tren/tester/:path*", destination: "/portal/analysere?tab=tester", permanent: true },
      { source: "/portal/tren/kalender", destination: "/portal/gjennomfore?tab=kalender", permanent: true },
      { source: "/portal/tren/kalender/:path*", destination: "/portal/gjennomfore?tab=kalender", permanent: true },
      { source: "/portal/tren", destination: "/portal/planlegge?tab=treningsplan", permanent: true },
      { source: "/portal/talent", destination: "/portal/analysere?tab=talent", permanent: true },
      { source: "/portal/talent/:path*", destination: "/portal/analysere?tab=talent", permanent: true },
      { source: "/portal/trackman", destination: "/portal/analysere?tab=trackman", permanent: true },
      { source: "/portal/trackman/:path*", destination: "/portal/analysere?tab=trackman", permanent: true },
      { source: "/portal/booking", destination: "/portal/gjennomfore?tab=booking", permanent: true },
      { source: "/portal/booking/:path*", destination: "/portal/gjennomfore?tab=booking", permanent: true },
      { source: "/portal/ny-okt", destination: "/portal/gjennomfore/ny-okt", permanent: true },
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

export default withSerwist(nextConfig);
