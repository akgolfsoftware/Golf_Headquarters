/** Prøvefil for PH-17 TrackMan. Syntetiske data, ingen ekte spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17Ramme, PH17Okter, PH17Gapping, PH17Utstyr } from "@/components/portal/precision/PH17TrackMan";
import type { Ph17Okt } from "@/lib/trackman/ph17-data";
import type { GappingData } from "@/lib/portal/gapping-data";
import type { ClubFitReport } from "@/lib/sg-hub/equipment-fit";

export const sti = "/portal/analysere/trackman";
export const natt = ["okter-natt", "gap-natt"];

const pts = (n: number, s: number): [number, number][] => Array.from({ length: n }, (_, i) => [Math.sin(i * 2.1) * s, Math.cos(i * 1.3) * s * 1.4] as [number, number]);
const snitt = { carry: 112.4, clubSpeed: 82.1, ballSpeed: 109.3, smash: 1.33, launch: 26.4, clubPath: -1.2, faceToPath: null, spin: 9180 };
const okter: Ph17Okt[] = [
  { id: "a", tittel: "Simulator (innendørs)", dato: "24.09.2026", slag: 46, kilde: "API", klubber: [{ navn: "54°", pts: pts(20, 5), snitt }, { navn: "Driver med langt navn", pts: pts(12, 14), snitt: { ...snitt, spin: null } }, { navn: "7-jern", pts: [], snitt: { ...snitt, carry: null } }] },
  { id: "b", tittel: "TrackMan-økt", dato: "17.09.2026", slag: 30, kilde: "CSV", klubber: [{ navn: "PW", pts: pts(9, 4), snitt }] },
];
const gap: GappingData = {
  vinduDager: 90, okter: 3, totaltSlag: 220, forFaaSlag: false,
  koller: [
    { klubb: "Driver", median: 232, p25: 224, p75: 240, slag: 30, tynn: false },
    { klubb: "5-jern", median: 172, p25: 166, p75: 178, slag: 40, tynn: false },
    { klubb: "7-jern", median: 140, p25: 136, p75: 144, slag: 50, tynn: false },
    { klubb: "PW", median: 112, p25: 108, p75: 116, slag: 12, tynn: true },
  ],
  gap: [{ over: "Driver", under: "5-jern", meter: 60, hullMidt: 202 }],
};
const rapporter: ClubFitReport[] = [
  { clubId: "Driver", category: "driver", shotCount: 30, overall: "warn", metrics: [
    { label: "Launch", unit: "°", target: { min: 11, max: 14 }, value: 9.8, status: "warn", note: "" },
    { label: "Spin", unit: "rpm", target: { min: 2200, max: 2800 }, value: 2950, status: "warn", note: "" },
    { label: "Smash", unit: "", target: { min: 1.45, max: 1.5 }, value: 1.47, status: "ok", note: "" }] },
  { clubId: "7i", category: "iron", shotCount: 50, overall: "missing", metrics: [] },
];
const Vis = ({ aktiv, tilstand, children }: { aktiv: "okter" | "gap" | "utstyr"; tilstand?: "data" | "feil"; children?: React.ReactNode }) =>
  <PlayerHQSkall innboksHref="#" uleste={0}><PH17Ramme aktiv={aktiv} tilstand={tilstand}>{children}</PH17Ramme></PlayerHQSkall>;
export const tilstander = {
  okter: <Vis aktiv="okter"><PH17Okter okter={okter} /></Vis>,
  "okter-natt": <Vis aktiv="okter"><PH17Okter okter={okter} /></Vis>,
  gap: <Vis aktiv="gap"><PH17Gapping data={gap} /></Vis>,
  "gap-natt": <Vis aktiv="gap"><PH17Gapping data={gap} /></Vis>,
  utstyr: <Vis aktiv="utstyr"><PH17Utstyr reports={rapporter} /></Vis>,
  tom: <Vis aktiv="okter"><PH17Okter okter={[]} /></Vis>,
  feil: <Vis aktiv="okter" tilstand="feil" />,
};
