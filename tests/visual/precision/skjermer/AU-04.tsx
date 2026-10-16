/**
 * Prøvefil for AU-04 Oppstart (spiller, sju steg) og forelder. Syntetiske data,
 * ingen ekte spillere. Server-handlinger er stubber i maal.mjs.
 * Kjør: node tests/visual/precision/maal.mjs AU-04
 */
import { useEffect, type ReactNode } from "react";
import { SpillerOppstart, FasSkjema, TOMME_VERDIER, type Kobling, type OppstartProps, type OppstartVerdier } from "@/components/auth/precision/SpillerOppstart";
import { VeiviserFlate } from "@/components/auth/precision/oppstart";
import { ForelderWizard } from "@/app/auth/onboarding/forelder/forelder-wizard";
import type { FasSvar } from "@/lib/onboarding/oppstart";

export const sti = "/auth/onboarding";
const noop = () => {};

const fylt: OppstartVerdier = {
  ...TOMME_VERDIER,
  fodt: "2009-04-12",
  hcp: "8,4",
  snitt: "75,2",
  nivaa: "REGION",
  sgIAar: "−2,2",
};

const fasiliteter: FasSvar[] = [
  { id: "f1", name: "Testklubb GK", range: true, rangeLen: 240, driver: true, bunker: true, bMin: 5, bMax: 30, chip: true, chipMax: 25, pitch: true, pitchMax: 60, lob: true, green: true, puttMax: 45, bane: true, holes: 18 },
  { id: "f2", name: "Treningsstudio", styrke: true, kond: true, bev: true },
];

const testSlag = {
  sw: [[68, 3.1], [73, 4.4], [66, 5.2], [71, 2.8], [69, 3.9]],
  i7: [[134, 9.2], [146, 11.8], [138, 8.1], [131, 12.4], [142, 7.6]],
  dr: [[214, 18.0], [226, 21.5], [208, 16.2], [219, 24.1], [223, 19.4]],
} as OppstartVerdier["testSlag"];

const kobling: Kobling = { navn: "Øyvind Rohjan", fodselsaar: 2009, kandidater: null, koblet: false, feil: null };
const treff: Kobling["kandidater"] = [
  { person_id: 1, name: "Øyvind Rohjan", birth_year: 2009, club: "Testklubb GK", tournaments: 14, evidence: [{ tournament: "Srixon Tour · runde 5", date: "2026-09-13", class: "G16" }] },
];

const grunn: OppstartProps = {
  steg: 1, v: TOMME_VERDIER, endre: noop, kobling, venter: false, melding: null,
  onNeste: noop, onTilbake: noop, onHopp: noop, onStart: noop, onSok: noop, onKoble: noop, onProvIgjen: noop,
};
const S = (p: Partial<OppstartProps>) => <SpillerOppstart {...grunn} {...p} />;

const Natt = ({ children }: { children: ReactNode }) => {
  useEffect(() => { document.querySelectorAll(".pa-root").forEach((el) => el.setAttribute("data-theme", "night")); });
  return <>{children}</>;
};

const steg1 = S({ steg: 1 });
const steg6 = S({ steg: 6, v: { ...fylt, plan: "Konkurransespilleren" } });

export const tilstander = {
  steg1tom: steg1,
  steg1: S({ steg: 1, v: fylt }),
  steg1under16: S({ steg: 1, v: { ...fylt, fodt: "2013-04-12" } }),
  steg1feil: S({ steg: 1, v: { ...fylt, fodt: "12.04.2009" }, melding: "Skriv fødselsdatoen som ÅÅÅÅ-MM-DD." }),
  steg2tom: S({ steg: 2, v: fylt }),
  steg2: S({ steg: 2, v: { ...fylt, fasiliteter } }),
  steg2skjema: <VeiviserFlate><FasSkjema startId="n1" onSave={noop} onCancel={noop} init={{ name: "Testklubb GK" }} startSporsmal={0} /></VeiviserFlate>,
  steg3: S({ steg: 3, v: fylt, kobling }),
  steg3treff: S({ steg: 3, v: fylt, kobling: { ...kobling, kandidater: treff } }),
  steg3ingen: S({ steg: 3, v: { ...fylt, koblingModus: "Golf-ID", golfId: "303-579" }, kobling: { ...kobling, kandidater: [] } }),
  steg3under16: S({ steg: 3, v: { ...fylt, fodt: "2013-04-12" }, kobling }),
  steg4tom: S({ steg: 4, v: fylt }),
  steg4: S({ steg: 4, v: { ...fylt, testSlag, testVist: true } }),
  steg4bane: S({ steg: 4, v: { ...fylt, testSlag, testVerktoy: "Banen" } }),
  steg5: S({ steg: 5, v: fylt }),
  steg5under16: S({ steg: 5, v: { ...fylt, fodt: "2013-04-12", forelderEpost: "forelder@example.com" } }),
  steg6: steg6,
  steg6tom: S({ steg: 6, v: fylt }),
  steg7: S({ steg: 7, v: { ...fylt, plan: "Konkurransespilleren", fasiliteter } }),
  laster: S({ steg: 7, tilstand: "laster" }),
  feil: S({ steg: 7, tilstand: "feil" }),
  forelder: <ForelderWizard />,
  nattSteg1: <Natt>{S({ steg: 1, v: fylt })}</Natt>,
  nattSteg2: <Natt>{S({ steg: 2, v: { ...fylt, fasiliteter } })}</Natt>,
  nattSteg4: <Natt>{S({ steg: 4, v: { ...fylt, testSlag, testVist: true } })}</Natt>,
  nattSteg6: <Natt>{steg6}</Natt>,
  nattFeil: <Natt>{S({ steg: 7, tilstand: "feil" })}</Natt>,
};
export const natt = ["nattSteg1", "nattSteg2", "nattSteg4", "nattSteg6", "nattFeil"];
