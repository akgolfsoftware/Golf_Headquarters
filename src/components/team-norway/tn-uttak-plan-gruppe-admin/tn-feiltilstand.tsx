"use client";

import { TriangleAlert } from "lucide-react";

import { TN } from "@/lib/v2/team-norway";

const klokke = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });

/**
 * Feiltilstanden fra «Team Norway App.dc.html» (stErr): hva som ikke kunne
 * hentes, at ingenting er slettet, og «Prøv igjen».
 * Avvik: tegningen viser feilkode 504. Appen kjenner ikke årsaken på klienten,
 * så feilkoden vises bare når Next.js har gitt en referanse (digest).
 */
export function TnFeiltilstand({ hva, reset, digest }: { hva: string; reset: () => void; digest?: string }) {
  return (
    <main style={{ minHeight: "100dvh", background: TN.surfacePage, padding: "clamp(20px, 3.2vw, 44px) clamp(16px, 3.4vw, 48px)" }}>
      <section role="alert" style={{ background: TN.white, border: `1px solid ${TN.navy100}`, borderRadius: TN.radius.lg, padding: "clamp(16px, 2vw, 24px)", maxWidth: 680, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span aria-hidden="true" style={{ width: 44, height: 44, flex: "none", border: `1px solid ${TN.status.redText}`, borderRadius: TN.radius.sm, color: TN.status.redText, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TriangleAlert size={20} strokeWidth={1.75} />
          </span>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontFamily: TN.font.display, fontWeight: 400, fontSize: 17, letterSpacing: "0.08em", textTransform: "uppercase", color: TN.navy900, lineHeight: 1.3, margin: 0 }}>Kunne ikke hente {hva}</h1>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: "6px 0 0" }}>AK Golf HQ svarte ikke som forventet. Ingenting er slettet. Sjekk nettforbindelsen og prøv igjen.</p>
            <div style={{ fontFamily: TN.font.mono, fontSize: 11, color: TN.textSecondary, marginTop: 8, overflowWrap: "anywhere" }}>
              {digest ? `FEILKODE ${digest} · ` : ""}{klokke.format(new Date())}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 18px", alignItems: "center", marginTop: 18 }}>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: "0 18px", background: TN.navy900, color: TN.white, border: 0, borderRadius: TN.radius.sm, fontFamily: TN.font.display, fontSize: 12.5, letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}>Prøv igjen</button>
          <a href="mailto:support@akgolf.no" style={{ display: "inline-flex", alignItems: "center", minHeight: 44, fontSize: 14, color: TN.navy900 }}>Kontakt support</a>
        </div>
      </section>
    </main>
  );
}
