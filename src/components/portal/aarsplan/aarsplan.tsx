/**
 * Aarsplan — PlayerHQ §2 Planlegge · Aarsplan (`/portal/tren/aarsplan`).
 *
 * Portet FRA v10-fasit:
 *   - Visuell fasit (pixel-maal): [historisk fasit, fjernet 2026-07-03] _screens/pl-aarsplan.png
 *     (mobil 430px, TOM-TILSTAND — ny spiller "Mathias", ingen sesongplan)
 *   - HTML/CSS-referanse (header + Gantt-verdier):
 *     [historisk fasit, fjernet 2026-07-03] playerhq/components-season-timeline.html
 *   - Manifest: docs/skjerm-manifest-playerhq.md §2 (Gantt-kart hele aaret,
 *     faser farget per pyramide-akse).
 *
 * Presentasjonell komponent — tar all data via props, INGEN Prisma/DB/auth.
 * Mobil er primaer-fasit (pixel-perfekt mot PNG). Desktop utvider responsivt;
 * skall (sidebar) leveres av preview/portal-laget.
 *
 * To tilstander:
 *   - `faser` tom  -> TOM-TILSTAND (fasiten): kalender-ikon + "Ingen sesongplan
 *     for <aar>" + brodtekst + primaer-CTA "Opprett sesongplan for <aar>".
 *   - `faser` med data -> Gantt-kart: maaneds-akse + en lane per pyramide-akse,
 *     hver fase som farget bar plassert paa maaned-rutenettet.
 *
 * Athletic-primitiver + DS-tokens (globals.css). Ingen hardkodet hex, ingen
 * emoji (kun lucide). All tekst norsk bokmaal.
 *
 * Porting-gate fikser (2026-06-11):
 *   - Eyebrow tracking: 0.14em → 0.12em (fasit .eb: letter-spacing 0.12em)
 *   - h1 tracking: -0.02em → -0.025em (fasit h1: letter-spacing -0.025em)
 *   - CalendarDays ikon: h-7 (28px) → h-6 (24px) (DS-regel: 24px standard)
 *   - TomTilstand py-14 (56px) → py-12 (48px) (8pt-grid: aldri py-14)
 *   - Gantt container sm:p-5 (20px) → sm:p-6 (24px) (8pt-grid: aldri p-5)
 */

import Link from "next/link";
import { CalendarDays, Plus } from "lucide-react";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell
// ────────────────────────────────────────────────────────────────────────────

/** Pyramide-akse — bestemmer lane og fargetema for en fase. */
export type PyramideAkse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type Fase = {
  id: string;
  akse: PyramideAkse;
  /** Visningsnavn paa fasen, f.eks. "Grunntrening". */
  navn: string;
  /** Startmaaned 1–12 (inklusiv). */
  fraManed: number;
  /** Sluttmaaned 1–12 (inklusiv). */
  tilManed: number;
};

export type AarsplanData = {
  aar: number;
  /** Spillerens fornavn — brukes i tom-tilstandens hilsen. */
  fornavn: string;
  /** Faser i planen. Tom array = tom-tilstand (fasiten). */
  faser: Fase[];
  hrefs: {
    /** CTA i tom-tilstand + "rediger" ved klikk paa fase. */
    opprett: string;
    /** Lenke pr. fase (rediger periode). */
    faseBase: string;
  };
};

// ────────────────────────────────────────────────────────────────────────────
// Akse-metadata — etikett + fargetema (DS-tokens, ingen hardkodet hex).
// ────────────────────────────────────────────────────────────────────────────

const AKSE: Record<
  PyramideAkse,
  { label: string; bar: string; tekst: string }
> = {
  FYS: { label: "Fysisk", bar: "bg-primary/15", tekst: "text-primary" },
  TEK: { label: "Teknikk", bar: "bg-info/15", tekst: "text-info" },
  SLAG: { label: "Slag", bar: "bg-warning/15", tekst: "text-warning" },
  SPILL: { label: "Spill", bar: "bg-success/15", tekst: "text-success" },
  TURN: {
    label: "Turnering",
    bar: "bg-accent/40",
    tekst: "text-accent-foreground",
  },
};

const AKSE_REKKEFOLGE: PyramideAkse[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

const MANED_KORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAI",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DES",
];

// ────────────────────────────────────────────────────────────────────────────
// Header — eyebrow + display-headline (italic aar) + brodtekst. Matcher
// .head i components-season-timeline.html (eyebrow mono 10/800, h1 display
// 30/700 med em italic 400 primary, sub sans 14 muted).
// ────────────────────────────────────────────────────────────────────────────

