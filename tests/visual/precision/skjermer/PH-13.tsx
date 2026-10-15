/** Prøvefil for PH-13 Øvelsesbank, øvelse og break-tabell, pakke 4 i nytt design. Syntetiske data. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13DrillBank } from "@/components/portal/precision/PH13DrillBank";
import { PH13DrillDetalj } from "@/components/portal/precision/PH13DrillDetalj";
import { PH13BreakTabell } from "@/components/portal/precision/PH13BreakTabell";
import Loading from "@/app/portal/drills/loading";
import Feil from "@/app/portal/drills/error";
import { ovelseVisning, ukeDager, type OvelseRad } from "@/lib/portal-drills/ovelser-visning";

export const sti = "/portal/planlegge";
const rad = (p: Partial<OvelseRad>): OvelseRad => ({
  id: "x", name: "", description: null, imageUrl: null, pyramidArea: "SLAG", skillArea: null, omraadeKode: null, motorikk: null, press: null,
  durationMin: 30, environment: [], utstyr: [], defaultSets: null, defaultReps: null, defaultRepsSets: null, source: "SYSTEM", ...p,
});
const ovelser = [
  rad({ id: "e1", name: "Chip til tre landingspunkt", omraadeKode: "CHIP", environment: ["RANGE"], press: "ALENE", defaultRepsSets: "40 slag", source: "PLAYER" }),
  rad({ id: "o1", name: "Lengdekontroll i simulator", pyramidArea: "TEK", omraadeKode: "INNSPILL_100", motorikk: "LAV_HAST", environment: ["SIMULATOR"], press: "OBSERVERT", utstyr: ["TrackMan"], durationMin: 45, defaultRepsSets: "30 slag", source: "COACH", description: "Tre lengder: 100, 125 og 150 m. Bytt lengde hvert slag.\nRegistrer carry fra TrackMan." }),
  rad({ id: "o2", name: "Face to Path med 7-jern", pyramidArea: "TEK", omraadeKode: "INNSPILL_150", motorikk: "LAV_HAST", environment: ["RANGE"], press: "ALENE", durationMin: 40 }),
  rad({ id: "o3", name: "Wedge-stigen 50–90 m", omraadeKode: "INNSPILL_50", environment: ["RANGE"], press: "OBSERVERT", durationMin: 40 }),
  rad({ id: "o4", name: "Klokka på 4 fot", omraadeKode: "PUTT_3_5", environment: ["RANGE"], press: "KONKURRANSE", durationMin: 20, defaultRepsSets: "40 putter" }),
  rad({ id: "o5", name: "Bunker: sandinngang", omraadeKode: "BUNKER", durationMin: 30 }),
  rad({ id: "o6", name: "Up and down fra ni situasjoner", pyramidArea: "SPILL", omraadeKode: "BANE", environment: ["BANE"], press: "KONKURRANSE", durationMin: 45 }),
  rad({ id: "o7", name: "Spilleplan før turnering", pyramidArea: "TURN", omraadeKode: "BANE", environment: ["BANE"], press: "TURNERING" }),
  rad({ id: "o8", name: "Styrke bein og kjerne", pyramidArea: "FYS", omraadeKode: "STYRKE", environment: ["GYM"], defaultSets: 4, defaultReps: 6, durationMin: 60, source: "COACH" }),
  rad({ id: "o9", name: "Bevegelighet hofte og brystrygg", pyramidArea: "FYS", omraadeKode: "BEVEGELIGHET", environment: ["HJEM"], durationMin: 20 }),
].map((r, i) => ovelseVisning(r, i === 1 ? 3 : 0));
const caddie = { ovelseId: "o1", omraade: "Innspill", sg: -0.9 };
const naa = new Date("2026-10-05T12:20:00Z");
const uke = { nr: 41, dager: ukeDager(naa) };
const skall = (n: React.ReactNode) => <PlayerHQSkall innboksHref="/portal/varsler" uleste={2}>{n}</PlayerHQSkall>;
const ukjent = rad({ id: "u", name: "Øvelse uten detaljer", pyramidArea: "SLAG", durationMin: null });

export const tilstander = {
  bank: skall(<PH13DrillBank ovelser={ovelser} caddie={caddie} />),
  bankNy: skall(<PH13DrillBank ovelser={ovelser} caddie={caddie} startMedNy />),
  tom: skall(<PH13DrillBank ovelser={[]} caddie={null} />),
  ovelse: skall(<PH13DrillDetalj ovelse={ovelser[1]} playerId="u1" uke={uke} />),
  ovelseArk: skall(<PH13DrillDetalj ovelse={ovelser[1]} playerId="u1" uke={uke} startMedArk />),
  ovelseTom: skall(<PH13DrillDetalj ovelse={ovelseVisning(ukjent)} playerId={null} uke={uke} />),
  break: skall(<PH13BreakTabell antallPutting={1} />),
  laster: <Loading />,
  feil: <Feil error={Object.assign(new Error("prøve"), { digest: "503" })} reset={() => {}} />,
};
if (typeof location !== "undefined" && new URLSearchParams(location.search).get("t") === "feil") { console.error = () => {}; window.fetch = async () => new Response("{}"); }
