/**
 * /stats/spillere — Norsk golf-spillerdatabase
 *
 * Søkbar offentlig liste over norske spillere med resultater fra
 * Srixon Tour, OLYO, Norges Cup og Østlandstour 2016-2026.
 *
 * ISR: 1 time revalidate. Server Component med GET-søk via searchParams.
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Norsk spillerdatabase — AK Golf Stats",
  description:
    "Søk opp norske golfspillere og se komplette turneringsresultater fra Srixon Tour, OLYO, Norges Cup og Østlandstour 2016–2026. Gratis fra AK Golf.",
  alternates: { canonical: "https://akgolf.no/stats/spillere" },
  openGraph: {
    title: "Norsk spillerdatabase — AK Golf Stats",
    description:
      "Søk opp norske golfspillere og se komplette turneringsresultater fra 10 år med norsk golf.",
    url: "https://akgolf.no/stats/spillere",
    type: "website",
  },
};

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

async function hentSideData(
  q: string | undefined,
  aar: string | undefined,
) {
  const [totalSpillere, totalTurneringer, totalResultater] = await Promise.all([
    prisma.publicPlayer.count({ where: { country: "NO", isActive: true } }),
    prisma.tournament.count({ where: { mergedIntoId: null } }),
    prisma.publicPlayerEntry.count(),
  ]);

  const navnFilter = q && q.trim().length > 0
    ? { name: { contains: q.trim(), mode: "insensitive" as const } }
    : {};

  const birthYearFilter =
    aar && /^\d{4}$/.test(aar) ? { birthYear: parseInt(aar, 10) } : {};

  const spillere = await prisma.publicPlayer.findMany({
    where: {
      country: "NO",
      isActive: true,
      ...navnFilter,
      ...birthYearFilter,
    },
    orderBy: { name: "asc" },
    take: 50,
    select: {
      id: true,
      slug: true,
      name: true,
      birthYear: true,
      tier: true,
      bio: true,
      _count: { select: { entries: true } },
    },
  });

  return { totalSpillere, totalTurneringer, totalResultater, spillere };
}

// Hent de 10 siste årgangene der vi har spillere
async function hentAarganger(): Promise<number[]> {
  const rows = await prisma.publicPlayer.findMany({
    where: { country: "NO", isActive: true, birthYear: { not: null } },
    select: { birthYear: true },
    distinct: ["birthYear"],
    orderBy: { birthYear: "desc" },
    take: 10,
  });
  return rows
    .map((r) => r.birthYear)
    .filter((y): y is number => y !== null);
}

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

/** Hent klubb fra bio-feltet. Format: "Klubb: Navn" eller bare første setning. */
function parseKlubb(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/[Kk]lubb:\s*([^\n.]+)/);
  if (match) return match[1].trim();
  return null;
}

