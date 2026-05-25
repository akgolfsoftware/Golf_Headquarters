"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import {
  ShellWrapper,
  PageHero,
  SectionHeader,
  ItineraryList,
  useNowTime,
} from "@/components/v2";
import {
  ØYVIND_USER,
  TODAY_SESSIONS,
  WEEK_SESSIONS,
  WEATHER_DATA,
} from "@/lib/v2-fixtures";
import type { Session, WeekSession } from "@/lib/v2-fixtures";

// ── Konverter WeekSession til Session-format for ItineraryList ───────────────

function weekSessionToSession(ws: WeekSession, idx: number): Session {
  const [hStr, mStr] = ws.time.split(":");
  const startH = parseInt(hStr, 10) + parseInt(mStr, 10) / 60;
  // Estimert varighet: 90 min som standard
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

// ── Grupper WEEK_SESSIONS per dag ─────────────────────────────────────────────

type DayGroup = {
  day: string;
  sessions: Session[];
};

function groupByDay(weekSessions: WeekSession[]): DayGroup[] {
  const map = new Map<string, Session[]>();
  weekSessions.forEach((ws, i) => {
    if (!map.has(ws.day)) map.set(ws.day, []);
    map.get(ws.day)!.push(weekSessionToSession(ws, i));
  });
  return Array.from(map.entries()).map(([day, sessions]) => ({ day, sessions }));
}

const STATUS_COLOR: Record<string, string> = {
  DONE: "var(--primary)",
  NEXT: "var(--accent)",
  PLANNED: "hsl(var(--muted-foreground))",
  TURNERING: "var(--destructive)",
};

export default function KalenderSamplePage() {
  const nowTime = useNowTime();
  const dayGroups = groupByDay(WEEK_SESSIONS);

  return (
    <ShellWrapper
      player={ØYVIND_USER}
      sessions={TODAY_SESSIONS}
      weather={WEATHER_DATA}
    >
      {/* Page hero */}
      <PageHero
        eyebrow="PROGRAMMET DITT"
        title="Kalender"
        italic="uke 21"
        lead="Full ukevisning for perioden 25–31. mai 2026. Turnering torsdag–lørdag."
        crumb="Hjem"
        crumbHref="/v2-preview/portal"
      />

      {/* Uke-status chips */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(
          [
            { label: "Gjennomført", count: 4, color: STATUS_COLOR.DONE },
            { label: "Neste", count: 1, color: STATUS_COLOR.NEXT },
            { label: "Planlagt", count: 4, color: STATUS_COLOR.PLANNED },
            { label: "Turnering", count: 3, color: STATUS_COLOR.TURNERING },
          ] as const
        ).map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-[6px] rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.10em]"
            style={{
              padding: "5px 12px",
              background:
                "color-mix(in oklab, var(--foreground) 5%, transparent)",
              border: "1px solid var(--border)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: chip.color }}
            />
            {chip.label}
            <span
              className="font-display font-bold"
              style={{ color: "var(--foreground)" }}
            >
              {chip.count}
            </span>
          </span>
        ))}
      </div>

      {/* Day sections */}
      <div className="space-y-10">
        {dayGroups.map((group) => {
          const isTournament = group.sessions.some(
            (s) => s.status === "TURNERING",
          );
          return (
            <section key={group.day}>
              <SectionHeader
                eyebrow={isTournament ? "TURNERING" : "TRENINGSDAG"}
                title={group.day}
                description={
                  isTournament
                    ? "Sørlandsåpent · Kristiansand GK · 54 huller stroke play"
                    : undefined
                }
              />
              <ItineraryList
                sessions={group.sessions}
                nowDecimal={nowTime.decimal}
              />
            </section>
          );
        })}
      </div>

      {/* Ny økt stub */}
      <div
        className="mt-12 flex flex-col items-center justify-center gap-4 rounded-[20px] border border-dashed py-10 px-8 text-center"
        style={{ borderColor: "var(--border)" }}
      >
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.10em]">
          Planlegg ny økt
        </span>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] no-underline"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            padding: "12px 24px",
          }}
        >
          <Plus size={16} />
          Ny økt-wizard
        </Link>
        <p className="m-0 text-[12px] text-muted-foreground">
          Stub — Booking-flyten implementeres i neste sprint.
        </p>
      </div>
    </ShellWrapper>
  );
}
