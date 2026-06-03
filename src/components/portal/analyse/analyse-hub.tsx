/**
 * PlayerHQ Analyse-hub — portet FRA v10-fasit:
 *   - Visuell fasit: public/design-handover/_screens/pl-analyse.png (mobil 430px, TOM-TILSTAND)
 *   - HTML/CSS-referanse (populert tilstand): public/design-handover/playerhq/components-training-analysis.html
 *   - Manifest: docs/skjerm-manifest-playerhq.md §4 ANALYSERE
 *
 * Presentasjonell komponent. All data via `AnalyseHubData`-props — INGEN Prisma/DB/auth.
 *
 * Fasiten viser TOM-TILSTAND (ny spiller uten loggførte økter): et stiplet kort med
 * Layers-ikon, overskrift «Treningsanalyse vises når du har loggførte økter.» og en
 * forklarende brødtekst. Når økter finnes, dekomponeres treningstiden på pyramide-akse
 * med timer, fordeling og SG-bidrag (kompakt mobil-tilpasset variant av v10-tabellen).
 *
 * Mobil er primær-fasit (pixel-mot PNG); desktop utvider responsivt (sentrert lesbar
 * kolonne, sidebar/skall leveres av preview/portal-laget).
 *
 * Athletic-primitiver + DS-tokens (globals.css). Ingen hardkodet hex, ingen emoji
 * (kun lucide-ikoner). All tekst norsk bokmål.
 */

import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, Layers } from "lucide-react";
import { KpiCard } from "@/components/athletic";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell — alt skjermen trenger, levert som props.
// ────────────────────────────────────────────────────────────────────────────

/** Pyramide-akse — fargesatt via --pyr-*-tokens i globals.css. */
export type PyramideAkse = "fys" | "tek" | "slag" | "spill" | "turn";

export type AkseRad = {
  akse: PyramideAkse;
  /** Kort kode, f.eks. «FYS». */
  kort: string;
  /** Fullt navn, f.eks. «Fysisk». */
  full: string;
  /** Loggførte timer i perioden. */
  timer: number;
  /** Måltimer for perioden (tick på baren). null = ingen mål. */
  maalTimer: number | null;
  /** Netto strokes gained-bidrag (positiv = vinner slag). */
  sg: number;
  /** Andel av total treningstid, 0–100. */
  andel: number;
};

export type AnalyseHubData = {
  /** Spillerens fornavn + initial, f.eks. «Markus R.P.» — vist i seksjons-eyebrow. */
  spillerNavn: string;
  /** Valgt periode-etikett, f.eks. «30 dager». */
  periodeLabel: string;
  /** Totale loggførte timer i perioden. */
  totalTimer: number;
  /** Netto SG i perioden. */
  nettoSg: number;
  /** Antall loggførte økter i perioden. */
  antallOkter: number;
  /** Dekomponering per pyramide-akse. Tom array = TOM-TILSTAND (fasit). */
  akser: AkseRad[];
  hrefs: {
    /** «Se full analyse» / dyp-dykk (SG Hub). */
    sgHub: string;
    /** CTA i tom-tilstand → planlegg / be om plan. */
    planlegge: string;
  };
};

// ────────────────────────────────────────────────────────────────────────────
// Formattering (norsk bokmål, tabulære tall).
// ────────────────────────────────────────────────────────────────────────────

