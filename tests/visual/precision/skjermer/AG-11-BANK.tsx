/**
 * Prøvefil for Øvelsesbanken i AgencyOS (/admin/ovelser, beslutning 16.10.2026): samme bank-side som
 * spillerens PH-13, i AgencyOS-skallet, for coachens tilgang. Syntetiske data.
 */
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { PH13DrillBank } from "@/components/portal/precision/PH13DrillBank";
import Loading from "@/app/admin/ovelser/loading";
import Feil from "@/app/admin/ovelser/error";
import { ovelseVisning, type OvelseRad } from "@/lib/portal-drills/ovelser-visning";

export const sti = "/admin/ovelser";
const rad = (p: Partial<OvelseRad>): OvelseRad => ({
  id: "x", name: "", description: null, imageUrl: null, pyramidArea: "SLAG", skillArea: null, omraadeKode: null, motorikk: null, press: null,
  durationMin: 30, environment: [], utstyr: [], defaultSets: null, defaultReps: null, defaultRepsSets: null, source: "SYSTEM", ...p,
});
const ovelser = [
  { ...ovelseVisning(rad({ id: "c1", name: "Lengdekontroll i simulator", pyramidArea: "TEK", omraadeKode: "INNSPILL_100", motorikk: "LAV_HAST", environment: ["SIMULATOR"], press: "OBSERVERT", source: "COACH" })), egen: true },
  { ...ovelseVisning(rad({ id: "p1", name: "Chip til tre landingspunkt", omraadeKode: "CHIP", environment: ["RANGE"], press: "ALENE", source: "PLAYER" })), egen: false },
  ovelseVisning(rad({ id: "o3", name: "Wedge-stigen 50–90 m", omraadeKode: "INNSPILL_50", environment: ["RANGE"], press: "OBSERVERT", durationMin: 40 })),
  ovelseVisning(rad({ id: "o4", name: "Klokka på 4 fot", omraadeKode: "PUTT_3_5", press: "KONKURRANSE", durationMin: 20, defaultRepsSets: "40 putter" })),
  ovelseVisning(rad({ id: "o6", name: "Up and down fra ni situasjoner", pyramidArea: "SPILL", omraadeKode: "BANE", environment: ["BANE"], press: "KONKURRANSE" })),
  ovelseVisning(rad({ id: "o7", name: "Spilleplan før turnering", pyramidArea: "TURN", omraadeKode: "BANE", press: "TURNERING" })),
  ovelseVisning(rad({ id: "o8", name: "Styrke bein og kjerne", pyramidArea: "FYS", omraadeKode: "STYRKE", environment: ["GYM"], defaultSets: 4, defaultReps: 6, durationMin: 60 })),
];
const skall = (n: React.ReactNode) => <AdminRolleProvider erAdmin><AgencyOSSkall navn="Test Coach">{n}</AgencyOSSkall></AdminRolleProvider>;

export const tilstander = {
  bank: skall(<PH13DrillBank ovelser={ovelser} caddie={null} coach />),
  tom: skall(<PH13DrillBank ovelser={[]} caddie={null} coach />),
  laster: skall(<Loading />),
  feil: skall(<Feil error={Object.assign(new Error("prøve"), { digest: "prove" })} reset={() => undefined} />),
};
// error.tsx logger feilen med console.error; i prøven er feilen tilsiktet.
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") { console.error = () => {}; }
