/**
 * AgencyOS — Kalender, /admin/kalender  (hybrid terminal design 2026-06-17).
 *
 * Layout: left panel (320px) = mini week-grid + kommende-liste.
 *         right panel = dag-visning med tid-slot-blokker.
 * Datakilde: loadWeekCalendar (Prisma booking). ?uke=YYYY-MM-DD støttes.
 */

import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadWeekCalendar } from "@/lib/admin-kalender/week-data";
import { AgChip, agBtnClass } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ uke?: string }>;

/* ───────────── akse-farger ───────────── */
type Akse = "fys" | "tek" | "slag" | "spill" | "turn";

function akseFra(serviceLabel: string): Akse {
  const t = serviceLabel.toLowerCase();
  if (/(fys|speed|styrke|screening|mobilitet)/.test(t)) return "fys";
  if (/(turnering)/.test(t)) return "turn";
  if (/(trackman|driver|innspill|wedge|jern|slag)/.test(t)) return "slag";
  if (/(spill|bane|hull|runde|tee)/.test(t)) return "spill";
  return "tek";
}

const AKSE_BAR: Record<Akse, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

/* Dag/Slot constants */
const VINDU_START_MIN = 7 * 60;   // 07:00


const DOW_SHORT = ["Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"];
const MND_NB = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

