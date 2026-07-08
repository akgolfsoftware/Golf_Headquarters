/**
 * PlayerHQ · Runder — rundeliste, recomponert til v13-designsystemet
 * (Bolk 2, 2026-07-04). Den gamle v10-fasiten er obsolet — v13 er eneste
 * gjeldende design. Bygget av golfdata-komponentene: Eyebrow + Button (header),
 * KpiTile (snitt-strip m/ count-up), Card (rundekort). Alt v13-innhold under
 * .golfdata-scope (lys PlayerHQ).
 *
 * Presentasjonell komponent (server): all data via `RunderData`-props — INGEN
 * Prisma/DB/auth her. Server-trygt fordi Card/Button/Eyebrow er hook-frie og
 * KpiTile (klient) kun får serialiserbare props. Mobil-først; desktop utvider
 * responsivt. Tom-tilstand (0 runder) bevart.
 *
 * All tekst norsk bokmål, ingen hardkodet hex, ingen emoji (kun lucide-ikoner).
 */

import Link from "next/link";
import { ChevronRight, Download, Flag, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, Eyebrow, KpiTile } from "@/components/athletic/golfdata";

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
// Farge-helpers — SG-fortegn + score-til-par.
// ────────────────────────────────────────────────────────────────────────────

function formatSg(v: number | null): string {
  if (v == null) return "—";
  const f = Math.abs(v).toFixed(1).replace(".", ",");
  if (v > 0) return `+${f}`;
  if (v < 0) return `−${f}`; // U+2212 minus
  return "0,0";
}

function formatTilPar(v: number): string {
  if (v === 0) return "E"; // even par
  return v > 0 ? `+${v}` : `−${Math.abs(v)}`;
}

// ────────────────────────────────────────────────────────────────────────────
// Tom-tilstand-kort — sentrert: flag-ikon + headline + body + CTA-er (v13 Button).
// ────────────────────────────────────────────────────────────────────────────

function TomTilstand({ data }: { data: RunderData }) {
  return (
    <div className="rounded-[20px] border border-dashed border-border bg-card/40 px-6 py-10 text-center sm:px-8">
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
        <Button as={Link} href={data.hrefs.ny} variant="signal" size="lg">
          Loggfør runde
        </Button>
      </div>

      <p className="mt-5 text-[13px] text-muted-foreground">eller</p>

      <div className="mt-5">
        <Button
          as={Link}
          href={data.hrefs.importGolfBox}
          variant="secondary"
          iconLeft={<Download className="h-4 w-4" strokeWidth={2} aria-hidden />}
        >
          Importer fra GolfBox
        </Button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Snitt-strip — snitt-score + snitt-SG + antall som KpiTile (count-up dataliv).
// ────────────────────────────────────────────────────────────────────────────

function SnittStrip({ runder }: { runder: RundeRow[] }) {
  const antall = runder.length;
  const snittScore = Math.round(runder.reduce((s, r) => s + r.score, 0) / antall);
  const medSg = runder.filter((r) => r.sgTotal != null);
  const snittSg =
    medSg.length > 0 ? medSg.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / medSg.length : null;

  return (
    <Card compact bodyStyle={{ padding: 0 }}>
      <div className="grid grid-cols-3 divide-x divide-border">
        <div className="px-4 py-4">
          <KpiTile size="md" label="Snitt-score" value={snittScore} />
        </div>
        <div className="px-4 py-4">
          <KpiTile size="md" label="Snitt SG" value={formatSg(snittSg)} />
        </div>
        <div className="px-4 py-4">
          <KpiTile size="md" label="Runder" value={antall} />
        </div>
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Rundekort — v13 Card interactive, klikkbart (Link). Score-boks + bane/dato/SG.
// ────────────────────────────────────────────────────────────────────────────

function RundeKort({ r, href }: { r: RundeRow; href: string }) {
  return (
    <Link href={href} className="block">
      <Card interactive compact>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl",
              r.beste ? "bg-primary text-accent" : "bg-secondary text-foreground",
            )}
            aria-hidden
          >
            <span className="font-mono text-[17px] font-bold leading-none tabular-nums">{r.score}</span>
            <span className="mt-0.5 font-mono text-[9px] tabular-nums opacity-70">{formatTilPar(r.tilPar)}</span>
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold tracking-[-0.005em] text-foreground">{r.bane}</span>
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

          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
        </div>
      </Card>
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent — sentrert lesbar kolonne under .golfdata-scope.
// ────────────────────────────────────────────────────────────────────────────

export function RundeListeSide({ data }: { data: RunderData }) {
  const tom = data.runder.length === 0;

  return (
    <div className="golfdata-scope mx-auto w-full max-w-[460px] space-y-6 px-4 py-6 sm:px-0 md:max-w-[720px]">
      {/* 1. Side-header */}
      <header className="space-y-4">
        <Eyebrow style={{ fontSize: "var(--text-11)", letterSpacing: "0.14em" }}>{data.eyebrow}</Eyebrow>
        <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[40px]">
          <span className="font-normal italic text-primary tabular-nums">
            {data.runder.length} {data.runder.length === 1 ? "runde" : "runder"}
          </span>{" "}
          denne sesongen, {data.fornavn}.
        </h1>
        <p className="text-[16px] leading-[1.5] text-muted-foreground">{data.subtittel}</p>
        <div className="pt-1">
          <Button as={Link} href={data.hrefs.ny} variant="signal" size="lg">
            Loggfør runde
          </Button>
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
          <div className="space-y-2">
            {data.runder.map((r) => (
              <RundeKort key={r.id} r={r} href={data.hrefs.detalj(r.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
