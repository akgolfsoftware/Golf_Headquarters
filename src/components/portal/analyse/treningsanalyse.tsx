/**
 * <Treningsanalyse> — PlayerHQ Treningsanalyse "Utforsk".
 *
 * Mobile-first (430px) port av public/design-handover/playerhq/
 * components-training-analysis.html.
 *
 * Dekomponer treningen på hvilken som helst akse (Pyramide / Område / SG-kategori
 * / Økt-type), fordel på en under-akse, filtrér bort segmenter, og se hvor tiden
 * brukes vs hvor slagene tapes. Alt aggregeres LIVE fra én flat økt-logg, slik at
 * "samme tall, ny vinkel" alltid stemmer.
 *
 * Klient-komponent for interaktiviteten (gruppering/periode/fordeling/filter).
 * Data lastes server-side i lib/portal-analyse/treningsanalyse-data.ts.
 *
 * SG-ærlighet: SG finnes kun per SG-kategori i datamodellen, så SG-kolonnen vises
 * bare når man grupperer på SG-kategori. Netto-SG vises alltid som KPI.
 *
 * Ingen hardkodet hex (kun DS-tokens), ingen emoji (kun lucide).
 */

"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Filter,
  GitFork,
  Layers,
  Minus,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AkseKey,
  OktLogg,
  SgPerKat,
  TreningsanalyseData,
} from "@/lib/portal-analyse/treningsanalyse-data";

// ── dimensjons-definisjoner ─────────────────────────────────────
type DimKey = "pyr" | "venue" | "kat" | "type";

type Member = {
  k: string;
  /** Kort mono-label (caps). */
  l: string;
  /** Fullt navn. */
  full: string;
  /** Tailwind bg-utility for fargeprikk/bar (pyramide har egne akse-farger). */
  dot?: string;
  /** Mål-timer per uke-ekvivalent (kun pyramide). */
  tgt?: number;
};

type DimDef = { label: string; members: Member[] };

const DIMS: Record<DimKey, DimDef> = {
  pyr: {
    label: "Pyramide-akse",
    members: [
      { k: "fys", l: "FYS", full: "Fysisk", dot: "bg-pyr-fys", tgt: 4 },
      { k: "tek", l: "TEK", full: "Teknikk", dot: "bg-pyr-tek", tgt: 3 },
      { k: "slag", l: "SLAG", full: "Slag", dot: "bg-pyr-slag", tgt: 6 },
      { k: "spill", l: "SPILL", full: "Spill", dot: "bg-pyr-spill", tgt: 3 },
      { k: "turn", l: "TURN", full: "Turnering", dot: "bg-pyr-turn", tgt: 4 },
    ],
  },
  venue: {
    label: "Treningsområde",
    members: [
      { k: "flat", l: "RANGE", full: "Range · matte" },
      { k: "gress", l: "STUDIO", full: "Studio · sim" },
      { k: "bane-tren", l: "BANE", full: "Bane · trening" },
      { k: "bane-scoring", l: "SCORING", full: "Bane · scoring" },
      { k: "gym", l: "GYM", full: "Styrke" },
      { k: "annet", l: "ANNET", full: "Hjemme · annet" },
    ],
  },
  kat: {
    label: "SG-kategori",
    members: [
      { k: "ott", l: "OTT", full: "Utslag" },
      { k: "app", l: "APP", full: "Innspill" },
      { k: "arg", l: "ARG", full: "Nærspill" },
      { k: "putt", l: "PUTT", full: "Putting" },
      { k: "ovrig", l: "ØVRIG", full: "Fys / spill / turnering" },
    ],
  },
  type: {
    label: "Økt-type",
    members: [
      { k: "egen", l: "EGEN", full: "Egentrening" },
      { k: "coachet", l: "COACHET", full: "Med coach" },
      { k: "test", l: "TEST", full: "Test / måling" },
      { k: "turnering", l: "TURN", full: "Konkurranse" },
    ],
  },
};

