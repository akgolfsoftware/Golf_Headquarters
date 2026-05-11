/**
 * DEMO — Video upload · trim
 * Bygd fra wireframe live-states/e7-video-upload-trim.html
 * URL: /video-upload-trim-demo
 */

import { ArrowRight, Scissors, Video, X } from "lucide-react";

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

const THUMB_GRADIENTS = [
  "linear-gradient(135deg, #2A4A3A, #1A2F25)",
  "linear-gradient(135deg, #2E5040, #1E3328)",
  "linear-gradient(135deg, #355A48, #21382B)",
  "linear-gradient(135deg, #2A4A3A, #1A2F25)",
  "linear-gradient(135deg, #3D6A55, #2A4435)",
  "linear-gradient(135deg, #2A4A3A, #1A2F25)",
  "linear-gradient(135deg, #2E5040, #1E3328)",
  "linear-gradient(135deg, #2A4A3A, #1A2F25)",
];

export default function VideoUploadTrimDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3.5 border-b border-border px-6 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-accent text-primary">
            <Scissors size={18} strokeWidth={1.5} />
          </span>
          <div className="flex-1">
            <h1 className="font-display text-[24px] font-semibold leading-tight tracking-tight">
              <em className="italic">Trim</em> swing-video
            </h1>
            <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Trim til det Anders skal se
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
          {/* Preview card */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Video stage */}
            <div
              className="relative aspect-video"
              style={{
                background: "linear-gradient(140deg, #1B3225 0%, #0E1F18 100%)",
              }}
            >
              <Video
                size={48}
                strokeWidth={1.5}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30"
              />
              <span className="absolute right-3 top-3 rounded-sm bg-black/60 px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-white tabular-nums">
                00:04 / 00:11 · frame 96
              </span>
            </div>

            {/* Trim bar */}
            <div className="border-t border-border bg-secondary/60 px-4 py-3.5">
              <div className="relative h-14 overflow-hidden rounded-md bg-[#0A1F18]">
                {/* Thumbnails */}
                <div className="flex h-full">
                  {THUMB_GRADIENTS.map((g, i) => (
                    <span
                      key={i}
                      className="flex-1 border-r border-white/5"
                      style={{ background: g }}
                    />
                  ))}
                </div>
                {/* Masks */}
                <span
                  className="pointer-events-none absolute inset-y-0 left-0 bg-[#0A1F18]/80"
                  style={{ width: "18%" }}
                />
                <span
                  className="pointer-events-none absolute inset-y-0 right-0 bg-[#0A1F18]/80"
                  style={{ width: "24%" }}
                />
                {/* Trim region */}
                <div
                  className="absolute inset-y-0 rounded-md border-2 border-accent shadow-[0_0_0_3px_rgba(209,248,67,0.20)]"
                  style={{ left: "18%", right: "24%" }}
                >
                  {/* Left handle */}
                  <span className="absolute -left-1.5 -top-1 -bottom-1 grid w-3 cursor-ew-resize place-items-center rounded-sm bg-accent">
                    <span className="block h-3.5 w-0.5 rounded-sm bg-[#0A1F18]/60" />
                  </span>
                  {/* Right handle */}
                  <span className="absolute -right-1.5 -top-1 -bottom-1 grid w-3 cursor-ew-resize place-items-center rounded-sm bg-accent">
                    <span className="block h-3.5 w-0.5 rounded-sm bg-[#0A1F18]/60" />
                  </span>
                </div>
                {/* Playhead */}
                <span
                  className="absolute -top-1 -bottom-1 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                  style={{ left: "36%" }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                <span className="tabular-nums">Fra 00:02</span>
                <strong className="rounded-md bg-accent/30 px-2 py-1 font-semibold text-foreground">
                  Trim · 6 sek
                </strong>
                <span className="tabular-nums">Til 00:08</span>
              </div>
            </div>
          </div>

          {/* Kølle */}
          <div>
            <div className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Kølle · 7-iron valgt
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {CLUBS.map((club) => (
                <button
                  key={club}
                  className={`rounded-md border px-2 py-2.5 font-mono text-[11px] font-semibold transition-colors ${
                    club === "7i"
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
              {ANGLES.map((a) => (
                <button
                  key={a}
                  className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                    a === "Down-the-line"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {a}
                </button>
              ))}
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
