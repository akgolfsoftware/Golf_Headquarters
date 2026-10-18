/**
 * Prøvefil for AU-04 Oppstart (spiller, sju steg) og forelder. Syntetiske data, ingen ekte spillere.
 * Server-handlinger er stubber i maal.mjs. Kjør: node tests/visual/precision/maal.mjs AU-04
 */
import { SpillerOppstart, TOMME_VERDIER, type Kobling, type OppstartProps, type OppstartVerdier } from "@/components/auth/precision/SpillerOppstart";
import { ForelderWizard } from "@/app/auth/onboarding/forelder/forelder-wizard";

export const sti = "/auth/onboarding";
const noop = () => {};

const fylt: OppstartVerdier = {
  ...TOMME_VERDIER,
  fodtTekst: "14.03.2009",
  hcp: "8,4",
  snitt: "81",
  nivaa: "REGION",
  sgIAar: { sgOtt: "+0,6", sgApp: "−0,4", sgArg: "−0,9", sgPutt: "+0,1" },
  sgIFjor: { sgOtt: "+0,2", sgApp: "", sgArg: "", sgPutt: "" },
  omrader: ["Utslag", "Innspill ca. 150 m", "Innspill ca. 100 m", "Chip", "Pitch", "Bunker", "Putting 0–3 fot", "Putting 3–5 fot", "Styrke", "Banespill"],
  steder: ["Driving range", "Puttinggreen", "Golfbane", "Treningsrom"],
  test: { sw: { carry: "58", fraMal: "4,1" }, i7: { carry: "131", fraMal: "14,6" }, dr: { carry: "221", fraMal: "12,0" } },
  plan: "Konkurransespilleren",
};

const kobling: Kobling = { navn: "Testspiller Prøvesen", fodselsaar: 2009, kandidater: null, koblet: false, feil: null };
const treff: Kobling["kandidater"] = [
  { person_id: 1, name: "Testspiller Prøvesen", birth_year: 2009, club: "Testklubb GK", tournaments: 6, evidence: [] },
  { person_id: 2, name: "Testspiller Prøvesen", birth_year: 2009, club: "Annen testklubb GK med langt navn", tournaments: 2, evidence: [] },
];

const grunn: OppstartProps = {
  steg: 1, v: TOMME_VERDIER, endre: noop, kobling, venter: false, melding: null,
  onNeste: noop, onTilbake: noop, onHopp: noop, onStart: noop, onSok: noop, onKoble: noop, onProvIgjen: noop,
};
const S = (p: Partial<OppstartProps>) => <SpillerOppstart {...grunn} {...p} />;

export const tilstander = {
  steg1tom: S({ steg: 1 }),
  steg1: S({ steg: 1, v: fylt }),
  steg1feil: S({ steg: 1, v: { ...fylt, fodtTekst: "14.3" }, melding: "Skriv fødselsdatoen som dd.mm.åååå." }),
  steg2: S({ steg: 2, v: fylt }),
  steg3: S({ steg: 3, v: fylt }),
  steg3tom: S({ steg: 3 }),
  steg4: S({ steg: 4, v: fylt, kobling: { ...kobling, kandidater: treff } }),
  steg4tom: S({ steg: 4, v: fylt, kobling: { ...kobling, kandidater: [] } }),
  steg4under16: S({ steg: 4, v: { ...fylt, fodtTekst: "14.03.2013" } }),
  steg5: S({ steg: 5, v: fylt }),
  steg6under16: S({ steg: 6, v: { ...fylt, fodtTekst: "14.03.2013", forelderEpost: "forelder@example.invalid" } }),
  steg6: S({ steg: 6, v: fylt }),
  steg7: S({ steg: 7, v: fylt }),
  steg7klubb: S({ steg: 7, v: { ...fylt, nivaa: "KLUBB", plan: null } }),
  laster: S({ steg: 7, v: fylt, tilstand: "laster" }),
  feil: S({ steg: 7, v: fylt, tilstand: "feil" }),
  forelder: <ForelderWizard />,
};
