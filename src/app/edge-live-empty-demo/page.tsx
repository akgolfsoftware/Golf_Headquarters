/**
 * PILOT — Live Empty State
 * Bygd direkte fra wireframe/design-files-v2/screens/04-edge-live-empty.html
 * URL: /edge-live-empty-demo
 *
 * Edge-case: ingen aktiv økt. Fullskjerm dark.
 */

import { X, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EdgeLiveEmptyDemo() {
  return (
    <div className="relative grid h-screen w-screen grid-rows-[56px_1fr] overflow-hidden bg-[#0A1F18] text-white">
      {/* Soft radial */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 60%)",
        }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center border-b border-white/[0.06] px-6">
        <div className="flex flex-1 items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-white/65">
            <span className="h-2 w-2 rounded-full bg-white/35" />
            Avsluttet
          </span>
          <span className="font-mono text-[12px] font-medium tabular-nums text-white/55">
            14:42
          </span>
        </div>
        <button
          aria-label="Lukk"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </header>

      {/* Center */}
      <div className="relative z-[1] flex flex-col items-center justify-center px-8 text-center">
        <div className="inline-flex h-40 w-40 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40">
          <Briefcase className="h-16 w-16" strokeWidth={1.5} />
        </div>

        <h1 className="mt-10 font-display text-[36px] italic font-medium leading-[1.2] tracking-[-0.02em] text-white">
          Ingen aktiv økt her.
        </h1>
        <p className="mt-4 max-w-[480px] text-[16px] leading-[1.5] text-white/70">
          Økten er enten ferdig eller ikke startet enda. Velg en vei tilbake.
        </p>

        <div className="mt-8 grid w-[600px] grid-cols-3 gap-3">
          <Suggest href="#hjem" label="Tilbake til hjem" />
          <Suggest href="#plan" label="Se planen" />
          <Suggest href="#ny" label="Logg ny økt" />
        </div>
      </div>
    </div>
  );
}

function Suggest({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-3.5 text-[14px] font-medium text-white/90 no-underline transition-colors hover:border-white/25 hover:bg-white/[0.09]"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5 text-white/50" strokeWidth={1.75} />
    </Link>
  );
}
