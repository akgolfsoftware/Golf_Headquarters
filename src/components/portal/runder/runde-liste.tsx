/**
 * PlayerHQ · Runder — rundeliste, portet FRA v10-fasit:
 *   - Visuell fasit (mobil, autoritativ): public/design-handover/_screens/pl-runder.png
 *   - HTML/CSS-referanse (rad-/farge-mønster): public/design-handover/playerhq/
 *     components-season-timeline.html (meta-rad + score-/SG-farger) og
 *     components-runde-ny.html (score-til-par-farger).
 *   - Manifest §4 ("Runder"): rundeliste m/ bane, dato, score-til-par, SG-total.
 *
 * Presentasjonell komponent. Tar all data via `RunderData`-props — INGEN
 * Prisma/DB/auth her. Mobil er primær-fasit (pixel-nært PNG); desktop utvider
 * responsivt (sentrert lesbar kolonne, sidebar leveres av skall-laget).
 *
 * Fasiten viser TOM-TILSTAND (ny GRATIS-spiller, 0 runder). Vertikal stack
 * (topp → bunn), eksakt rekkefølge fra pl-runder.png:
 *   1. Side-header: eyebrow + "0 runder denne sesongen, {navn}." (tall italic)
 *      + subtekst + primær "Ny runde"-knapp (kun tekst)
 *   2. Separator (border)
 *   3. Tom-tilstand-kort (sentrert): flag-ikon (sirkel) + "Ingen runder logget
 *      ennå" + body + "Ny runde" + "eller" (ren tekst) + "Importer fra GolfBox"
 *      (outline, Download-ikon)
 *
 * Når runder finnes (rows ≥ 1): valgfri snitt-strip + rundeliste (klikkbare
 * rader → /portal/mal/runder/[id]). Empty-state-kortet erstattes av lista.
 *
 * Athletic/UI-primitiver + DS-tokens (globals.css). Ingen hardkodet hex, ingen
 * emoji (kun lucide-ikoner). All tekst norsk bokmål.
 */

