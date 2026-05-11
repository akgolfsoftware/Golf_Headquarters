/**
 * PILOT — BookSessionModal · Steg 3 (Bekreft og betal)
 * Bygd direkte fra wireframe/modal-C/01-book-session-steg3.html
 * URL: /book-session-steg3-demo
 *
 * Mock: Markus booker 1:1 med Anders — torsdag 14. mai 2026.
 */

import { X, ArrowRight, ArrowLeft, Info } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

const SUM_ROWS: Array<{ k: string; v: string; mono?: boolean }> = [
  { k: "Fasilitet", v: "Mulligan Studio 1 · matte 4" },
  { k: "Dato", v: "Torsdag 14. mai 2026", mono: true },
  { k: "Tid", v: "16:30 – 17:30 · 60 min", mono: true },
  { k: "Type", v: "1:1 trening · Anders Kristiansen" },
  { k: "Inkluderer", v: "TrackMan-data · video-replay · kaffe" },
];

export default function BookSessionSteg3Demo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-7">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              <span>Steg 3 av 3</span>
              <span className="mx-2 text-foreground/30">·</span>
              <span>Bekreft og betal</span>
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Book økt
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <StepDots active={2} total={3} />
            <button
              type="button"
              aria-label="Lukk"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Summary card */}
          <div
            className="mb-5 rounded-2xl border border-primary/12 px-5 py-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,88,64,0.04), rgba(209,248,67,0.10))",
            }}
          >
            {SUM_ROWS.map((row, i) => (
              <div
                key={row.k}
                className={`flex items-center justify-between py-2 text-[13.5px] ${
                  i < SUM_ROWS.length - 1 ? "border-b border-dashed border-primary/10" : ""
                }`}
              >
                <span className="text-muted-foreground">{row.k}</span>
                <span
                  className={`font-semibold text-foreground ${
                    row.mono ? "font-mono tabular-nums" : ""
                  }`}
                >
                  {row.v}
                </span>
              </div>
            ))}
            <div className="mt-1.5 flex items-baseline justify-between border-t border-primary/20 pt-3.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
                Total å betale
              </span>
              <span className="font-mono text-[26px] font-semibold tabular-nums text-foreground">
                1 600 kr
              </span>
            </div>
          </div>

          {/* Extras */}
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
            Ekstravalg
          </span>

          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-primary bg-primary/[0.06] px-3.5 py-3">
            <div className="text-[13px]">
              <b className="font-semibold text-foreground">Inviter spillpartner</b>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">
                De får e-post med booking-detaljer · split betaling tilgjengelig etter
                bekreftelse
              </span>
            </div>
            <Switch on />
          </div>

          <div className="mt-2.5 flex gap-1.5">
            <input
              type="email"
              defaultValue="henrik.nilsen@gfgk.no"
              placeholder="navn@e-post.no"
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              + Legg til
            </button>
          </div>

          <div className="mt-3.5 flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-3">
            <div className="text-[13px]">
              <b className="font-semibold text-foreground">Send beskjed til Anders</b>
              <span className="mt-0.5 block text-[12px] text-muted-foreground">
                Hva vil du jobbe med? Pitch-tempo, putting, kort spill …
              </span>
            </div>
            <Switch />
          </div>

          {/* Payment */}
          <div className="mt-5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              Betaling
            </span>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-3">
              <div className="grid h-6 w-9 place-items-center rounded-sm bg-[#1A1F71] font-display text-[9px] font-bold tracking-[0.05em] text-white">
                VISA
              </div>
              <div>
                <div className="font-mono text-[13px] font-semibold tabular-nums text-foreground">
                  •••• •••• •••• 4242
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Standard · utløper 04/28
                </div>
              </div>
              <button
                type="button"
                className="ml-auto border-b border-current text-[12px] font-semibold text-primary"
              >
                Endre
              </button>
            </div>
          </div>

          {/* Fine print */}
          <div className="mt-3 flex items-start gap-1.5 text-[11px] leading-[1.5] text-muted-foreground">
            <Info className="mt-px h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.5} />
            <span>
              Du belastes ved bekreftelse. Avbestilling &gt;48 t = full refusjon, 24–48 t
              = 50 %, &lt;24 t = ingen refusjon.{" "}
              <a
                href="#"
                className="border-b border-current font-medium text-primary"
              >
                Les vilkår
              </a>
            </span>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Tilbake
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Bekreft og betal 1 600 kr
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function StepDots({ active, total }: { active: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i < active ? "bg-primary/60" : i === active ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function Switch({ on = false }: { on?: boolean }) {
  return (
    <span
      className={`relative inline-block h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-border"
      }`}
      aria-hidden="true"
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </span>
  );
}
