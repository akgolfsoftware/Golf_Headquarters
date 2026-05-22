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
