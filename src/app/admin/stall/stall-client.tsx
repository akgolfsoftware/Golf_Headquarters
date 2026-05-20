"use client";

/**
 * CoachHQ — Stall-oversikt (klient)
 *
 * Tre tabs som deler den samme spiller-snapshoten:
 *  - Aktivitet:  Heat-map siste 30d (alle spillere × dager)
 *  - Fremgang:   Pyramide-fordeling per spiller + SG-trend per spiller
 *  - Risiko:     Spillere som krever oppmerksomhet (inaktiv eller mangler plan)
 *
 * Filter (kategori + status) drilles ned i alle tabs.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Flame,
  TrendingUp,
} from "lucide-react";
import { avatarBg } from "@/lib/avatar-colors";

type Tier = "GRATIS" | "PRO" | "ELITE";
type Category = "A1" | "A2" | "B1" | "B2";
type Tab = "aktivitet" | "fremgang" | "risiko";

export type StallPlayer = {
  id: string;
  name: string;
  email: string;
  hcp: number | null;
  hcpLabel: string;
  tier: Tier;
  category: Category;
  gruppe: string | null;
  dagerSidenPalogging: number;
  sistAktivLabel: string;
  harAktivPlan: boolean;
  erInaktiv: boolean;
  trengerOppmerksomhet: boolean;
  sgAvg: number | null;
  sgTrend: number[];
  /** 30 dager — index 0 = i dag, 29 = 29 dager siden. 1 = aktivitet, 0 = ingen. */
  heat: number[];
  antRunder30d: number;
};

export type StallSnapshot = {
  players: StallPlayer[];
  kpi: {
    total: number;
    aktive: number;
    inaktive: number;
    trengerPlan: number;
    trengerOppmerksomhet: number;
    snittHcp: number | null;
    snittHcpLabel: string;
    kategoriFordeling: Record<Category, number>;
    topp10: number;
  };
};

const CAT_STYLE: Record<Category, string> = {
  A1: "bg-accent/30 text-accent-foreground",
  A2: "bg-primary/15 text-primary",
  B1: "bg-secondary text-foreground",
  B2: "bg-muted text-muted-foreground",
};

