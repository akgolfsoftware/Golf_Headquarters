/**
 * /stats/spillere/[slug] — Spillerprofil
 *
 * Viser komplett turneringshistorikk for én offentlig spiller.
 * Data: PublicPlayer + PublicPlayerEntry joined med Tournament.
 *
 * ISR: 1 time revalidate. 404 hvis slug ikke finnes.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Flag, Mail, Trophy, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const revalidate = 3600;

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

type RundeBlogg = {
  n: number;
  score: number;
  par?: string | number;
};

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

async function hentSpiller(slug: string) {
  return prisma.publicPlayer.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      birthYear: true,
      tier: true,
      bio: true,
      photoUrl: true,
      country: true,
      entries: {
        orderBy: { tournament: { startDate: "desc" } },
        select: {
          id: true,
          status: true,
          position: true,
          scoreToPar: true,
          totalScore: true,
          rounds: true,
          tournament: {
            select: {
              id: true,
              name: true,
              shortName: true,
              slug: true,
              startDate: true,
              tour: true,
              location: true,
            },
          },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Hjelpefunksjoner
// ---------------------------------------------------------------------------

/** Hent klubb fra bio-feltet. Format: "Klubb: Navn" */
function parseKlubb(bio: string | null): string | null {
  if (!bio) return null;
  const match = bio.match(/[Kk]lubb:\s*([^\n.]+)/);
  if (match) return match[1].trim();
  return null;
}

function formaterDato(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
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

function formaterTour(tour: string | null): string {
  if (!tour) return "—";
  switch (tour) {
    case "pga":
      return "PGA Tour";
    case "dp":
      return "DP World Tour";
    case "lpga":
      return "LPGA";
    case "korn-ferry":
      return "Korn Ferry";
    case "challenge":
      return "Challenge Tour";
    case "amateur-no":
      return "Norsk amatør";
    case "junior-no":
      return "Norsk junior";
    case "college":
      return "College";
    default:
      return tour;
  }
}

/** Parse rounds JSON-blob til runde-scores-streng, f.eks. "71 · 73 · 70" */
function parseRunder(rounds: unknown): string {
  if (!rounds || !Array.isArray(rounds)) return "—";
  const rader = rounds as RundeBlogg[];
  const scores = rader
    .filter((r) => typeof r.score === "number")
    .sort((a, b) => a.n - b.n)
    .map((r) => String(r.score));
  return scores.length > 0 ? scores.join(" · ") : "—";
}

/** Formater posisjon: 1 → "1.", 2 → "2.", null → "—", CUT/WD fra status */
function formaterPosisjon(
  position: number | null,
  status: string,
): string {
  if (status === "CUT") return "CUT";
  if (status === "WITHDREW") return "WD";
  if (status === "DNF") return "DNF";
  if (position === null) return "—";
  if (position === 1) return "1."
  return `${position}.`;
}

/** Formater score to par: -3 → "-3", 0 → "E", 5 → "+5" */
function formaterScoreToPar(s: number | null): string {
  if (s === null) return "—";
  if (s === 0) return "E";
  return s > 0 ? `+${s}` : `${s}`;
}

type SpillerMedEntries = NonNullable<Awaited<ReturnType<typeof hentSpiller>>>;
type Entry = SpillerMedEntries["entries"][number];

/** Beregn snitt scoreToPar per år for alle entries med data */
function beregneSnittPerAar(
  entries: Entry[],
): { aar: number; snitt: string; antall: number }[] {
  const map: Record<number, number[]> = {};
  for (const e of entries) {
    if (e.scoreToPar === null) continue;
    const aar = new Date(e.tournament.startDate).getFullYear();
    if (!map[aar]) map[aar] = [];
    map[aar].push(e.scoreToPar);
  }
  return Object.entries(map)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([aar, scores]) => ({
      aar: Number(aar),
      snitt: formaterScoreToPar(
        Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) /
          10,
      ),
      antall: scores.length,
    }));
}

