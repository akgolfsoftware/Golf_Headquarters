/**
 * <GjennomforeOverview> — landings-skjerm for /portal/gjennomfore.
 *
 * 4 kort som speiler tabbene: I dag, Kalender, Live-økt, Booking.
 */

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Calendar,
  Activity,
  TicketCheck,
  Play,
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

export async function GjennomforeOverview({ userId }: { userId: string }) {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const in7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    okterIDag,
    nesteOkt,
    okterDenneUken,
    liveOkt,
    aktiveBookinger,
    nesteBooking,
  ] = await Promise.all([
    prisma.trainingSessionV2.count({
      where: {
        studentId: userId,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
    }),
    prisma.trainingSessionV2.findFirst({
      where: {
        studentId: userId,
        startTime: { gte: new Date() },
        status: { in: ["PLANNED", "IN_PROGRESS"] },
      },
      orderBy: { startTime: "asc" },
      select: { title: true, startTime: true },
    }),
    prisma.trainingSessionV2.count({
      where: {
        studentId: userId,
        startTime: { gte: startOfDay, lte: in7 },
      },
    }),
    prisma.trainingSessionV2.findFirst({
      where: { studentId: userId, status: "IN_PROGRESS" },
      select: { id: true, title: true },
    }),
    prisma.booking.count({
      where: {
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { gte: new Date() },
      },
    }),
    prisma.booking.findFirst({
      where: {
        userId,
        status: "CONFIRMED",
        startAt: { gte: new Date() },
      },
      orderBy: { startAt: "asc" },
      include: {
        serviceType: { select: { name: true } },
      },
    }),
  ]);

  const kort: Kort[] = [
    {
      href: "/portal/gjennomfore?tab=idag",
      eyebrow: "Dagens program",
      titel: "I dag",
      Icon: CalendarDays,
      primaryLine: okterIDag > 0 ? `${okterIDag} økt(er) i dag` : "Ingen økter i dag",
      secondaryLine: nesteOkt
        ? `Neste: ${nesteOkt.title} · ${formaterKlokke(nesteOkt.startTime)}`
        : "Sjekk kalenderen for kommende",
    },
    {
      href: "/portal/gjennomfore?tab=kalender",
      eyebrow: "Uke + måned",
      titel: "Kalender",
      Icon: Calendar,
      primaryLine:
        okterDenneUken > 0
          ? `${okterDenneUken} planlagte de neste 7 dagene`
          : "Ingen planlagte økter neste uke",
      secondaryLine: nesteOkt
        ? NB_DATE.format(nesteOkt.startTime)
        : "Be coach legge inn økter",
    },
    {
      href: liveOkt ? `/portal/tren/${liveOkt.id}` : "/portal/gjennomfore?tab=live",
      eyebrow: "Pågående trening",
      titel: "Live-økt",
      Icon: Activity,
      primaryLine: liveOkt ? "Du har en pågående økt" : "Ingen live-økt",
      secondaryLine: liveOkt ? liveOkt.title : "Start eller fortsett en økt",
    },
    {
      href: "/portal/gjennomfore?tab=booking",
      eyebrow: "Coaching-økter",
      titel: "Booking",
      Icon: TicketCheck,
      primaryLine:
        aktiveBookinger > 0
          ? `${aktiveBookinger} aktiv(e) booking(er)`
          : "Ingen aktive bookinger",
      secondaryLine: nesteBooking
        ? `Neste: ${nesteBooking.serviceType.name} · ${NB_DATE.format(nesteBooking.startAt)}`
        : "Book en ny økt",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <Play className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>PLAYERHQ · GJENNOMFØRE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Gjør{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontStyle: "italic",
                color: "hsl(var(--primary))",
              }}
            >
              jobben
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Dagens program, kalenderen, live-økt og dine bookinger.
          </p>
        </div>
      </section>

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
      <div className="mt-4 border-t border-border/50 pt-2">
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
