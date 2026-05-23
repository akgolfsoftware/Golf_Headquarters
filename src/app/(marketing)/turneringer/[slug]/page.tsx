/**
 * /turneringer/[slug] — detaljside per turnering.
 *
 * Viser: info, deltakerliste (nordmenn øverst), live leaderboard (når aktiv),
 * mersalg-banner.
 *
 * ISR med 15-min revalidate.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarRange,
  MapPin,
  ExternalLink,
  Trophy,
  Flag,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MersalgBanner } from "@/components/turneringer/mersalg-banner";

export const revalidate = 900; // 15 min

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t) {
    return { title: "Turnering ikke funnet | AK Golf" };
  }
  return {
    title: `${t.name} — turneringsoversikt | AK Golf`,
    description:
      `Følg ${t.name} live. Norske spillere, leaderboard, info og resultater. Oppdatert automatisk.`,
    alternates: { canonical: `https://akgolf.no/turneringer/${slug}` },
    openGraph: {
      title: `${t.name} — AK Golf`,
      description: `Live oversikt over norske spillere i ${t.name}`,
      url: `https://akgolf.no/turneringer/${slug}`,
      type: "website",
    },
  };
}

export default async function TurneringDetalj({ params }: Props) {
  const { slug } = await params;

  const t = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      publicEntries: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              slug: true,
              country: true,
              tier: true,
              photoUrl: true,
            },
          },
        },
        orderBy: [{ position: "asc" }, { player: { name: "asc" } }],
      },
      leaderboardSnap: {
        select: { fetchedAt: true },
      },
    },
  });

  if (!t) notFound();

  const norske = t.publicEntries.filter((e) => e.player.country === "NO");
  const andre = t.publicEntries.filter((e) => e.player.country !== "NO");
  const erLive = t.status === "IN_PROGRESS";
  const erFerdig = t.status === "COMPLETED";

  return (
    <div className="bg-background text-foreground">
      {/* SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: tilJsonLd(t) }}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
          <Link
            href="/turneringer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={2} />
            Alle turneringer
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
              {formaterTour(t.tour)}
            </span>
            {erLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-destructive">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                Pågår nå
              </span>
            )}
            {erFerdig && (
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Ferdigspilt
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            {t.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarRange className="h-4 w-4" strokeWidth={1.75} />
              {formaterDato(t.startDate, t.endDate)}
            </span>
            {t.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" strokeWidth={1.75} />
                {t.location}
              </span>
            )}
            {t.officialUrl && (
              <a
                href={t.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Offisiell side
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            )}
          </div>

          {t.winnerName && erFerdig && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
              <Trophy className="h-4 w-4 text-primary" strokeWidth={2} />
              <span className="text-sm font-medium">
                Vinner: <strong>{t.winnerName}</strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Norske spillere først */}
      {norske.length > 0 && (
        <section className="bg-accent/10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
            <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">
              <Flag className="mr-2 inline-block h-5 w-5 text-primary" strokeWidth={2} />
              🇳🇴 Norske spillere ({norske.length})
            </h2>
            <SpillerListe entries={norske} live={erLive} />
          </div>
        </section>
      )}

      {/* Andre spillere */}
      {andre.length > 0 && (
        <section>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
            <h2 className="mb-5 font-display text-2xl font-semibold tracking-tight">
              Andre deltakere ({andre.length})
            </h2>
            <SpillerListe entries={andre} live={erLive} />
          </div>
        </section>
      )}

      {/* Tom-tilstand */}
      {t.publicEntries.length === 0 && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
            Deltakerliste oppdateres
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Vi henter felt-listen automatisk så snart turneringen er i gang.
          </p>
        </section>
      )}

      {t.leaderboardSnap && (
        <p className="mx-auto max-w-5xl px-4 pb-4 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground sm:px-6">
          Sist oppdatert {NB_TIME.format(t.leaderboardSnap.fetchedAt)}
        </p>
      )}

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
        <MersalgBanner />
      </section>
    </div>
  );
}

function SpillerListe({
  entries,
  live,
}: {
  entries: Array<{
    id: string;
    status: string;
    position: number | null;
    scoreToPar: number | null;
    player: {
      id: string;
      name: string;
      slug: string;
      country: string;
      tier: string;
    };
  }>;
  live: boolean;
}) {
  return (
    <ul className="space-y-2">
      {entries.map((e) => (
        <li
          key={e.id}
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold tracking-tight">
              {e.player.name}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {formaterTier(e.player.tier)}
              {e.player.country !== "NO" && ` · ${e.player.country}`}
            </p>
          </div>
          {live && (
            <div className="flex items-baseline gap-3 text-right">
              {e.position && (
                <span className="font-mono text-[11px] uppercase text-muted-foreground">
                  T{e.position}
                </span>
              )}
              {e.scoreToPar !== null && (
                <span
                  className={`font-display text-xl font-semibold tabular-nums ${
                    e.scoreToPar < 0
                      ? "text-primary"
                      : e.scoreToPar > 0
                        ? "text-destructive"
                        : "text-foreground"
                  }`}
                >
                  {e.scoreToPar > 0 ? `+${e.scoreToPar}` : e.scoreToPar === 0 ? "E" : e.scoreToPar}
                </span>
              )}
              {e.status === "CUT" && (
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Cut
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const NB_TIME = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formaterDato(start: Date, slutt: Date | null): string {
  if (!slutt) return NB_DATE.format(start);
  if (start.toDateString() === slutt.toDateString()) return NB_DATE.format(start);
  return `${NB_DATE.format(start)} — ${NB_DATE.format(slutt)}`;
}

function formaterTour(t: string | null): string {
  switch (t) {
    case "pga": return "PGA Tour";
    case "euro": return "DP World Tour";
    case "kft": return "Korn Ferry Tour";
    case "alt": return "Alt-tour";
    case "champ": return "Champions Tour";
    case "lpga": return "LPGA";
    case "let": return "Ladies European Tour";
    case "amateur-no": return "Norge · Amatør";
    case "junior-no": return "Norge · Junior";
    default: return "Turnering";
  }
}

function formaterTier(t: string): string {
  switch (t) {
    case "pro-pga": return "Pro · PGA";
    case "pro-dp": return "Pro · DP World";
    case "pro-lpga": return "Pro · LPGA";
    case "amateur": return "Amatør";
    case "junior": return "Junior";
    case "college": return "College";
    default: return "Pro";
  }
}

type LdTournament = {
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  officialUrl: string | null;
};

function tilJsonLd(t: LdTournament): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: t.name,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate?.toISOString(),
    location: t.location
      ? {
          "@type": "Place",
          name: t.location,
        }
      : undefined,
    url: t.officialUrl ?? undefined,
    sport: "Golf",
  });
}
