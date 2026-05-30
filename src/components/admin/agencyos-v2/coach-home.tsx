/**
 * CoachHQ Hjem — operations cockpit (Variant A, steg 2 · 3-kolonne)
 * Spec: ui_kits/coachhq (CoachHQ UI-kit) — Fokus-spiller · Timeline · Innboks.
 *
 * Tokens: forest #005840, accent lime #D1F843, surface #FAFAF7.
 * Server Component (kun Links).
 */

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Flame,
  HeartPulse,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { PyramidProgress, type PyramidRow } from "@/components/athletic/pyramid-progress";

export type SgTile = { label: string; value: string; tone: "good" | "bad" | "neutral" };

export type FocusPlayer = {
  id: string;
  name: string;
  hcpLabel: string; // "Hcp 4,2"
  roundsLabel: string; // "14 runder · 2026"
  nextLabel: string; // "Klar 14:30" / "Ingen økt i dag"
  online: boolean;
  sg: SgTile[]; // 4 tiles
  pyramid: PyramidRow[];
};

export type CoachHomeProps = {
  coachName: string;
  isoDateLabel: string; // "MANDAG 23. MAI · UKE 21"
  // KPI
  todaysSessionCount: number;
  enrolledThisWeek: number;
  burningTaskCount: number;
  stallHealthPct: number;
  // Fokus-spiller (venstre kolonne)
  focusPlayer: FocusPlayer | null;
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

      {/* 3-kolonne: Fokus-spiller · Timeline · Innboks */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-[320px_1fr_360px]">
        {/* Fokus-spiller */}
        <FocusPanel player={props.focusPlayer} />

        {/* Tidslinje */}
        <section className="rounded-2xl border border-border bg-card p-6">
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
                    className="pointer-events-auto absolute left-3 right-2 overflow-hidden rounded-xl border border-border border-l-[3px] border-l-primary bg-primary/8 px-4 py-2 transition-colors hover:bg-primary/15"
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

        {/* Innboks */}
        <Inbox burningTasks={props.burningTasks} messages={props.recentMessages} />
      </div>

      {/* Stall-overview-strip */}
      <section className="rounded-2xl border border-border bg-card p-6">
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
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
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

      {/* Siste godkjenninger */}
      <section className="rounded-2xl border border-border bg-card p-6">
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
                  <p className="truncate text-sm text-foreground">{a.title}</p>
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
  );
}

/* ── Fokus-spiller-panel ───────────────────────────────────────────── */
function FocusPanel({ player }: { player: FocusPlayer | null }) {
  if (!player) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Fokus-spiller
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Ingen spiller å vise ennå.
        </p>
      </section>
    );
  }
  const sgColor: Record<SgTile["tone"], string> = {
    good: "text-success",
    bad: "text-destructive",
    neutral: "text-foreground",
  };
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Fokus-spiller
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative">
          <div
            className="grid h-14 w-14 place-items-center rounded-full font-display text-base font-bold text-white"
            style={{ background: avatarBg(player.name) }}
          >
            {initialsFromName(player.name)}
          </div>
          {player.online && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-accent ring-2 ring-card" />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-xl font-bold tracking-tight text-foreground">
            {player.name}
          </div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            {player.hcpLabel} · {player.roundsLabel} · {player.nextLabel}
          </div>
        </div>
      </div>

      {/* 4 SG-tiles */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {player.sg.map((t) => (
          <div key={t.label} className="rounded-xl border border-border bg-background p-3">
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              {t.label}
            </div>
            <div
              className={`mt-1.5 font-mono text-xl font-semibold tabular-nums leading-none ${sgColor[t.tone]}`}
            >
              {t.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pyramide */}
      <div className="mt-5">
        <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Pyramide · siste 30 d
        </div>
        <PyramidProgress rows={player.pyramid} />
      </div>

      <Link
        href={`/admin/spillere/${player.id}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-display text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Åpne spillerprofil
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    </section>
  );
}

/* ── Innboks ───────────────────────────────────────────────────────── */
function Inbox({
  burningTasks,
  messages,
}: {
  burningTasks: CoachHomeProps["burningTasks"];
  messages: CoachHomeProps["recentMessages"];
}) {
  const items = [
    ...burningTasks.map((t) => ({
      key: `b-${t.id}`,
      name: t.title,
      detail: t.deadline,
      href: t.href,
      badge: "Haster",
      tone: "urgent" as const,
    })),
    ...messages.map((m) => ({
      key: `m-${m.id}`,
      name: m.from,
      detail: m.preview,
      href: "/admin/innboks",
      badge: m.timeAgo,
      tone: "neutral" as const,
    })),
  ].slice(0, 6);

  const toneCls: Record<"urgent" | "neutral", string> = {
    urgent: "bg-destructive/12 text-destructive",
    neutral: "bg-secondary text-muted-foreground",
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Innboks · {burningTasks.length} krever handling
          </div>
        </div>
        <Link
          href="/admin/innboks"
          className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary hover:underline"
        >
          Se alle →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Innboksen er rolig.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={it.key}>
              <Link
                href={it.href}
                className={`flex items-center gap-3 py-2.5 ${i < items.length - 1 ? "border-b border-border" : ""}`}
              >
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                  style={{ background: avatarBg(it.name) }}
                >
                  {initialsFromName(it.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-foreground">
                    {it.name}
                  </div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">
                    {it.detail}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] ${toneCls[it.tone]}`}
                >
                  {it.badge}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
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
