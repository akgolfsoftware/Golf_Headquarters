/** Prøvefil for AG-14 Plan-hub, maler og øvelser. Oppdiktede data, ingen ekte spillere eller maler. */
import { CircleAlert, RotateCw } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { AG14PlanHub } from "@/components/admin/precision/AG14PlanHub";
import { AG14Ovelseark } from "@/components/admin/precision/AG14Ovelseark";
import type { PlanhubData, PlanhubFane, PlanhubMal } from "@/lib/agencyos/planhub-typer";

export const sti = "/admin/plan";

const mal = (over: Partial<PlanhubMal>): PlanhubMal => ({
  id: "m1", navn: "Prøvemal", beskrivelse: null, kategori: "E", fase: "GRUNN", varighetUker: 1, ukentligOktAntall: 5,
  usageCount: 0, oktAntall: 0, godkjent: false, fordeling: [], minutter: [], ukeOversikt: [], effektAvg: null, effektAntall: 0, ...over,
});

const data: PlanhubData = {
  uke: { nr: 40, spillere: 12, okter: 31, udekket: 2 },
  workbenchHref: "/admin/workbench/p1?uke=2026-09-28",
  ukemaler: [
    mal({ id: "u1", navn: "Grunnuke nærspill", usageCount: 14, oktAntall: 5, godkjent: true, minutter: [{ akse: "SLAG", verdi: 180 }, { akse: "TEK", verdi: 120 }, { akse: "FYS", verdi: 60 }], fordeling: [{ akse: "SLAG", verdi: 50 }, { akse: "TEK", verdi: 30 }, { akse: "FYS", verdi: 20 }], effektAvg: 0.42, effektAntall: 3 }),
    mal({ id: "u2", navn: "Turneringsuke med et svært langt navn som må brytes over flere linjer", kategori: "B", fase: "TURNERING", usageCount: 2, oktAntall: 4, minutter: [{ akse: "TURN", verdi: 270 }, { akse: "SPILL", verdi: 120 }] }),
    mal({ id: "u3", navn: "Tom ukemal", fase: "SPESIAL", fordeling: [{ akse: "TEK", verdi: 40 }, { akse: "SLAG", verdi: 60 }] }),
  ],
  program: [
    mal({ id: "p1", navn: "Wedge-blokk seks uker", beskrivelse: "Lengdekontroll 50–100 m, fra lav hastighet til automatikk.", varighetUker: 6, ukentligOktAntall: 4, usageCount: 5, oktAntall: 24, godkjent: true,
      minutter: [{ akse: "SLAG", verdi: 900 }, { akse: "TEK", verdi: 400 }], ukeOversikt: [{ fraUke: 1, tilUke: 3, akse: "TEK", oktAntall: 12 }, { fraUke: 4, tilUke: 6, akse: "SLAG", oktAntall: 12 }] }),
    mal({ id: "p2", navn: "Styrke vinter", varighetUker: 8, fase: "GRUNN", fordeling: [{ akse: "FYS", verdi: 100 }] }),
  ],
  standardokter: [
    { id: "s1", navn: "Putting 3–5 fot · ballstart", akse: "SLAG", minutter: 45, ovelseAntall: 3 },
    { id: "s2", navn: "Styrke bein og kjerne", akse: "FYS", minutter: 50, ovelseAntall: 5 },
    { id: "s3", navn: "Ni hull · strategioppgave", akse: "SPILL", minutter: 120, ovelseAntall: 1 },
  ],
  ovelser: [
    { id: "o1", navn: "7-jern mot mål", pyramide: "SLAG", omraade: "INNSPILL_150", motorikk: "AUTO", belastning: "TRENINGSOMRAADE", press: "ALENE", mengde: "30 slag",
      detaljer: { mengde: { enhet: "SLAG", antall: 30 }, mal: { resultatkrav: "±6 m" }, tekniskFokus: "LENGDEKONTROLL" }, parametre: null },
    { id: "o2", navn: "Stigeputt 1–3 m", pyramide: "SLAG", omraade: "PUTT_3_5", motorikk: null, belastning: "TRENINGSOMRAADE", press: "OBSERVERT", mengde: "40 putter", detaljer: null, parametre: null },
    { id: "o3", navn: "Eldre øvelse uten område", pyramide: "TEK", omraade: null, motorikk: null, belastning: null, press: null, mengde: null, detaljer: null, parametre: null },
    { id: "o4", navn: "Knebøy", pyramide: "FYS", omraade: "STYRKE", motorikk: null, belastning: "INNENDORS", press: "ALENE", mengde: "4 serier · 6 repetisjoner · 60 kg",
      detaljer: { mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 60 } }, parametre: null },
  ],
  ovelserTotalt: 412,
};

const tom: PlanhubData = { ...data, uke: { nr: 40, spillere: 0, okter: 0, udekket: 0 }, workbenchHref: "/admin/spillere", ukemaler: [], program: [], standardokter: [], ovelser: [], ovelserTotalt: 0 };

const Skall = ({ children }: { children: React.ReactNode }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall>
  </AdminRolleProvider>
);
const Vis = (d: PlanhubData, fane: PlanhubFane = "ukemaler") => <Skall><AG14PlanHub data={d} startFane={fane} /></Skall>;

export const tilstander = {
  data: Vis(data),
  program: Vis(data, "program"),
  standardokter: Vis(data, "standardokter"),
  ovelser: Vis(data, "ovelser"),
  "ny-ovelse": <Skall><AG14PlanHub data={data} startFane="ovelser" /><AG14Ovelseark open ovelse={null} onLukk={() => {}} onLagret={() => {}} /></Skall>,
  "rediger-ovelse": <Skall><AG14PlanHub data={data} startFane="ovelser" /><AG14Ovelseark open ovelse={data.ovelser[3]!} onLukk={() => {}} onLagret={() => {}} /></Skall>,
  tom: Vis(tom),
  "tom-ovelser": Vis(tom, "ovelser"),
  laster: <Skall><div className="pa-side"><LasterTilstand text="Henter maler og øvelser …" /></div></Skall>,
  feil: <Skall><div className="pa-side"><FeilTilstand icon={CircleAlert} title="Plan-hub kunne ikke hentes" text="Ingen maler eller øvelser er endret. Prøv igjen."
    retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw">Prøv igjen</Knapp>} /></div></Skall>,
};