function nbTimer(t: number): string {
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

const AKSE_FILL: Record<PyramideAkse, string> = {
  fys: "bg-pyr-fys",
  tek: "bg-pyr-tek",
  slag: "bg-pyr-slag",
  spill: "bg-pyr-spill",
  turn: "bg-pyr-turn",
};

const SG_TEXT: Record<SgTone, string> = {
  pos: "text-primary",
  neg: "text-destructive",
  flat: "text-muted-foreground",
};

const SG_ARROW: Record<SgTone, string> = {
  pos: "▲",
  neg: "▼",
  flat: "→",
};

// ────────────────────────────────────────────────────────────────────────────
// Seksjons-header — mono-eyebrow med hårlinje til høyre (v10 «.sec»-mønster).
// ────────────────────────────────────────────────────────────────────────────

function SeksjonHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// TOM-TILSTAND — eksakt fasit (pl-analyse.png): stiplet kort, Layers-ikon,
// overskrift + forklarende brødtekst, sentrert.
// ────────────────────────────────────────────────────────────────────────────

function TomTilstand() {
  return (
    <div className="flex flex-col items-center rounded-[20px] border border-dashed border-border bg-card px-6 py-12 text-center sm:py-14">
      <Layers
        className="h-8 w-8 text-muted-foreground/60"
        strokeWidth={1.5}
        aria-hidden
      />
      <h2 className="mt-3 text-[15px] text-foreground">
        Treningsanalyse vises når du har loggførte økter.
      </h2>
      <p className="mt-1.5 max-w-[36ch] text-[13px] leading-[1.55] text-muted-foreground">
        Når coachen tildeler en plan og du gjennomfører økter, dekomponerer vi
        tiden din på pyramide-akse, område, SG-kategori og økt-type.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Populert tilstand — KPI-strip + innsiktslinje + akse-dekomponering.
// (Kompakt mobil-tilpasset variant av v10 components-training-analysis.html.)
// ────────────────────────────────────────────────────────────────────────────

function KpiSeksjon({ data }: { data: AnalyseHubData }) {
  const sg = sgTone(data.nettoSg);
  const verst = data.akser
    .filter((a) => a.sg < -0.005)
    .sort((a, b) => a.sg - b.sg)[0];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <KpiCard
        label={`Total trening · ${data.periodeLabel}`}
        value={nbTimer(data.totalTimer)}
        unit="t"
      />
      <KpiCard
        label="SG netto vs Tour"
        value={
          <span className={SG_TEXT[sg]}>
            {nbSg(data.nettoSg)} <span className="text-base">{SG_ARROW[sg]}</span>
          </span>
        }
      />
      <KpiCard
        label={verst ? `Største tap · ${verst.kort}` : "Økter logget"}
        value={
          verst ? (
            <span className="text-destructive">
              {nbSg(verst.sg)} <span className="text-base">▼</span>
            </span>
          ) : (
            String(data.antallOkter)
          )
        }
      />
    </div>
  );
}

function InnsiktsLinje({ data }: { data: AnalyseHubData }) {
  const verst = data.akser
    .filter((a) => a.sg < -0.005)
    .sort((a, b) => a.sg - b.sg)[0];

  if (verst) {
    return (
      <div className="grid grid-cols-[26px_1fr] items-start gap-3 rounded-xl border border-destructive/30 border-l-[3px] border-l-destructive bg-destructive/[0.06] p-4">
        <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </span>
        <p className="text-[13px] leading-[1.45] tracking-[-0.005em] text-foreground">
          <span className="font-bold">{verst.kort}</span> ({verst.full}) eier
          tapet:{" "}
          <span className="font-mono font-bold text-destructive">
            {nbSg(verst.sg)} SG
          </span>{" "}
          — {nbTimer(verst.timer)} t av {nbTimer(data.totalTimer)} t. Prioritér
          denne aksen neste periode.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[26px_1fr] items-start gap-3 rounded-xl border border-border border-l-[3px] border-l-muted-foreground bg-secondary/40 p-4">
      <span className="grid h-[26px] w-[26px] place-items-center rounded-full bg-secondary text-muted-foreground">
        <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      </span>
      <p className="text-[13px] leading-[1.45] tracking-[-0.005em] text-foreground">
        Ingen negativ SG i utvalget. Netto{" "}
        <span className="font-mono font-bold">{nbSg(data.nettoSg)}</span> over{" "}
        {data.antallOkter} økter.
      </p>
    </div>
  );
}

function AkseRadKort({
  rad,
  skala,
}: {
  rad: AkseRad;
  skala: number;
}) {
  const neg = rad.sg < -0.005;
  const tone = sgTone(rad.sg);
  const fyll = Math.round((rad.timer / skala) * 100);
  const tick =
    rad.maalTimer != null
      ? Math.min(100, Math.round((rad.maalTimer / skala) * 100))
      : null;

  return (
    <div
      className={cn(
        "flex flex-col gap-2.5 border-b border-border p-4 last:border-b-0",
        neg && "border-l-[3px] border-l-destructive bg-destructive/[0.04]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", AKSE_FILL[rad.akse])}
            aria-hidden
          />
          <span>
            <span className="block font-mono text-[13px] font-bold uppercase tracking-[0.04em] text-foreground">
              {rad.kort}
            </span>
            <span className="block text-[10.5px] font-medium text-muted-foreground">
              {rad.full}
            </span>
          </span>
        </div>
        <div className="flex items-baseline gap-3 text-right">
          <span className="font-mono text-xs font-bold tabular-nums text-foreground">
            {nbTimer(rad.timer)}
            <span className="font-semibold text-muted-foreground">
              {rad.maalTimer != null ? ` / ${nbTimer(rad.maalTimer)} t` : " t"}
            </span>
          </span>
          <span
            className={cn(
              "inline-flex min-w-[64px] items-baseline justify-end gap-1 font-mono text-sm font-bold tabular-nums",
              SG_TEXT[tone],
            )}
          >
            {nbSg(rad.sg)}
            <span className="text-[11px] leading-none">{SG_ARROW[tone]}</span>
          </span>
        </div>
      </div>
      <div
        className={cn(
          "relative h-2 overflow-hidden rounded-full",
          neg ? "bg-destructive/[0.12]" : "bg-secondary",
        )}
      >
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full", AKSE_FILL[rad.akse])}
          style={{ width: `${fyll}%` }}
        />
        {tick != null && (
          <div
            className={cn(
              "absolute -top-0.5 -bottom-0.5 w-0.5",
              neg ? "bg-destructive" : "bg-foreground",
            )}
            style={{ left: `${tick}%` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}

function Dekomponering({ data }: { data: AnalyseHubData }) {
  const skala = Math.max(
    0.1,
    ...data.akser.map((a) => Math.max(a.timer, a.maalTimer ?? 0)),
  );

  return (
    <section aria-labelledby="dekomp-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2
          id="dekomp-heading"
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Trening per pyramide-akse
        </h2>
        <Link
          href={data.hrefs.sgHub}
          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary hover:opacity-80"
        >
          Se alt
          <ChevronRight className="h-3 w-3" strokeWidth={2.5} aria-hidden />
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {data.akser.map((rad) => (
          <AkseRadKort key={rad.akse} rad={rad} skala={skala} />
        ))}
      </div>
      <p className="font-mono text-[10px] font-semibold leading-[1.5] tracking-[0.02em] text-muted-foreground">
        Hver rad regnes live fra {data.antallOkter} økt-logger. SG-bidragene
        summerer til{" "}
        <span className="font-bold text-foreground">{nbSg(data.nettoSg)}</span>{" "}
        uansett hvilken akse du grupperer på.
      </p>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent — sentrert lesbar kolonne. Skall (sidebar/bunn-nav) leveres av
// preview/portal-laget; her er det rene innholdet.
// ────────────────────────────────────────────────────────────────────────────

export function AnalyseHub({ data }: { data: AnalyseHubData }) {
  // Tom-tilstand = fasit (pl-analyse.png): kun det stiplede kortet, flush øverst.
  if (data.akser.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[460px] px-4 py-5 sm:px-6 md:max-w-[720px]">
        <TomTilstand />
      </div>
    );
  }

  // Populert tilstand: seksjons-header + KPI + innsikt + akse-dekomponering.
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-5 px-4 py-5 sm:px-6 md:max-w-[720px]">
      <SeksjonHeader>Treningsanalyse · {data.spillerNavn}</SeksjonHeader>
      <KpiSeksjon data={data} />
      <InnsiktsLinje data={data} />
      <Dekomponering data={data} />
    </div>
  );
}
