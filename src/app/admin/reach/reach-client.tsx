"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Flame,
  MessageCircle,
  Send,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";

export type ReachData = {
  isDummy: boolean;
  totalPlayers: number;
  active7d: number;
  active30d: number;
  avgCompliance: number;
  messageReadRate: number;
  daily: { date: string; active: number }[];
  players: {
    id: string;
    name: string;
    avatarUrl: string | null;
    sessions7d: number;
    compliancePct: number;
    lastSeen: string | null;
    status: "green" | "amber" | "red";
  }[];
  topEngaged: {
    id: string;
    name: string;
    avatarUrl: string | null;
    compliancePct: number;
    readRatePct: number;
    aiCaddieThreads: number;
  }[];
  needsFollowup: {
    id: string;
    name: string;
    avatarUrl: string | null;
    compliancePct: number;
    readRatePct: number;
    lastSeen: string | null;
  }[];
  featureUsage: { label: string; count: number }[];
};

const FILTERS = ["Alle", "Trenger oppfølging", "Topp engasjerte"] as const;
type Filter = (typeof FILTERS)[number];

export function ReachClient({ data }: { data: ReachData }) {
  const [filter, setFilter] = useState<Filter>("Alle");

  const active7dPct = data.totalPlayers
    ? Math.round((data.active7d / data.totalPlayers) * 100)
    : 0;
  const active30dPct = data.totalPlayers
    ? Math.round((data.active30d / data.totalPlayers) * 100)
    : 0;

  const filteredPlayers = useMemo(() => {
    if (filter === "Trenger oppfølging")
      return data.players.filter(
        (p) => p.status === "red" || p.compliancePct < 50,
      );
    if (filter === "Topp engasjerte")
      return [...data.players]
        .sort((a, b) => b.compliancePct - a.compliancePct)
        .slice(0, 10);
    return data.players;
  }, [filter, data.players]);

  return (
    <div className="space-y-8">
      {/* HERO */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span
            aria-hidden="true"
            className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Reach & Engasjement · Siste 30 dager
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Plattform-{" "}
            <em className="font-normal italic text-primary">engasjement</em>
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {data.totalPlayers} spillere · hvor mye lander det vi sender, og hvem
            trenger oppmerksomhet?
          </p>
        </div>
        {data.isDummy && (
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-amber-700 dark:text-amber-300">
            <Sparkles size={12} strokeWidth={1.75} />
            Eksempeldata
          </div>
        )}
      </header>

      {/* KPI-STRIP */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Users}
          label="Aktive (7d)"
          value={`${data.active7d}`}
          sub={`av ${data.totalPlayers} (${active7dPct}%)`}
          progress={active7dPct}
        />
        <Kpi
          icon={TrendingUp}
          label="Aktive (30d)"
          value={`${data.active30d}`}
          sub={`av ${data.totalPlayers} (${active30dPct}%)`}
          progress={active30dPct}
        />
        <Kpi
          icon={CheckCircle2}
          label="Snitt-compliance"
          value={`${data.avgCompliance}%`}
          sub="Fullført vs planlagt"
          progress={data.avgCompliance}
          tone={
            data.avgCompliance >= 75
              ? "good"
              : data.avgCompliance >= 50
                ? "warn"
                : "bad"
          }
        />
        <Kpi
          icon={MessageCircle}
          label="Åpningsrate meldinger"
          value={`${data.messageReadRate}%`}
          sub="Read-rate siste 30d"
          progress={data.messageReadRate}
          tone={
            data.messageReadRate >= 75
              ? "good"
              : data.messageReadRate >= 50
                ? "warn"
                : "bad"
          }
        />
      </section>

      {/* DAGLIG AKTIVITET — LINJEGRAF */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Daglige aktive{" "}
              <em className="font-normal italic text-primary">spillere</em>
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Siste 30 dager · spillere som logget økt, runde, AI-tråd, mål eller
              åpnet melding
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Daglig
          </span>
        </div>
        <LineChart data={data.daily} totalPlayers={data.totalPlayers} />
      </section>

      {/* TOPP ENGASJERTE + TRENGER OPPFØLGING */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Topp engasjerte */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Flame
              size={16}
              strokeWidth={1.75}
              className="text-primary"
            />
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Topp{" "}
              <em className="font-normal italic text-primary">engasjerte</em>
            </h3>
          </div>
          <ul className="space-y-3">
            {data.topEngaged.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3 transition-colors hover:bg-secondary/40"
              >
                <span className="font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
                  #{i + 1}
                </span>
                <Avatar name={p.name} avatarUrl={p.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/spillere/${p.id}`}
                    className="block truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-1 flex items-center gap-3 font-mono text-[10px] tabular-nums text-muted-foreground">
                    <span>{p.compliancePct}% compliance</span>
                    <span>·</span>
                    <span>{p.readRatePct}% lest</span>
                    <span>·</span>
                    <span>{p.aiCaddieThreads} AI-tråder</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Trenger oppfølging */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/[0.03] p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle
              size={16}
              strokeWidth={1.75}
              className="text-destructive"
            />
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Trenger{" "}
              <em className="font-normal italic text-destructive">
                oppfølging
              </em>
            </h3>
          </div>
          <ul className="space-y-3">
            {data.needsFollowup.map((p) => {
              const dager = p.lastSeen ? daysSince(p.lastSeen) : null;
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 p-3"
                >
                  <Avatar name={p.name} avatarUrl={p.avatarUrl} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/admin/spillere/${p.id}`}
                      className="block truncate text-sm font-medium text-foreground hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 font-mono text-[10px] tabular-nums text-muted-foreground">
                      <span className="text-destructive">
                        {p.compliancePct}% compliance
                      </span>
                      <span>·</span>
                      <span>{p.readRatePct}% lest</span>
                      {dager != null && (
                        <>
                          <span>·</span>
                          <span>sett {dager}d siden</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/admin/innboks?ny=${p.id}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Send size={12} strokeWidth={1.75} />
                    Send
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* COMPLIANCE-TABELL */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Compliance per{" "}
              <em className="font-normal italic text-primary">spiller</em>
            </h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Sortert etter lavest compliance · klikk for å åpne profilen
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.06em] transition-colors ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left">
              <tr>
                <Th>Spiller</Th>
                <Th>Økter sist uke</Th>
                <Th>Compliance</Th>
                <Th>Sist sett</Th>
                <Th>Status</Th>
                <Th aria-label="Handling" />
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center font-mono text-xs text-muted-foreground"
                  >
                    Ingen spillere matcher filteret.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                  >
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={p.name}
                          avatarUrl={p.avatarUrl}
                          size="sm"
                        />
                        <Link
                          href={`/admin/spillere/${p.id}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {p.name}
                        </Link>
                      </div>
                    </Td>
                    <Td className="font-mono text-xs tabular-nums">
                      {p.sessions7d}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                          <div
                            className={`h-full rounded-full transition-all ${complianceBarColor(
                              p.compliancePct,
                            )}`}
                            style={{ width: `${p.compliancePct}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs tabular-nums text-foreground">
                          {p.compliancePct}%
                        </span>
                      </div>
                    </Td>
                    <Td className="font-mono text-xs text-muted-foreground">
                      {p.lastSeen ? formatRelative(p.lastSeen) : "—"}
                    </Td>
                    <Td>
                      <StatusDot status={p.status} />
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/admin/spillere/${p.id}`}
                        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
                      >
                        Åpne
                        <ArrowRight size={12} strokeWidth={1.75} />
                      </Link>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </section>

      {/* FEATURE-BRUK BAR CHART */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Feature-{" "}
              <em className="font-normal italic text-primary">bruk</em>
            </h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Antall unike spillere som har brukt featuret siste 30 dager
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Adoption
          </span>
        </div>
        <FeatureBarChart
          data={data.featureUsage}
          totalPlayers={data.totalPlayers}
        />
      </section>
    </div>
  );
}

// ------- HELPERS -------

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  progress,
  tone = "neutral",
}: {
  icon: typeof Users;
  label: string;
  value: string;
  sub?: string;
  progress?: number;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const valueColor =
    tone === "bad"
      ? "text-destructive"
      : tone === "good"
        ? "text-primary"
        : "text-foreground";
  const barColor =
    tone === "bad"
      ? "bg-destructive"
      : tone === "warn"
        ? "bg-amber-500"
        : "bg-primary";

  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon size={14} strokeWidth={1.75} />
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-3xl font-semibold tabular-nums ${valueColor}`}
      >
        {value}
      </div>
      {typeof progress === "number" && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      )}
      {sub && (
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

function Avatar({
  name,
  avatarUrl,
  size = "md",
}: {
  name: string;
  avatarUrl: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs";
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className={`${dim} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full font-mono font-semibold text-white`}
      style={{ background: avatarBg(name) }}
    >
      {initialsFromName(name)}
    </div>
  );
}

function StatusDot({ status }: { status: "green" | "amber" | "red" }) {
  const colors: Record<typeof status, string> = {
    green: "bg-primary",
    amber: "bg-amber-500",
    red: "bg-destructive",
  };
  const labels: Record<typeof status, string> = {
    green: "På sporet",
    amber: "Følg med",
    red: "Trenger oppfølging",
  };
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 shrink-0 rounded-full ${colors[status]}`}
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        {labels[status]}
      </span>
    </span>
  );
}

function Th({
  children,
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function complianceBarColor(pct: number): string {
  if (pct >= 75) return "bg-primary";
  if (pct >= 50) return "bg-amber-500";
  return "bg-destructive";
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function formatRelative(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return "i dag";
  if (d === 1) return "i går";
  if (d < 7) return `${d}d siden`;
  if (d < 30) return `${Math.floor(d / 7)}u siden`;
  return `${Math.floor(d / 30)}mnd siden`;
}

// ------- CHARTS -------

function LineChart({
  data,
  totalPlayers,
}: {
  data: { date: string; active: number }[];
  totalPlayers: number;
}) {
  const width = 720;
  const height = 200;
  const padX = 40;
  const padY = 24;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const maxValue = Math.max(totalPlayers || 1, ...data.map((d) => d.active), 1);
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padX + i * step,
    y: padY + innerH - (d.active / maxValue) * innerH,
    ...d,
  }));

  const pathLine = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

  const pathArea =
    points.length > 0
      ? `${pathLine} L${points[points.length - 1].x.toFixed(2)},${(padY + innerH).toFixed(2)} L${points[0].x.toFixed(2)},${(padY + innerH).toFixed(2)} Z`
      : "";

  // Y-akser
  const yTicks = [0, Math.round(maxValue / 2), maxValue];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[160px] w-full min-w-[480px] sm:h-[200px] sm:min-w-[600px]"
        role="img"
        aria-label="Daglig aktive spillere siste 30 dager"
      >
        <defs>
          <linearGradient id="reach-area" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor="hsl(var(--primary))"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {yTicks.map((tick) => {
          const y = padY + innerH - (tick / maxValue) * innerH;
          return (
            <g key={tick}>
              <line
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="hsl(var(--border))"
                strokeDasharray="2 4"
                strokeWidth="1"
              />
              <text
                x={padX - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground font-mono"
                fontSize="10"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Area */}
        {pathArea && <path d={pathArea} fill="url(#reach-area)" />}
        {/* Line */}
        {pathLine && (
          <path
            d={pathLine}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Points (kun hver 5te for å unngå clutter) */}
        {points.map((p, i) =>
          i % 5 === 0 || i === points.length - 1 ? (
            <g key={p.date}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="hsl(var(--card))"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                className="fill-muted-foreground font-mono"
                fontSize="9"
              >
                {p.date.slice(5)}
              </text>
            </g>
          ) : null,
        )}
      </svg>
    </div>
  );
}

function FeatureBarChart({
  data,
  totalPlayers,
}: {
  data: { label: string; count: number }[];
  totalPlayers: number;
}) {
  const max = Math.max(totalPlayers || 1, ...data.map((d) => d.count), 1);

  return (
    <ul className="space-y-4">
      {data.map((feat) => {
        const pct = Math.round((feat.count / max) * 100);
        const adoptionPct = totalPlayers
          ? Math.round((feat.count / totalPlayers) * 100)
          : 0;
        return (
          <li key={feat.label} className="grid grid-cols-[100px_1fr_60px] items-center gap-3 sm:grid-cols-[160px_1fr_80px] sm:gap-4">
            <span className="font-mono text-xs text-foreground">
              {feat.label}
            </span>
            <div className="relative h-6 overflow-hidden rounded-sm bg-secondary">
              <div
                className="h-full rounded-sm bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
              <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[10px] font-semibold tabular-nums text-primary-foreground mix-blend-difference">
                {feat.count} spillere
              </span>
            </div>
            <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
              {adoptionPct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}