const FILTER_DIMS: DimKey[] = ["pyr", "venue", "kat", "type"];

/** Primary-tint-trapp for sub-fordelings-segmenter (CSS color-mix på DS-tokens). */
const SUB_RAMP = [
  "color-mix(in oklab, var(--primary) 82%, var(--card))",
  "color-mix(in oklab, var(--primary) 60%, var(--card))",
  "color-mix(in oklab, var(--primary) 42%, var(--card))",
  "color-mix(in oklab, var(--primary) 27%, var(--card))",
  "color-mix(in oklab, var(--primary) 15%, var(--card))",
  "color-mix(in oklab, var(--primary) 10%, var(--card))",
];

/** Pyramide-akse → CSS-variabel for inline fill (bg-utility dekker prikker). */
const PYR_VAR: Record<AkseKey, string> = {
  fys: "var(--pyr-fys)",
  tek: "var(--pyr-tek)",
  slag: "var(--pyr-slag)",
  spill: "var(--pyr-spill)",
  turn: "var(--pyr-turn)",
};

const PERIOD_DAYS = { "7": 7, "30": 30, season: 92 } as const;
type PeriodKey = keyof typeof PERIOD_DAYS;

// ── hjelpere ────────────────────────────────────────────────────
function keyOf(s: OktLogg, dim: DimKey): string {
  switch (dim) {
    case "pyr":
      return s.axis;
    case "venue":
      return s.venue;
    case "kat":
      return s.kat;
    case "type":
      return s.type;
  }
}

function periodFactor(period: PeriodKey): number {
  // tgt er per ~30 d → skaler målet til valgt periode.
  return period === "7" ? 7 / 30 : period === "season" ? 92 / 30 : 1;
}

function nbHours(t: number): string {
  return t.toFixed(1).replace(".", ",");
}

function nbSg(v: number): string {
  const a = Math.abs(v);
  const dec = a > 0 && a < 0.1 ? 2 : 1;
  const s = a.toFixed(dec).replace(".", ",");
  if (v > 0.005) return `+${s}`;
  if (v < -0.005) return `−${s}`;
  return "±0,0";
}

type SgTone = "pos" | "neg" | "flat";
function sgTone(v: number): SgTone {
  return v > 0.005 ? "pos" : v < -0.005 ? "neg" : "flat";
}

const sgToneText: Record<SgTone, string> = {
  pos: "text-primary",
  neg: "text-destructive",
  flat: "text-muted-foreground",
};

function segColor(dim: DimKey, k: string, i: number): string {
  if (dim === "pyr") return PYR_VAR[k as AkseKey];
  return SUB_RAMP[i] ?? "color-mix(in oklab, var(--primary) 12%, var(--card))";
}

/** SG-snitt for en kategori-rad (kun meningsfullt når gdim === "kat"). */
function sgForKat(k: string, sgPerKat: SgPerKat): number | null {
  if (k === "ott" || k === "app" || k === "arg" || k === "putt") return sgPerKat[k];
  return null;
}