const TIER_STYLE: Record<Tier, string> = {
  GRATIS: "bg-secondary text-muted-foreground",
  PRO: "bg-primary/15 text-primary",
  ELITE: "bg-foreground text-accent",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function StallClient({ snapshot }: { snapshot: StallSnapshot }) {
  const [tab, setTab] = useState<Tab>("aktivitet");
  const [katFilter, setKatFilter] = useState<Category | "alle">("alle");
  const [statusFilter, setStatusFilter] =
    useState<"alle" | "aktiv" | "inaktiv">("alle");

  const filtered = useMemo(() => {
    return snapshot.players.filter((p) => {
      if (katFilter !== "alle" && p.category !== katFilter) return false;
      if (statusFilter === "aktiv" && p.erInaktiv) return false;
      if (statusFilter === "inaktiv" && !p.erInaktiv) return false;
      return true;
    });
  }, [snapshot.players, katFilter, statusFilter]);

  const { kpi } = snapshot;

  return (
    <div className="space-y-6">
      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        <KpiAccent
          label="Snitt-HCP"
          value={kpi.snittHcpLabel}
          sub={`${kpi.total} spillere totalt`}
        />
        <Kpi
          label="A1 / A2"
          value={`${kpi.kategoriFordeling.A1} / ${kpi.kategoriFordeling.A2}`}
          sub="Topp-kategoriene"
        />
        <Kpi
          label="B1 / B2"
          value={`${kpi.kategoriFordeling.B1} / ${kpi.kategoriFordeling.B2}`}
          sub="Utviklings-kategoriene"
        />
        <Kpi
          label="Trenger plan"
          value={String(kpi.trengerPlan)}
          sub="Ingen aktiv plan"
          tone={kpi.trengerPlan > 0 ? "warn" : undefined}
        />
        <Kpi
          label="Topp 10 %"
          value={String(kpi.topp10)}
          sub="Etter HCP"
        />
      </div>

      {/* Filter-rad */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-card p-1">
          {(["alle", "A1", "A2", "B1", "B2"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKatFilter(k)}
              className={`rounded-sm px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors ${
                katFilter === k
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {k === "alle" ? `Alle (${kpi.total})` : k}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-border bg-card p-1">
          {(["alle", "aktiv", "inaktiv"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-sm px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "alle"
                ? "Alle"
                : s === "aktiv"
                  ? `Aktive (${kpi.aktive})`
                  : `Inaktive (${kpi.inaktive})`}
            </button>
          ))}
        </div>

        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          Viser <b className="text-foreground">{filtered.length}</b> av {kpi.total}
        </span>
      </div>

      {/* Tabs */}
      <div className="-mx-4 inline-flex gap-0.5 overflow-x-auto rounded-md bg-secondary p-1 sm:mx-0">
        {(
          [
            { key: "aktivitet", label: "Aktivitet", icon: Activity },
            { key: "fremgang", label: "Fremgang", icon: TrendingUp },
            { key: "risiko", label: "Risiko", icon: AlertTriangle },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const erAktiv = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-sm px-4 text-sm font-medium transition-colors ${
                erAktiv
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Innhold */}
      {tab === "aktivitet" && <Heatmap players={filtered} />}
      {tab === "fremgang" && <Fremgang players={filtered} />}
      {tab === "risiko" && <Risiko players={filtered} />}
    </div>
  );
}

// --------- Heat-map ---------

function Heatmap({ players }: { players: StallPlayer[] }) {
  // Vis dag-skala: 29..0 dager siden, mtps. legg nyeste til høyre
  const dager = Array.from({ length: 30 }, (_, i) => 29 - i);

  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
        Ingen spillere matcher filter
      </div>
    );
  }

  return (
    <section
      aria-label="Aktivitet siste 30 dager"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <header className="flex items-baseline justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Aktivitet siste 30 dager
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Hver celle = en dag · grønn = aktivitet
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {players.length} spillere
        </span>
      </header>

      <div className="overflow-x-auto">
        <div className="min-w-[840px] p-4">
          {/* Dag-akse */}
          <div
            className="ml-[200px] mb-2 grid gap-0.5 font-mono text-[8px] uppercase tracking-[0.04em] text-muted-foreground"
            style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}
          >
            {dager.map((d) => (
              <div
                key={d}
                className="grid place-items-center"
                title={`${d} dager siden`}
              >
                {d % 7 === 0 ? `${d}d` : ""}
              </div>
            ))}
          </div>

          <ul className="space-y-1">
            {players.map((p) => (
              <li key={p.id} className="flex items-center gap-2">
                <Link
                  href={`/admin/spillere/${p.id}`}
                  className="flex w-[200px] shrink-0 items-center gap-2 hover:text-primary"
                >
                  <div
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[9px] font-semibold text-white"
                    style={{ background: avatarBg(p.name) }}
                  >
                    {initials(p.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[12px] font-medium text-foreground">
                      {p.name}
                    </div>
                    <div className="truncate font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                      {p.category} · HCP {p.hcpLabel}
                    </div>
                  </div>
                </Link>

                <div
                  className="grid flex-1 gap-0.5"
                  style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}
                >
                  {dager.map((d) => {
                    const aktiv = p.heat[d] === 1;
                    return (
                      <span
                        key={d}
                        aria-label={`${aktiv ? "Aktiv" : "Inaktiv"} dag ${d}`}
                        className={`h-5 rounded-sm ${
                          aktiv ? "bg-primary" : "bg-secondary"
                        }`}
                      />
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-border bg-secondary/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
        <span>30 dager siden — i dag</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
            Ingen aktivitet
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
            Aktiv
          </span>
        </span>
      </footer>
    </section>
  );
}

// --------- Fremgang ---------

function Fremgang({ players }: { players: StallPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
        Ingen spillere matcher filter
      </div>
    );
  }

  return (
    <section
      aria-label="Fremgang per spiller"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <header className="flex items-baseline justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Fremgang · SG-snitt og 30-dagers aktivitet
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground">
          {players.length} spillere
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {players.map((p) => (
          <article
            key={p.id}
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-4"
          >
            <header className="flex items-center justify-between gap-3">
              <Link
                href={`/admin/spillere/${p.id}`}
                className="flex min-w-0 items-center gap-2 hover:text-primary"
              >
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
                  style={{ background: avatarBg(p.name) }}
                >
                  {initials(p.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-semibold text-foreground">
                    {p.name}
                  </div>
                  <div className="truncate font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {p.gruppe ?? "Ingen gruppe"}
                  </div>
                </div>
              </Link>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${CAT_STYLE[p.category]}`}
              >
                {p.category}
              </span>
            </header>

            <div className="flex items-end justify-between gap-3 border-t border-border pt-3">
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                  SG snitt
                </div>
                <div className="mt-0.5 font-mono text-[20px] font-semibold leading-none tabular-nums text-foreground">
                  {p.sgAvg != null
                    ? p.sgAvg.toFixed(2).replace(".", ",")
                    : "—"}
                </div>
              </div>
              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                  Runder 30d
                </div>
                <div className="mt-0.5 font-mono text-[20px] font-semibold leading-none tabular-nums text-foreground">
                  {p.antRunder30d}
                </div>
              </div>
              <Sparkline values={p.sgTrend} />
            </div>

            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.06em]">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${TIER_STYLE[p.tier]}`}
              >
                {p.tier === "GRATIS"
                  ? "Free"
                  : p.tier === "PRO"
                    ? "Pro"
                    : "Elite"}
              </span>
              <span className="text-muted-foreground">{p.sistAktivLabel}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// --------- Risiko ---------

function Risiko({ players }: { players: StallPlayer[] }) {
  const risiko = players.filter((p) => p.trengerOppmerksomhet);

  if (risiko.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center">
        <Flame
          className="mx-auto h-8 w-8 text-primary"
          strokeWidth={1.5}
          aria-hidden="true"
        />
        <p className="mt-3 font-display text-base font-semibold text-foreground">
          Alt under kontroll
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Ingen spillere krever oppmerksomhet akkurat nå
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label="Spillere som krever oppmerksomhet"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <header className="flex items-baseline justify-between border-b border-border bg-secondary/40 px-4 py-3">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            Krever oppmerksomhet
          </h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Inaktive ({">"} 14 dager) eller mangler aktiv plan
          </p>
        </div>
        <span className="font-mono text-[11px] text-destructive">
          {risiko.length} spillere
        </span>
      </header>

      <ul className="divide-y divide-border">
        {risiko.map((p) => {
          const grunner: string[] = [];
          if (p.erInaktiv) grunner.push("Inaktiv");
          if (!p.harAktivPlan) grunner.push("Ingen plan");

          return (
            <li key={p.id}>
              <Link
                href={`/admin/spillere/${p.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/30"
              >
                <div
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
                  style={{ background: avatarBg(p.name) }}
                >
                  {initials(p.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-foreground">
                      {p.name}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${CAT_STYLE[p.category]}`}
                    >
                      {p.category}
                    </span>
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {p.sistAktivLabel} · HCP {p.hcpLabel}
                  </div>
                </div>

                <div className="hidden flex-col items-end gap-1 sm:flex">
                  {grunner.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-destructive"
                    >
                      <AlertTriangle
                        size={10}
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      {g}
                    </span>
                  ))}
                </div>

                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// --------- Felles ---------

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div className="flex h-8 items-center justify-end font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        Lite data
      </div>
    );
  }
  const w = 56;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const trendUp = values[values.length - 1] >= values[0];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      aria-label="SG-trend"
    >
      <polyline
        fill="none"
        stroke={trendUp ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  );
}

function KpiAccent({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg bg-gradient-to-br from-foreground to-foreground/90 p-4 text-background">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </div>
      <div className="font-mono text-[24px] font-semibold leading-none tabular-nums text-background">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10px] text-background/70">{sub}</div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "warn";
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[24px] font-semibold leading-none tabular-nums ${
          tone === "warn" ? "text-accent-foreground" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[10px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
