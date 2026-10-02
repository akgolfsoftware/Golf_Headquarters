/** Prøvefil for PH-05 Live-økt: aktiv. Syntetiske data, ingen ekte spillere. */
import { PH05LiveAktiv, type PH05Drill, type PH05Props } from "@/components/portal/precision/PH05LiveAktiv";

export const sti = "/portal/live/demo/active";
export const natt = ["data", "tom", "laster", "feil", "pause", "dialog", "mange", "fys"];

const drills: PH05Drill[] = [
  { id: "d1", akse: "slag", navn: "Innspill ca. 100 m · Lengdekontroll", beskrivelse: "Tre mål på 90, 100 og 110 m. Ti lav-hastighetssving uten mål først. Deretter 30 slag: ti mot hvert mål i tilfeldig rekkefølge.", arkMeta: "40 REPS · 20 MIN", ferdig: true, hoppet: false, fys: false },
  { id: "d2", akse: "slag", navn: "Innspill ca. 50 m · Lengdekontroll med et langt navn som må brytes over flere linjer", beskrivelse: "Ti svinger uten ball med kort baksving. Tjue i lav hastighet mot 50 m. Førti slag der du veksler mellom 45, 50 og 55 m. Mål: innenfor 4 m.", arkMeta: "PÅGÅR", ferdig: false, hoppet: false, fys: false },
  { id: "d3", akse: "slag", navn: "Pitch · Landingspunkt", beskrivelse: null, arkMeta: "30 REPS · 15 MIN", ferdig: false, hoppet: false, fys: false },
  { id: "d4", akse: "spill", navn: "Putting 3–5 fot · Ballstart", beskrivelse: "Port med to tees en putterbredde foran ballen.", arkMeta: "50 REPS · 20 MIN", ferdig: false, hoppet: false, fys: false },
];
const nul = () => {};
const tellere = (v: [number, number, number, number]): PH05Props["tellere"] =>
  [["ub", "Uten ball"], ["lh", "Lav hastighet"], ["auto", "Automatikk"], ["treff", "Treff"]].map(([id, label], i) => ({ id: id!, label: label!, verdi: v[i]!, onEndre: nul }));
const base: PH05Props = {
  tilstand: "data", klokke: "24:12", pauset: false, planlagtMin: 75, drills, valgt: 1, drillKlokke: "08:32", drillPlan: "AV 20:00",
  totalt: 40, planlagtTotalt: 70, tellere: tellere([10, 14, 0, 16]),
  kvittering: { navn: "Innspill ca. 100 m · Lengdekontroll", tid: "18:38", planTid: "20:00", fikk: 40, plan: 40 },
  status: null, feilKode: "FRAKOBLET · 14:52 · 40 REPS LOKALT", kanRegistrere: true, slagtellerHref: "#",
  onPause: nul, onAvslutt: nul, onVelg: nul, onFerdig: nul, onHopp: nul, onFjern: nul, fullforer: false,
  dialog: { open: false, ferdige: 1, totalt: 4, lagrer: false, feil: false, notatVarsel: false, onFortsett: nul, onBekreft: nul },
  ekstra: <details className="pa-card" style={{ padding: 0 }}><summary style={{ minHeight: 56, display: "flex", alignItems: "center", padding: "0 16px" }}>Notater</summary></details>,
};

export const tilstander = {
  data: <PH05LiveAktiv {...base} />,
  tom: <PH05LiveAktiv {...base} tilstand="tom" klokke="00:00" valgt={0} drillKlokke="00:00" totalt={0} kvittering={null} tellere={tellere([0, 0, 0, 0])} drills={drills.map((d) => ({ ...d, ferdig: false }))} />,
  laster: <PH05LiveAktiv {...base} tilstand="laster" kanRegistrere={false} />,
  feil: <PH05LiveAktiv {...base} tilstand="feil" kanRegistrere={false} onProv={nul} />,
  pause: <PH05LiveAktiv {...base} pauset status="Uten nett. Registreringene venter på sending." statusHandling={{ label: "Prøv lagring igjen", onClick: nul }} />,
  dialog: <PH05LiveAktiv {...base} dialog={{ ...base.dialog, open: true, notatVarsel: true }} />,
  mange: <PH05LiveAktiv {...base} valgt={3} drills={[...drills, ...drills.map((d) => ({ ...d, id: d.id + "b", ferdig: false }))]} />,
  fys: <PH05LiveAktiv {...base} drills={drills.map((d, i) => i === 1 ? { ...d, akse: "fys" as const, fys: true } : d)} fysInnhold={<div className="pa-card" style={{ padding: 16 }}>Fys-logger</div>} />,
};
