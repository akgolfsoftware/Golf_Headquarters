/**
 * DEMO — Video upload success-state
 * Bygd fra wireframe live-states/e7-video-upload-success.html
 * URL: /video-upload-success-demo
 */

import { ArrowRight, CheckCircle2, Clock, Play, X } from "lucide-react";

export default function VideoUploadSuccessDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Svar innen 24 timer
            </div>
            <h1 className="mt-1.5 font-display text-[28px] font-semibold leading-tight tracking-tight">
              Sendt til <em className="italic">Anders</em>
            </h1>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-col items-center px-10 pt-10 pb-4 text-center">
          {/* Stor checkmark */}
          <div className="mb-6 grid h-22 w-22 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-[0_0_0_8px_rgba(209,248,67,0.30),0_12px_30px_rgba(46,87,16,0.20)]" style={{ width: 88, height: 88 }}>
            <CheckCircle2 size={40} strokeWidth={1.5} />
          </div>

          <div className="font-display text-[28px] italic leading-tight">
            Videoen ligger på pulten hans.
          </div>
          <p className="mt-2.5 max-w-[380px] text-sm leading-relaxed text-muted-foreground">
            Anders får varsel nå og pleier å gi tilbakemelding i løpet av samme
            dag.
          </p>

          {/* Klubb-pill + thumbnail */}
          <div className="mt-6 flex max-w-[360px] items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5">
            {/* Thumbnail */}
            <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-primary to-foreground">
              <span className="absolute inset-0 grid place-items-center">
                <Play size={12} strokeWidth={1.5} className="fill-card text-card translate-x-px" />
              </span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-[13px] font-semibold">
                swing-driver-rangen.mov
              </div>
              <div className="mt-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
                Driver · face-on · 8 sek · GFGK
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
              GFGK
            </span>
          </div>

          {/* Forventet svartid */}
          <div className="mt-7 flex max-w-[420px] items-start gap-3 rounded-xl border border-accent/45 bg-accent/15 px-4 py-3.5 text-left">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <Clock size={16} strokeWidth={1.5} />
            </span>
            <div>
              <div className="text-sm font-semibold text-primary">
                Estimert svartid: 4–8 timer
              </div>
              <div className="mt-1 text-xs leading-snug text-muted-foreground">
                Du får varsel i appen og e-post når Anders har sett gjennom.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Last opp en til
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Ferdig
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </footer>
      </div>
    </div>
  );
}
