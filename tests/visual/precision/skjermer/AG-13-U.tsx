/** Prøvefil for AG-13 og AG-13-U Live coachingøkt i nytt design. Syntetiske data. */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { Feil as FeilNy, Laster } from "@/components/admin/agencyos-ny/ny";
import { AG13LiveOktNy, type LiveSamtykke } from "@/components/admin/precision/AG13LiveOktNy";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

export const sti = "/admin/agencyos/live/s1";

const base: LiveOktData = {
  id: "s1", kilde: "v2", tittel: "Wedge 50–90 m", spillerNavn: "Testspiller Med Et Langt Etternavn", spillerId: "p1", coachNavn: "Test Coach", sted: "Range", miljo: "UTE", type: "Privattime", status: "PÅGÅR",
  startTime: new Date(Date.now() - 34 * 60_000).toISOString(), varighetPlanlagtMin: 90, malsetning: "Avstandskontroll 50–90 m, treff innenfor 3 m.", opptak: null,
  driller: [
    { id: "d1", navn: "Oppvarming · korte wedger", varighetMin: 10, pyramide: "TEK", logget: true },
    { id: "d2", navn: "Avstandskontroll 60 m med et langt navn som må brytes over flere linjer", varighetMin: 15, pyramide: "SLAG", logget: false },
  ],
  coachBrief: "", coachRating: null,
};
const OPPGAVE = { planId: "pl1", pNummer: "P7.0", posisjon: "Treffpunktet", tittel: "Hendene foran ballen i treff", gjort: 240, maal: 400 };
const GITT: LiveSamtykke = { tillatt: true };

const Vis = (d: LiveOktData, samtykke: LiveSamtykke = GITT, oppgave = OPPGAVE) => (
  <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><AG13LiveOktNy data={d} samtykke={samtykke} hcp={1.2} oppgave={oppgave} /></AgencyOSSkall></AdminRolleProvider>
);

export const tilstander = {
  utenOpptak: Vis(base),
  etter: Vis({ ...base, startTime: new Date(Date.now() - 200 * 60_000).toISOString(), opptak: { status: "DONE", durationSec: 3480, transcript: "Coach: Bra tempo …", coachAnalyse: "Jobbet med avstandskontroll 50–90 m. 13 av 20 innenfor 3 m." }, coachRating: 4 }),
  medOpptak: Vis({ ...base, opptak: { status: "RECORDING", durationSec: 754, transcript: "Coach: Bra tempo på den siste …", coachAnalyse: "Jevnt over god avstandskontroll, litt kort på 90 m." }, coachBrief: "Tenk rytme, ikke fart.", coachRating: 4 }),
  utenSamtykke: Vis(base, { tillatt: false, status: "MANGLER" }),
  trukket: Vis(base, { tillatt: false, status: "TRUKKET" }),
  tom: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><AG13LiveOktNy data={{ ...base, driller: [], malsetning: null, spillerId: null }} samtykke={GITT} hcp={null} oppgave={null} /></AgencyOSSkall></AdminRolleProvider>,
  laster: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="agn-s"><Laster tekst="Henter live-økta …" hoyder={[120, 200, 200]} /></div></AgencyOSSkall></AdminRolleProvider>,
  feil: <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach"><div className="agn-s"><FeilNy tittel="Live-økta kunne ikke hentes" tekst="Ingenting er sendt eller tatt opp. Prøv igjen." kode="FEIL · LIVE" onProv={() => {}} /></div></AgencyOSSkall></AdminRolleProvider>,
};