function Header({ data }: { data: AarsplanData }) {
  const tom = data.faser.length === 0;
  return (
    <header>
      <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        PlayerHQ · Trening · Årsplan
      </p>
      <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
        Årsplan{" "}
        <em className="font-normal italic text-primary">{data.aar}</em>
      </h1>
      <p className="mt-2 max-w-[760px] text-sm leading-[1.55] text-muted-foreground">
        {tom
          ? `Ingen sesongplan for ${data.aar} enda, ${data.fornavn}. Opprett en for å starte planleggingen.`
          : `Sesongplan for ${data.aar} — faser fordelt per pyramide-akse gjennom hele året.`}
      </p>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Tom-tilstand — fasiten. Solid-border kort, kalender-ikon, overskrift,
// brodtekst, primaer forest-CTA med plus-ikon.
// ────────────────────────────────────────────────────────────────────────────

function TomTilstand({ data }: { data: AarsplanData }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-12 text-center sm:py-16"
    >
      <CalendarDays
        className="h-6 w-6 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden
      />
      <h2 className="mt-6 text-[22px] font-bold leading-tight tracking-[-0.01em] text-foreground">
        Ingen sesongplan for {data.aar}
      </h2>
      <p className="mt-3 max-w-[320px] text-[15px] leading-[1.5] text-muted-foreground">
        En sesongplan hjelper deg å strukturere hele treningsåret med Mac
        O&apos;Grady-faser, volummål og turneringsplan.
      </p>
      <Link
        href={data.hrefs.opprett}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        Opprett sesongplan for {data.aar}
      </Link>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Gantt — vises naar `faser` har data (manifest-intensjon). Maaneds-akse paa
// topp + en lane per pyramide-akse; hver fase plassert paa 12-kolonne grid.
// ────────────────────────────────────────────────────────────────────────────

function GanttBar({ fase }: { fase: Fase }) {
  const tema = AKSE[fase.akse];
  const start = Math.min(Math.max(fase.fraManed, 1), 12);
  const slutt = Math.min(Math.max(fase.tilManed, start), 12);
  return (
    <div
      className={`flex items-center overflow-hidden rounded-md px-2 py-1.5 ${tema.bar}`}
      style={{ gridColumn: `${start} / ${slutt + 1}` }}
    >
      <span
        className={`truncate font-mono text-[10px] font-bold uppercase tracking-[0.06em] ${tema.tekst}`}
      >
        {fase.navn}
      </span>
    </div>
  );
}

function Gantt({ data }: { data: AarsplanData }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="min-w-[640px]">
        {/* Maaneds-akse */}
        <div className="mb-3 grid grid-cols-[88px_repeat(12,minmax(0,1fr))] items-end gap-x-1.5">
          <span aria-hidden />
          {MANED_KORT.map((m) => (
            <span
              key={m}
              className="text-center font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
            >
              {m}
            </span>
          ))}
        </div>

        {/* En lane per akse */}
        <div className="space-y-2">
          {AKSE_REKKEFOLGE.map((akse) => {
            const faser = data.faser.filter((f) => f.akse === akse);
            return (
              <div
                key={akse}
                className="grid grid-cols-[88px_repeat(12,minmax(0,1fr))] items-center gap-x-1.5"
              >
                <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
                  {AKSE[akse].label}
                </span>
                {/* Faser legges direkte i 12-kol-omraadet (kol 2–13). */}
                <div className="col-start-2 col-end-[14] grid grid-cols-12 gap-x-1.5">
                  {faser.length > 0 ? (
                    faser.map((f) => (
                      <Link
                        key={f.id}
                        href={`${data.hrefs.faseBase}/${f.id}/rediger`}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                        style={{
                          gridColumn: `${Math.min(
                            Math.max(f.fraManed, 1),
                            12,
                          )} / ${
                            Math.min(
                              Math.max(f.tilManed, f.fraManed),
                              12,
                            ) + 1
                          }`,
                        }}
                      >
                        <GanttBar fase={f} />
                      </Link>
                    ))
                  ) : (
                    <span className="col-span-12 h-[30px] rounded-md border border-dashed border-border" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent — sentrert lesbar kolonne. Skall leveres av preview/portal.
// ────────────────────────────────────────────────────────────────────────────

export function Aarsplan({ data }: { data: AarsplanData }) {
  const tom = data.faser.length === 0;
  return (
    <div className="mx-auto w-full max-w-[460px] space-y-6 px-4 py-6 sm:px-6 md:max-w-[860px]">
      <Header data={data} />
      {tom ? <TomTilstand data={data} /> : <Gantt data={data} />}
    </div>
  );
}
