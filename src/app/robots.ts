import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/portal/",
          "/admin/",
          "/api/",
          "/auth/",
          "/intern/",
          "/forelder/",
          "/onboard/",
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
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
