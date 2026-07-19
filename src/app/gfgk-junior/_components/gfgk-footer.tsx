import Image from "next/image";
import Link from "next/link";

import { KONTAKT } from "../_data/gfgk-junior-data";

export function GfgkFooter() {
  return (
    <footer style={{ background: "var(--ink)", color: "rgba(255,255,255,0.75)" }}>
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-7 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/gfgk-junior/logo-mark.png"
              alt="GFGK"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <span className="text-[17px] font-bold uppercase tracking-[0.02em] text-white">
              GFGK Junior & Elite
            </span>
          </div>
          <p className="mt-3.5 max-w-xs text-[14.5px] leading-relaxed">
            Informasjons- og fellesskapsplattform for Junior og Elite-spillere, foreldre og
            trenere.
          </p>
          <div className="mt-4 flex gap-2.5">
            <a
              href={KONTAKT.facebook}
              className="rounded-full px-3.5 py-2 text-[13px] font-bold no-underline"
              style={{ background: "rgba(255,255,255,0.1)", color: "var(--gfgk-white)" }}
            >
              Facebook
            </a>
          </div>
        </div>
        <div>
          <div
            className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--gfgk-gold)" }}
          >
            Navigasjon
          </div>
          <div className="flex flex-col gap-2 text-[14.5px]">
            <Link href="/gfgk-junior" className="no-underline" style={{ color: "rgba(255,255,255,0.75)" }}>Hjem</Link>
            <Link href="/gfgk-junior#gruppene" className="no-underline" style={{ color: "rgba(255,255,255,0.75)" }}>Gruppene</Link>
            <Link href="/gfgk-junior#slik-starter-du" className="no-underline" style={{ color: "rgba(255,255,255,0.75)" }}>Starte med golf</Link>
            <Link href="/gfgk-junior/treningsplaner" className="no-underline" style={{ color: "rgba(255,255,255,0.75)" }}>Treningsplaner</Link>
            <Link href="/gfgk-junior/veileder" className="no-underline" style={{ color: "rgba(255,255,255,0.75)" }}>Kunnskapsbase</Link>
            <Link href="/gfgk-junior/kalender" className="no-underline" style={{ color: "rgba(255,255,255,0.75)" }}>Full treningskalender</Link>
          </div>
        </div>
        <div>
          <div
            className="mb-3.5 text-[13px] font-bold uppercase tracking-[0.12em]"
            style={{ color: "var(--gfgk-gold)" }}
          >
            Kontakt
          </div>
          <div className="flex flex-col gap-2 text-[14.5px]">
            <span>{KONTAKT.adresse}</span>
            <a
              href={`mailto:${KONTAKT.epost}`}
              className="no-underline"
              style={{ color: "var(--teal-300)" }}
            >
              {KONTAKT.epost}
            </a>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <div
          className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-3 px-5 py-4 text-[13px] sm:px-7"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          <span>© 2026 GFGK Junior & Elite</span>
          <span>Torsnesveien 16, 1630 Gamle Fredrikstad</span>
        </div>
      </div>
    </footer>
  );
}
