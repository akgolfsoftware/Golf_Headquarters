"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Activity,
  Calendar,
  CalendarCheck,
  ChevronLeft,
  ClipboardList,
  Flag,
  MessageSquare,
  Target,
  User,
} from "lucide-react";

export type SpillerData = {
  id: string;
  navn: string;
  initial: string;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  playingYears: number | null;
  ambition: string | null;
  memberSince: string;
  runder: {
    id: string;
    score: number;
    relativ: number;
    kursNavn: string;
    playedAt: string;
    sgTotal: number | null;
    sgPutt: number | null;
    sgOtt: number | null;
    sgApp: number | null;
    sgArg: number | null;
  }[];
  aktivPlan: { id: string; name: string } | null;
  coachingHistorikk: {
    id: string;
    scheduledAt: string;
    type: string;
    summary: string | null;
    coachNavn: string;
  }[];
  mal: {
    id: string;
    title: string;
    type: string;
    targetValue: number | null;
    currentValue: number | null;
    deadline: string | null;
  }[];
  stats: {
    antallRunder: number;
    snittScore: number | null;
    sgSnitt: number | null;
    antallOkter: number;
  };
};

type Tab = "oversikt" | "plan" | "statistikk" | "runder" | "coaching";

const TABS: { id: Tab; label: string }[] = [
  { id: "oversikt", label: "Oversikt" },
  { id: "plan", label: "Plan" },
  { id: "statistikk", label: "Statistikk" },
  { id: "runder", label: "Runder" },
  { id: "coaching", label: "Coaching-historikk" },
];

function relativStr(r: number): string {
  if (r === 0) return "E";
  return r > 0 ? `+${r}` : `${r}`;
}

function sgFmt(v: number | null): string {
  if (v === null) return "–";
  return v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1);
}

function formatDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatKortDato(iso: string): string {
  return new Date(iso).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
  });
}