function hhmm(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/* slot-type: forest = live coaching, lime = trackman/slag, bg3 = other */
type SlotKind = "forest" | "lime" | "bg3";

function kindFra(serviceLabel: string, isLive: boolean): SlotKind {
  if (isLive) return "forest";
  const t = serviceLabel.toLowerCase();
  if (/(trackman|slag|sg|putting|putt)/.test(t)) return "lime";
  return "bg3";
}

/* ───────────── page ───────────── */

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { uke } = await searchParams;
  const props = await loadWeekCalendar(uke);

  const now = new Date();
  const todayDow = (now.getDay() + 6) % 7; // 0=man … 6=søn
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Today's events for day-view (right panel)
  const todayEvents = props.events
    .filter((e) => e.dayIndex === todayDow || (props.nowDayIndex !== null && e.dayIndex === props.nowDayIndex))
    .sort((a, b) => a.startMin - b.startMin);

  // Upcoming events across the week (kommende panel)
  const kommendeEvents = props.events
    .filter((e) => {
      if (!props.isCurrentWeek) return true;
      const todayIdx = props.nowDayIndex ?? 0;
      return e.dayIndex > todayIdx || (e.dayIndex === todayIdx && e.startMin > nowMin);
    })
    .sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.startMin - b.startMin;
    })
    .slice(0, 5);

  // Time slots 07:00–17:00 (hourly)
  const timeSlots = Array.from({ length: 11 }, (_, i) => ({
    min: VINDU_START_MIN + i * 60,
    label: hhmm(VINDU_START_MIN + i * 60),
  }));

  // Day header label for right panel
  const todayDate = now.getDate();
  const todayMnd = MND_NB[now.getMonth()];
  const todayDowLabel = DOW_SHORT[todayDow];

  // Prev/next week URLs
  const prevHref = `/admin/kalender?uke=${props.prevWeekParam}`;
  const nextHref = `/admin/kalender?uke=${props.nextWeekParam}`;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>

      {/* ── Topbar ── */}
      <div className="flex items-center gap-3 border-b border-border bg-background/50 px-5 py-3 backdrop-blur-sm">
        <div>
          <div className="font-display text-[19px] font-bold leading-tight tracking-tight text-foreground">
            Kalender
          </div>
          <div className="font-mono text-[10.5px] text-muted-foreground">
            Uke {props.weekNumber} · {props.rangeLabel}
          </div>
        </div>

        {/* View tabs Dag / Uke / Måned */}
        <div className="ml-2 flex gap-[3px] rounded-[10px] border border-border bg-card p-[3px]">
          {[
            { label: "Dag", href: `/admin/kalender?uke=${uke ?? ""}`, active: true },
            { label: "Uke", href: `/admin/kalender?uke=${uke ?? ""}`, active: false },
            { label: "Måned", href: "/admin/kalender/maned", active: false },
          ].map((v) => (
            <Link
              key={v.label}
              href={v.href}
              className={cn(
                "rounded-[8px] px-[11px] py-[6px] font-mono text-[10px] font-bold tracking-wide transition-colors",
                v.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={prevHref}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Forrige uke"
          >
            <ChevronLeft size={14} strokeWidth={1.8} />
          </Link>
          <Link
            href={nextHref}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Neste uke"
          >
            <ChevronRight size={14} strokeWidth={1.8} />
          </Link>
          <Link href="/admin/coach-workbench" className={agBtnClass("primary", "sm")}>
            <Plus size={13} strokeWidth={2.4} />
            Ny økt
          </Link>
        </div>
      </div>

      {/* ── Body: left panel + right day-view ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: mini week grid + kommende ── */}
        <div className="hidden w-[300px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-border p-4 md:flex">

          {/* Week label */}
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Uke {props.weekNumber} · {MND_NB[now.getMonth()]} {now.getFullYear()}
          </div>

          {/* 7-day mini grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {DOW_SHORT.map((d) => (
              <div
                key={d}
                className="pb-1 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
              >
                {d.slice(0, 2).toLowerCase()}
              </div>
            ))}
            {props.days.map((day, i) => {
              const hasEvents = props.events.some((e) => e.dayIndex === i);
              const isFull = props.events.filter((e) => e.dayIndex === i).length >= 4;
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-[6px] border font-mono text-[13px] font-semibold",
                    day.isToday
                      ? "border-primary bg-primary/10 text-primary"
                      : isFull
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground",
                    day.weekend && !day.isToday && !isFull && "text-muted-foreground opacity-50",
                  )}
                >
                  {day.date}
                  {hasEvents && !isFull && (
                    <span
                      aria-hidden
                      className="absolute bottom-1.5 left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-primary"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
            <span className="flex items-center gap-[5px]">
              <span className="h-[5px] w-[5px] rounded-full bg-primary" />Økt
            </span>
            <span className="flex items-center gap-[5px]">
              <span className="h-[5px] w-[5px] rounded-full bg-primary" />Turnering
            </span>
          </div>

          {/* Kommende */}
          <div className="mt-1 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Kommende
          </div>
          <div className="flex flex-col gap-2">
            {kommendeEvents.length === 0 ? (
              <p className="font-mono text-[11px] text-muted-foreground">Ingen kommende økter.</p>
            ) : (
              kommendeEvents.map((e) => {
                const day = props.days[e.dayIndex];
                return (
                  <Link
                    key={e.id}
                    href={e.href}
                    className="flex items-center gap-2.5 rounded-[8px] border border-border bg-card p-[9px] transition-colors hover:bg-secondary"
                  >
                    {/* Date badge */}
                    <div className="flex h-[30px] w-[30px] shrink-0 flex-col items-center justify-center rounded-[6px] bg-background">
                      <span className="font-mono text-[13px] font-bold leading-none text-foreground">
                        {day.date}
                      </span>
                      <span className="font-mono text-[7.5px] text-muted-foreground">
                        {DOW_SHORT[e.dayIndex].toLowerCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-semibold text-foreground">
                        {e.serviceLabel}
                      </div>
                      <div className="mt-px font-mono text-[9.5px] text-muted-foreground">
                        {e.timeLabel} · {e.title}
                      </div>
                    </div>
                    <AgChip tone={e.kind === "live" ? "lime" : "neu"}>
                      {e.kind === "live" ? "Live" : "Planlagt"}
                    </AgChip>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: day view ── */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Day heading */}
          <div className="mb-4 flex items-center gap-3">
            <span className="font-display text-[18px] font-bold text-foreground">
              I dag · {todayDowLabel.toLowerCase()}dag {todayDate}. {todayMnd}
            </span>
            {props.isCurrentWeek && (
              <span className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold text-primary">
                <span
                  aria-hidden
                  className="h-[6px] w-[6px] rounded-full bg-primary motion-safe:animate-pulse"
                />
                Live nå
              </span>
            )}
          </div>

          {/* Time slots */}
          <div className="flex flex-col gap-px">
            {timeSlots.map(({ min, label }) => {
              const slotEvents = todayEvents.filter(
                (e) => e.startMin >= min && e.startMin < min + 60,
              );
              return (
                <div
                  key={label}
                  className="grid min-h-[48px] items-start gap-[10px]"
                  style={{ gridTemplateColumns: "48px 1fr" }}
                >
                  {/* Time label */}
                  <div className="pt-[10px] text-right font-mono text-[11px] text-muted-foreground">
                    {label}
                  </div>
                  {/* Slot content */}
                  <div className="border-t border-border py-2">
                    <div className="flex flex-col gap-1.5">
                      {slotEvents.map((e) => {
                        const kind = kindFra(e.serviceLabel, e.kind === "live");
                        const akse = akseFra(e.serviceLabel);
                        const duration = e.endMin - e.startMin;
                        return (
                          <Link
                            key={e.id}
                            href={e.href}
                            className={cn(
                              "flex items-center gap-[9px] rounded-[8px] px-[11px] py-[9px] transition-colors",
                              kind === "forest"
                                ? "bg-primary/10 text-foreground hover:bg-primary/15"
                                : kind === "lime"
                                  ? "bg-primary/20 text-foreground hover:bg-primary/25"
                                  : "bg-card text-foreground hover:bg-secondary",
                              e.isCompleted && "opacity-60",
                            )}
                          >
                            {/* Icon box */}
                            <span
                              className={cn(
                                "flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px]",
                                kind === "forest"
                                  ? "bg-primary/20 text-primary"
                                  : kind === "lime"
                                    ? "bg-primary/30 text-primary-foreground"
                                    : "bg-secondary text-muted-foreground",
                              )}
                              aria-hidden
                            >
                              <span
                                className={cn(
                                  "block h-[3px] w-[14px] rounded-full",
                                  AKSE_BAR[akse],
                                )}
                              />
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-[13.5px] font-semibold leading-tight text-foreground">
                                {e.serviceLabel}
                              </div>
                              <div className="mt-px font-mono text-[10.5px] text-muted-foreground">
                                {e.timeLabel}–{hhmm(e.endMin)} · {e.title}
                                {e.location ? ` · ${e.location}` : ""}
                              </div>
                            </div>
                            {e.kind === "live" && (
                              <AgChip tone="lime">LIVE</AgChip>
                            )}
                            <span className="ml-1 shrink-0 font-mono text-[9px] text-muted-foreground">
                              {duration} m
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {todayEvents.length === 0 && (
            <p className="mt-8 text-center font-mono text-[12px] text-muted-foreground">
              Ingen økter planlagt i dag.
            </p>
          )}
        </div>

      </div>

      {/* ── Mobile fallback: week list ── */}
      <div className="flex flex-col gap-4 p-4 md:hidden">
        {props.days.map((day, di) => {
          const okter = props.events
            .filter((e) => e.dayIndex === di)
            .sort((a, b) => a.startMin - b.startMin);
          return (
            <section key={di}>
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground after:h-px after:flex-1 after:bg-border after:content-['']">
                {DOW_SHORT[di]} {day.date}. {day.month}
                {day.isToday && <AgChip tone="lime">I dag</AgChip>}
              </div>
              {okter.length === 0 ? (
                <p className="px-1 py-1 text-[13px] text-muted-foreground">Ingen økter.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {okter.map((e) => (
                    <Link
                      key={e.id}
                      href={e.href}
                      className={cn(
                        "relative flex min-h-[52px] items-center gap-3 rounded-[10px] border border-border bg-card py-2 pl-4 pr-3 transition-colors hover:bg-secondary",
                        e.kind === "live" && "ring-1 ring-primary",
                        e.isCompleted && "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute bottom-2 left-0 top-2 w-[3px] rounded-full",
                          AKSE_BAR[akseFra(e.serviceLabel)],
                        )}
                        aria-hidden
                      />
                      <span className="w-[44px] shrink-0 font-mono text-[11px] font-bold leading-[1.2] tabular-nums text-foreground">
                        {e.timeLabel}
                        <span className="mt-0.5 block font-mono text-[9px] font-semibold text-muted-foreground">
                          {e.endMin - e.startMin} m
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-foreground">
                          {e.serviceLabel}
                        </span>
                        <span className="mt-px block truncate font-mono text-[10px] text-muted-foreground">
                          {e.title}{e.location ? ` · ${e.location}` : ""}
                        </span>
                      </span>
                      {e.kind === "live" && <AgChip tone="lime">Live</AgChip>}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

    </div>
  );
}
