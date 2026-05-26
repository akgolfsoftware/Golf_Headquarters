"use client";

import Link from "next/link";
import { ChevronRight, Check, CalendarDays } from "lucide-react";
import {
  ShellWrapper,
  PageHero,
  SectionHeader,
  StatTile,
  ItineraryList,
  PhotoDivider,
  useNowTime,
} from "@/components/v2";
import {
  ØYVIND_USER,
  TODAY_SESSIONS,
  WEEK_SESSIONS,
  WEATHER_DATA,
} from "@/lib/v2-fixtures";
import type { Session, WeekSession } from "@/lib/v2-fixtures";

// ── Konverter WeekSession → Session for ItineraryList ────────────────────────

function weekSessionToSession(ws: WeekSession, idx: number): Session {
  const [hStr, mStr] = ws.time.split(":");
  const startH = parseInt(hStr, 10) + parseInt(mStr, 10) / 60;
  const endH = startH + 1.5;
  return {
    id: `ws-${idx}`,
    time: ws.time,
    end: `${String(Math.floor(endH)).padStart(2, "0")}:${String(Math.round((endH % 1) * 60)).padStart(2, "0")}`,
    startH,
    endH,
    axis: ws.axis,
    title: ws.title,
    subtitle: ws.axis,
    location: "GFGK",
    drills: 3,
    status: ws.status,
  };
}

// ── Dagtittel-farge (matcher design-kilde: muted for mandag, normal for resten,
//    destructive for turnering-dager) ──────────────────────────────────────────

const DAY_TONE: Record<string, string> = {
  "Man 25.5": "var(--muted-foreground)",
  "Tir 26.5": "var(--foreground)",
  "Ons 27.5": "var(--foreground)",
  "Tor 28.5": "var(--destructive)",
  "Fre 29.5": "var(--destructive)",
  "Lør 30.5": "var(--destructive)",
};

const STATUS_DOT_COLOR: Record<string, string> = {
  DONE: "var(--primary)",
  NEXT: "var(--accent)",
  PLANNED: "var(--muted-foreground)",
  TURNERING: "var(--destructive)",
};

// ── Sett, sammendrag-kni-tiles (matcher design-kilde KPI-rad) ────────────────

const KALENDER_KPI = [
  { label: "Økter totalt", value: 12, unit: "", context: "denne uka", tone: "default" as const },
  { label: "Fullført",     value: 4,  unit: "",  context: "33% av planen", tone: "default" as const },
  { label: "Turneringer",  value: 1,  unit: "",  context: "Sørlandsåpent", tone: "default" as const },
  { label: "Hviledager",   value: 0,  unit: "",  context: "uke 23 har 2", tone: "default" as const },
];

// ── Grupper WEEK_SESSIONS per dag, bevar rekkefølge ─────────────────────────

type DayGroup = { day: string; sessions: Session[] };

function groupByDay(weekSessions: WeekSession[]): DayGroup[] {
  const map = new Map<string, Session[]>();
  weekSessions.forEach((ws, i) => {
    if (!map.has(ws.day)) map.set(ws.day, []);
    map.get(ws.day)!.push(weekSessionToSession(ws, i));
  });
  return Array.from(map.entries()).map(([day, sessions]) => ({ day, sessions }));
}

// ── Hjelp: er dette en turnerings-dag? ───────────────────────────────────────

function isTourDay(day: string) {
  return day.startsWith("Tor") || day.startsWith("Fre") || day.startsWith("Lør");
}

function isToday(day: string) {
  return day === "Tir 26.5";
}

// ── Dag-header (tilsvarer design-kildens day-label-rad) ──────────────────────

function DayHeader({ day, sessionCount }: { day: string; sessionCount: number }) {
  const color = DAY_TONE[day] ?? "var(--foreground)";
  return (
    <div
      className="flex items-baseline gap-2 pb-2 mb-2"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span
        className="font-display font-bold tracking-[-0.02em]"
        style={{ fontSize: 24, color }}
      >
        {day}
      </span>

      {isToday(day) && (
        <span
          className="rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.10em]"
          style={{
            padding: "3px 10px",
            background: "var(--accent)",
            color: "var(--accent-foreground)",
          }}
        >
          I dag
        </span>
      )}

      {isTourDay(day) && (
        <span
          className="rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.10em]"
          style={{
            padding: "3px 10px",
            background: "color-mix(in oklab, var(--destructive) 15%, transparent)",
            color: "var(--destructive)",
            border: "1px solid color-mix(in oklab, var(--destructive) 30%, transparent)",
          }}
        >
          Sørlandsåpent
        </span>
      )}

      <span
        className="ml-auto font-mono uppercase tracking-[0.08em]"
        style={{ fontSize: 11, color: "var(--muted-foreground)" }}
      >
        {sessionCount} ØKTER
      </span>
    </div>
  );
}

