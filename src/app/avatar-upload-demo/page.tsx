/**
 * PILOT — Modal · Avatar Upload (crop step)
 * Bygd direkte fra wireframe/design-files-v2/screens/30-modal-avatar-upload.html
 * URL: /avatar-upload-demo
 *
 * Én produksjonsskjerm: steg 2 av 3 — beskjær til sirkel med live preview.
 */

import { X, ArrowLeft } from "lucide-react";

export default function AvatarUploadDemo() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 py-12"
      style={{
        background: "linear-gradient(135deg, #EDEAE2 0%, #F5F2EA 100%)",
      }}
    >
      {/* Backdrop scrim */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(10,31,24,0.40)",
          backdropFilter: "blur(6px)",
        }}
      />

      {/* Modal */}
      <div className="relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[0_32px_80px_rgba(10,31,24,0.30)]">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h1 className="font-display text-[22px] font-medium leading-tight tracking-tight">
              Beskjær. <em className="text-[16px] font-normal italic text-muted-foreground">Til sirkel.</em>
            </h1>
            <p className="mt-1 max-w-[380px] text-[12px] leading-relaxed text-muted-foreground">
              Dra rammen, juster zoom og rotasjon. Forhåndsvisning til høyre viser hvordan avatar ser ut på fire
              steder.
            </p>
          </div>
          <button
            aria-label="Lukk"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground hover:bg-border"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </header>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-3.5">
          <span className="h-[3px] flex-1 rounded-full bg-primary" />
          <span className="h-[3px] flex-1 rounded-full bg-primary" />
          <span className="h-[3px] flex-1 rounded-full bg-secondary" />
        </div>

        {/* Body */}
        <div className="grid grid-cols-[1fr_180px] gap-5 px-6 py-5">
          {/* Crop stage */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-[#0A1F18]">
              <div
                className="absolute inset-0 flex items-center justify-center font-display italic text-[60px] tracking-tight"
                style={{
                  background: "radial-gradient(circle at 40% 35%, #5b7466 0%, #2b3f37 60%, #0e1d18 100%)",
                  color: "rgba(245,244,238,0.45)",
                }}
              >
                MP
              </div>
              {/* Mask + circle */}
              <div
                className="pointer-events-none absolute"
                style={{
                  inset: "14%",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.85)",
                  boxShadow: "0 0 0 9999px rgba(10,31,24,0.55)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 38% 32%, #5b7466 0%, #2b3f37 60%, #0e1d18 100%)",
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ border: "1px dashed rgba(212,210,126,0.5)" }}
                />
              </div>
              {/* Handles */}
              <div className="pointer-events-none absolute" style={{ inset: "14%" }}>
                <Handle position="tl" />
                <Handle position="tr" />
                <Handle position="bl" />
                <Handle position="br" />
              </div>
            </div>

            {/* Sliders */}
            <SliderRow label="Zoom" value="1,4×" fillPercent={42} />
            <SliderRow label="Rotasjon" value="+2°" fillPercent={52} />
          </div>

          {/* Preview side */}
          <aside className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Forhåndsvisning
            </span>
            <PreviewRow size={80} fontSize={28} label="96 PX · PROFIL" />
            <PreviewRow size={40} fontSize={14} label="40 PX · NAV" />
            <PreviewRow size={24} fontSize={9} label="24 PX · LISTE" />
            <PreviewRow size={32} fontSize={11} label="32 PX · KOMMENTAR" square />
          </aside>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/50 px-6 py-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
            Fil: portrett-final.jpg · 2,1 MB · 1920×2400 → 96 px
          </span>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
              <ArrowLeft className="h-3 w-3" strokeWidth={1.5} />
              Tilbake
            </button>
            <button className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground hover:opacity-90">
              Last opp og lagre →
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Handle({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const pos: Record<typeof position, string> = {
    tl: "top-[-5px] left-[-5px]",
    tr: "top-[-5px] right-[-5px]",
    bl: "bottom-[-5px] left-[-5px]",
    br: "bottom-[-5px] right-[-5px]",
  };
  return (
    <div
      className={`absolute h-2.5 w-2.5 rounded-sm border-[1.5px] border-primary bg-white ${pos[position]}`}
    />
  );
}

function SliderRow({
  label,
  value,
  fillPercent,
}: {
  label: string;
  value: string;
  fillPercent: number;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_48px] items-center gap-3 border-t border-border py-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">{label}</span>
      <div className="relative h-1.5 rounded-full border border-border bg-secondary/60">
        <div className="absolute -top-px bottom-[-1px] left-0 rounded-full bg-primary" style={{ width: `${fillPercent}%` }} />
        <div
          className="absolute top-[-6px] h-3.5 w-3.5 -translate-x-1/2 rounded-full border-[2px] border-primary bg-white"
          style={{ left: `${fillPercent}%` }}
        />
      </div>
      <span className="text-right font-mono text-[12px] font-medium text-foreground">{value}</span>
    </div>
  );
}

function PreviewRow({
  size,
  fontSize,
  label,
  square,
}: {
  size: number;
  fontSize: number;
  label: string;
  square?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-2 last:border-b-0">
      <div
        className={`flex flex-shrink-0 items-center justify-center border border-border font-display italic ${square ? "rounded-sm" : "rounded-full"}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${fontSize}px`,
          background: "radial-gradient(circle at 38% 32%, #5b7466 0%, #2b3f37 60%, #0e1d18 100%)",
          color: "rgba(245,244,238,0.45)",
        }}
      >
        MP
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">{label}</span>
    </div>
  );
}
