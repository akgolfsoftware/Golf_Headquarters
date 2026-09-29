import type { TnSpillerRad } from "@/lib/domain/tn-arbeidsflate";
import { TN } from "@/lib/v2/team-norway";
import { tnSpillerHref } from "../tn-ruter";
import { TnFlate, TnFlatehode, TnMangler } from "../tn-flate";
import type { UkeTid } from "./etterlevelse";
import { TERSKEL_PROSENT, underTerskelToUker } from "./etterlevelse";
import { Initialplate, Sekundarlenke, mono } from "./ui";

/**
 * TN-01 «Spillere som trenger deg». Fasit: «Team Norway App.dc.html», ndRows.
 *
 * Avvik:
 *   - Bare én grunn har data i dag: under 70 % av planlagt tid to uker på rad
 *     (WorkbenchSession, samme regel som etterlevelse, beslutning 26.09.2026).
 *   - «Fireukerssjekk ikke levert» og «Forslag venter svar» står ikke: det finnes
 *     ingen modell for fireukerssjekk eller for trenerforslag til spilleren.
 *   - Klasse (Herrer, Damer, U18) står ikke under navnet: profilen har ikke kjønn.
 */
export function TrengerDeg({ spillere, ukeTid }: { spillere: TnSpillerRad[]; ukeTid: Map<string, UkeTid[]> }) {
  const rader = spillere
    .map((s) => ({ spiller: s, uker: ukeTid.get(s.id) ?? [] }))
    .filter((r) => underTerskelToUker(r.uker));

  return (
    <TnFlate>
      <TnFlatehode tittel="Spillere som trenger deg" merknad={`${rader.length} ${rader.length === 1 ? "SPILLER" : "SPILLERE"} · ${rader.length} ${rader.length === 1 ? "SAK" : "SAKER"}`} />
      {rader.map(({ spiller, uker }) => {
        const [a, b] = uker.slice(-2);
        return (
          <div key={spiller.id} style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
            <div style={{ flex: "1 1 220px", minWidth: 0, display: "flex", gap: 14, alignItems: "center" }}>
              <Initialplate navn={spiller.navn} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{spiller.navn}</div>
                <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{spiller.klubb ?? "Klubb ikke registrert"}</div>
              </div>
            </div>
            <div style={{ flex: "2 1 300px", minWidth: 0, display: "flex", flexWrap: "wrap", gap: "2px 12px", alignItems: "baseline" }}>
              <span style={{ fontSize: 14 }}>Under {TERSKEL_PROSENT} % av planlagt tid to uker på rad</span>
              <span style={{ ...mono(11, TN.navy900), letterSpacing: "0.04em" }}>UKE {a.ukenr} {a.prosent} % · UKE {b.ukenr} {b.prosent} %</span>
            </div>
            <Sekundarlenke href={`${tnSpillerHref(spiller.id)}?fane=plan`}>Åpne profil</Sekundarlenke>
          </div>
        );
      })}
      {rader.length === 0 ? <TnMangler>Ingen trenger oppfølging akkurat nå.</TnMangler> : null}
    </TnFlate>
  );
}
