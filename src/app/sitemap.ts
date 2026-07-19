import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statiske: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/coaching`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/treningsfilosofi`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/playerhq`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/booking`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/om-oss`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/vilkar`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/personvern`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Hent aktive service-typer for booking-deep-links. Uten DB (build/CI med
  // dummy-URL) faller vi tilbake til de statiske sidene — bygget skal aldri
  // kreve en nåbar database.
  let services: { slug: string; updatedAt: Date }[] = [];
  try {
    services = await prisma.serviceType.findMany({
      where: { active: true, priceOre: { gt: 0 } },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    services = [];
  }
  const bookingPages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE_URL}/booking/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...statiske, ...bookingPages];
}
