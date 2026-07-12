/**
 * PlayerHQ · Trening · Ukekalender (`/portal/tren/kalender`) — hybrid-design 2026-06-17.
 *
 * Fasit: [historisk fasit, fjernet 2026-07-03] prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ Ukekalender (hybrid).dc.html
 *
 * Layout:
 *   - Header: "Uke {N} · {måned}" + prev/next-piler
 *   - Uke-mini-grid 7 dager (ma–sø) med done/today/has/muted-tilstander
 *   - Streak-tracker-kort: antall dager på rad + mini-celler + rekord
 *   - "Denne uken"-liste: dato-ikon + tittel + meta + badge
 *   - Tom-tilstand for ingen data
 *
 * Server component. Prisma-data: TrainingPlanSession + Round + TestResult.
 * URL-param `?uke=YYYY-WNN` for navigasjon.
 * Ingen hardkodet hex — kun DS-tokens.
 */

import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { startOfWeek, dagerIUken, ukenummer, sammeDag } from "@/lib/uke-helpers";
import { computeStreak, aktivStreak } from "@/lib/streak";
import type { PyramidArea } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const DOW_KORT = ["ma", "ti", "on", "to", "fr", "lø", "sø"] as const;

const MANED_NAVN = [
  "januar", "februar", "mars", "april", "mai", "juni",
  "juli", "august", "september", "oktober", "november", "desember",
] as const;

const MANED_KORT = [
  "JAN","FEB","MAR","APR","MAI","JUN","JUL","AUG","SEP","OKT","NOV","DES",
] as const;

type BadgeInfo = { badge: string; bg: string; fg: string };

const PYR_BADGE: Record<PyramidArea, BadgeInfo> = {
  FYS:   { badge: "Fysisk",    bg: "rgba(0,88,64,.1)",     fg: "var(--pyr-fys, #005840)" },
  TEK:   { badge: "Teknisk",   bg: "rgba(184,133,42,.12)", fg: "var(--pyr-tek, #B8852A)" },
  SLAG:  { badge: "Slag",      bg: "rgba(37,99,235,.1)",   fg: "var(--info, #2563EB)" },
  SPILL: { badge: "Spill",     bg: "color-mix(in srgb, var(--v2-lime) 25%, transparent)", fg: "var(--forest, #005840)" },
  TURN:  { badge: "Turnering", bg: "rgba(163,45,45,.1)",   fg: "var(--pyr-turn, #A32D2D)" },
};

type OktRad = {
  id: string;
  dag: number;
  dow: string;
  tittel: string;
  meta: string;
  erIdag: boolean;
  badge: BadgeInfo;
  href: string | null;
};

function fmtUkeParam(d: Date): string {
  return d.getFullYear() + "-W" + String(ukenummer(d)).padStart(2, "0");
}

// Uke-celle i mini-grid
function UkeCelle({
  dato,
  erIdag,
  erFullfort,
  harOkter,
  erFremtidig,
}: {
  dato: number;
  erIdag: boolean;
  erFullfort: boolean;
  harOkter: boolean;
  erFremtidig: boolean;
}) {
  let cls =
    "relative flex aspect-square flex-col items-center justify-center rounded-[8px] border font-mono text-[12px] font-semibold";
  if (erIdag) {
    cls += " border-primary bg-primary text-primary-foreground";
  } else if (erFullfort) {
    cls += " border-primary/20 bg-primary/8 text-primary";
  } else if (erFremtidig) {
    cls += " border-border/60 bg-card text-foreground/40";
  } else {
    cls += " border-border/60 bg-card text-foreground";
  }
  return (
    <div className={cls}>
      {dato}
      {harOkter && (
        <span
          className="absolute bottom-[4px] left-1/2 h-[4px] w-[4px] -translate-x-1/2 rounded-full"
          style={{ background: erIdag ? "var(--lime, #D1F843)" : "var(--forest, #005840)" }}
        />
      )}
    </div>
  );
}

// Streak-celle (2 uker = 14 celler)
function StreakCelle({
  erFullfort,
  erIdag,
  label,
}: {
  erFullfort: boolean;
  erIdag: boolean;
  label: string;
}) {
  let cls =
    "flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] font-mono text-[8px] font-semibold";
  if (erFullfort) {
    cls += " bg-primary text-primary-foreground";
  } else {
    cls += " bg-secondary text-muted-foreground";
  }
  if (erIdag) {
    cls += " ring-2 ring-offset-1 ring-primary";
  }
  return <div className={cls}>{label}</div>;
}

type SearchParams = Promise<{ uke?: string }>;