function formaterTier(tier: string): string {
  switch (tier) {
    case "amateur":
      return "Amateur";
    case "junior":
      return "Junior";
    case "pro-pga":
      return "PGA Pro";
    case "pro-dp":
      return "DP World Pro";
    case "pro-lpga":
      return "LPGA Pro";
    case "college":
      return "College";
    default:
      return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpillerdatabasePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const aar = typeof params.aar === "string" ? params.aar : undefined;

  const [{ totalSpillere, totalTurneringer, totalResultater, spillere }, aarganger] =
    await Promise.all([hentSideData(q, aar), hentAarganger()]);

  const harFilter = Boolean(q || aar);

  return (
    <div className="bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <Link
            href="/stats"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake til AK Golf Stats
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <AthleticEyebrow tone="lime">
              Norsk golf · Spillerdatabase
            </AthleticEyebrow>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Norsk golf-database —{" "}
              <em className="font-normal italic text-primary">
                alle spillere
              </em>{" "}
              ett sted.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.6] text-muted-foreground md:text-[18px]">
              Komplett resultathistorikk fra 10 år med norsk golf. Srixon Tour,
              OLYO, Norges Cup og Østlandstour 2016–2026 — alle runder, alle
              tourer.
            </p>

            {/* Snapshot-tall */}
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3">
              <SnapshotKort
                ikon={<Users className="h-4 w-4" />}
                tall={totalSpillere.toLocaleString("nb-NO")}
                label="Norske spillere"
              />
              <SnapshotKort
                ikon={<Trophy className="h-4 w-4" />}
                tall={totalTurneringer.toLocaleString("nb-NO")}
                label="Turneringer"
              />
              <SnapshotKort
                ikon={<Search className="h-4 w-4" />}
                tall={totalResultater.toLocaleString("nb-NO")}
                label="Registrerte resultater"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SØK OG FILTER */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Søkeboks */}
          <form method="GET" className="flex gap-3">
            {aar && (
              <input type="hidden" name="aar" value={aar} />
            )}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Søk etter spiller..."
                autoComplete="off"
                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Søk
            </button>
            {harFilter && (
              <Link
                href="/stats/spillere"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
              >
                Nullstill
              </Link>
            )}
          </form>

          {/* Årgangfilter */}
          {aarganger.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="self-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Årsklasse:
              </span>
              {aarganger.map((y) => (
                <Link
                  key={y}
                  href={`/stats/spillere?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    aar: String(y),
                  }).toString()}`}
                  className={`rounded-full px-3 py-0.5 font-mono text-[11px] font-medium transition-colors ${
                    aar === String(y)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {y}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* RESULTATLISTE */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {/* Teller */}
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {harFilter
              ? `${spillere.length} treff${spillere.length === 50 ? " (viser de første 50)" : ""}`
              : `Viser ${spillere.length} av ${totalSpillere.toLocaleString("nb-NO")} spillere`}
          </p>

          {spillere.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-16 text-center">
              <Users
                className="mx-auto h-10 w-10 text-muted-foreground/40"
                strokeWidth={1.25}
              />
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                Ingen spillere funnet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Prøv et annet søkeord eller fjern filtrene.
              </p>
              <Link
                href="/stats/spillere"
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
              >
                Vis alle spillere
              </Link>
            </div>
          ) : (
            <>
              {/* Mobilvisning: cards */}
              <div className="grid gap-3 sm:hidden">
                {spillere.map((s) => {
                  const klubb = parseKlubb(s.bio);
                  return (
                    <Link
                      key={s.id}
                      href={`/stats/spillere/${s.slug}`}
                      className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/40 hover:shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-display text-base font-semibold leading-tight tracking-tight text-foreground group-hover:text-primary">
                          {s.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {[
                            s.birthYear,
                            klubb,
                            formaterTier(s.tier),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0 text-right">
                        <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                          {s._count.entries}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          tourer
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Desktopvisning: tabell */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Navn
                      </th>
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Årsklasse
                      </th>
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Klubb
                      </th>
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Nivå
                      </th>
                      <th className="pb-3 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Turneringer
                      </th>
                      <th className="pb-3 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Profil
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {spillere.map((s, idx) => {
                      const klubb = parseKlubb(s.bio);
                      return (
                        <tr
                          key={s.id}
                          className={`border-b border-border transition-colors hover:bg-secondary/30 ${
                            idx % 2 === 0 ? "" : "bg-secondary/10"
                          }`}
                        >
                          <td className="py-3 pr-4">
                            <Link
                              href={`/stats/spillere/${s.slug}`}
                              className="font-display text-[15px] font-semibold tracking-tight text-foreground hover:text-primary"
                            >
                              {s.name}
                            </Link>
                          </td>
                          <td className="py-3 pr-4 font-mono text-sm tabular-nums text-muted-foreground">
                            {s.birthYear ?? "—"}
                          </td>
                          <td className="py-3 pr-4 text-sm text-muted-foreground">
                            {klubb ?? "—"}
                          </td>
                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                              {formaterTier(s.tier)}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right font-mono text-sm tabular-nums text-foreground">
                            {s._count.entries}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              href={`/stats/spillere/${s.slug}`}
                              className="inline-flex items-center gap-1 text-xs text-primary hover:gap-2 transition-all"
                            >
                              Se profil
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {/* PLAYERHQ MERSALG */}
      <section className="border-t border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <AthleticEyebrow tone="lime">Din egen utvikling</AthleticEyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Vil{" "}
            <em className="font-normal italic">du</em> ha en slik profil?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/90">
            Med PlayerHQ logger du runder, ser din egen Strokes Gained over tid,
            og får AI-coach-analyser basert på ditt faktiske spill. 300 kr/mnd
            — gratis de første 30 dagene.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/playerhq"
              className="inline-flex items-center gap-2 rounded-md bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-background/90"
            >
              Prøv PlayerHQ gratis i 30 dager
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/priser"
              className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              Se priser
            </Link>
          </div>
          <p className="mt-6 text-xs text-primary-foreground/60">
            Ingen kredittkort nødvendig. Avslutt når du vil.
          </p>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponenter
// ---------------------------------------------------------------------------

function SnapshotKort({
  ikon,
  tall,
  label,
}: {
  ikon: React.ReactNode;
  tall: string;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-center gap-1.5 text-primary">
        {ikon}
        <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">
          {tall}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
