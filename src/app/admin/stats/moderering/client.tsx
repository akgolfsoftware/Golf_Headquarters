"use client";

import { useState } from "react";
import {
  Check,
  X,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Trophy,
  ListChecks,
  UserCog,
  History,
} from "lucide-react";
import { CountUp } from "@/components/stats/count-up";

type Turnering = {
  id: string;
  navn: string;
  dato: string;
  innlegger: string;
  flagg: number;
  dubletter: string[];
};

type Slett = {
  spiller: string;
  forespurAv: string;
  mottatt: string;
  grunn: string;
  rader: number;
};

type Stats = {
  turneringer: number;
  resultater: number;
  profilEndringer: number;
  slett: number;
  godkjentDenneUka: number;
  avvistDenneUka: number;
  snittTid: string;
};

const TABS = [
  { id: "turneringer", label: "Turneringer", icon: Trophy },
  { id: "resultater", label: "Resultater", icon: ListChecks },
  { id: "profil", label: "Profil-endringer", icon: UserCog },
  { id: "slett", label: "Slett-forespørsler", icon: Trash2 },
  { id: "historikk", label: "Historikk", icon: History },
] as const;

type Tab = (typeof TABS)[number]["id"];

export function ModeringClient({
  turneringer,
  slett,
  stats,
}: {
  turneringer: Turnering[];
  slett: Slett | null;
  stats: Stats;
}) {
  const [aktivTab, setAktivTab] = useState<Tab>("turneringer");
  const [valgte, setValgte] = useState<string[]>([]);
  const totaltVentende =
    stats.turneringer + stats.resultater + stats.profilEndringer + stats.slett;

  const toggleValgt = (id: string) =>
    setValgte((v) => (v.includes(id) ? v.filter((s) => s !== id) : [...v, id]));

  return (
    <div className="space-y-6 pb-24">
      {/* Hero */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Admin · Stats
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
            Moderering
          </h1>
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            Godkjenn innsendte turneringer, resultater og profil-endringer ·
            håndter GDPR-slett
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[56px] font-bold leading-none tabular-nums text-primary">
            <CountUp value={totaltVentende} />
          </div>
          <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Ventende
          </div>
        </div>
      </header>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Ventende" value={totaltVentende} tone="primary" />
        <Kpi label="Godkjent denne uka" value={stats.godkjentDenneUka} tone="success" />
        <Kpi label="Avvist denne uka" value={stats.avvistDenneUka} tone="destructive" />
        <KpiText label="Snitt-tid" value={stats.snittTid} />
      </div>

      {/* Tab-bar */}
      <div className="flex items-center gap-0 overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const TabIcon = t.icon;
          const count =
            t.id === "turneringer"
              ? stats.turneringer
              : t.id === "resultater"
                ? stats.resultater
                : t.id === "profil"
                  ? stats.profilEndringer
                  : t.id === "slett"
                    ? stats.slett
                    : undefined;
          const isActive = aktivTab === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAktivTab(t.id)}
              className={`-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.10em] transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TabIcon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              {t.label}
              {count !== undefined && count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-px font-mono text-[10px] font-extrabold tabular-nums ${
                    t.id === "slett"
                      ? "bg-destructive text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab-innhold */}
      <div>
        {aktivTab === "turneringer" && (
          <div className="flex flex-col gap-2.5">
            {turneringer.length === 0 ? (
              <EmptyTab kind="turneringer" />
            ) : (
              turneringer.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <input
                    type="checkbox"
                    checked={valgte.includes(t.id)}
                    onChange={() => toggleValgt(t.id)}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[hsl(var(--primary))]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="font-display text-[17px] font-bold tracking-[-0.01em]">
                        {t.navn}
                      </div>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {t.dato.toUpperCase()}
                      </span>
                      {t.flagg > 0 && (
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] ${
                            t.flagg >= 3
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/15 text-warning"
                          }`}
                        >
                          <AlertTriangle className="h-3 w-3" strokeWidth={2} aria-hidden />
                          {t.flagg} FLAGG
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 text-[13px] text-muted-foreground">
                      Innlagt av{" "}
                      <strong className="font-semibold text-foreground">
                        {t.innlegger}
                      </strong>
                      {t.dubletter.length > 0 && (
                        <> · Mulige dubletter: {t.dubletter.join(", ")}</>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      title="Godkjenn"
                      className="grid h-9 w-9 place-items-center rounded-md bg-accent text-accent-foreground transition-opacity hover:opacity-90"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    </button>
                    <button
                      type="button"
                      title="Avvis"
                      className="grid h-9 w-9 place-items-center rounded-md bg-destructive/10 text-destructive transition-colors hover:bg-destructive/15"
                    >
                      <X className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {aktivTab === "slett" && !slett && <EmptyTab kind="slett" />}

        {aktivTab === "slett" && slett && (
          <div className="max-w-[640px] rounded-2xl border border-destructive/30 bg-destructive/5 p-8">
            <div className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-destructive">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              GDPR · Slett-forespørsel
            </div>
            <h2 className="font-display text-[28px] font-bold tracking-[-0.02em]">
              {slett.spiller}
            </h2>
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <span className="text-muted-foreground">Forespurt av:</span>
              <span className="text-foreground">{slett.forespurAv}</span>
              <span className="text-muted-foreground">Mottatt:</span>
              <span className="text-foreground">{slett.mottatt}</span>
              <span className="text-muted-foreground">Grunn:</span>
              <span className="text-foreground">«{slett.grunn}»</span>
            </div>

            <div className="mt-6 rounded-xl bg-destructive/[0.08] p-4">
              <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-destructive">
                Konsekvens
              </div>
              <ul className="flex flex-col gap-1.5 text-[13px] leading-relaxed text-foreground">
                <li>· Sletter PublicPlayer + {slett.rader} PublicPlayerEntry-rader</li>
                <li>· Markerer {slett.rader} turneringer som «anonym deltaker»</li>
                <li>· Sender bekreftelse til {slett.forespurAv}</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-destructive px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
              >
                Bekreft sletting
              </button>
              <button
                type="button"
                className="rounded-full border border-border bg-secondary px-6 py-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary/70"
              >
                Avvis med begrunnelse
              </button>
            </div>
          </div>
        )}

        {aktivTab !== "turneringer" && aktivTab !== "slett" && (
          <EmptyTab kind={aktivTab} />
        )}
      </div>

      {/* Sticky batch-bar */}
      {valgte.length > 0 && (
        <div className="sticky bottom-4 z-20 flex items-center gap-4 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[0_12px_32px_hsl(var(--primary)/0.3)]">
          <span className="font-mono text-[13px] font-bold uppercase tracking-[0.08em]">
            {valgte.length} VALGT
          </span>
          <button
            type="button"
            className="rounded-full border border-accent/40 px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-accent transition-colors hover:bg-accent/10"
          >
            Godkjenn alle
          </button>
          <button
            type="button"
            className="rounded-full border border-accent/40 px-4 py-1.5 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-accent transition-colors hover:bg-accent/10"
          >
            Avvis alle
          </button>
          <button
            type="button"
            onClick={() => setValgte([])}
            className="ml-auto grid h-7 w-7 place-items-center rounded-full text-accent transition-colors hover:bg-accent/10"
            aria-label="Lukk utvalg"
          >
            <X className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────── helpers ──

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "success" | "destructive";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-4">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className={`font-mono text-[34px] font-bold leading-none tabular-nums ${toneClass}`}>
        <CountUp value={value} />
      </div>
    </div>
  );
}

function KpiText({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-4">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <div className="font-mono text-[28px] font-bold leading-none tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}

function EmptyTab({ kind }: { kind: Tab }) {
  const labels: Record<Tab, string> = {
    turneringer: "turneringer",
    resultater: "resultater",
    profil: "profil-endringer",
    slett: "slett-forespørsler",
    historikk: "historikk",
  };
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Check className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 font-display text-base font-bold tracking-[-0.01em] text-foreground">
        Ingen ventende {labels[kind]}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Køen er tom akkurat nå.
      </p>
    </div>
  );
}
