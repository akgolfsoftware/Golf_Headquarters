/**
 * CoachHQ Hjem — pixel-perfekt operations cockpit (Variant A)
 * Spec: sesjon-1-hjem-og-spiller.md, skjerm 2.
 *
 * Tokens: forest #005840, accent lime #D1F843, surface #FAFAF7.
 * Server Component (kun Links).
 */

import Link from "next/link";
import {
  AlertOctagon,
  ArrowRight,
  CalendarClock,
  Flame,
  HeartPulse,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

export type CoachHomeProps = {
  coachName: string;
  isoDateLabel: string; // "MANDAG 23. MAI · UKE 21"
  // KPI
  todaysSessionCount: number;
  enrolledThisWeek: number;
  burningTaskCount: number;
  stallHealthPct: number;
  // Timeline
  timeline: {
    id: string;
    startTime: Date;
    endTime: Date;
    playerName: string;
    serviceName: string;
    locationName: string;
  }[];
  // Brennende oppgaver
  burningTasks: {
    id: string;
    title: string;
    deadline: string;
    href: string;
  }[];
  // Stall-overview
  stallOverview: {
    id: string;
    name: string;
    avatarUrl: string | null;
    status: "aktiv" | "skadet" | "permisjon";
  }[];
  // Workspace quick
  workspaceTasks: { id: string; title: string; href: string }[];
  // Aktivitet-strøm
  recentMessages: { id: string; from: string; preview: string; timeAgo: string }[];
  recentApprovals: { id: string; title: string; timeAgo: string }[];
};

const STATUS_COLOR: Record<CoachHomeProps["stallOverview"][number]["status"], string> = {
  aktiv: "hsl(var(--success))",
  skadet: "hsl(var(--destructive))",
  permisjon: "hsl(var(--warning))",
};

function timeStr(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

const TIMELINE_START_HOUR = 8;
const TIMELINE_END_HOUR = 20;
const HOUR_HEIGHT = 56; // px per hour

export function CoachHome(props: CoachHomeProps) {
  const fornavn = props.coachName.split(" ")[0];

  return (
    <div className="space-y-6">
      {/* HERO */}
      <header>
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {props.isoDateLabel}
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
          God morgen,{" "}
          <em
            className="font-normal not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            {fornavn}
          </em>
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Du har <span className="font-semibold text-foreground">{props.todaysSessionCount} økter</span> i dag og{" "}
          <span className="font-semibold text-destructive">{props.burningTaskCount} ting som brenner</span>.
        </p>
      </header>

      {/* KPI-strip */}
      <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {/* Featured: Aktive økter */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{
            background: "linear-gradient(135deg, #005840 0%, #003A2A 100%)",
          }}
        >
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-white/70">
            Aktive økter i dag
          </div>
          <div className="mt-2 font-mono text-[38px] font-semibold leading-none tabular-nums text-accent">
            {props.todaysSessionCount}
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-accent/80">
            sortert kronologisk
          </div>
        </div>

        <Kpi
          icon={Users}
          eyebrow="Påmeldte denne uka"
          value={String(props.enrolledThisWeek)}
          sub="spillere"
        />
        <Kpi
          icon={Flame}
          eyebrow="Brennende oppgaver"
          value={String(props.burningTaskCount)}
          sub={props.burningTaskCount === 0 ? "alt klart" : "krever handling"}
          tone={props.burningTaskCount > 0 ? "danger" : "good"}
        />
        <Kpi
          icon={HeartPulse}
          eyebrow="Stall-helse"
          value={`${props.stallHealthPct}%`}
          sub="aktive siste 30d"
        />
      </section>

      {/* I dag-tidslinje + Brennende oppgaver */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Tidslinje */}
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
          <div className="mb-6 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                I dag
              </div>
              <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
                <em
                  className="font-normal not-italic"
                  style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontStyle: "italic",
                    color: "hsl(var(--primary))",
                  }}
                >
                  Tidslinje
                </em>{" "}
                · 08:00 — 20:00
              </h2>
            </div>
            <Link
              href="/admin/kalender"
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
            >
              Full kalender →
            </Link>
          </div>

          <div className="relative">
            {/* Hour-rows */}
            <div>
              {Array.from(
                { length: TIMELINE_END_HOUR - TIMELINE_START_HOUR },
                (_, i) => TIMELINE_START_HOUR + i,
              ).map((h) => (
                <div
                  key={h}
                  className="relative flex items-start gap-2 border-t border-border first:border-t-0"
                  style={{ height: HOUR_HEIGHT }}
                >
                  <div className="w-12 shrink-0 pt-1 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {String(h).padStart(2, "0")}:00
                  </div>
                  <div className="flex-1" />
                </div>
              ))}
            </div>

            {/* Event-cards absolutt-plassert */}
            <div className="pointer-events-none absolute left-12 right-0 top-0">
              {props.timeline.map((ev) => {
                const startH =
                  ev.startTime.getHours() + ev.startTime.getMinutes() / 60;
                const endH =
                  ev.endTime.getHours() + ev.endTime.getMinutes() / 60;
                if (endH < TIMELINE_START_HOUR || startH > TIMELINE_END_HOUR)
                  return null;
                const top = (startH - TIMELINE_START_HOUR) * HOUR_HEIGHT;
                const height = Math.max(
                  32,
                  (endH - startH) * HOUR_HEIGHT - 4,
                );
                return (
                  <Link
                    key={ev.id}
                    href={`/admin/kalender#${ev.id}`}
                    className="pointer-events-auto absolute left-3 right-2 overflow-hidden rounded-xl border border-primary/20 bg-primary/8 px-4 py-2 transition-colors hover:bg-primary/15"
                    style={{ top, height }}
                  >
                    <div className="font-mono text-[10px] font-semibold tabular-nums text-primary">
                      {timeStr(ev.startTime)} – {timeStr(ev.endTime)}
                    </div>
                    <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {ev.playerName} · {ev.serviceName}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {ev.locationName}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick-add */}
          <div className="mt-4 border-t border-dashed border-border pt-4">
            <Link
              href="/admin/kalender?action=ny-okt"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground hover:text-primary"
            >
              <Plus size={12} strokeWidth={2} />
              Quick-add økt
            </Link>
          </div>
        </section>

        {/* Brennende oppgaver */}
        <section
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
        >
          <div
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-1.5"
            style={{ background: "hsl(var(--destructive))" }}
          />
          <div className="pl-4">
            <div className="flex items-center gap-2">
              <AlertOctagon
                size={16}
                strokeWidth={1.75}
                className="text-destructive"
              />
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-destructive">
                Brennende
              </div>
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold leading-snug text-foreground">
              Krever handling
            </h2>
            {props.burningTasks.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Ingen brennende oppgaver. Pust ut.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {props.burningTasks.map((t) => (
                  <li
                    key={t.id}
                    className="rounded-xl border border-[#A32D2D]/15 bg-destructive/5 p-4"
                  >
                    <Link
                      href={t.href}
                      className="group block"
                    >
                      <div className="text-sm font-semibold text-foreground group-hover:text-destructive">
                        {t.title}
                      </div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-destructive">
                        {t.deadline}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Stall-overview-strip */}
      <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Stallen
            </div>
            <h2 className="mt-1 font-display text-lg font-semibold text-foreground">
              Mine spillere
            </h2>
          </div>
          <Link
            href="/admin/spillere"
            className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
          >
            Hele stallen →
          </Link>
        </div>
        {props.stallOverview.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ingen aktive spillere ennå.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {props.stallOverview.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/admin/spillere/${p.id}`}
                className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary"
              >
                <div className="relative">
                  {p.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatarUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="grid h-12 w-12 place-items-center rounded-full font-mono text-xs font-semibold text-white"
                      style={{ background: avatarBg(p.name) }}
                    >
                      {initialsFromName(p.name)}
                    </div>
                  )}
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card"
                    style={{ background: STATUS_COLOR[p.status] }}
                  />
                </div>
                <div className="min-w-0 text-center">
                  <div className="truncate text-xs font-semibold text-foreground group-hover:text-primary">
                    {p.name.split(" ")[0]}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                    {p.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Workspace-quick-strip */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
      >
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-1.5"
          style={{ background: "hsl(var(--accent))" }}
        />
        <div className="pl-4">
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} strokeWidth={1.75} className="text-primary" />
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                Workspace
              </div>
            </div>
            <Link
              href="/admin/workspace/tildelt-meg"
              className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
            >
              Åpne workspace
              <ArrowRight size={12} strokeWidth={2} />
            </Link>
          </div>
          {props.workspaceTasks.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Ingen oppgaver tildelt akkurat nå.
            </p>
          ) : (
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {props.workspaceTasks.slice(0, 3).map((t) => (
                <li key={t.id}>
                  <Link
                    href={t.href}
                    className="block rounded-xl border border-accent/40 bg-accent/8 p-4 text-sm text-foreground transition-colors hover:bg-accent/20"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Aktivitet-strøm 2-kol */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
          <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Siste meldinger
          </div>
          {props.recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Innboksen er rolig.</p>
          ) : (
            <ul className="space-y-2">
              {props.recentMessages.slice(0, 4).map((m) => (
                <li
                  key={m.id}
                  className="border-b border-border pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {m.from}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {m.timeAgo}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {m.preview}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 sm:p-6">
          <div className="mb-2 flex items-center gap-2">
            <CalendarClock
              size={14}
              strokeWidth={1.75}
              className="text-muted-foreground"
            />
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Siste godkjenninger
            </div>
          </div>
          {props.recentApprovals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Alt godkjent.</p>
          ) : (
            <ul className="space-y-2">
              {props.recentApprovals.slice(0, 4).map((a) => (
                <li
                  key={a.id}
                  className="flex items-start justify-between gap-2 border-b border-border pb-2 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      {a.title}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {a.timeAgo}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({
  icon: Icon,
  eyebrow,
  value,
  sub,
  tone,
}: {
  icon: typeof Users;
  eyebrow: string;
  value: string;
  sub: string;
  tone?: "good" | "danger";
}) {
  const valueColor =
    tone === "danger" ? "text-destructive" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {eyebrow}
        </span>
        <Icon size={14} strokeWidth={1.75} className="text-muted-foreground" />
      </div>
      <div
        className={`mt-2 font-mono text-[28px] font-semibold leading-none tabular-nums ${valueColor}`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}
