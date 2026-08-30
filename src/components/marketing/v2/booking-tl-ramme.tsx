"use client";

/* AK Golf HQ — delt LYS ramme for bookingens undersider (Train-lock, 29.08.2026).
   Brukes av MarkedBookingTjenesteV2 / -BekreftV2 / -KvitteringV2 i stedet for
   den mørke MRamme (marked-ramme.tsx, som andre markedssider fortsatt eier).
   Topplinja er samme stil som MarkedBookingV2 sin (`.bkp .topp` i
   booking-paper.css — nå TL-broet): logo + tilbakelenke til /booking, ingen
   egen footer. Alle farger/fonter leses fra TL / --tl-* — aldri T / --p-*. */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Caps } from "@/components/v2";
/** Fluid breakpoint (samme terskel som marked-ramme, default desktop). */
export function useMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return mobile;
}

/** Full sideramme: lys scene, topplinje med tilbakelenke, ingen footer. */
export function BookingRamme({ children, waveId }: { children: ReactNode; waveId: string }) {
  return (
    <div
      className="bkp"
      data-paper-wave-i={waveId}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <header className="topp">
        <div className="wrap toppin">
          <Link className="logo" href="/">
            AK&nbsp;Golf<span>.</span>
          </Link>
          <nav aria-label="Meny">
            <Link className="btn sm" href="/booking">
              Til booking
            </Link>
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

/* ── Tekst-primitiver (TL-utgaver av marked-rammas skala) ── */
export function Seksjon({ mobile, children, style }: { mobile: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ padding: mobile ? "40px 22px" : "64px 64px", ...style }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Caps size={11} style={{ marginBottom: 14 }}>
      {children}
    </Caps>
  );
}

export function HeroT({ mobile, children }: { mobile: boolean; children: ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: TL.font.sans,
        fontWeight: 700,
        fontSize: mobile ? 34 : 48,
        letterSpacing: "-0.02em",
        color: TL.text,
        margin: 0,
        lineHeight: 1.05,
      }}
    >
      {children}
    </h1>
  );
}

export function Lede({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p style={{ fontFamily: TL.font.sans, fontSize: 16, color: TL.mute, lineHeight: 1.65, margin: 0, maxWidth: 560, ...style }}>
      {children}
    </p>
  );
}

/** Lenke-knapp: primær = ink (én per skjerm), ghost = hairline. */
export function BookingCta({ href, ghost, children }: { href: string; ghost?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="v2-press v2-focus"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 48,
        padding: "0 26px",
        fontFamily: TL.font.sans,
        fontSize: 15,
        fontWeight: 700,
        color: ghost ? TL.text : TL.onFill,
        background: ghost ? "transparent" : TL.fill,
        border: `1px solid ${ghost ? TL.hair : "transparent"}`,
        borderRadius: TL.radius.pill,
        textDecoration: "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Link>
  );
}
