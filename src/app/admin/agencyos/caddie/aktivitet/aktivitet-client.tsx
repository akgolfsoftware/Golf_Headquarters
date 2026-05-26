"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Clock,
  Info,
  Search,
  X,
} from "lucide-react";
import { avatarBg } from "@/lib/avatar-colors";
import { PageHeader } from "@/components/shared/page-header";

export type CaddieEvent = {
  id: string;
  at: Date;
  type: "suggest" | "analyzed" | "escalate" | "flagged" | "import";
  statusKind: "ok" | "wait" | "rej" | "info";
  playerInitials: string;
  playerName: string;
  pillLabel: string;
  title: string;
  italicSpan?: string;
  confidence: number;
  followUp: "followed" | "ignored" | null;
};

type FilterType = CaddieEvent["type"] | "all";
type FilterDate = "today" | "yesterday" | "7d" | "all";

export function CaddieAktivitetClient({
  events: initialEvents,
  nowMs,
}: {
  events: ReadonlyArray<CaddieEvent>;
  nowMs: number;
}) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterDate, setFilterDate] = useState<FilterDate>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [followups, setFollowups] = useState<
    Record<string, "followed" | "ignored" | null>
  >(() => {
    const init: Record<string, "followed" | "ignored" | null> = {};
    for (const e of initialEvents) init[e.id] = e.followUp;
    return init;
  });

  const filtered = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    return initialEvents.filter((e) => {
      if (filterType !== "all" && e.type !== filterType) return false;
      if (filterDate !== "all") {
        const age = nowMs - e.at.getTime();
        if (filterDate === "today" && age > dayMs) return false;
        if (filterDate === "yesterday" && (age < dayMs || age > 2 * dayMs))
          return false;
        if (filterDate === "7d" && age > 7 * dayMs) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !e.playerName.toLowerCase().includes(q) &&
          !e.title.toLowerCase().includes(q) &&
          !e.pillLabel.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialEvents, filterType, filterDate, search, nowMs]);

  // Gruppér på dag
  const grouped = useMemo(
    () => groupByDay(filtered, nowMs),
    [filtered, nowMs],
  );

  // KPI-tall: dagens hendelser
  const stats = useMemo(() => {
    const dayMs = 24 * 60 * 60 * 1000;
    const today = initialEvents.filter(
      (e) => nowMs - e.at.getTime() < dayMs,
    );
    const wait = today.filter((e) => e.statusKind === "wait").length;
    const ok = today.filter((e) => e.statusKind === "ok").length;
    const rej = today.filter((e) => e.statusKind === "rej").length;
    const conf =
      today.length === 0
        ? 0
        : today.reduce((s, e) => s + e.confidence, 0) / today.length;
    const actionable = today.filter(
      (e) => e.type === "escalate" || e.type === "flagged",
    ).length;
    return {
      total: today.length,
      wait,
      ok,
      rej,
      conf,
      actionable,
      totalAll: initialEvents.length,
    };
  }, [initialEvents, nowMs]);

  function toggleFollowup(id: string, kind: "followed" | "ignored") {
    setFollowups((s) => ({ ...s, [id]: s[id] === kind ? null : kind }));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Caddie-aktivitet"
        titleLead="Caddie"
        titleItalic="aktivitet"
        sub={`I dag · ${stats.total} hendelser · ${stats.ok} godkjent · ${stats.rej} avvist · ${stats.wait} venter · snitt-konfidens ${(stats.conf * 100).toFixed(0)} %`}
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/40 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live · auto 10s
          </span>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiAccent label="I dag · samtaler" value={String(stats.total)}>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-background/60">
            {stats.totalAll} totalt registrert
          </p>
        </KpiAccent>
        <Kpi
          label="Godkjenningsrate"
          value={`${stats.total === 0 ? 0 : Math.round((stats.ok / stats.total) * 100)} %`}
          sub={`${stats.ok} godkjent · ${stats.rej} avvist`}
        />
        <Kpi
          label="Snitt-konfidens"
          value={stats.conf.toFixed(2)}
          sub="Skala 0–1, høyere = sikrere"
        />
        <Kpi
          label="Actionable insights"
          value={String(stats.actionable)}
          sub="Eskaleringer + flagg"
        />
      </div>

      {/* Filter */}
      <form className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-[260px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk spiller, emne eller hendelse"
            className="flex-1 bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
          />
        </label>
        <FilterSelect
          value={filterType}
          onChange={(v) => setFilterType(v as FilterType)}
          options={[
            { value: "all", label: "Type · alle" },
            { value: "suggest", label: "Foreslo økt" },
            { value: "analyzed", label: "Analyserte" },
            { value: "escalate", label: "Eskalerte" },
            { value: "flagged", label: "Flagg" },
            { value: "import", label: "Import" },
          ]}
        />
        <FilterSelect
          value={filterDate}
          onChange={(v) => setFilterDate(v as FilterDate)}
          options={[
            { value: "all", label: "Dato · alle" },
            { value: "today", label: "I dag" },
            { value: "yesterday", label: "I går" },
            { value: "7d", label: "Siste 7d" },
          ]}
        />
      </form>

      {/* Grid: feed + rail */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Live-feed tidslinje */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Live-feed{" "}
              <em className="font-normal italic text-primary">siste 24 timer</em>
            </h2>
            <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Sist synk {formatTime(new Date(nowMs))}
            </span>
          </div>

          <div className="max-h-[760px] overflow-y-auto px-2 pb-3">
            {grouped.length === 0 ? (
              <div className="px-6 py-16 text-center text-sm text-muted-foreground">
                Ingen hendelser matcher filtrene.
              </div>
            ) : (
              grouped.map((g) => (
                <section key={g.key}>
                  <div className="sticky top-0 z-10 bg-card px-4 pt-3 pb-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {g.label}
                    <span className="ml-2 font-semibold text-foreground">
                      {g.events.length} hendelser
                    </span>
                  </div>
                  <ul>
                    {g.events.map((ev) => {
                      const open = expandedId === ev.id;
                      const fu = followups[ev.id] ?? null;
                      return (
                        <li key={ev.id}>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(open ? null : ev.id)
                            }
                            className={`grid w-full grid-cols-[60px_auto_1fr_auto] items-center gap-3 rounded-md px-3 py-3 text-left transition-colors hover:bg-secondary/50 ${
                              isFresh(ev.at, nowMs) ? "bg-accent/10" : ""
                            }`}
                          >
                            <span className="font-mono text-[11px] font-bold text-foreground">
                              {formatTime(ev.at)}
                              <span className="mt-1 block font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                                {relativeShort(ev.at, nowMs)}
                              </span>
                            </span>
                            <span
                              aria-hidden="true"
                              className="grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                              style={{ background: avatarBg(ev.playerName) }}
                            >
                              {ev.playerInitials}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Pill type={ev.type}>{ev.pillLabel}</Pill>
                                <span className="font-display text-[13px] font-semibold">
                                  {ev.playerName}
                                </span>
                              </div>
                              <p className="mt-1 text-[13px] leading-snug text-foreground">
                                {ev.italicSpan ? (
                                  highlightItalic(ev.title, ev.italicSpan)
                                ) : (
                                  ev.title
                                )}
                                <span className="ml-2 font-mono text-[10px] font-semibold text-muted-foreground">
                                  {ev.confidence.toFixed(2)}
                                </span>
                              </p>
                            </div>
                            <StatusIcon kind={ev.statusKind} />
                          </button>

                          {open && (
                            <div className="ml-[68px] mr-3 mb-3 rounded-md border border-border bg-background p-4">
                              <h4 className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                                Full samtale-kontekst
                              </h4>
                              <p className="mt-2 text-sm text-foreground">
                                Caddie-agenten konkluderte basert på SG-data,
                                kalenderstatus og spillerens egne meldinger.
                                Bruk knappene for å markere oppfølging — coach-
                                handlingen logges på saken.
                              </p>
                              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                <Meta k="Konfidens" v={ev.confidence.toFixed(2)} />
                                <Meta k="Agent" v="AI-Caddie" />
                                <Meta
                                  k="Status"
                                  v={statusLabel(ev.statusKind)}
                                />
                                <Meta k="Type" v={ev.pillLabel} />
                              </div>
                              <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFollowup(ev.id, "followed");
                                  }}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                    fu === "followed"
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border bg-card text-foreground hover:border-primary hover:text-primary"
                                  }`}
                                >
                                  <Check size={12} strokeWidth={2} />
                                  Fulgt opp
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFollowup(ev.id, "ignored");
                                  }}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                    fu === "ignored"
                                      ? "border-destructive bg-destructive text-destructive-foreground"
                                      : "border-border bg-card text-foreground hover:border-destructive hover:text-destructive"
                                  }`}
                                >
                                  <X size={12} strokeWidth={2} />
                                  Ignorert
                                </button>
                                {fu && (
                                  <span className="ml-auto self-center font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                                    Markert som {fu === "followed" ? "fulgt opp" : "ignorert"}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>

        {/* Rail */}
        <aside className="flex flex-col gap-4">
          {/* Mørk KPI-panel */}
          <div className="relative overflow-hidden rounded-lg bg-foreground p-6 text-background">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-accent/70">
              I dag · nøkkeltall
            </span>
            <div className="mt-3 space-y-0">
              <KpiRow k="Forslag totalt" v={String(stats.total)} />
              <KpiRow
                k="Godkjenningsrate"
                v={`${stats.total === 0 ? 0 : Math.round((stats.ok / stats.total) * 100)} %`}
              />
              <KpiRow k="Snitt-konfidens" v={stats.conf.toFixed(2)} />
              <KpiRow k="Eskalert til coach" v={String(stats.actionable)} />
            </div>
          </div>

          {/* Mest aktive spillere */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Mest aktive spillere · 7d
            </h3>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Flest AI-interaksjoner
            </p>
            <ul className="mt-3 divide-y divide-border">
              {TOP_PLAYERS.map((p, i) => (
                <li
                  key={p.name}
                  className="grid grid-cols-[24px_28px_1fr_auto] items-center gap-3 py-2"
                >
                  <span className="font-mono text-[11px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                    style={{ background: avatarBg(p.name) }}
                  >
                    {p.initials}
                  </span>
                  <span className="font-display text-[13px] font-semibold">
                    {p.name}
                  </span>
                  <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[11px] font-bold text-foreground">
                    {p.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Drill-typer */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-sm font-semibold tracking-tight">
              Mest brukte drill-typer · 30d
            </h3>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Fordeling av AI-forslag
            </p>
            <div className="mt-4 space-y-2">
              {DRILL_DISTRIBUTION.map((d) => (
                <div key={d.label} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-foreground">{d.label}</span>
                    <span className="font-semibold text-muted-foreground">
                      {d.pct} %
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${d.pct}%`,
                        background: d.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI-feil */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-display text-sm font-semibold tracking-tight">
              AI-feil · siste 7 dager
            </h3>
            <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              2 rapporterte tilfeller
            </p>
            <ul className="mt-3 space-y-2">
              {AI_ERRORS.map((er) => (
                <li
                  key={er.title}
                  className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-md border border-destructive/25 bg-destructive/5 p-3"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-destructive/15 text-destructive">
                    <AlertTriangle size={13} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="font-display text-[12.5px] font-semibold">
                      {er.title}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {er.desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-destructive hover:underline"
                  >
                    Se detalj
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ----------------- Sub-komponenter -----------------

function Pill({
  type,
  children,
}: {
  type: CaddieEvent["type"];
  children: React.ReactNode;
}) {
  const styles: Record<CaddieEvent["type"], string> = {
    suggest: "bg-accent/40 text-accent-foreground",
    analyzed: "bg-primary/15 text-primary",
    escalate: "bg-destructive/15 text-destructive",
    flagged: "bg-destructive/15 text-destructive",
    import: "bg-secondary text-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] ${styles[type]}`}
    >
      {children}
    </span>
  );
}

function StatusIcon({ kind }: { kind: CaddieEvent["statusKind"] }) {
  const styles: Record<CaddieEvent["statusKind"], string> = {
    ok: "bg-primary/15 text-primary",
    wait: "bg-accent/30 text-accent-foreground",
    rej: "bg-destructive/15 text-destructive",
    info: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      aria-label={statusLabel(kind)}
      className={`grid h-7 w-7 place-items-center rounded-full ${styles[kind]}`}
    >
      {kind === "ok" && <Check size={13} strokeWidth={2.5} />}
      {kind === "wait" && <Clock size={13} strokeWidth={1.75} />}
      {kind === "rej" && <X size={13} strokeWidth={2.5} />}
      {kind === "info" && <Info size={13} strokeWidth={1.75} />}
    </span>
  );
}

function statusLabel(kind: CaddieEvent["statusKind"]): string {
  switch (kind) {
    case "ok":
      return "Godkjent";
    case "wait":
      return "Venter";
    case "rej":
      return "Avvist";
    case "info":
      return "Info";
  }
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-foreground">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        strokeWidth={1.75}
        className="text-muted-foreground"
        aria-hidden="true"
      />
    </label>
  );
}

function KpiAccent({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-foreground p-4 text-background">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </span>
      <div className="font-mono text-[28px] font-semibold leading-none">
        {value}
      </div>
      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <div className="font-mono text-[28px] font-semibold leading-none text-foreground">
        {value}
      </div>
      {sub && (
        <p className="font-mono text-[11px] text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

function KpiRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-accent/10 py-2.5 last:border-b-0">
      <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-background/65">
        {k}
      </span>
      <span className="font-mono text-2xl font-bold tracking-tight text-accent">
        {v}
      </span>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-card px-3 py-2">
      <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {k}
      </span>
      <span className="mt-0.5 block font-mono text-[12px] font-semibold text-foreground">
        {v}
      </span>
    </div>
  );
}

// ----------------- Statisk hjelpedata -----------------

const TOP_PLAYERS = [
  { name: "Markus R.P.", initials: "MR", count: 28 },
  { name: "Joachim T.", initials: "JT", count: 22 },
  { name: "Øyvind R.", initials: "ØR", count: 19 },
  { name: "Emma S.", initials: "ES", count: 17 },
  { name: "Ida M.", initials: "IM", count: 14 },
];

const DRILL_DISTRIBUTION = [
  { label: "Putting", pct: 36, color: "#A8C82E" },
  { label: "Iron", pct: 24, color: "var(--primary)" },
  { label: "Pitch & chip", pct: 18, color: "hsl(var(--accent))" },
  { label: "Mental", pct: 14, color: "#7B4FB4" },
  { label: "Fysisk", pct: 8, color: "hsl(var(--warning))" },
];

const AI_ERRORS = [
  {
    title: "Feil drill-anbefaling · 16.5",
    desc: "Anbefalte driver-volum for spiller med albue-flagg — overstyrte helse-status",
  },
  {
    title: "Konflikt-deteksjon mislyktes · 14.5",
    desc: "Foreslo booking-tid som kolliderte med private hendelser i Google Calendar",
  },
];

// ----------------- Helpers -----------------

function highlightItalic(text: string, span: string) {
  const idx = text.indexOf(span);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <em className="font-display italic text-primary">{span}</em>
      {text.slice(idx + span.length)}
    </>
  );
}

function isFresh(d: Date, nowMs: number): boolean {
  return nowMs - d.getTime() < 60 * 60 * 1000; // < 1 time
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeShort(d: Date, nowMs: number): string {
  const ms = nowMs - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "siste min";
  if (min < 60) return `${min} min`;
  const t = Math.floor(min / 60);
  const rem = min - t * 60;
  if (t < 24) return rem ? `${t}t ${rem}m` : `${t}t`;
  const dg = Math.floor(t / 24);
  return `${dg}d`;
}

function groupByDay(events: ReadonlyArray<CaddieEvent>, nowMs: number) {
  const groups = new Map<string, { label: string; events: CaddieEvent[] }>();
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  for (const e of events) {
    const day = new Date(e.at);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().slice(0, 10);
    let label: string;
    if (key === today.toISOString().slice(0, 10)) {
      label = `I dag · ${formatDayNb(day)}`;
    } else if (key === yesterday.toISOString().slice(0, 10)) {
      label = `I går · ${formatDayNb(day)}`;
    } else {
      label = formatDayNb(day);
    }
    if (!groups.has(key)) groups.set(key, { label, events: [] });
    groups.get(key)!.events.push(e);
  }
  return Array.from(groups.entries()).map(([key, g]) => ({
    key,
    label: g.label,
    events: g.events,
  }));
}

function formatDayNb(d: Date): string {
  const day = d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return day;
}