// ── Status-chip for uke-sammendrag ────────────────────────────────────────────

const STATUS_CHIPS = [
  { label: "Gjennomført", count: 4, colorKey: "DONE" },
  { label: "Neste",       count: 1, colorKey: "NEXT" },
  { label: "Planlagt",    count: 4, colorKey: "PLANNED" },
  { label: "Turnering",   count: 3, colorKey: "TURNERING" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export default function KalenderSamplePage() {
  const nowTime = useNowTime();
  const allGroups = groupByDay(WEEK_SESSIONS);

  // Split: mandag–onsdag vs turnering (torsdag–lørdag)
  const weekdayGroups = allGroups.filter((g) => !isTourDay(g.day));
  const tourGroups = allGroups.filter((g) => isTourDay(g.day));

  return (
    <ShellWrapper
      player={ØYVIND_USER}
      sessions={TODAY_SESSIONS}
      weather={WEATHER_DATA}
    >
      {/* ── 00 · PageHero ──────────────────────────────────────────────────── */}
      <PageHero
        eyebrow="Uke 22 — sesong 2026"
        title="Kalender."
        italic="syv dager."
        lead="Pyramide-balansert program — 12 økter denne uka, inkludert tre runder av Sørlandsåpent fra torsdag."
        crumb="Hjem"
        crumbHref="/v2-preview/portal"
      />

      {/* ── Status-chips ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {STATUS_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-[6px] rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.10em]"
            style={{
              padding: "5px 12px",
              background: "color-mix(in oklab, var(--foreground) 5%, transparent)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: STATUS_DOT_COLOR[chip.colorKey] }}
            />
            {chip.label}
            <span className="font-display font-bold" style={{ color: "var(--foreground)" }}>
              {chip.count}
            </span>
          </span>
        ))}
      </div>

      <div className="space-y-10 lg:space-y-12">

        {/* ── 01 · Mini-KPI-rad ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            ghostNum="01"
            eyebrow="ØKTSAMMENDRAG · UKE 22"
            title="Uken i tall"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {KALENDER_KPI.map((kpi, i) => (
              <StatTile
                key={kpi.label}
                idx={i}
                hero={i === 0}
                tile={{
                  label: kpi.label,
                  value: kpi.value,
                  unit: kpi.unit,
                  context: kpi.context,
                  tone: kpi.tone,
                }}
              />
            ))}
          </div>
        </section>

        {/* ── 02 · Mandag–Onsdag ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            ghostNum="02"
            eyebrow="DAG FOR DAG"
            title="Mandag–Onsdag"
            description="Treningsdager med teknisk arbeid, slagtrening og mental forberedelse."
          />
          <div className="space-y-8">
            {weekdayGroups.map((group) => (
              <div key={group.day}>
                <DayHeader day={group.day} sessionCount={group.sessions.length} />
                <ItineraryList
                  sessions={group.sessions}
                  nowDecimal={nowTime.decimal}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Foto-skillelinje mellom treningsdager og turnering ──────────────── */}
        <PhotoDivider
          img={22}
          kicker="UKEN HØYDEPUNKT"
          line="Sørlandsåpent torsdag 28. mai — første dag av tre."
          dateLabel="AK GOLF ACADEMY · 28/05/26"
        />

        {/* ── 03 · Torsdag–Lørdag: turnering ─────────────────────────────────── */}
        <section>
          <SectionHeader
            ghostNum="03"
            eyebrow="WEEKEND + TURNERING"
            title="Torsdag–Lørdag"
            description="Sørlandsåpent · Kristiansand GK · 54 huller stroke play."
          />
          <div className="space-y-8">
            {tourGroups.map((group) => (
              <div key={group.day}>
                <DayHeader day={group.day} sessionCount={group.sessions.length} />
                <ItineraryList
                  sessions={group.sessions}
                  nowDecimal={nowTime.decimal}
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── 04 · Neste uke-forhåndsvisning ──────────────────────────────────── */}
        <section>
          <SectionHeader
            ghostNum="04"
            eyebrow="NESTE UKE"
            title="Uke 23"
            description="To hviledager, seks øktdager, fokus på restitusjon etter Sørlandsåpent."
          />

          <div
            className="rounded-2xl border border-border p-6 flex flex-col gap-6"
            style={{ background: "color-mix(in oklab, var(--foreground) 3%, transparent)" }}
          >
            {/* Mini-stat-rad */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Øktdager", value: "6", sub: "av 7" },
                { label: "Hviledager", value: "2", sub: "mandag + søndag" },
                { label: "Turneringer", value: "0", sub: "ingen denne uka" },
                { label: "Fokusakse", value: "FYS", sub: "restitusjon" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-[3px] rounded-xl border border-border p-4"
                  style={{ background: "var(--card)" }}
                >
                  <span className="eyebrow">{item.label}</span>
                  <span
                    className="font-display font-bold tabular-nums leading-none tracking-[-0.02em]"
                    style={{ fontSize: 28 }}
                  >
                    {item.value}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {item.sub}
                  </span>
                </div>
              ))}
            </div>

            {/* Uke 23-agenda-rader */}
            <div>
              <span className="eyebrow eyebrow-w-strek mb-2 block">Planlagte økter uke 23</span>
              <div className="flex flex-col gap-2">
                {[
                  { day: "Tir 02.6", axis: "FYS", title: "Restitusjon + mobilitet" },
                  { day: "Ons 03.6", axis: "TEK", title: "Sving-review — etter Sørlandsåpent" },
                  { day: "Tor 04.6", axis: "SLAG", title: "Wedge-kontroll 50–100 m" },
                  { day: "Fre 05.6", axis: "SPILL", title: "18 huller — scoring-runde" },
                  { day: "Lør 06.6", axis: "SLAG", title: "Bunker + rough-spill" },
                  { day: "Søn 07.6", axis: "TURN", title: "Mental analyse + logg" },
                ].map((item) => (
                  <div
                    key={item.day}
                    className="flex items-center gap-4 rounded-xl border border-border px-4 py-2"
                    style={{ background: "var(--card)" }}
                  >
                    <span
                      className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] shrink-0"
                      style={{ color: "var(--muted-foreground)", minWidth: 72 }}
                    >
                      {item.day}
                    </span>
                    <span
                      className={`pill pill-${item.axis.toLowerCase()} shrink-0`}
                    >
                      {item.axis}
                    </span>
                    <span
                      className="font-display font-semibold tracking-[-0.01em] text-foreground"
                      style={{ fontSize: 14 }}
                    >
                      {item.title}
                    </span>
                    <ChevronRight
                      size={16}
                      className="ml-auto shrink-0 text-muted-foreground"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Check: bekreftet av coach */}
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-2"
              style={{
                background: "color-mix(in oklab, var(--primary) 10%, transparent)",
                border: "1px solid color-mix(in oklab, var(--primary) 25%, transparent)",
              }}
            >
              <Check size={16} style={{ color: "var(--primary)" }} className="shrink-0" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--primary)" }}>
                Bekreftet av coach
              </span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                Anders Kristiansen · 24. mai 2026
              </span>
            </div>
          </div>
        </section>

        {/* ── CTA-bar ─────────────────────────────────────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl border border-dashed py-10 px-8 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.10em] sm:mr-4">
            Planlegg ny økt eller se hele måneden
          </span>
          <div className="flex gap-2 flex-wrap justify-center">
            <Link
              href="/v2-preview/portal/gjennomfore"
              className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] no-underline"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                padding: "12px 24px",
              }}
            >
              <Check size={16} />
              Ny økt
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] no-underline"
              style={{
                background: "color-mix(in oklab, var(--foreground) 8%, transparent)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                padding: "12px 24px",
              }}
            >
              <CalendarDays size={16} />
              Se hele måneden
            </Link>
          </div>
        </div>

      </div>
    </ShellWrapper>
  );
}