export default async function UkekalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;

  let referanseDato = new Date();
  if (params.uke) {
    const parts = params.uke.split("-W");
    const aar = Number(parts[0]);
    const uke = Number(parts[1]);
    if (aar && uke) {
      const jan4 = new Date(aar, 0, 4);
      const start = startOfWeek(jan4);
      start.setDate(start.getDate() + (uke - 1) * 7);
      referanseDato = start;
    }
  }

  const ukeStart = startOfWeek(referanseDato);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const dager = dagerIUken(ukeStart);
  const uke = ukenummer(ukeStart);
  const maned = MANED_NAVN[ukeStart.getMonth()];

  const forrige = new Date(ukeStart);
  forrige.setDate(forrige.getDate() - 7);
  const neste = new Date(ukeStart);
  neste.setDate(neste.getDate() + 7);

  const aktivePlaner = await prisma.trainingPlan.findMany({
    where: { userId: user.id, isActive: true },
    select: { id: true },
  });
  const planIds = aktivePlaner.map((p) => p.id);

  const [sessions, runder, tester, fullforteHist] = await Promise.all([
    planIds.length
      ? prisma.trainingPlanSession.findMany({
          where: { planId: { in: planIds }, scheduledAt: { gte: ukeStart, lt: ukeSlutt } },
          select: { id: true, scheduledAt: true, title: true, durationMin: true, pyramidArea: true, status: true },
          orderBy: { scheduledAt: "asc" },
        })
      : Promise.resolve([]),
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: ukeStart, lt: ukeSlutt } },
      select: { id: true, playedAt: true, course: { select: { name: true } } },
      orderBy: { playedAt: "asc" },
    }),
    prisma.testResult.findMany({
      where: { userId: user.id, takenAt: { gte: ukeStart, lt: ukeSlutt } },
      select: { id: true, takenAt: true, test: { select: { name: true } } },
      orderBy: { takenAt: "asc" },
    }),
    planIds.length
      ? prisma.trainingPlanSession.findMany({
          where: { planId: { in: planIds }, status: "COMPLETED" },
          select: { scheduledAt: true },
          orderBy: { scheduledAt: "desc" },
          take: 90,
        })
      : Promise.resolve([]),
  ]);

  const idag = new Date();

  // Streak
  const streakDatoer = fullforteHist.map((s) => s.scheduledAt);
  const streakArr = computeStreak(streakDatoer, 14);
  const aktivStreakAntall = aktivStreak(streakArr);
  let rekord = 0;
  let lopende = 0;
  for (const b of streakArr) {
    if (b) { lopende++; rekord = Math.max(rekord, lopende); }
    else lopende = 0;
  }

  // Streak-celler (14 dager bakover)
  const DOW_MINI = ["M","T","O","T","F","L","S","M","T","O","T","F","L","S"];
  const streakCeller: { erFullfort: boolean; erIdag: boolean; label: string }[] = [];
  {
    const startDato = new Date(idag);
    startDato.setDate(idag.getDate() - 13);
    startDato.setHours(0, 0, 0, 0);
    for (let i = 0; i < 14; i++) {
      const d = new Date(startDato);
      d.setDate(startDato.getDate() + i);
      streakCeller.push({
        erFullfort: streakArr[i],
        erIdag: sammeDag(d, idag),
        label: DOW_MINI[i],
      });
    }
  }

  // Dager i uken med aktivitet (for dots)
  const datoerMedOkt = new Set([
    ...sessions.map((s) => s.scheduledAt.toDateString()),
    ...runder.map((r) => r.playedAt.toDateString()),
    ...tester.map((t) => t.takenAt.toDateString()),
  ]);
  const fullforteDatoer = new Set(
    sessions.filter((s) => s.status === "COMPLETED").map((s) => s.scheduledAt.toDateString())
  );

  // Rad-liste
  const rader: OktRad[] = [];
  const fmtTid = (d: Date) =>
    String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0");

  for (const s of sessions) {
    const slutt = new Date(s.scheduledAt.getTime() + s.durationMin * 60_000);
    rader.push({
      id: s.id,
      dag: s.scheduledAt.getDate(),
      dow: DOW_KORT[(s.scheduledAt.getDay() + 6) % 7].toUpperCase(),
      tittel: s.title,
      meta: fmtTid(s.scheduledAt) + " - " + fmtTid(slutt) + " · " + s.durationMin + " min",
      erIdag: sammeDag(s.scheduledAt, idag),
      badge: PYR_BADGE[s.pyramidArea],
      href: "/portal/tren/" + s.id,
    });
  }
  for (const r of runder) {
    rader.push({
      id: r.id,
      dag: r.playedAt.getDate(),
      dow: DOW_KORT[(r.playedAt.getDay() + 6) % 7].toUpperCase(),
      tittel: "Runde · " + r.course.name,
      meta: MANED_KORT[r.playedAt.getMonth()] + " " + r.playedAt.getDate(),
      erIdag: sammeDag(r.playedAt, idag),
      badge: PYR_BADGE["SPILL"],
      href: null,
    });
  }
  for (const t of tester) {
    rader.push({
      id: t.id,
      dag: t.takenAt.getDate(),
      dow: DOW_KORT[(t.takenAt.getDay() + 6) % 7].toUpperCase(),
      tittel: "Test · " + t.test.name,
      meta: MANED_KORT[t.takenAt.getMonth()] + " " + t.takenAt.getDate(),
      erIdag: sammeDag(t.takenAt, idag),
      badge: PYR_BADGE["SLAG"],
      href: null,
    });
  }
  rader.sort((a, b) => a.dag - b.dag);

  return (
    <div className="mx-auto w-full max-w-[460px] px-4 py-6 sm:px-6">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-[22px] font-bold leading-tight tracking-[-0.03em] text-foreground">
          Uke {uke}
          <em className="ml-1 font-medium italic text-primary"> · {maned}</em>
        </h1>
        <div className="flex gap-[5px]">
          <Link
            href={"/portal/tren/kalender?uke=" + fmtUkeParam(forrige)}
            className="grid h-7 w-7 place-items-center rounded-[8px] border border-border bg-card text-foreground hover:bg-secondary"
            aria-label="Forrige uke"
          >
            <ChevronLeft className="h-3 w-3" strokeWidth={2} />
          </Link>
          <Link
            href={"/portal/tren/kalender?uke=" + fmtUkeParam(neste)}
            className="grid h-7 w-7 place-items-center rounded-[8px] border border-border bg-card text-foreground hover:bg-secondary"
            aria-label="Neste uke"
          >
            <ChevronRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Uke-mini-grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-[5px]">
          {DOW_KORT.map((d) => (
            <div
              key={d}
              className="pb-[3px] text-center font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
              {d}
            </div>
          ))}
          {dager.map((dag, i) => (
            <UkeCelle
              key={i}
              dato={dag.getDate()}
              erIdag={sammeDag(dag, idag)}
              erFullfort={fullforteDatoer.has(dag.toDateString())}
              harOkter={datoerMedOkt.has(dag.toDateString())}
              erFremtidig={dag > idag && !sammeDag(dag, idag)}
            />
          ))}
        </div>
      </div>

      {/* Streak-tracker */}
      <div className="mb-4 rounded-[20px] border border-border bg-card px-[15px] py-[14px] shadow-sm">
        <div className="mb-[10px] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-bold leading-none text-primary">
              {aktivStreakAntall}
            </span>
            <span className="font-display text-[14px] font-semibold text-foreground">
              dager på rad
            </span>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            Rekord: {rekord}
          </span>
        </div>
        <div className="flex flex-wrap gap-[3px]">
          {streakCeller.map((c, i) => (
            <StreakCelle
              key={i}
              erFullfort={c.erFullfort}
              erIdag={c.erIdag}
              label={c.label}
            />
          ))}
        </div>
        <div className="mt-[10px] flex items-center gap-[5px] text-[12px] text-muted-foreground">
          <Flame className="h-3 w-3 text-primary" strokeWidth={2} aria-hidden />
          {aktivStreakAntall > 0
            ? rekord > aktivStreakAntall
              ? "Tren i dag for å nå " + (aktivStreakAntall + 1) + " — " + (rekord - aktivStreakAntall) + " fra rekorden."
              : "Fantastisk! Du er på rekorden din (" + rekord + " dager)."
            : "Start streaken din — tren i dag."}
        </div>
      </div>

      {/* Denne uken */}
      <div>
        <p className="mb-[10px] font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Denne uken
        </p>
        {rader.length > 0 ? (
          <div className="flex flex-col gap-[7px]">
            {rader.map((rad) => {
              const ikonBg = rad.erIdag ? "var(--lime, #D1F843)" : "var(--secondary, #F1EEE5)";
              const ikonFg = rad.erIdag ? "var(--forest, #005840)" : "var(--muted-foreground, #5E5C57)";
              const innhold = (
                <div
                  className={
                    "flex items-center gap-[11px] rounded-[14px] border bg-card px-[13px] py-[11px] " +
                    (rad.erIdag ? "border-l-2 border-primary/30 border-l-primary" : "border-border")
                  }
                  style={rad.erIdag ? { background: "color-mix(in srgb, var(--v2-lime) 5%, transparent)" } : undefined}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-[8px]"
                    style={{ background: ikonBg }}
                  >
                    <span className="font-mono text-[13px] font-bold leading-none" style={{ color: ikonFg }}>
                      {rad.dag}
                    </span>
                    <span className="font-mono text-[7.5px] opacity-70" style={{ color: ikonFg }}>
                      {rad.dow}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">{rad.tittel}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{rad.meta}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-[8px] py-[3px] font-mono text-[9px] font-bold"
                    style={{
                      background: rad.erIdag ? "color-mix(in srgb, var(--v2-lime) 20%, transparent)" : rad.badge.bg,
                      color: rad.erIdag ? "var(--forest, #005840)" : rad.badge.fg,
                    }}
                  >
                    {rad.erIdag ? "I dag" : rad.badge.badge}
                  </span>
                </div>
              );
              return rad.href ? (
                <Link key={rad.id} href={rad.href} className="block hover:opacity-90">
                  {innhold}
                </Link>
              ) : (
                <div key={rad.id}>{innhold}</div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px] border border-border bg-card px-6 py-6 text-center">
            <p className="text-[14px] font-semibold text-foreground">Ingen økt planlagt</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              Ny bruker — coach legger til plan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
