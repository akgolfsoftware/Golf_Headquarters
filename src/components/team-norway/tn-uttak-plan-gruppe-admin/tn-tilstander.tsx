import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { TN } from "@/lib/v2/team-norway";

/**
 * Tilstandene fra «Team Norway App.dc.html» (stLoad, stEmpty) for skjermene
 * Uttak, Plan og fag, Gruppe og Admin. Feiltilstanden ligger i
 * tn-feiltilstand.tsx fordi den trenger klienten for «Prøv igjen».
 */

const flate = {
  background: TN.white,
  border: `1px solid ${TN.navy100}`,
  borderRadius: TN.radius.lg,
  padding: "clamp(16px, 2vw, 24px)",
  minWidth: 0,
} as const;

const SKJELETT: [string, string][] = [["42%", "28%"], ["55%", "20%"], ["36%", "30%"], ["48%", "24%"], ["40%", "32%"], ["52%", "18%"]];

/** Skjelettet fra tegningen: «Henter … », en tittelstrek og seks rader. */
export function TnLasterFlate({ hva }: { hva: string }) {
  return (
    <section aria-busy="true" aria-label={`Henter ${hva}`} style={flate}>
      <div style={{ fontFamily: TN.font.mono, fontSize: 12, color: TN.textSecondary }}>Henter {hva} …</div>
      <div style={{ height: 14, width: "38%", background: TN.navy100, borderRadius: TN.radius.sm, marginTop: 18 }} />
      {SKJELETT.map(([a, b], i) => (
        <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
          <span style={{ width: 44, height: 44, flex: "none", background: TN.navy50, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.sm }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 12, width: a, background: TN.navy100, borderRadius: TN.radius.sm }} />
            <div style={{ height: 10, width: b, background: TN.navy50, borderRadius: TN.radius.sm, marginTop: 8 }} />
          </div>
          <div style={{ height: 12, width: 56, flex: "none", background: TN.navy100, borderRadius: TN.radius.sm }} />
        </div>
      ))}
    </section>
  );
}

/**
 * Laster-side for en rute. Skallet kan ikke tegnes før brukeren er kjent,
 * så skjelettet står alene på sidebunnen.
 */
export function TnLasterSide({ hva }: { hva: string }) {
  return (
    <main style={{ minHeight: "100dvh", background: TN.surfacePage, padding: "clamp(20px, 3.2vw, 44px) clamp(16px, 3.4vw, 48px)" }}>
      <div style={{ maxWidth: 1320 }}>
        <TnLasterFlate hva={hva} />
      </div>
    </main>
  );
}

/** Tom tilstand: ikon, tittel, forklaring og én vei videre. */
export function TnTomFlate({ ikon: Ikon, tittel, tekst, lenke }: { ikon: LucideIcon; tittel: string; tekst: string; lenke?: { href: string; tekst: string } }) {
  return (
    <section style={{ ...flate, maxWidth: 680 }}>
      <span aria-hidden="true" style={{ width: 44, height: 44, border: `1px solid ${TN.navy200}`, borderRadius: TN.radius.sm, color: TN.navy900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ikon size={20} strokeWidth={1.75} />
      </span>
      <h2 style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 17, letterSpacing: "0.08em", textTransform: "uppercase", color: TN.navy900, margin: "16px 0 0" }}>{tittel}</h2>
      <p style={{ fontSize: 14.5, lineHeight: 1.6, color: TN.textSecondary, margin: "6px 0 0", maxWidth: "60ch" }}>{tekst}</p>
      {lenke ? (
        <Link href={lenke.href} style={{ minHeight: 44, padding: "0 14px", border: `1px solid ${TN.navy900}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.navy900, fontFamily: TN.font.display, fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", marginTop: 18 }}>
          {lenke.tekst} <ArrowRight size={14} aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}
