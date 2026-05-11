/**
 * DEMO — Video upload · error (filen er for stor)
 * Bygd fra wireframe live-states/e7-video-upload-error.html
 * URL: /video-upload-error-demo
 */

import { AlertCircle, ArrowRight, FileText, X } from "lucide-react";

const TIPS = [
  "Trim til 8-15 sek av selve svingen — det Anders trenger",
  "Eksporter i 1080p i stedet for 4K (gjør filen 60 % mindre)",
  "Bruk Photos-appen sin “Eksporter mindre kopi” hvis du er på iPhone",
];

export default function VideoUploadErrorDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <h1 className="font-display text-[24px] font-semibold leading-tight tracking-tight text-destructive">
              Filen er <em className="italic">for stor</em>
            </h1>
            <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Maks 500 MB · 60 sek
            </div>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="space-y-5 px-6 py-6">
          {/* Error drop */}
          <div className="flex flex-col items-center gap-3.5 rounded-xl border-2 border-dashed border-destructive/40 bg-destructive/10 px-6 py-8 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-xl bg-destructive/15 text-destructive">
              <AlertCircle size={28} strokeWidth={1.5} />
            </span>
            <div>
              <div className="font-display text-[17px] font-semibold text-destructive">
                Klarte ikke å laste opp denne videoen
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Filen overskrider 500 MB-grensen. Trim den ned, eller komprimer før opplasting.
              </div>
            </div>
          </div>

          {/* File info */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-secondary/60 text-muted-foreground">
              <FileText size={16} strokeWidth={1.5} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="truncate text-[13px] font-semibold">range-session-full.mov</div>
              <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-destructive">
                <strong>722 MB</strong> · 2 min 14 sek · over grense
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-sm bg-border">
                <div className="h-full rounded-sm bg-destructive" style={{ width: "100%" }} />
              </div>
              <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                144 % av tillatt · 222 MB over
              </div>
            </div>
          </div>

          {/* Tip card */}
          <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3.5">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Slik får du videoen til å passe
            </div>
            <ul className="mt-2 space-y-1.5 text-[13px] text-muted-foreground">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="font-mono text-primary">→</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Avbryt
          </button>
          <button className="rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            Velg en annen video
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Trim og prøv på nytt
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}