export function SpillerDetaljClient({ data }: { data: SpillerData }) {
  const [aktifTab, setAktifTab] = useState<Tab>("oversikt");

  return (
    <div className="space-y-0 pb-20 md:pb-0">
      {/* Tilbake-lenke */}
      <div className="px-4 pt-4 md:px-8">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" strokeWidth={2.5} />
          Tilbake
        </Link>
      </div>

      {/* Hero */}
      <div className="px-4 pb-4 pt-4 md:px-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent bg-gradient-to-br from-muted to-[#EFEDE6] font-display text-3xl font-bold text-primary shadow-md">
            {data.initial}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight">
              {data.navn.split(" ")[0]}{" "}
              <em className="font-normal italic text-primary">
                {data.navn.split(" ").slice(1).join(" ")}
              </em>
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              {data.hcp !== null && <span>HCP {data.hcp}</span>}
              {data.homeClub && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{data.homeClub}</span>
                </>
              )}
              {data.playingYears !== null && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{data.playingYears} år med golf</span>
                </>
              )}
            </div>

            {/* Status-piller */}
            <div className="mt-2.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Aktiv spiller
              </span>
              {data.aktivPlan && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
                  <ClipboardList className="h-3 w-3" strokeWidth={2} />
                  {data.aktivPlan.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                Siden {formatKortDato(data.memberSince)}
              </span>
            </div>
          </div>

          {/* Handlinger */}
          <div className="flex flex-col gap-2 sm:min-w-[180px]">
            <Link
              href={`/portal/coach?spillerId=${data.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-foreground shadow-md transition-opacity hover:opacity-90"
            >
              <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
              Send melding
            </Link>
            <Link
              href={`/portal/booking?spillerId=${data.id}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <CalendarCheck className="h-3.5 w-3.5" strokeWidth={1.75} />
              Book økt
            </Link>
          </div>
        </div>
      </div>

      {/* KPI-rad */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-4 md:grid-cols-4 md:px-8">
        <KpiKort
          label="Runder"
          verdi={data.stats.antallRunder > 0 ? String(data.stats.antallRunder) : "–"}
          sub="siste periode"
          ikon={Flag}
        />
        <KpiKort
          label="Snitt-score"
          verdi={data.stats.snittScore !== null ? String(data.stats.snittScore) : "–"}
          sub="siste 10 runder"
          ikon={Activity}
        />
        <KpiKort
          label="SG Total"
          verdi={sgFmt(data.stats.sgSnitt)}
          sub="gjennomsnitt"
          ikon={Target}
        />
        <KpiKort
          label="Coaching-økter"
          verdi={data.stats.antallOkter > 0 ? String(data.stats.antallOkter) : "–"}
          sub="totalt"
          ikon={User}
        />
      </div>

      {/* Tab-bar */}
      <div className="sticky top-0 z-20 overflow-x-auto border-b border-border bg-background">
        <div className="flex gap-0.5 px-4 pt-0.5 md:px-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAktifTab(tab.id)}
              className={`-mb-px whitespace-nowrap border-b-[3px] px-4 py-2 font-display text-[13.5px] font-semibold transition-colors ${
                aktifTab === tab.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id === "runder" && data.runder.length > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${
                    aktifTab === "runder"
                      ? "bg-accent text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {data.runder.length}
                </span>
              )}
              {tab.id === "coaching" && data.coachingHistorikk.length > 0 && (
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.5 font-mono text-[9.5px] font-semibold ${
                    aktifTab === "coaching"
                      ? "bg-accent text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {data.coachingHistorikk.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab-innhold */}
      <div className="px-4 py-6 md:px-8">
        {aktifTab === "oversikt" && <OversiktTab data={data} />}
        {aktifTab === "plan" && <PlanTab data={data} />}
        {aktifTab === "statistikk" && <StatistikkTab data={data} />}
        {aktifTab === "runder" && <RunderTab data={data} />}
        {aktifTab === "coaching" && <CoachingTab data={data} />}
      </div>
    </div>
  );
}

function KpiKort({
  label,
  verdi,
  sub,
  ikon: Ikon,
  lime,
}: {
  label: string;
  verdi: string;
  sub: string;
  ikon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  lime?: boolean;
}) {
  return (
    <div
      className={`relative flex min-h-[130px] flex-col gap-1.5 overflow-hidden rounded-2xl border p-4 ${
        lime
          ? "border-accent/55 bg-gradient-to-b from-[#FCFEEC] to-white"
          : "border-border bg-card"
      }`}
    >
      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-auto font-mono text-3xl font-bold leading-none tracking-tight text-foreground">
        {verdi}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">{sub}</span>
      <Ikon
        className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/30"
        strokeWidth={1.5}
      />
    </div>
  );
}

function OversiktTab({ data }: { data: SpillerData }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Profil-info */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-display text-sm font-semibold tracking-tight">
          Profil
        </h3>
        <div className="space-y-0">
          {[
            { k: "Navn", v: data.navn },
            { k: "HCP", v: data.hcp !== null ? String(data.hcp) : "–" },
            { k: "Klubb", v: data.homeClub ?? "–" },
            {
              k: "År med golf",
              v: data.playingYears !== null ? `${data.playingYears} år` : "–",
            },
            { k: "Mål/ambisjon", v: data.ambition ?? "–" },
            { k: "Medlem siden", v: formatKortDato(data.memberSince) },
          ].map(({ k, v }) => (
            <div
              key={k}
              className="grid grid-cols-[84px_1fr] gap-2 border-b border-border/60 py-2 last:border-0"
            >
              <span className="self-center font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {k}
              </span>
              <span className="text-sm text-foreground">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Siste runder */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-display text-sm font-semibold tracking-tight">
          Siste runder
        </h3>
        {data.runder.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen runder logget ennå.</p>
        ) : (
          <div className="space-y-0">
            {data.runder.slice(0, 5).map((r) => (
              <div
                key={r.id}
                className="border-b border-border/60 py-2 last:border-0"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[12.5px] font-semibold">
                    {r.kursNavn}
                  </span>
                  <span className="font-mono text-[11px] font-bold">
                    {r.score}{" "}
                    <span
                      className={
                        r.relativ <= 0 ? "text-primary" : "text-muted-foreground"
                      }
                    >
                      ({relativStr(r.relativ)})
                    </span>
                  </span>
                </div>
                <div className="mt-0.5 font-mono text-[9.5px] text-muted-foreground">
                  {formatKortDato(r.playedAt)}
                  {r.sgTotal !== null && (
                    <span className="ml-2">SG {sgFmt(r.sgTotal)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mål */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <h3 className="mb-2 font-display text-sm font-semibold tracking-tight">
          Aktive mål
        </h3>
        {data.mal.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ingen aktive mål.</p>
        ) : (
          <div className="space-y-2">
            {data.mal.map((m) => {
              const progresjon =
                m.currentValue !== null &&
                m.targetValue !== null &&
                m.targetValue > 0
                  ? Math.min(
                      100,
                      Math.round((m.currentValue / m.targetValue) * 100),
                    )
                  : null;
              return (
                <div key={m.id}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-[13px] font-semibold leading-snug">
                      {m.title}
                    </span>
                    {progresjon !== null && (
                      <span className="flex-shrink-0 font-mono text-[10px] text-muted-foreground">
                        {progresjon}%
                      </span>
                    )}
                  </div>
                  {progresjon !== null && (
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${progresjon}%` }}
                      />
                    </div>
                  )}
                  <p className="mt-1 font-mono text-[9.5px] text-muted-foreground">
                    {m.deadline
                      ? `Frist ${formatKortDato(m.deadline)}`
                      : m.type}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanTab({ data }: { data: SpillerData }) {
  if (!data.aktivPlan) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ClipboardList className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <p className="font-display text-lg font-semibold">Ingen aktiv plan</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Spilleren har ikke en aktiv treningsplan for øyeblikket.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight">
              {data.aktivPlan.name}
            </h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-primary">
              AKTIV PLAN
            </p>
          </div>
          <Link
            href={`/portal/tren`}
            className="flex-shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Se plan
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Planen vises fullt ut i Treningsplanleggeren.
        </p>
      </div>
    </div>
  );
}

