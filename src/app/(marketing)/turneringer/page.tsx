/**
 * /turneringer — turneringskalender på akgolf.no
 *
 * Gratis, åpen, ingen innlogging. Mersalg-arena for PlayerHQ-abonnement.
 *
 * Datakilder (sync via cron):
 * - DataGolf API: PGA, DP World, LPGA, LET, Challenge, Korn Ferry
 * - NGF (stub for nå): norske amatør-turneringer
 *
 * ISR med 30-min revalidate — DB oppdateres av cron, vi rendrer cachet.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CalendarRange, MapPin, Trophy, Flag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { NorskeDenneUkaWidget } from "@/components/turneringer/norske-denne-uka-widget";
import { MersalgBanner } from "@/components/turneringer/mersalg-banner";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

export const revalidate = 1800; // 30 min

export const metadata: Metadata = {
  title: "Turneringer — alle norske spillere ett sted | AK Golf",
  description:
    "Følg norske golfspillere på PGA, DP World, LPGA, amatør og junior — automatisk oppdatert hver dag. Gratis oversikt fra AK Golf.",
  alternates: { canonical: "https://akgolf.no/turneringer" },
};

type Tab = "alle" | "norge" | "pro" | "norske";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function TurneringerPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab: Tab = ["alle", "norge", "pro", "norske"].includes(params.tab as Tab)
    ? (params.tab as Tab)
    : "alle";

  const tournaments = await hentTurneringer(tab);
  const norskeDenneUka = await hentNorskeDenneUka();
  const counts = await hentCounts();

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] font-medium text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            Oppdateres automatisk hver dag
          </div>
          <h1 className="max-w-4xl font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
            Turneringer.{" "}
            <em className="font-display font-normal italic text-primary">
              Hele oversikten.
            </em>
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-[1.6] text-muted-foreground md:text-[18px]">
            PGA, DP World, LPGA, LET, Challenge, Korn Ferry, norske amatør- og
            junior-turneringer. Følg nordmenn live — ett sted, ingen logg-inn.
          </p>
        </div>
      </section>

      {/* Nordmenn denne uka — toppvisning */}
      <NorskeDenneUkaWidget entries={norskeDenneUka} />

      {/* Tab-bar */}
      <section className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex flex-wrap gap-2 py-4 text-sm">
            <TabLink href="/turneringer?tab=alle" active={tab === "alle"} count={counts.alle}>
              Alle
            </TabLink>
            <TabLink href="/turneringer?tab=norske" active={tab === "norske"} count={counts.norske}>
              Med nordmenn
            </TabLink>
            <TabLink href="/turneringer?tab=norge" active={tab === "norge"} count={counts.norge}>
              Norge
            </TabLink>
            <TabLink href="/turneringer?tab=pro" active={tab === "pro"} count={counts.pro}>
              Pro
            </TabLink>
          </nav>
        </div>
      </section>

      {/* Liste */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        {tournaments.length === 0 ? (
          <TomTilstand />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <TurneringKort key={t.id} t={t} />
            ))}
          </ul>
        )}
      </section>

      {/* Mersalg-banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <MersalgBanner />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type TurneringKortData = {
  id: string;
  slug: string | null;
  name: string;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  country: string | null;
  tour: string | null;
  status: string | null;
  norskeCount: number;
};

async function hentTurneringer(tab: Tab): Promise<TurneringKortData[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const baseWhere = {
    startDate: { gte: today, lte: in60 },
    status: { in: ["UPCOMING", "IN_PROGRESS"] },
    mergedIntoId: null,
  };

  type TurneringWhere =
    | typeof baseWhere
    | (typeof baseWhere & { tour: { in: string[] } })
    | (typeof baseWhere & {
        publicEntries: { some: { player: { country: string } } };
      });

  let where: TurneringWhere = baseWhere;

  if (tab === "norge") {
    where = { ...baseWhere, tour: { in: ["amateur-no", "junior-no"] } };
  } else if (tab === "pro") {
    where = {
      ...baseWhere,
      tour: { in: ["pga", "euro", "kft", "alt", "champ", "lpga", "let"] },
    };
  } else if (tab === "norske") {
    where = {
      ...baseWhere,
      publicEntries: { some: { player: { country: "NO" } } },
    };
  }

  const rows = await prisma.tournament.findMany({
    where,
    orderBy: { startDate: "asc" },
    take: 48,
    include: {
      _count: {
        select: {
          publicEntries: { where: { player: { country: "NO" } } },
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    startDate: r.startDate,
    endDate: r.endDate,
    location: r.location,
    country: r.country,
    tour: r.tour,
    status: r.status,
    norskeCount: r._count.publicEntries,
  }));
}

async function hentNorskeDenneUka() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  return prisma.publicPlayerEntry.findMany({
    where: {
      player: { country: "NO" },
      tournament: {
        startDate: { gte: today, lte: in7 },
        status: { in: ["UPCOMING", "IN_PROGRESS"] },
        mergedIntoId: null,
      },
    },
    include: {
      player: {
        select: { id: true, name: true, slug: true, tier: true, photoUrl: true },
      },
      tournament: {
        select: {
          id: true,
          name: true,
          slug: true,
          startDate: true,
          tour: true,
          status: true,
          location: true,
        },
      },
    },
    orderBy: [{ position: "asc" }, { tournament: { startDate: "asc" } }],
    take: 30,
  });
}

async function hentCounts() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in60 = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  const base = {
    startDate: { gte: today, lte: in60 },
    status: { in: ["UPCOMING", "IN_PROGRESS"] },
    mergedIntoId: null,
  };

  const [alle, norge, pro, norske] = await Promise.all([
    prisma.tournament.count({ where: base }),
    prisma.tournament.count({
      where: { ...base, tour: { in: ["amateur-no", "junior-no"] } },
    }),
    prisma.tournament.count({
      where: {
        ...base,
        tour: { in: ["pga", "euro", "kft", "alt", "champ", "lpga", "let"] },
      },
    }),
    prisma.tournament.count({
      where: {
        ...base,
        publicEntries: { some: { player: { country: "NO" } } },
      },
    }),
  ]);

  return { alle, norge, pro, norske };
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

const NB = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

function TabLink({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {children}
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[10px] tabular-nums ${
          active
            ? "bg-primary-foreground/20"
            : "bg-secondary text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

function TurneringKort({ t }: { t: TurneringKortData }) {
  const datoTekst = t.endDate
    ? `${NB.format(t.startDate)} — ${NB.format(t.endDate)}`
    : NB.format(t.startDate);
  const tourLabel = formaterTour(t.tour);
  const erLive = t.status === "IN_PROGRESS";

  return (
    <li>
      <Link
        href={t.slug ? `/turneringer/${t.slug}` : "/turneringer"}
        className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
      >
        <div className="flex items-start justify-between gap-2">
          <AthleticEyebrow>{tourLabel}</AthleticEyebrow>
          {erLive && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-destructive">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
              Live
            </span>
          )}
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight leading-tight">
          {t.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarRange className="h-3.5 w-3.5" strokeWidth={1.75} />
            {datoTekst}
          </span>
          {t.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
              {t.location}
            </span>
          )}
        </div>
        {t.norskeCount > 0 && (
          <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/20 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
            <Flag className="h-3 w-3" strokeWidth={2} />
            {t.norskeCount} {t.norskeCount === 1 ? "norsk spiller" : "norske spillere"}
          </div>
        )}
      </Link>
    </li>
  );
}

function TomTilstand() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <Trophy className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
        Ingen turneringer i denne kategorien
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Vi henter data daglig — kom tilbake om en stund.
      </p>
    </div>
  );
}

function formaterTour(t: string | null): string {
  switch (t) {
    case "pga": return "PGA Tour";
    case "opp": return "PGA Tour · Opposite Field";
    case "euro": return "DP World Tour";
    case "kft": return "Korn Ferry Tour";
    case "alt": return "Alt-tour";
    case "champ": return "Champions Tour";
    case "lpga": return "LPGA";
    case "let": return "Ladies European Tour";
    case "amateur-no": return "Norge · Amatør";
    case "junior-no": return "Norge · Junior";
    case "college": return "College";
    default: return "Turnering";
  }
}
