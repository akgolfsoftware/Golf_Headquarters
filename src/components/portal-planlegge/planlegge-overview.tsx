/**
 * <PlanleggeOverview> — landings-skjerm for /portal/planlegge.
 *
 * Vises når brukeren klikker "Planlegge" i sidemenyen uten å velge tab.
 * 5 kort som speiler tabbene: Årsplan, Treningsplan, Mål, Turneringer, Drills.
 * Hver kort viser en kompakt status + CTA til respektive tab.
 *
 * Sub-tabs via sidemenyen (?tab=X) går fortsatt direkte til tabben.
 */

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarRange,
  CalendarCheck,
  Target,
  Trophy,
  Dumbbell,
} from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic";
import { prisma } from "@/lib/prisma";

const NB_DATE = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

type Kort = {
  href: string;
  eyebrow: string;
  titel: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  primaryLine: string;
  secondaryLine: string;
};

export async function PlanleggeOverview({ userId }: { userId: string }) {
  const today = new Date();
  const year = today.getFullYear();
  const in7 = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    seasonPlan,
    nesteOkt,
    aktiveMaal,
    fullforteMaalIaar,
    kommendeTurneringer,
    nesteTurnering,
    nyligeDrills,
  ] = await Promise.all([
    prisma.seasonPlan.findFirst({
      where: { userId, year },
      select: { name: true, startDate: true, endDate: true },
    }),
    prisma.trainingSessionV2.findFirst({
      where: {
        studentId: userId,
        startTime: { gte: today },
        status: { in: ["PLANNED", "IN_PROGRESS"] },
      },
      orderBy: { startTime: "asc" },
      select: { title: true, startTime: true, practiceType: true },
    }),
    prisma.goal.count({ where: { userId, status: "ACTIVE" } }),
    prisma.goal.count({
      where: {
        userId,
        status: "ACHIEVED",
        updatedAt: { gte: new Date(year, 0, 1) },
      },
    }),
    prisma.tournamentEntry.count({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
    }),
    prisma.tournamentEntry.findFirst({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
        OR: [
          { manualDate: { gte: today } },
          { tournament: { startDate: { gte: today } } },
        ],
      },
      orderBy: [{ manualDate: "asc" }],
      select: {
        manualName: true,
        manualDate: true,
        tournament: { select: { name: true, startDate: true } },
      },
    }),
    prisma.trainingDrillV2.count({
      where: {
        session: { studentId: userId, startTime: { gte: today, lte: in7 } },
      },
    }),
  ]);

  const kort: Kort[] = [
    {
      href: "/portal/planlegge?tab=arsplan",
      eyebrow: "Sesongplan",
      titel: "Årsplan",
      Icon: CalendarRange,
      primaryLine: seasonPlan
        ? (seasonPlan.name ?? `Sesong ${year}`)
        : `Ingen sesongplan for ${year}`,
      secondaryLine: seasonPlan
        ? `${NB_DATE.format(seasonPlan.startDate)} — ${NB_DATE.format(seasonPlan.endDate)}`
        : "Opprett en plan for året",
    },
    {
      href: "/portal/planlegge?tab=treningsplan",
      eyebrow: "Ukeplan",
      titel: "Treningsplan",
      Icon: CalendarCheck,
      primaryLine: nesteOkt
        ? `Neste: ${nesteOkt.title}`
        : "Ingen planlagte økter",
      secondaryLine: nesteOkt
        ? `${NB_DATE.format(nesteOkt.startTime)} · ${formaterKlokke(nesteOkt.startTime)}`
        : "Be coachen din legge inn økter",
    },
    {
      href: "/portal/planlegge?tab=mal",
      eyebrow: "Personlige mål",
      titel: "Mål",
      Icon: Target,
      primaryLine: aktiveMaal > 0 ? `${aktiveMaal} aktive` : "Ingen aktive mål",
      secondaryLine:
        fullforteMaalIaar > 0
          ? `${fullforteMaalIaar} fullført i ${year}`
          : "Sett ditt første mål",
    },
    {
      href: "/portal/planlegge?tab=turneringer",
      eyebrow: "Turnerings­kalender",
      titel: "Turneringer",
      Icon: Trophy,
      primaryLine:
        kommendeTurneringer > 0
          ? `${kommendeTurneringer} planlagt`
          : "Ingen kommende",
      secondaryLine: nesteTurnering
        ? `Neste: ${nesteTurnering.tournament?.name ?? nesteTurnering.manualName ?? "Turnering"} · ${
            nesteTurnering.manualDate
              ? NB_DATE.format(nesteTurnering.manualDate)
              : nesteTurnering.tournament?.startDate
                ? NB_DATE.format(nesteTurnering.tournament.startDate)
                : ""
          }`
        : "Meld deg på en turnering",
    },
    {
      href: "/portal/planlegge?tab=drills",
      eyebrow: "Øvelser",
      titel: "Drills",
      Icon: Dumbbell,
      primaryLine:
        nyligeDrills > 0
          ? `${nyligeDrills} i ukens økter`
          : "Ingen drills denne uken",
      secondaryLine: "Bla i biblioteket",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      {/* Hero */}
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <CalendarRange className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>PLAYERHQ · PLANLEGGE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Plan din{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              utvikling
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sesong, økter, mål, turneringer og drills — alt på ett sted.
          </p>
        </div>
      </section>

      {/* Kort-grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kort.map((k) => (
          <OversiktKort key={k.href} {...k} />
        ))}
      </section>
    </div>
  );
}

function OversiktKort({
  href,
  eyebrow,
  titel,
  Icon,
  primaryLine,
  secondaryLine,
}: Kort) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20"
    >
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <ArrowUpRight
          className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.75}
        />
      </div>
      <span className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {eyebrow}
      </span>
      <h3 className="mt-1 font-display text-xl font-semibold tracking-tight">
        {titel}
      </h3>
      <div className="mt-4 border-t border-border/50 pt-3">
        <p className="text-[14px] font-medium text-foreground">{primaryLine}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {secondaryLine}
        </p>
      </div>
    </Link>
  );
}

function formaterKlokke(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
