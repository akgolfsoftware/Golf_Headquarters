import type { TnSpillerRad } from "@/lib/domain/tn-arbeidsflate";
import type { OppfolgingTall } from "@/lib/oppfolging/data";
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
 *   - «Fireukerssjekk ikke levert» (frist passert uten innlevering) og «Forslag venter
 *     svar» kommer fra tabellene `fireukerssjekker` og `trener_forslag` (Pakke 1).
 *   - Klasse (Herrer, Damer, U18) står ikke under navnet: profilen har ikke kjønn.
 */
type Grunn = { key: string; spiller: TnSpillerRad; tekst: string; detalj?: string; lenke: string; lenketekst: string };

export function TrengerDeg({ spillere, ukeTid, oppfolging }: { spillere: TnSpillerRad[]; ukeTid: Map<string, UkeTid[]>; oppfolging: OppfolgingTall }) {
  const grunner: Grunn[] = [];
  for (const s of spillere) {
    const uker = ukeTid.get(s.id) ?? [];
    if (underTerskelToUker(uker)) {
      const [a, b] = uker.slice(-2);
      grunner.push({
        key: `tid-${s.id}`,
        spiller: s,
        tekst: `Under ${TERSKEL_PROSENT} % av planlagt tid to uker på rad`,
        detalj: `UKE ${a.ukenr} ${a.prosent} % · UKE ${b.ukenr} ${b.prosent} %`,
        lenke: `${tnSpillerHref(s.id)}?fane=plan`,
        lenketekst: "Åpne profil",
      });
    }
    if (oppfolging.sjekkIkkeLevert.includes(s.id)) {
      grunner.push({ key: `sjekk-${s.id}`, spiller: s, tekst: "Fireukerssjekk ikke levert", detalj: "FRISTEN ER PASSERT", lenke: `${tnSpillerHref(s.id)}?fane=sam`, lenketekst: "Åpne profil" });
    }
    if (oppfolging.forslagVenter.includes(s.id)) {
      grunner.push({ key: `forslag-${s.id}`, spiller: s, tekst: "Forslag venter svar", detalj: "SENDT, IKKE BESVART", lenke: `${tnSpillerHref(s.id)}?fane=sam`, lenketekst: "Åpne profil" });
    }
  }
  const antallSpillere = new Set(grunner.map((g) => g.spiller.id)).size;

  return (
    <TnFlate>
      <TnFlatehode tittel="Spillere som trenger deg" merknad={`${antallSpillere} ${antallSpillere === 1 ? "SPILLER" : "SPILLERE"} · ${grunner.length} ${grunner.length === 1 ? "SAK" : "SAKER"}`} />
      {grunner.map(({ key, spiller, tekst, detalj, lenke, lenketekst }) => (
        <div key={key} style={{ display: "flex", flexWrap: "wrap", gap: "12px 20px", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${TN.navy100}` }}>
          <div style={{ flex: "1 1 220px", minWidth: 0, display: "flex", gap: 14, alignItems: "center" }}>
            <Initialplate navn={spiller.navn} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, overflowWrap: "anywhere" }}>{spiller.navn}</div>
              <div style={{ fontSize: 13, color: TN.textSecondary, marginTop: 2, overflowWrap: "anywhere" }}>{spiller.klubb ?? "Klubb ikke registrert"}</div>
            </div>
          </div>
          <div style={{ flex: "2 1 300px", minWidth: 0, display: "flex", flexWrap: "wrap", gap: "2px 12px", alignItems: "baseline" }}>
            <span style={{ fontSize: 14 }}>{tekst}</span>
            {detalj ? <span style={{ ...mono(11, TN.navy900), letterSpacing: "0.04em" }}>{detalj}</span> : null}
          </div>
          <Sekundarlenke href={lenke}>{lenketekst}</Sekundarlenke>
        </div>
      ))}
      {grunner.length === 0 ? <TnMangler>Ingen trenger oppfølging akkurat nå.</TnMangler> : null}
    </TnFlate>
  );
}
