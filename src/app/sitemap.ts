import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statiske: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/priser`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/funksjoner`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/om-oss`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/forsta`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/for-klubber`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/book-demo`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/booking`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/last-ned-guide`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/vilkar`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/personvern`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Hent publiserte blogg-poster fra filsystem (content/blog/*.md)
  const blogPosts: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.publishedAt ? new Date(p.publishedAt) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Hent aktive service-typer for booking-deep-links
  const services = await prisma.serviceType.findMany({
    where: { active: true, priceOre: { gt: 0 } },
    select: { slug: true, updatedAt: true },
  });
  const bookingPages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE_URL}/booking/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...statiske, ...blogPosts, ...bookingPages];
}
