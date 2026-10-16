/** Prøvefil for planmal-sidene under AG-14 (detalj, ny, editor). Oppdiktede maler og øvelser. */
import { CircleAlert, RotateCw } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AdminRolleProvider } from "@/components/v2/rolle";
import { FeilTilstand, Knapp, LasterTilstand } from "@/components/precision/pa";
import { AG14MalDetalj, type PlanMalDetalj } from "@/components/admin/precision/AG14MalDetalj";
import { AG14MalNy } from "@/components/admin/precision/AG14MalNy";
import { AG14MalRediger, type RedigerDrillValg, type RedigerMal } from "@/components/admin/precision/AG14MalRediger";

export const sti = "/admin/plan-templates/m1";

const fordeling = { FYS: 0.15, TEK: 0.25, SLAG: 0.25, SPILL: 0.2, TURN: 0.15 };

const okter = [
  { id: "s1", ukeNr: 1, dagNr: 1, title: "Wedge 50–90 m med et langt navn som må brytes", varighetMin: 60, pyramidArea: "SLAG" as const, skillArea: "TILNAERMING" as const, environment: "RANGE" as const, focus: "Lengdekontroll", notes: "Tre avstander.\nTi slag hver.", drills: [{ exerciseId: "e1", sets: 3, reps: 10, csTarget: 80 }] },
  { id: "s2", ukeNr: 1, dagNr: 3, title: "Styrke bein", varighetMin: 45, pyramidArea: "FYS" as const, skillArea: null, environment: "GYM" as const, focus: null, notes: null, drills: [] },
  { id: "s3", ukeNr: 2, dagNr: 5, title: "Ni hull", varighetMin: 150, pyramidArea: "SPILL" as const, skillArea: "SPILL" as const, environment: "BANE" as const, focus: null, notes: null, drills: [] },
];

const detalj: PlanMalDetalj = {
  id: "m1", name: "Prøveprogram to uker", description: "Oppdiktet mal for skjermprøven.", kategori: "E", lPhase: "GRUNN", varighetUker: 2, ukentligOktAntall: 3,
  fordeling, anbefaltFordeling: { FYS: 0.15, TEK: 0.25, SLAG: 0.25, SPILL: 0.2, TURN: 0.15 }, minAlder: 13, maxAlder: null, approved: true, usageCount: 7, effectivenessAvg: 0.4,
  sessions: okter.map((o) => ({ ...o, drills: o.drills.map((d) => ({ ...d, exerciseName: "Prøveøvelse" })) })),
};

const drillValg: RedigerDrillValg[] = [
  { id: "e1", name: "Prøveøvelse", pyramidArea: "SLAG", skillArea: "TILNAERMING" },
  { id: "e2", name: "Knebøy", pyramidArea: "FYS", skillArea: null },
  { id: "e3", name: "Stigeputt med et svært langt navn som må brytes over linjer", pyramidArea: "SLAG", skillArea: "PUTTING" },
];

const rediger: RedigerMal = { ...detalj, sessions: okter };

const Skall = ({ children }: { children: React.ReactNode }) => (
  <AdminRolleProvider erAdmin>
    <AgencyOSSkall navn="Test Coach">{children}</AgencyOSSkall>
  </AdminRolleProvider>
);

export const tilstander = {
  data: <Skall><AG14MalDetalj template={detalj} /></Skall>,
  tom: <Skall><AG14MalDetalj template={{ ...detalj, approved: false, usageCount: 0, effectivenessAvg: null, description: null, sessions: [] }} /></Skall>,
  ny: <Skall><AG14MalNy /></Skall>,
  rediger: <Skall><AG14MalRediger template={rediger} drillOptions={drillValg} /></Skall>,
  "rediger-tom": <Skall><AG14MalRediger template={{ ...rediger, sessions: [], varighetUker: 1 }} drillOptions={[]} /></Skall>,
  laster: <Skall><div className="pa-side"><LasterTilstand text="Henter planmalen …" /></div></Skall>,
  feil: <Skall><div className="pa-side"><FeilTilstand icon={CircleAlert} title="Planmalen kunne ikke hentes" text="Ingenting i malen er endret. Prøv igjen, eller gå tilbake til Plan-hub."
    retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw">Prøv igjen</Knapp>} /></div></Skall>,
};