import Link from "next/link";
import { ChevronRight, Download, Flag, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell — alt skjermen trenger, levert som props.
// ────────────────────────────────────────────────────────────────────────────

/** Én logget runde i lista. */
export type RundeRow = {
  /** Stabil id — brukes i lenke til detalj. */
  id: string;
  /** Banenavn, f.eks. "Larvik GK". */
  bane: string;
  /** Visningsdato, f.eks. "18. mai 2026". */
  dato: string;
  /** Banens par, f.eks. 72. */
  par: number;
  /** Totalt antall slag, f.eks. 76. */
  score: number;
  /** Score til par (signert heltall): negativ = under par. */
  tilPar: number;
  /** SG-total for runden, eller null hvis ikke beregnet. */
  sgTotal: number | null;
  /** true = sesongens beste runde (lime ★-markør). */
  beste?: boolean;
};

/** Lenker skjermen navigerer til. */
export type RunderHrefs = {
  /** Ny runde / logg runde-flyt. */
  ny: string;
  /** Importér fra GolfBox. */
  importGolfBox: string;
  /** Bygger detalj-rute for en gitt runde-id. */
  detalj: (id: string) => string;
};

export type RunderData = {
  /** Eyebrow over headline, f.eks. "PLAYERHQ · /PORTAL/MAL/RUNDER". */
  eyebrow: string;
  /** Spillerens fornavn (headline). */
  fornavn: string;
  /** Subtekst under headline. */
  subtittel: string;
  /** Spillerens nåværende HCP (fra brukerprofil), eller null hvis ikke satt. */
  hcp: number | null;
  /** Loggede runder (tom liste ⇒ tom-tilstand vises). */
  runder: RundeRow[];
  /** Navigasjons-lenker. */
  hrefs: RunderHrefs;
};

// ────────────────────────────────────────────────────────────────────────────
// Farge-helpers — matcher fasitens score-/SG-koding (timeline + runde-ny HTML).
// ────────────────────────────────────────────────────────────────────────────

function formatSg(v: number | null): string {
  if (v == null) return "—";
  const f = Math.abs(v).toFixed(1).replace(".", ",");
  if (v > 0) return `+${f}`;
  if (v < 0) return `−${f}`; // U+2212 minus, jf. fasit
  return "0,0";
}

function formatTilPar(v: number): string {
  if (v === 0) return "E"; // even par — "E", ikke "0" (jf. runde-ny.html)
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

function sgClass(v: number | null): string {
  if (v == null || v === 0) return "text-muted-foreground";
  return v > 0 ? "text-success" : "text-destructive";
}

// ────────────────────────────────────────────────────────────────────────────
// Primær-knapp ("Ny runde") — pill, forest, lime tekst, KUN tekst (jf. fasit).
// Gjenbrukt i header + tom-tilstand.
// ────────────────────────────────────────────────────────────────────────────

function NyRundeKnapp({ href, className }: { href: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-display text-[15px] font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      Loggfør runde
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Tom-tilstand-kort — sentrert: flag-ikon (sirkel, secondary) + headline + body
// + "Loggfør runde" + "eller" (ren tekst) + "Importer fra GolfBox" (outline).
// Jf. pl-runder.png-mønsteret.
// ────────────────────────────────────────────────────────────────────────────

function TomTilstand({ data }: { data: RunderData }) {
  return (
    <div className="rounded-[20px] border border-dashed border-border bg-card/40 px-6 py-10 text-center sm:px-8">
      {/* Flag-ikon i sirkel (sand/grå) */}
      <span
        aria-hidden
        className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground"
      >
        <Flag className="h-6 w-6" strokeWidth={1.75} />
      </span>

      <h2 className="mt-5 font-display text-[24px] font-bold leading-[1.12] tracking-[-0.02em] text-foreground">
        <span className="font-normal italic text-primary">Ingen runder</span> logget ennå
      </h2>

      <p className="mx-auto mt-3 max-w-[42ch] text-[15px] leading-[1.55] text-muted-foreground">
        Logg din første 18-hulls runde manuelt, eller koble til GolfBox for å importere
        automatisk fra din historikk.
      </p>

      <div className="mt-6">
        <NyRundeKnapp href={data.hrefs.ny} />
      </div>

      {/* "eller" — ren sentrert tekst, ingen flankerende linjer (jf. fasit) */}
      <p className="mt-5 text-[13px] text-muted-foreground">eller</p>

      {/* Importer fra GolfBox — outline (title-case, Download-ikon, jf. fasit) */}
      <Link
        href={data.hrefs.importGolfBox}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-[14px] font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
        Importer fra GolfBox
      </Link>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Snitt-strip — kompakt sammendrag når runder finnes (snitt-score + snitt-SG +
// antall). Skjules i tom-tilstand. Mono tabular-tall, jf. KPI-stilen i fasiten.
// ────────────────────────────────────────────────────────────────────────────

function SnittStrip({ runder }: { runder: RundeRow[] }) {
  const antall = runder.length;
  const snittScore = Math.round(runder.reduce((s, r) => s + r.score, 0) / antall);
  const medSg = runder.filter((r) => r.sgTotal != null);
  const snittSg =
    medSg.length > 0
      ? medSg.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / medSg.length
      : null;

  const celle = (label: string, value: string, klasse?: string) => (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className={cn("font-mono text-2xl font-bold leading-none tabular-nums", klasse ?? "text-foreground")}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-card p-4">
      {celle("Snitt-score", String(snittScore))}
      {celle("Snitt SG", formatSg(snittSg), sgClass(snittSg))}
      {celle("Runder", String(antall))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Rundeliste — klikkbare rader. Layout: [score-boks 48×48] + [bane/dato/meta] + [chevron].
// Score-boks er primary bg + accent tekst for beste runde, ellers secondary/foreground.
// ────────────────────────────────────────────────────────────────────────────

function RundeRad({ r, href }: { r: RundeRow; href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary",
        r.beste && "bg-accent/[0.06]",
      )}
    >
      {/* Score-boks — 48×48, rounded-xl, fasit-farge (jf. RoundsView i ph-screens.jsx) */}
      <span
        className={cn(
          "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl",
          r.beste
            ? "bg-primary text-accent"
            : "bg-secondary text-foreground",
        )}
        aria-hidden
      >
        <span className="font-mono text-[17px] font-bold leading-none tabular-nums">
          {r.score}
        </span>
        <span className="mt-0.5 font-mono text-[9px] tabular-nums opacity-70">
          {formatTilPar(r.tilPar)}
        </span>
      </span>

      {/* Bane + dato + meta (SG) */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold tracking-[-0.005em] text-foreground">
            {r.bane}
          </span>
          {r.beste && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-[2px] font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
              <Star className="h-[10px] w-[10px] fill-current" strokeWidth={2} aria-hidden />
              Beste
            </span>
          )}
        </div>
        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          {r.dato} · {r.sgTotal != null ? `SG ${formatSg(r.sgTotal)}` : `Par ${r.par}`}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight
        className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        strokeWidth={1.5}
        aria-hidden
      />
    </Link>
  );
}

function RundeListe({ data }: { data: RunderData }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <ul>
        {data.runder.map((r, idx) => (
          <li key={r.id} className={cn(idx > 0 && "border-t border-border")}>
            <RundeRad r={r} href={data.hrefs.detalj(r.id)} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent — sentrert lesbar kolonne. Skall (sidebar/bunn-nav) leveres av
// preview/portal-laget; her er det rene innholdet.
// ────────────────────────────────────────────────────────────────────────────

export function RundeListeSide({ data }: { data: RunderData }) {
  const tom = data.runder.length === 0;

  return (
    <div className="mx-auto w-full max-w-[460px] space-y-6 px-4 py-6 sm:px-0 md:max-w-[720px]">
      {/* 1. Side-header */}
      <header className="space-y-4">
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {data.eyebrow}
        </span>
        <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
          <span className="font-normal italic text-primary tabular-nums">
            {data.runder.length} {data.runder.length === 1 ? "runde" : "runder"}
          </span>{" "}
          denne sesongen, {data.fornavn}.
        </h1>
        <p className="text-[16px] leading-[1.5] text-muted-foreground">{data.subtittel}</p>
        <div className="pt-1">
          <NyRundeKnapp href={data.hrefs.ny} />
        </div>
      </header>

      {/* 2. Separator */}
      <hr className="border-border" />

      {/* 3. Tom-tilstand ELLER snitt + liste */}
      {tom ? (
        <TomTilstand data={data} />
      ) : (
        <div className="space-y-6">
          <SnittStrip runder={data.runder} />
          <RundeListe data={data} />
        </div>
      )}
    </div>
  );
}
