/**
 * DEMO — Video upload · progress
 * Bygd fra wireframe live-states/e7-video-upload-progress.html
 * URL: /video-upload-progress-demo
 */

import { Check, Circle, Loader2 } from "lucide-react";

const PCT = 67;
const RADIUS = 54;
const CIRC = 2 * Math.PI * RADIUS;
const OFFSET = CIRC * (1 - PCT / 100);

export default function VideoUploadProgressDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 py-5">
          <h1 className="font-display text-[24px] font-semibold leading-tight tracking-tight">
            Laster opp <em className="italic">...</em>
          </h1>
          <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Driver · face-on · 11 sek · 82 MB
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-col items-center gap-6 px-7 py-14">
          {/* Progress ring */}
          <div className="relative h-[140px] w-[140px]">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={OFFSET}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[34px] font-semibold tabular-nums">{PCT}%</span>
              <span className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                3,2 MB/s
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="font-display text-[22px] italic leading-tight text-foreground">
              Snart oppe
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Estimert tid igjen: ca 9 sekunder.
            </p>
          </div>

          {/* Bytes row */}
          <div className="flex items-center gap-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="tabular-nums">54,9 MB / 82 MB</span>
            <span>·</span>
            <span>Stabil tilkobling</span>
          </div>

          {/* Bottom progress bar */}
          <div className="w-full max-w-sm">
            <div className="h-2 overflow-hidden rounded-sm bg-border">
              <div
                className="h-full animate-pulse rounded-sm bg-accent"
                style={{ width: `${PCT}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="mt-2 flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-[#16A34A]">
              <Check size={14} strokeWidth={2.5} />
              Komprimerer video · ok
            </div>
            <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-primary">
              <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
              Laster opp til server · 67 %
            </div>
            <div className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              <Circle size={14} strokeWidth={1.5} />
              Sender varsel til Anders
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Avbryt opplasting
          </button>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Ikke lukk vinduet
          </span>
        </footer>
      </div>
    </div>
  );
}