// ── segmentert kontroll ─────────────────────────────────────────
function Seg<T extends string>({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: typeof Layers;
  value: T;
  options: { v: T; label: string; disabled?: boolean }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        {label}
      </span>
      <div className="inline-flex gap-0.5 rounded-[10px] border border-border bg-card p-[3px]">
        {options.map((o) => {
          const on = o.v === value;
          return (
            <button
              key={o.v}
              type="button"
              disabled={o.disabled}
              onClick={() => onChange(o.v)}
              aria-pressed={on}
              className={cn(
                "rounded-[7px] px-2.5 py-1.5 font-mono text-[11px] font-bold tracking-[0.02em] transition-colors",
                on
                  ? "bg-accent font-extrabold text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
                o.disabled && "cursor-not-allowed opacity-30",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── KPI-rute ────────────────────────────────────────────────────
function Kpi({
  value,
  unit,
  tone,
  arrow,
  label,
}: {
  value: string;
  unit?: string;
  tone?: SgTone;
  arrow?: SgTone;
  label: string;
}) {
  const ArrowIcon = arrow === "pos" ? TrendingUp : arrow === "neg" ? TrendingDown : Minus;
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5">
      <span
        className={cn(
          "inline-flex items-baseline gap-1 font-mono text-[24px] font-extrabold leading-none tabular-nums tracking-[-0.02em]",
          tone ? sgToneText[tone] : "text-foreground",
        )}
      >
        {value}
        {unit && <span className="text-[13px] font-bold text-muted-foreground">{unit}</span>}
        {arrow && (
          <ArrowIcon
            className={cn("h-3.5 w-3.5 self-center", tone ? sgToneText[tone] : "text-muted-foreground")}
            strokeWidth={2}
            aria-hidden
          />
        )}
      </span>
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function Treningsanalyse({ data }: { data: TreningsanalyseData }) {
  const [group, setGroup] = useState<DimKey>("pyr");
  const [period, setPeriod] = useState<PeriodKey>("30");
  const [sub, setSub] = useState<DimKey | "none">("venue");
  const [off, setOff] = useState<Record<DimKey, Set<string>>>({
    pyr: new Set(),
    venue: new Set(),
    kat: new Set(),
    type: new Set(),
  });

  const harTrening = data.okter.length > 0;

  // Sub kan ikke være samme dimensjon som gruppering.
  const effSub: DimKey | "none" = sub === group ? "none" : sub;

  const toggleFilter = (dim: DimKey, k: string) => {
    setOff((prev) => {
      const neste = new Set(prev[dim]);
      if (neste.has(k)) neste.delete(k);
      else neste.add(k);
      return { ...prev, [dim]: neste };
    });
  };

  const nullstill = () => {
    setOff({ pyr: new Set(), venue: new Set(), kat: new Set(), type: new Set() });
    setGroup("pyr");
    setPeriod("30");
    setSub("venue");
  };

  // ── live aggregat ─────────────────────────────────────────────
  const agg = useMemo(() => {
    const maxD = PERIOD_DAYS[period];
    const fs = data.okter.filter(
      (s) =>
        s.d <= maxD &&
        !off.pyr.has(s.axis) &&
        !off.venue.has(s.venue) &&
        !off.kat.has(s.kat) &&
        !off.type.has(s.type),
    );

    const totT = fs.reduce((a, s) => a + s.t, 0);
    const fak = periodFactor(period);

    type Row = {
      m: Member;
      h: number;
      n: number;
      tgt: number | null;
      sg: number | null;
      dist: { k: string; l: string; h: number; c: string }[] | null;
    };

    const rows: Row[] = DIMS[group].members
      .map((m) => {
        const ss = fs.filter((s) => keyOf(s, group) === m.k);
        const h = ss.reduce((a, s) => a + s.t, 0);
        const tgt = group === "pyr" && m.tgt != null ? m.tgt * fak : null;
        const sg = group === "kat" ? sgForKat(m.k, data.sgPerKat) : null;
        let dist: Row["dist"] = null;
        if (effSub !== "none" && h > 0) {
          dist = DIMS[effSub].members
            .map((sm, i) => {
              const sh = ss
                .filter((s) => keyOf(s, effSub) === sm.k)
                .reduce((a, s) => a + s.t, 0);
              return { k: sm.k, l: sm.l, h: sh, c: segColor(effSub, sm.k, i) };
            })
            .filter((x) => x.h > 0);
        }
        return { m, h, n: ss.length, tgt, sg, dist };
      })
      .filter((r) => r.h > 0 || r.n > 0);

    const scaleMax = Math.max(0.1, ...rows.map((r) => Math.max(r.h, r.tgt ?? 0)));

    // Største SG-tap (kun når SG er koblet, dvs. gruppering = kat).
    const worst =
      group === "kat"
        ? rows
            .filter((r) => r.sg != null && r.sg < -0.005)
            .sort((a, b) => (a.sg as number) - (b.sg as number))[0] ?? null
        : null;

    // Mest tidkrevende rad (alltid meningsfull).
    const mestTid = [...rows].sort((a, b) => b.h - a.h)[0] ?? null;

    return { fs, totT, rows, scaleMax, worst, mestTid };
  }, [data.okter, data.sgPerKat, group, period, off, effSub]);

  const skjult = FILTER_DIMS.reduce((sum, d) => sum + off[d].size, 0);
  const visNullstill =
    skjult > 0 || group !== "pyr" || period !== "30" || sub !== "venue";

  const periodLbl = period === "7" ? "7 dager" : period === "season" ? "sesongen" : "30 dager";
  const sgNettoTone = data.sgNetto != null ? sgTone(data.sgNetto) : "flat";

  // ── tom-tilstand (ingen trening logget) ───────────────────────
  if (!harTrening) {
    return (
      <section className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <Layers className="mx-auto h-7 w-7 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
        <p className="mt-3 text-[15px] text-foreground">
          Treningsanalyse vises når du har loggførte økter.
        </p>
        <p className="mx-auto mt-1.5 max-w-[36ch] text-[13px] text-muted-foreground">
          Når coachen tildeler en plan og du gjennomfører økter, dekomponerer vi
          tiden din på pyramide-akse, område, SG-kategori og økt-type.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      {/* HEADER */}
      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.7)]" />
          </span>
          TRENINGSANALYSE · UTFORSK
        </span>
        <h2 className="font-display text-[24px] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
          Hvor <em className="font-normal italic text-primary">brukes</em> tiden — og hvor{" "}
          <em className="font-normal italic text-primary">tapes</em> slagene?
        </h2>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Dekomponer treningen på hvilken som helst akse
        </p>
      </header>

      {/* KONTROLLER */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4">
        <Seg
          label="Gruppér på"
          icon={Layers}
          value={group}
          onChange={(v) => setGroup(v)}
          options={[
            { v: "pyr", label: "Pyramide" },
            { v: "venue", label: "Område" },
            { v: "kat", label: "SG-kat" },
            { v: "type", label: "Type" },
          ]}
        />
        <Seg
          label="Periode"
          icon={CalendarDays}
          value={period}
          onChange={(v) => setPeriod(v)}
          options={[
            { v: "7", label: "7 d" },
            { v: "30", label: "30 d" },
            { v: "season", label: "Sesong" },
          ]}
        />
        <Seg
          label="Fordelt på"
          icon={GitFork}
          value={sub}
          onChange={(v) => setSub(v)}
          options={[
            { v: "venue", label: "Område", disabled: group === "venue" },
            { v: "pyr", label: "Pyramide", disabled: group === "pyr" },
            { v: "type", label: "Type", disabled: group === "type" },
            { v: "none", label: "Av" },
          ]}
        />
      </div>

      {/* FILTER-CHIPS */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
            <Filter className="h-3 w-3" strokeWidth={1.75} aria-hidden />
            Filtrér bort
          </span>
          <span className="font-mono text-[10px] font-bold text-foreground">
            {skjult ? `${skjult} skjult` : "alt vises"}
          </span>
          {visNullstill && (
            <button
              type="button"
              onClick={nullstill}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RotateCcw className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
              Nullstill
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {FILTER_DIMS.map((dim) => (
            <div key={dim} className="flex flex-col gap-1.5">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
                {DIMS[dim].label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DIMS[dim].members.map((m) => {
                  const isOff = off[dim].has(m.k);
                  const dotCls = dim === "pyr" ? m.dot : undefined;
                  return (
                    <button
                      key={m.k}
                      type="button"
                      onClick={() => toggleFilter(dim, m.k)}
                      aria-pressed={!isOff}
                      className={cn(
                        "inline-flex h-6 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.03em] transition-opacity",
                        isOff
                          ? "border-border bg-transparent text-muted-foreground line-through opacity-40"
                          : "border-border bg-background text-foreground hover:bg-secondary",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-[2px]",
                          dotCls ?? "bg-muted-foreground",
                          isOff && "opacity-40",
                        )}
                      />
                      {m.l}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI-STRIP */}
      <div className="grid grid-cols-2 gap-3">
        <Kpi value={nbHours(agg.totT)} unit="t" label={`Total trening · ${periodLbl}`} />
        {data.sgNetto != null ? (
          <Kpi
            value={nbSg(data.sgNetto)}
            tone={sgNettoTone}
            arrow={sgNettoTone}
            label="SG netto vs scratch"
          />
        ) : (
          <Kpi value="—" label="SG netto · ingen data" />
        )}
        {agg.worst ? (
          <Kpi
            value={nbSg(agg.worst.sg as number)}
            tone="neg"
            arrow="neg"
            label={`Største tap · ${agg.worst.m.l}`}
          />
        ) : (
          <Kpi
            value={agg.mestTid ? nbHours(agg.mestTid.h) : "—"}
            unit={agg.mestTid ? "t" : undefined}
            label={agg.mestTid ? `Mest tid · ${agg.mestTid.m.l}` : "Mest tid · —"}
          />
        )}
        <Kpi
          value={`${agg.rows.length}`}
          unit={`/ ${DIMS[group].members.length}`}
          label={`${DIMS[group].label} i bruk`}
        />
      </div>

      {/* INNSIKT */}
      {agg.worst ? (
        <div className="grid grid-cols-[26px_1fr] items-center gap-3 rounded-lg border border-destructive/30 border-l-[3px] border-l-destructive bg-destructive/[0.06] p-3.5">
          <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-[13px] leading-snug tracking-[-0.005em] text-foreground">
            <b className="font-bold">{agg.worst.m.l}</b> ({agg.worst.m.full}) eier tapet:{" "}
            <span className="font-mono font-extrabold tabular-nums text-destructive">
              {nbSg(agg.worst.sg as number)} SG
            </span>{" "}
            mot scratch. Du har lagt{" "}
            <b className="font-bold">{nbHours(agg.worst.h)} t</b> her i perioden — koblingen
            mellom tid og resultat er synlig på SG-kategori-aksen.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-[26px_1fr] items-center gap-3 rounded-lg border border-border border-l-[3px] border-l-muted-foreground bg-background p-3.5">
          <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </span>
          <span className="text-[13px] leading-snug tracking-[-0.005em] text-foreground">
            {group === "kat"
              ? data.sgNetto != null
                ? "Ingen negativ SG-kategori i utvalget — treningen holder spillet i pluss mot scratch."
                : "Logg runder med SG-data for å koble treningstiden mot hvor du tjener og taper slag."
              : `Grupperingen er på ${DIMS[group].label.toLowerCase()}. Bytt til SG-kategori for å se hvor slagene tapes.`}
          </span>
        </div>
      )}

      {/* BREAKDOWN */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-3">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            {DIMS[group].label}
          </span>
          <span className="ml-auto font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            {group === "pyr" ? "Timer · mål = tick" : "Timer · andel"}
          </span>
        </div>

        {agg.rows.length === 0 ? (
          <p className="px-4 py-12 text-center font-mono text-[12px] text-muted-foreground">
            Ingen økter matcher filteret. Slå på flere chips eller nullstill.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {agg.rows.map((r) => {
              const neg = r.sg != null && r.sg < -0.005;
              const fill = Math.round((r.h / agg.scaleMax) * 100);
              const fillCol =
                group === "pyr"
                  ? PYR_VAR[r.m.k as AkseKey]
                  : "color-mix(in oklab, var(--primary) 55%, var(--card))";
              const share = agg.totT > 0 ? Math.round((r.h / agg.totT) * 100) : 0;
              const dotCls = group === "pyr" ? r.m.dot : undefined;
              const tone = r.sg != null ? sgTone(r.sg) : "flat";
              const ArrowIcon =
                tone === "pos" ? TrendingUp : tone === "neg" ? TrendingDown : Minus;

              return (
                <li
                  key={r.m.k}
                  className={cn(
                    "flex flex-col gap-2 px-4 py-3.5",
                    neg && "border-l-[3px] border-l-destructive bg-destructive/[0.04]",
                  )}
                >
                  {/* navn + timer + (sg) */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className={cn(
                        "h-2.5 w-2.5 shrink-0 translate-y-0.5 rounded-[3px]",
                        dotCls ?? "bg-muted-foreground",
                      )}
                    />
                    <span className="font-mono text-[13px] font-extrabold uppercase leading-none tracking-[0.04em] text-foreground">
                      {r.m.l}
                    </span>
                    <span className="truncate text-[10.5px] font-medium text-muted-foreground">
                      {r.m.full}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[12px] font-extrabold tabular-nums text-foreground">
                      {nbHours(r.h)}
                      <span className="font-semibold text-muted-foreground">
                        {r.tgt != null ? ` / ${nbHours(r.tgt)} t` : " t"}
                      </span>
                    </span>
                  </div>

                  {/* timebar m/ mål-tick */}
                  <div
                    className={cn(
                      "relative h-2 overflow-hidden rounded-full",
                      neg ? "bg-destructive/15" : "bg-secondary",
                    )}
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${fill}%`, background: fillCol }}
                    />
                    {r.tgt != null && (
                      <span
                        className="absolute -top-0.5 bottom-[-2px] w-0.5 bg-foreground"
                        style={{
                          left: `${Math.min(100, Math.round((r.tgt / agg.scaleMax) * 100))}%`,
                        }}
                      />
                    )}
                  </div>

                  {/* sub-fordeling (stacked) + sg + andel */}
                  <div className="flex items-center gap-3">
                    {r.dist && r.dist.length > 0 ? (
                      <span className="flex h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        {r.dist.map((d) => (
                          <span
                            key={d.k}
                            title={`${d.l} ${nbHours(d.h)} t`}
                            style={{
                              width: `${((d.h / r.h) * 100).toFixed(1)}%`,
                              background: d.c,
                            }}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="flex-1 font-mono text-[10px] text-muted-foreground">
                        {effSub === "none" ? "" : "—"}
                      </span>
                    )}

                    {r.sg != null && (
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 font-mono text-[12px] font-extrabold tabular-nums",
                          sgToneText[tone],
                        )}
                      >
                        {nbSg(r.sg)}
                        <ArrowIcon className="h-3 w-3" strokeWidth={2} aria-hidden />
                      </span>
                    )}
                    <span className="shrink-0 font-mono text-[11px] font-bold tabular-nums text-muted-foreground">
                      {share}%
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* stack-legend */}
        {effSub !== "none" && agg.rows.some((r) => r.dist && r.dist.length > 0) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-border bg-background px-4 py-3">
            <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
              Fordelt på {DIMS[effSub].label.toLowerCase()}
            </span>
            {DIMS[effSub].members.map((sm, i) => (
              <span
                key={sm.k}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.03em] text-foreground"
              >
                <span
                  className="h-2 w-3 rounded-[3px]"
                  style={{ background: segColor(effSub, sm.k, i) }}
                />
                {sm.l}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* FOOT */}
      <p className="font-mono text-[10px] font-semibold leading-relaxed tracking-[0.02em] text-muted-foreground">
        Hver rad regnes live fra <b className="font-bold text-foreground">{agg.fs.length}</b>{" "}
        loggførte økter i utvalget.{" "}
        {data.sgNetto != null
          ? "SG kobles per kategori og holder seg konsistent uansett akse — samme tall, ny vinkel."
          : "SG vises når du har registrert runder eller manuelle SG-tall."}
      </p>
    </section>
  );
}
