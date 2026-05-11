/**
 * DEMO — Video upload (med video lastet inn)
 * Bygd fra wireframe live-states/e7-video-upload-med-video.html
 * URL: /video-upload-demo
 */

import { ArrowRight, FileText, Play, Video, X } from "lucide-react";

const CLUBS = [
  "Driver",
  "3w",
  "5w",
  "4i",
  "5i",
  "6i",
  "7i",
  "8i",
  "9i",
  "PW",
  "GW",
  "SW",
  "LW",
  "Putter",
];

const ANGLES = ["Face-on", "Down-the-line", "Topp", "Annet"];

export default function VideoUploadDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3.5 border-b border-border px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-primary">
            <Video size={18} strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <h1 className="font-display text-[24px] font-semibold leading-tight tracking-tight">
              Last opp <em className="italic">swing-video</em>
            </h1>
            <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Video lastet inn · klar for send
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
        <div className="space-y-6 px-6 py-6">
          {/* Preview card */}
          <div className="overflow-hidden rounded-xl border border-border">
            <div
              className="relative flex aspect-video items-center justify-center"
              style={{
                background:
                  "linear-gradient(140deg, hsl(var(--primary) / 0.6) 0%, hsl(var(--foreground)) 100%)",
              }}
            >
              <button
                className="grid h-16 w-16 place-items-center rounded-full bg-background/95 text-foreground shadow-lg"
                aria-label="Spill av"
              >
                <Play size={22} strokeWidth={1.5} fill="currentColor" />
              </button>
              <span className="absolute right-3 top-3 rounded-sm bg-black/60 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
                00:11 · Face-on
              </span>
            </div>
            <div className="flex items-center gap-3 border-t border-border bg-secondary/60 px-4 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground">
                <FileText size={16} strokeWidth={1.5} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate text-[13px] font-semibold">swing-driver-rangen.mov</div>
                <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  82 MB · 1080p · 11 sek
                </div>
              </div>
              <button className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
                Erstatt
              </button>
            </div>
          </div>

          {/* Klubb */}
          <div>
            <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Kølle (påkrevd) · Driver valgt
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {CLUBS.map((club, i) => (
                <button
                  key={club}
                  className={`rounded-md border px-2 py-2.5 font-mono text-[11px] font-semibold transition-colors ${
                    i === 0
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {club}
                </button>
              ))}
            </div>
          </div>

          {/* Vinkel */}
          <div>
            <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Vinkel
            </div>
            <div className="flex flex-wrap gap-2">
              {ANGLES.map((a, i) => (
                <button
                  key={a}
                  className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    i === 0
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Notater */}
          <div>
            <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Notater til Anders
            </div>
            <textarea
              rows={3}
              defaultValue="Føles som jeg napper med bakhånda i nedsving og slår over ballen. Ballposisjon føles riktig, men kanskje ikke?"
              className="w-full resize-y rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span>Valgfri</span>
              <span className="tabular-nums">142 / 280</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Avbryt
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Last opp og send til Anders
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}