function StatistikkTab({ data }: { data: SpillerData }) {
  const sgKategorier = [
    { label: "SG Total", v: data.stats.sgSnitt },
    {
      label: "SG Putt",
      v:
        data.runder.filter((r) => r.sgPutt !== null).length > 0
          ? data.runder
              .filter((r) => r.sgPutt !== null)
              .reduce((s, r) => s + (r.sgPutt ?? 0), 0) /
            data.runder.filter((r) => r.sgPutt !== null).length
          : null,
    },
    {
      label: "SG OTT",
      v:
        data.runder.filter((r) => r.sgOtt !== null).length > 0
          ? data.runder
              .filter((r) => r.sgOtt !== null)
              .reduce((s, r) => s + (r.sgOtt ?? 0), 0) /
            data.runder.filter((r) => r.sgOtt !== null).length
          : null,
    },
    {
      label: "SG App",
      v:
        data.runder.filter((r) => r.sgApp !== null).length > 0
          ? data.runder
              .filter((r) => r.sgApp !== null)
              .reduce((s, r) => s + (r.sgApp ?? 0), 0) /
            data.runder.filter((r) => r.sgApp !== null).length
          : null,
    },
    {
      label: "SG ARG",
      v:
        data.runder.filter((r) => r.sgArg !== null).length > 0
          ? data.runder
              .filter((r) => r.sgArg !== null)
              .reduce((s, r) => s + (r.sgArg ?? 0), 0) /
            data.runder.filter((r) => r.sgArg !== null).length
          : null,
    },
  ];

  const harSg = sgKategorier.some((k) => k.v !== null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <KpiKort
          label="Runder totalt"
          verdi={String(data.stats.antallRunder)}
          sub="loggede runder"
          ikon={Flag}
        />
        <KpiKort
          label="Snitt-score"
          verdi={data.stats.snittScore !== null ? String(data.stats.snittScore) : "–"}
          sub="siste 10 runder"
          ikon={Activity}
          lime
        />
        <KpiKort
          label="SG Total"
          verdi={sgFmt(data.stats.sgSnitt)}
          sub="gjennomsnitt"
          ikon={Target}
        />
        <KpiKort
          label="Coaching-økter"
          verdi={String(data.stats.antallOkter)}
          sub="totalt"
          ikon={Calendar}
        />
      </div>

      {harSg && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-4 font-display text-sm font-semibold tracking-tight">
            SG-fordeling (snitt)
          </h3>
          <div className="space-y-2">
            {sgKategorier.filter((k) => k.v !== null).map((k) => (
              <div key={k.label} className="flex items-center gap-2">
                <span className="w-20 flex-shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {k.label}
                </span>
                <div className="flex-1 overflow-hidden rounded-full bg-muted" style={{ height: 6 }}>
                  <div
                    className={`h-full rounded-full ${
                      (k.v ?? 0) >= 0
                        ? "bg-gradient-to-r from-primary to-accent"
                        : "bg-destructive"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.abs((k.v ?? 0)) * 25 + 50)}%`,
                    }}
                  />
                </div>
                <span
                  className={`w-12 flex-shrink-0 text-right font-mono text-[11px] font-bold ${
                    (k.v ?? 0) >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {sgFmt(k.v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RunderTab({ data }: { data: SpillerData }) {
  if (data.runder.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Flag className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <p className="font-display text-lg font-semibold">Ingen runder ennå</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Spilleren har ikke logget noen runder ennå.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/40">
            {["Bane", "Dato", "Score", "Rel.", "SG Total", "SG Putt", ""].map(
              (h) => (
                <th
                  key={h}
                  className="border-b border-border/60 px-4 py-2 text-left font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {data.runder.map((r) => (
            <tr
              key={r.id}
              className="border-b border-border/60 last:border-0 hover:bg-accent/5"
            >
              <td className="px-4 py-2 font-display text-sm font-semibold">
                {r.kursNavn}
              </td>
              <td className="px-4 py-2 font-mono text-[11.5px] text-muted-foreground">
                {formatKortDato(r.playedAt)}
              </td>
              <td className="px-4 py-2 font-mono text-[11.5px] font-bold tabular-nums">
                {r.score}
              </td>
              <td
                className={`px-4 py-2 font-mono text-[11.5px] font-bold tabular-nums ${
                  r.relativ <= 0 ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {relativStr(r.relativ)}
              </td>
              <td className="px-4 py-2 font-mono text-[11.5px] tabular-nums">
                {sgFmt(r.sgTotal)}
              </td>
              <td className="px-4 py-2 font-mono text-[11.5px] tabular-nums">
                {sgFmt(r.sgPutt)}
              </td>
              <td className="px-4 py-2">
                <Link
                  href={`/portal/statistikk/runder/${r.id}/del`}
                  className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-primary hover:underline"
                >
                  Del
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CoachingTab({ data }: { data: SpillerData }) {
  if (data.coachingHistorikk.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Calendar className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <p className="font-display text-lg font-semibold">Ingen coaching-historikk</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          Spilleren har ingen registrerte coaching-økter ennå.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.coachingHistorikk.map((okt) => (
        <div
          key={okt.id}
          className="rounded-2xl border border-border bg-card p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {formatDato(okt.scheduledAt)}
                </span>
                <span className="rounded-full border border-border/60 bg-muted px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  {okt.type}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                Coach: {okt.coachNavn}
              </p>
            </div>
          </div>
          {okt.summary && (
            <p className="mt-2 text-[13px] leading-relaxed text-foreground">
              {okt.summary}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