function unikeTourer(entries: Entry[]): string[] {
  const tourer = new Set<string>();
  for (const e of entries) {
    if (e.tournament.tour) tourer.add(formaterTour(e.tournament.tour));
  }
  return Array.from(tourer);
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spiller = await prisma.publicPlayer.findUnique({
    where: { slug },
    select: { name: true, birthYear: true, bio: true },
  });
  if (!spiller) return { title: "Spiller ikke funnet" };

  const tittel = spiller.birthYear
    ? `${spiller.name} (f. ${spiller.birthYear}) — AK Golf Stats`
    : `${spiller.name} — AK Golf Stats`;
  const beskrivelse =
    spiller.bio ??
    `Turneringsresultater og statistikk for ${spiller.name}. AK Golf spillerdatabase.`;

  return {
    title: tittel,
    description: beskrivelse,
    alternates: { canonical: `https://akgolf.no/stats/spillere/${slug}` },
    openGraph: {
      title: tittel,
      description: beskrivelse,
      url: `https://akgolf.no/stats/spillere/${slug}`,
      type: "profile",
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SpillerProfilPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spiller = await hentSpiller(slug);

  if (!spiller) notFound();

  // TypeScript narrowing after notFound()
  const spillerData = spiller as NonNullable<typeof spiller>;
  const klubb = parseKlubb(spillerData.bio);
  const entries = spillerData.entries;
  const snittPerAar = beregneSnittPerAar(entries);
  const tourer = unikeTourer(entries);
  const antallTurneringer = entries.length;
  const antallFinished = entries.filter((e) => e.status === "FINISHED").length;

  // Beste posisjon
  const posisjoner = entries
    .map((e) => e.position)
    .filter((p): p is number => p !== null);
  const bestePosisjon =
    posisjoner.length > 0 ? Math.min(...posisjoner) : null;

  return (
    <div className="bg-background text-foreground">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <Link
            href="/stats/spillere"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Tilbake til spillerdatabasen
          </Link>
        </div>
      </div>

      {/* SPILLERHODE */}
      <section className="border-b border-border bg-gradient-to-b from-background to-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            {/* Bilde eller initialer-sirkel */}
            {spillerData.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={spillerData.photoUrl}
                alt={spillerData.name}
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary/10 ring-2 ring-border">
                <span className="font-display text-2xl font-semibold text-primary">
                  {spillerData.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <AthleticEyebrow tone="default">
                {formaterTier(spillerData.tier)}
                {spillerData.country !== "NO" ? ` · ${spillerData.country}` : " · Norsk"}
              </AthleticEyebrow>
              <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                {spillerData.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 font-mono text-[12px] text-muted-foreground">
                {spillerData.birthYear && (
                  <span>f. {spillerData.birthYear}</span>
                )}
                {klubb && <span>{klubb}</span>}
                {tourer.length > 0 && (
                  <span>{tourer.slice(0, 3).join(", ")}</span>
                )}
              </div>
              {spillerData.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {spillerData.bio}
                </p>
              )}
            </div>
          </div>

          {/* Stats-kort */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatKort
              tall={String(antallTurneringer)}
              label="Turneringer"
              ikon={<Trophy className="h-4 w-4" />}
            />
            <StatKort
              tall={String(antallFinished)}
              label="Fullførte"
              ikon={<Flag className="h-4 w-4" />}
            />
            <StatKort
              tall={bestePosisjon !== null ? `${bestePosisjon}.` : "—"}
              label="Beste plassering"
              ikon={<Users className="h-4 w-4" />}
            />
            <StatKort
              tall={snittPerAar[0]?.snitt ?? "—"}
              label={
                snittPerAar[0]
                  ? `Snitt-score ${snittPerAar[0].aar}`
                  : "Snitt-score"
              }
              ikon={<Flag className="h-4 w-4" />}
            />
          </div>
        </div>
      </section>

      {/* TURNERINGSHISTORIKK */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="mb-6">
            <AthleticEyebrow tone="default">Resultater</AthleticEyebrow>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              Alle turneringer
            </h2>
          </div>

          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 px-8 py-12 text-center">
              <p className="text-muted-foreground">
                Ingen registrerte resultater ennå.
              </p>
            </div>
          ) : (
            <>
              {/* Mobilvisning: cards */}
              <div className="grid gap-3 sm:hidden">
                {entries.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-display text-[15px] font-semibold leading-tight tracking-tight text-foreground">
                          {e.tournament.shortName ?? e.tournament.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                          {formaterDato(new Date(e.tournament.startDate))}
                          {e.tournament.tour && (
                            <> · {formaterTour(e.tournament.tour)}</>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className={`font-mono text-lg font-semibold tabular-nums ${
                            e.position === 1
                              ? "text-accent-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {formaterPosisjon(e.position, e.status)}
                        </p>
                        {e.scoreToPar !== null && (
                          <p
                            className={`font-mono text-[12px] tabular-nums ${
                              e.scoreToPar < 0
                                ? "text-primary"
                                : e.scoreToPar > 0
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {formaterScoreToPar(e.scoreToPar)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                      {parseRunder(e.rounds)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktopvisning: tabell */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Dato
                      </th>
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Turnering
                      </th>
                      <th className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Tour
                      </th>
                      <th className="pb-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Runder
                      </th>
                      <th className="pb-3 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Score
                      </th>
                      <th className="pb-3 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        Pos.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e, idx) => (
                      <tr
                        key={e.id}
                        className={`border-b border-border transition-colors hover:bg-secondary/30 ${
                          idx % 2 === 0 ? "" : "bg-secondary/10"
                        }`}
                      >
                        <td className="py-3 pr-4 font-mono text-[12px] tabular-nums text-muted-foreground">
                          {formaterDato(new Date(e.tournament.startDate))}
                        </td>
                        <td className="py-3 pr-4">
                          {e.tournament.slug ? (
                            <Link
                              href={`/turneringer/${e.tournament.slug}`}
                              className="font-display text-[15px] font-medium tracking-tight text-foreground hover:text-primary"
                            >
                              {e.tournament.shortName ?? e.tournament.name}
                            </Link>
                          ) : (
                            <span className="font-display text-[15px] font-medium tracking-tight text-foreground">
                              {e.tournament.shortName ?? e.tournament.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4 font-mono text-[12px] text-muted-foreground">
                          {formaterTour(e.tournament.tour ?? null)}
                        </td>
                        <td className="py-3 pr-4 text-center font-mono text-[12px] tabular-nums text-muted-foreground">
                          {parseRunder(e.rounds)}
                        </td>
                        <td
                          className={`py-3 pr-4 text-right font-mono text-sm tabular-nums ${
                            e.scoreToPar !== null && e.scoreToPar < 0
                              ? "text-primary"
                              : e.scoreToPar !== null && e.scoreToPar > 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        >
                          {formaterScoreToPar(e.scoreToPar)}
                        </td>
                        <td
                          className={`py-3 text-right font-mono text-sm tabular-nums font-semibold ${
                            e.position === 1
                              ? "text-accent-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {formaterPosisjon(e.position, e.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {/* TREND: snitt per år */}
      {snittPerAar.length > 0 && (
        <section className="border-b border-border bg-secondary/20">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="mb-6">
              <AthleticEyebrow tone="default">Trend</AthleticEyebrow>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                Snitt-score per år
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gjennomsnittlig score to par per sesong (kun fullførte runder).
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full max-w-md">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      År
                    </th>
                    <th className="pb-2 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Snitt
                    </th>
                    <th className="pb-2 text-right font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      Runder
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {snittPerAar.map((rad) => (
                    <tr
                      key={rad.aar}
                      className="border-b border-border"
                    >
                      <td className="py-2 font-mono text-sm tabular-nums text-foreground">
                        {rad.aar}
                      </td>
                      <td
                        className={`py-2 text-right font-mono text-sm tabular-nums font-semibold ${
                          rad.snitt.startsWith("-")
                            ? "text-primary"
                            : rad.snitt.startsWith("+")
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }`}
                      >
                        {rad.snitt}
                      </td>
                      <td className="py-2 text-right font-mono text-sm tabular-nums text-muted-foreground">
                        {rad.antall}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* PERSONVERN */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-sm text-muted-foreground">
            Dataene på denne siden er hentet fra offentlige turneringsresultater.
            Ønsker du å få slettet informasjonen om deg?{" "}
            <a
              href={`mailto:akgolfgroup@gmail.com?subject=${encodeURIComponent(
                `GDPR slett: ${spillerData.name}`,
              )}&body=${encodeURIComponent(
                `Hei,\n\nJeg ønsker å få slettet all informasjon om meg fra AK Golf Stats-databasen.\n\nNavn: ${spillerData.name}\nURL: https://akgolf.no/stats/spillere/${spillerData.slug}\n\nMvh`,
              )}`}
              className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
            >
              <Mail className="h-3.5 w-3.5" />
              Send slette-forespørsel til akgolfgroup@gmail.com
            </a>
          </p>
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
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-komponenter
// ---------------------------------------------------------------------------

function StatKort({
  tall,
  label,
  ikon,
}: {
  tall: string;
  label: string;
  ikon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
      <div className="flex items-center justify-center gap-1.5 text-primary">
        {ikon}
        <span className="font-mono text-xl font-semibold tabular-nums text-foreground">
          {tall}
        </span>
      </div>
      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
