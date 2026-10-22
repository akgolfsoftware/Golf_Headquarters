import type { TnArbeidskontekst } from "@/lib/domain/tn-arbeidsflate";
import type { TnWagrPlass } from "@/lib/domain/tn-iup-oversikt";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, tnRolleNavn } from "../tn-shell";
import { TnFlate, TnFotnote, TnListerad, TnRutenett } from "../tn-flate";
import { TnSkraKort, TnSkraTopp } from "../tn-skra-topp";
import { datoLang } from "./felles";
import { TnIupStripe } from "./tn-spillerprofil-visning";

/**
 * IUP for en spiller i gruppa som ikke har delt med treneren (wireframes «Spiller uten deling»,
 * beslutninger.md §SPILLERLISTEN I TEAM NORWAY VISER DE ÅPNE TALLENE, punkt 2). Bare navn og offentlig
 * WAGR-plass, klubb og fødselsår (beslutningen 22.10); ingen tester, trening, plan eller poster.
 * Ingen knapp sender noe til spilleren.
 *
 * Avvik:
 *   - Fanene er ikke med: de andre IUP-fanene gir fortsatt 404 uten deling til pakke e gir dem samme lås.
 *   - «Kopier forklaringen» er ikke med; teksten kan merkes og kopieres.
 */
/** Overskriftene står inne i kortene, så ingen tekst ligger over den skrå kanten. */
const OVERSKRIFT = { margin: 0, fontFamily: TN.font.display, fontSize: 20, lineHeight: 1.25, color: TN.navy900 } as const;

export function TnIupLaastVisning({ brukerNavn, kontekst, navn, klubb, fodselsaar, wagr, aar }: { brukerNavn: string | null; kontekst: TnArbeidskontekst; navn: string; klubb: string | null; fodselsaar: number | null; wagr: TnWagrPlass | null; aar: number }) {
  const fornavn = navn.split(" ")[0] || navn;
  return (
    <TnShell aktiv="spillere" brukerNavn={brukerNavn ?? "Ukjent"} rolle={tnRolleNavn(kontekst.rolle)} groupId={kontekst.gruppe.id} visTrenerflater kanAdministrere={kontekst.kanAdministrere} tilbake={{ href: "/team-norway/spillere", label: "Spillere" }}>
      <TnSkraTopp bilde="tee-hand" etikett={`IUP for ${navn}`} overlinje="IUP · Spillere" tittel={navn} ingress={[klubb, fodselsaar ? `født ${fodselsaar}` : null].filter(Boolean).join(" · ") || undefined} hoyre={<TnIupStripe wagr={wagr} bruttoSnitt={null} aar={aar} />} />
      <TnSkraKort>
        <TnRutenett min={320}>
          <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <TnFlate style={{ display: "grid", gap: 12 }}>
              <h2 style={OVERSKRIFT}>{fornavn} har ikke delt IUP-en med deg</h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: TN.ink700, maxWidth: "60ch" }}>
                Du ser bare det som er åpent: navn, klubb, fødselsår og WAGR-plass. Tester, trening, turneringsplan, teknisk plan og fireukerssjekk vises når {fornavn} deler.
              </p>
              <b style={{ fontSize: 14, color: TN.navy900 }}>Slik deler spilleren</b>
              <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6, fontSize: 15, lineHeight: 1.45, color: TN.ink700 }}>
                <li>PlayerHQ › Meg › Personvern › Deling</li>
                <li>Velg «Del med trener» og skriv inn din e-post på @golfforbundet.no</li>
                <li>Under 16 år: foresatt godkjenner</li>
                <li>Du åpner lenken innen sju dager</li>
              </ol>
            </TnFlate>
          </section>
          <section style={{ display: "grid", gap: 12, alignContent: "start" }}>
            <TnFlate style={{ display: "grid", gap: 4 }}>
              <h2 style={OVERSKRIFT}>Offentlig ranking</h2>
              <TnListerad tittel="WAGR-plass" hoyre={<span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 16, color: TN.navy900 }}>{wagr?.plass != null ? new Intl.NumberFormat("nb-NO").format(wagr.plass) : "—"}</span>} />
              <TnFotnote>{wagr ? `Kilde: World Amateur Golf Ranking (WAGR), The R&A, ${datoLang(wagr.dato)}.` : "Spilleren er ikke koblet til WAGR ennå."}</TnFotnote>
            </TnFlate>
          </section>
        </TnRutenett>
      </TnSkraKort>
    </TnShell>
  );
}
