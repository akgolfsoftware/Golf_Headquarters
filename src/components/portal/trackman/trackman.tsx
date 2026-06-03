/**
 * TrackMan — PlayerHQ sesjonsanalyse (presentasjonell, props-drevet).
 *
 * Fasit: public/design-handover/_screens/pl-trackman.png (tom-tilstand).
 * Skjermen viser dispersjon + per-slag-data per kølle. Når spilleren ikke har
 * importert noen TrackMan-økt ennå, vises tom-tilstanden fra fasiten:
 *   - eyebrow "TRACKMAN · SESJONSANALYSE"
 *   - editorial italic-tittel "Range-analyse per kølle"
 *   - et stort tom-tilstandskort med activity-ikon, overskrift, brødtekst,
 *     to import-knapper, en "Last opp HTML-rapport"-lenke og en
 *     "Eksporter fra TrackMan"-instruksjonsboks.
 *
 * Komponenten er ren presentasjon — INGEN Prisma/DB/auth. Tom-tilstand
 * styres av `data.okter.length === 0` (eller eksplisitt `null`-felt for
 * sesjonsdata). Mobil-først; samme markup skalerer til desktop-kolonnen.
 */

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

// ── Datatyper ────────────────────────────────────────────────────────────

export type TrackmanHrefs = {
  /** Hvor "Importer TrackMan" / "Importer CSV" / "Last opp HTML" peker */
  importTrackman: string;
  importCsv: string;
  importHtml: string;
};

export type TrackmanData = {
  /** Mono-eyebrow over tittelen */
  eyebrow: string;
  /** Antall importerte økter — 0 ⇒ tom-tilstand (fasit) */
  okterCount: number;
  hrefs: TrackmanHrefs;
};

// ── Komponent ──────────────────────────────────────────────────────────────

export function Trackman({ data }: { data: TrackmanData }) {
  const erTom = data.okterCount === 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Sidetittel */}
      <header className="mb-5">
        <AthleticEyebrow>{data.eyebrow}</AthleticEyebrow>
        <h1 className="font-display mt-1 text-[26px] font-bold italic leading-[1.1] tracking-[-0.015em] text-foreground sm:text-[30px]">
          Range-analyse per kølle
        </h1>
      </header>

      {erTom ? <TrackmanEmptyState hrefs={data.hrefs} /> : null}
    </div>
  );
}

// ── Tom-tilstand ─────────────────────────────────────────────────────────

function TrackmanEmptyState({ hrefs }: { hrefs: TrackmanHrefs }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-10 sm:px-10 sm:py-12">
      {/* Hero — sentrert (ikon + overskrift + brødtekst) */}
      <div className="flex flex-col items-center text-center">
        {/* Ikon i sirkel */}
        <span className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <Activity
            className="h-7 w-7 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
        </span>

        {/* Overskrift — editorial: grønn italic + mørk forts. */}
        <h2 className="font-display text-[19px] font-bold leading-snug tracking-[-0.01em] sm:text-[21px]">
          <em className="font-normal not-italic">
            <span className="italic text-primary">Ingen TrackMan-data</span>{" "}
            <span className="text-foreground">importert ennå</span>
          </em>
        </h2>

        {/* Brødtekst */}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Importer din første økt for å se spredning, stabilitet og full
          parameter-tabell per kølle.
        </p>
      </div>

      {/* Handlinger — venstrejustert (jf. fasit) */}
      <div className="mt-7">
        {/* Import-knapper — side ved side, uten ikoner */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={hrefs.importTrackman}
            className="font-display inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-bold tracking-[-0.005em] text-accent transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-6"
          >
            Importer TrackMan
          </Link>
          <Link
            href={hrefs.importCsv}
            className="font-display inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-bold tracking-[-0.005em] text-accent transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-6"
          >
            Importer CSV
          </Link>
        </div>

        {/* HTML-rapport — outlined chip */}
        <Link
          href={hrefs.importHtml}
          className="font-display mt-3 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Last opp HTML-rapport
        </Link>
      </div>

      {/* Eksport-instruksjoner */}
      <div className="mt-8 rounded-xl bg-secondary px-5 py-4 text-left">
        <p className="font-mono text-[13px] font-bold tracking-[0.02em] text-foreground">
          Eksporter fra TrackMan:
        </p>
        <ol className="mt-2 space-y-1.5">
          <li className="flex items-baseline gap-2 font-mono text-[12.5px] leading-relaxed text-muted-foreground">
            <span className="shrink-0 font-bold text-foreground">CSV:</span>
            <span className="inline-flex flex-wrap items-center gap-x-1.5">
              Sessions <ArrowRight className="h-3 w-3" aria-hidden /> velg økt{" "}
              <ArrowRight className="h-3 w-3" aria-hidden /> Export{" "}
              <ArrowRight className="h-3 w-3" aria-hidden /> CSV
            </span>
          </li>
          <li className="flex items-baseline gap-2 font-mono text-[12.5px] leading-relaxed text-muted-foreground">
            <span className="shrink-0 font-bold text-foreground">HTML:</span>
            <span className="inline-flex flex-wrap items-center gap-x-1.5">
              Åpne Multi Group Report i nettleseren{" "}
              <ArrowRight className="h-3 w-3" aria-hidden /> Lagre som HTML
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
