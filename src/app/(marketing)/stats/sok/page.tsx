/**
 * /stats/sok — Global søk
 * Design-brief 27-global-sok.md
 *
 * Server-rendered med GET-form + URL: /stats/sok?q=hovland&type=norske
 * Delegerer live-søk til SokClient.
 */

import "../stats.css";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatsEyebrow } from "@/components/stats/eyebrow";
import { Reveal } from "@/components/stats/reveal";
import { SokClient } from "./sok-client";

export const revalidate = 0; // Aldri caches — søk er alltid live

export const metadata: Metadata = {
  title: "Søk — AK Golf Stats",
  description:
    "Søk i hele AK Golf Stats. Finn norske spillere, PGA Tour-spillere, klubber, turneringer og artikler på ett sted.",
  alternates: { canonical: "https://akgolf.no/stats/sok" },
  openGraph: {
    title: "Søk — AK Golf Stats",
    url: "https://akgolf.no/stats/sok",
  },
  robots: { index: false }, // Søkesider skal ikke indekseres
};

// ---------------------------------------------------------------------------
// Server-side søk (kjøres ved direktelenke med ?q=)
// ---------------------------------------------------------------------------

async function serverSok(q: string) {
  if (!q || q.length < 2) return null;

  const [norskeSpillere, pgaSpillere, turneringer] = await Promise.all([
    prisma.publicPlayer
      .findMany({
        where: {
          country: "NO",
          isActive: true,
          name: { contains: q, mode: "insensitive" },
        },
        take: 10,
        select: { slug: true, name: true, tier: true, bio: true },
      })
      .catch(() => []),
    prisma.pgaPlayerSeason
      .findMany({
        where: {
          playerName: { contains: q, mode: "insensitive" },
          year: 2026,
        },
        take: 10,
        orderBy: { sgTotal: "desc" },
        select: { playerName: true, dgPlayerId: true, sgTotal: true },
      })
      .catch(() => []),
    prisma.tournament
      .findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
          mergedIntoId: null,
        },
        orderBy: { startDate: "desc" },
        take: 10,
        select: { slug: true, name: true, startDate: true, tour: true },
      })
      .catch(() => []),
  ]);

  return { norskeSpillere, pgaSpillere, turneringer };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function SokPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; year?: string }>;
}) {
  const { q = "", type = "alle", year = "alle" } = await searchParams;
  const serverResultater = await serverSok(q);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="stats-hero compact">
        <Reveal>
          <StatsEyebrow>AK Golf Stats · Søk</StatsEyebrow>
          <h1>
            Søk{" "}
            <em className="stats-italic-accent">alt</em>.
          </h1>
          <p className="stats-hero-sub" style={{ maxWidth: 520 }}>
            Spillere, turneringer, klubber, artikler — alt i én søkeboks.
          </p>
        </Reveal>
      </section>

      {/* ── SOK-KLIENT ── */}
      <SokClient
        initialQuery={q}
        initialType={type}
        initialYear={year}
        serverResultater={serverResultater}
      />
    </div>
  );
}
