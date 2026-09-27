/**
 * AK Golf HQ — Komplett Kategorisystem for Treningsmotoren.
 *
 * Master for pyramide-hierarkiet, fysiske pilarer, slagformer, golfkøller,
 * de 9 slaghøydene, P1.0–P10.0 svingposisjoner og læringstrappen for repetisjoner.
 *
 * Kilde: Anders Kristiansen 27.09.2026.
 */

// ============================================================================
// 1. Pyramiden (Hovedinngang / Hvorfor)
// ============================================================================

export const PYRAMIDE_NIVAAER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type PyramideNivaa = (typeof PYRAMIDE_NIVAAER)[number];

export const PYRAMIDE_DETALJER: Record<
  PyramideNivaa,
  { tittel: string; beskrivelse: string; farge: string }
> = {
  FYS: {
    tittel: "Fysisk",
    beskrivelse: "Fysisk kapasitet, skadeforebygging og atletisk fundament",
    farge: "#7C3AED", // Fiolett
  },
  TEK: {
    tittel: "Teknisk",
    beskrivelse: "Bevegelsesmønster, posisjoner (P1–P10) og motorisk læring",
    farge: "#2563EB", // Blå
  },
  SLAG: {
    tittel: "Golfslag",
    beskrivelse: "Ballkontroll, 9 høyder, 5 kurver, lengde og utfallskvalitet",
    farge: "#0D9488", // Turkis/teal
  },
  SPILL: {
    tittel: "Spill",
    beskrivelse: "Banespill, situasjonstrening, strategi, rutiner og press",
    farge: "#059669", // Smaragdgrønn
  },
  TURN: {
    tittel: "Turnering",
    beskrivelse: "Turneringsforberedelse, konkurranserunder og evaluering",
    farge: "#D97706", // Amber
  },
};

// ============================================================================
// 2. FYSISK (FYS) — 4 Pilarer, Tester og Målsettingskjede
// ============================================================================

export const FYS_PILARER = [
  "STYRKE",
  "KONDISJON",
  "BEVEGELIGHET",
  "POWER_SPEED",
] as const;
export type FysPilar = (typeof FYS_PILARER)[number];

export const FYS_PILAR_INFO: Record<
  FysPilar,
  { label: string; beskrivelse: string; parametere: string[] }
> = {
  STYRKE: {
    label: "Styrke",
    beskrivelse: "Maksimal styrke og muskulær utholdenhet",
    parametere: ["Sett", "Reps", "Vekt (kg)", "RIR (Reps in Reserve)", "Pause (sek)"],
  },
  KONDISJON: {
    label: "Kondisjon",
    beskrivelse: "Aerob og anaerob kapasitet for stabilitet over 18/36 hull",
    parametere: ["Segmenter", "Intervallsekvens", "Pulssone (1–5)", "Tid (min)", "Watt/Hastighet"],
  },
  BEVEGELIGHET: {
    label: "Bevegelighet",
    beskrivelse: "Mobilitet, leddutslag og funksjonelle svingposisjoner",
    parametere: ["Tid (sek)", "Reps", "Statisk/Dynamisk", "Mål-leddutslag (grader)"],
  },
  POWER_SPEED: {
    label: "Power & Speed",
    beskrivelse: "Eksplosivitet, vertikal bakkekraft og køllehastighet",
    parametere: ["Køllehastighet (mph)", "Ballhastighet (mph)", "Kast/hopp-høyde (cm)", "Reps", "Innsats (100 %)"],
  },
};

export type FysTestStatus = {
  testNavn: string;
  pilar: FysPilar;
  naasituasjonScore: string;
  enhet: string;
  testDato: string;
  evaluering: "UNDER_KRAV" | "PAA_PLAN" | "OVER_KRAV";
};

export type FysiskMaalsetting = {
  id: string;
  pilar: FysPilar;
  tittel: string;
  beskrivelse: string;
  basertPaaTest?: string;
  individueltVarsel?: string;
  startVerdi: string;
  maalVerdi: string;
  fristDato: string;
  // Lenke til planleggingskjeden
  koblingKjede: {
    aarsplan: boolean;
    periodeplan: boolean;
    maanedsplan: boolean;
    ukeplan: boolean;
    oektplan: boolean;
    programNavn: string;
  };
};

// ============================================================================
// 3. Områder (Avstand og Slagkategori)
// ============================================================================

export const TREN_OMRAADE_KODER = [
  "UTSLAG_TOTAL",
  "INNSPILL_250_PLUSS",
  "INNSPILL_200_250",
  "INNSPILL_150_200",
  "INNSPILL_100_150",
  "INNSPILL_50_100",
  "INNSPILL_UNDER_50",
  "CHIP",
  "PITCH",
  "LOB",
  "BUNKER",
  "PUTTING",
] as const;
export type TrenOmraadeKode = (typeof TREN_OMRAADE_KODER)[number];

export const TREN_OMRAADE_LABEL: Record<TrenOmraadeKode, string> = {
  UTSLAG_TOTAL: "Utslag / Tee totalt (>205 m)",
  INNSPILL_250_PLUSS: "Innspill 250 m+",
  INNSPILL_200_250: "Innspill 200–250 m",
  INNSPILL_150_200: "Innspill 150–200 m",
  INNSPILL_100_150: "Innspill 100–150 m",
  INNSPILL_50_100: "Innspill 50–100 m",
  INNSPILL_UNDER_50: "Innspill under 50 m",
  CHIP: "Chip",
  PITCH: "Pitch",
  LOB: "Lob",
  BUNKER: "Bunker",
  PUTTING: "Putting",
};

// ============================================================================
// 4. Golfkøller
// ============================================================================

export const GOLFKOLLE_KODER = [
  "DRIVER",
  "WOOD_3",
  "WOOD_5",
  "WOOD_7",
  "HYBRID_2",
  "HYBRID_3",
  "HYBRID_4",
  "DRIVING_IRON",
  "JERN_3",
  "JERN_4",
  "JERN_5",
  "JERN_6",
  "JERN_7",
  "JERN_8",
  "JERN_9",
  "PW",
  "GW",
  "SW",
  "LW",
  "PUTTER",
] as const;
export type GolfkolleKode = (typeof GOLFKOLLE_KODER)[number];

export const GOLFKOLLE_LABEL: Record<GolfkolleKode, string> = {
  DRIVER: "Driver",
  WOOD_3: "3-wood",
  WOOD_5: "5-wood",
  WOOD_7: "7-wood",
  HYBRID_2: "2-hybrid",
  HYBRID_3: "3-hybrid",
  HYBRID_4: "4-hybrid",
  DRIVING_IRON: "Driving Iron",
  JERN_3: "3-jern",
  JERN_4: "4-jern",
  JERN_5: "5-jern",
  JERN_6: "6-jern",
  JERN_7: "7-jern",
  JERN_8: "8-jern",
  JERN_9: "9-jern",
  PW: "PW (Pitching Wedge)",
  GW: "GW (Gap Wedge)",
  SW: "SW (Sand Wedge)",
  LW: "LW (Lob Wedge)",
  PUTTER: "Putter",
};

// ============================================================================
// 5. Slagtype og Kurve (5 slagkurver)
// ============================================================================

export const SLAGKURVE_KODER = ["RETT", "DRAW", "FADE", "HOOK", "SLICE"] as const;
export type SlagkurveKode = (typeof SLAGKURVE_KODER)[number];

export const SLAGKURVE_LABEL: Record<SlagkurveKode, string> = {
  RETT: "Rett",
  DRAW: "Draw",
  FADE: "Fade",
  HOOK: "Hook",
  SLICE: "Slice",
};

// ============================================================================
// 6. De 9 Slaghøydene (3x3 Ballbane-grid)
// ============================================================================

export const SLAGHOYDE_KODER = [
  "LOW_LOW",
  "LOW_MEDIUM",
  "LOW_HIGH",
  "MEDIUM_LOW",
  "MEDIUM_MEDIUM",
  "MEDIUM_HIGH",
  "HIGH_LOW",
  "HIGH_MEDIUM",
  "HIGH_HIGH",
] as const;
export type SlaghoydeKode = (typeof SLAGHOYDE_KODER)[number];

export type HovedHoydeNivaa = "LAV" | "MEDIUM" | "HOY";

export const SLAGHOYDE_INFO: Record<
  SlaghoydeKode,
  { label: string; hovedNivaa: HovedHoydeNivaa; beskrivelse: string }
> = {
  LOW_LOW: {
    label: "Low-Low (Lavest)",
    hovedNivaa: "LAV",
    beskrivelse: "Ekstremt lav ballflukt / flat stinger under kraftig motvind",
  },
  LOW_MEDIUM: {
    label: "Low-Medium",
    hovedNivaa: "LAV",
    beskrivelse: "Lav penetrerende flukt med normal fremdrift",
  },
  LOW_HIGH: {
    label: "Low-High",
    hovedNivaa: "LAV",
    beskrivelse: "Lav utgang med stigende toppunkt",
  },
  MEDIUM_LOW: {
    label: "Medium-Low",
    hovedNivaa: "MEDIUM",
    beskrivelse: "Moderat flat standardsving for kontroll",
  },
  MEDIUM_MEDIUM: {
    label: "Medium-Medium (Standard)",
    hovedNivaa: "MEDIUM",
    beskrivelse: "Standard nøytral svinghøyde for valgt kølle",
  },
  MEDIUM_HIGH: {
    label: "Medium-High",
    hovedNivaa: "MEDIUM",
    beskrivelse: "Høyere standardsving for mykere landing",
  },
  HIGH_LOW: {
    label: "High-Low",
    hovedNivaa: "HOY",
    beskrivelse: "Høy utgang med flatere toppunkt",
  },
  HIGH_MEDIUM: {
    label: "High-Medium",
    hovedNivaa: "HOY",
    beskrivelse: "Høy ballbane for å stoppe raskt på green",
  },
  HIGH_HIGH: {
    label: "High-High (Høyest)",
    hovedNivaa: "HOY",
    beskrivelse: "Maksimal høyde / tårnhøyde over hindringer med myk landing",
  },
};

// ============================================================================
// 7. Svingposisjoner: P1.0 til P10.0 med 10 underposisjoner per hovedposisjon
// ============================================================================

export type HovedPosisjonNummer = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PosisjonsInfo = {
  kode: string; // f.eks. "P1.0", "P1.1", ... "P10.0"
  hovedP: HovedPosisjonNummer;
  underIndex: number; // 0 til 9 (P10 har kun 0)
  navn: string;
  fokus: string;
};

const HOVEDPOSISJON_NAVN: Record<HovedPosisjonNummer, string> = {
  1: "Setup / Adresse",
  2: "Takeaway (kølle parallel med bakken)",
  3: "Baksving (venstre arm parallel)",
  4: "Topp av baksving (turn, tilt & wrist)",
  5: "Nedsving start (venstre arm parallel)",
  6: "Delivery (kølle parallel i nedsving)",
  7: "Treffpunkt / Impact",
  8: "Gjennomsving (kølle parallel etter treff)",
  9: "Release (høyre arm parallel med bakken)",
  10: "Full finish & balanse",
};

const UNDERPOSISJON_DATA: Record<HovedPosisjonNummer, { navn: string; fokus: string }[]> = {
  1: [
    { navn: "P1.0 Grunnoppstilling", fokus: "Helhetlig adresseposisjon og atletisk balanse" },
    { navn: "P1.1 Fotstilling og bredde", fokus: "Stabilt fundament tilpasset køllelengde" },
    { navn: "P1.2 Vektfordeling og balanse", fokus: "50/50 eller 60/40 trykk over midtfot" },
    { navn: "P1.3 Ryggvinkel og hoftebøy", fokus: "Korrekt hoftevinkel uten krumming i korsrygg" },
    { navn: "P1.4 Armheng og rom til kropp", fokus: "Naturlig hengende armer fra skuldrene" },
    { navn: "P1.5 Grep og håndposisjon", fokus: "Nøytralt grep og hender rett foran ballen" },
    { navn: "P1.6 Skulderlinje og sikte", fokus: "Skuldre parallelle med mållinjen" },
    { navn: "P1.7 Hofte- og knefleksjon", fokus: "Myke knær for optimal bakkekraft" },
    { navn: "P1.8 Ballplassering", fokus: "Presis plassering i forhold til brystben og venstre hæl" },
    { navn: "P1.9 Sikte og trigger", fokus: "Visuelt sikte mot mål og igangsettingsbevegelse" },
  ],
  2: [
    { navn: "P2.0 Takeaway start", fokus: "Kølleskaft parallel med bakken og mållinje" },
    { navn: "P2.1 Køllebladets vinkel", fokus: "Køllebladet matcher ryggvinkelen (square to spine)" },
    { navn: "P2.2 Håndbane", fokus: "Hendene holdes innenfor køllehodet" },
    { navn: "P2.3 Brystrotasjon", fokus: "Tidlig overkroppsrotasjon som en enhet (one-piece)" },
    { navn: "P2.4 Venstre arm", fokus: "Utstrakt og rolig venstre arm uten bøying" },
    { navn: "P2.5 Høyre arm og albue", fokus: "Høyre albue forblir foran brystet" },
    { navn: "P2.6 Hoftebevegelse", fokus: "Minimal hofteforskyvning, stabil rotasjonsakse" },
    { navn: "P2.7 Trykkforskyvning", fokus: "Trykk starter å flytte seg mot høyre hæl" },
    { navn: "P2.8 Håndleddsvinkel", fokus: "Start på naturlig hengsling (hinge) uten roll" },
    { navn: "P2.9 Skaftbane", fokus: "Skaftet peker rett mot mållinjen" },
  ],
  3: [
    { navn: "P3.0 Venstre arm parallel", fokus: "Venstre arm i 90 grader mot mållinjen" },
    { navn: "P3.1 Skulderdreiing", fokus: "Minst 60-70 grader skulderdreiing etablert" },
    { navn: "P3.2 Hoftevinkel", fokus: "40-45 grader hoftevinkel med bevart kneknekk" },
    { navn: "P3.3 Håndleddsvinkel (cocking)", fokus: "Full 90 graders vinkel mellom arm og skaft" },
    { navn: "P3.4 Underarmrotasjon", fokus: "Nøytral rotasjon uten tidlig åpning av bladet" },
    { navn: "P3.5 Svingplan", fokus: "Køllepeker mot ballinjen eller rett innenfor" },
    { navn: "P3.6 Høyre ben stabilitet", fokus: "Trykket opptas på innsiden av høyre hæl" },
    { navn: "P3.7 Hodeposisjon", fokus: "Stabil hodehøyde og sentrert nakkeakse" },
    { navn: "P3.8 Hånddybde", fokus: "Hendene plassert over høyre skulderhøyde" },
    { navn: "P3.9 Trykkoverføring topp", fokus: "Maksimalt trykk i høyre fot før transisjon" },
  ],
  4: [
    { navn: "P4.0 Topp av baksving", fokus: "Full baksving fullført med maksimal oppspenning" },
    { navn: "P4.1 Brystrotasjon (turn)", fokus: "90+ grader full brystrotasjon" },
    { navn: "P4.2 Bekkentilt og rotasjon", fokus: "Bevaring av sideveis tilt mot målet" },
    { navn: "P4.3 Venstre håndledd", fokus: "Flatt håndledd (nøytral) for presis køllebladkontroll" },
    { navn: "P4.4 Køllebladvinkel topp", fokus: "Parallel med venstre underarm (square)" },
    { navn: "P4.5 Håndhøyde", fokus: "Høyde over høyre skulder tilpasset svingtype" },
    { navn: "P4.6 Høyre albueposisjon", fokus: "Albue peker skrått nedover, ikke flying" },
    { navn: "P4.7 Vekt og balanse på topp", fokus: "Klargjort for vektforskyvning før svingen snur" },
    { navn: "P4.8 Skaftretning", fokus: "Parallel med mållinjen uten å peke over (across line)" },
    { navn: "P4.9 Transisjons-trigger", fokus: "Underkropp starter nedsving mens hendene fullfører topp" },
  ],
  5: [
    { navn: "P5.0 Nedsving start", fokus: "Venstre arm parallel med bakken på vei ned" },
    { navn: "P5.1 Hofteskift mot venstre", fokus: "Lateralt skift og rotasjon mot venstre hæl" },
    { navn: "P5.2 Lateral sidebøy (side tilt)", fokus: "Høyre sidebøy opprettholder vinkelen mot ballen" },
    { navn: "P5.3 Bevaring av lag", fokus: "Skarp vinkel mellom venstre arm og skaft bevares" },
    { navn: "P5.4 Skafthelling (shallow)", fokus: "Køllen faller naturlig inn på svingplanet (shallowing)" },
    { navn: "P5.5 Håndbane nedover", fokus: "Hendene beveger seg mot fremre lår" },
    { navn: "P5.6 Bakkekraftreaksjon", fokus: "Aktivt trykk ned i underlaget for kraftutvikling" },
    { navn: "P5.7 Brystorientering", fokus: "Brystkassen holdes lukket mot målet lenger enn hoftene" },
    { navn: "P5.8 Hodeakse og høyde", fokus: "Hodet forblir stabilt bak ballen" },
    { navn: "P5.9 Bakkekraft vertikal", fokus: "Forberedelse til vertikalt fraspark" },
  ],
  6: [
    { navn: "P6.0 Delivery posisjon", fokus: "Kølleskaft parallel med bakken rett før impact" },
    { navn: "P6.1 Køllehodets bane", fokus: "Køllen kommer svakt fra innsiden (in-to-out/square)" },
    { navn: "P6.2 Åpen brystkasse", fokus: "Brystkassen 20-30 grader åpen mot målet" },
    { navn: "P6.3 Åpent bekken", fokus: "Hoftene 35-45 grader åpne mot målet" },
    { navn: "P6.4 Håndposisjon", fokus: "Hendene foran ballen med nøytral/fleksert håndledd" },
    { navn: "P6.5 Venstre håndledd (flexion)", fokus: "Lett buet (bowed) håndledd de-lofter køllen" },
    { navn: "P6.6 Face-to-path vinkel", fokus: "Køllebladet kontrollert i forhold til svingbanen" },
    { navn: "P6.7 Høyre albue kontakt", fokus: "Høyre albue tett foran høyre hoftekam" },
    { navn: "P6.8 Skafthelling", fokus: "Skaftet lener mot målet" },
    { navn: "P6.9 Treff-frigjøring", fokus: "Utsending av køllehodet med maksimal hastighet" },
  ],
  7: [
    { navn: "P7.0 Treffpunkt (Impact)", fokus: "Presist treffpunkt og overføring av energi til ballen" },
    { navn: "P7.1 Forward shaft lean", fokus: "Skaftet lener forover (5–10 grader med jern)" },
    { navn: "P7.2 Dynamisk loft", fokus: "Optimalisert for maksimal ballhastighet og spinn" },
    { navn: "P7.3 Køllebladvinkel", fokus: "Square mot ønsket startretning" },
    { navn: "P7.4 Attack angle", fokus: "Negativ for jern (-2 til -4), positiv for driver (+2 til +4)" },
    { navn: "P7.5 Low point", fokus: "Svingbuens laveste punkt 5–10 cm foran ballen med jern" },
    { navn: "P7.6 Kroppsåpning", fokus: "Klaring i hofter og skuldre for uhindret sving" },
    { navn: "P7.7 Vektfordeling treff", fokus: "80-90 % av trykket etablert på venstre hæl" },
    { navn: "P7.8 Hode bak ball", fokus: "Hodet forblir stabilt bak ballens opprinnelige posisjon" },
    { navn: "P7.9 Treffsted på slagflaten", fokus: "Sentrert treff i sweetspot for maksimal smash factor" },
  ],
  8: [
    { navn: "P8.0 Gjennomsving parallel", fokus: "Kølleskaft parallel med bakken etter treff" },
    { navn: "P8.1 Utgangsbane", fokus: "Køllehodet følger svingbuen mot venstre" },
    { navn: "P8.2 Køllebladrotasjon", fokus: "Køllebladet roterer naturlig uten overaktiv håndrulling" },
    { navn: "P8.3 Ekstensjon i armer", fokus: "Begge armer fullt utstrakte gjennom treffsonen" },
    { navn: "P8.4 Venstre ben ekstensjon", fokus: "Venstre ben strekkes ut for å absorbere bakkekraft" },
    { navn: "P8.5 Brystrotasjon gjennom", fokus: "Brystkassen peker godt forbi ballens posisjon" },
    { navn: "P8.6 Håndleddsfrigjøring", fokus: "Trygg og naturlig utløsning av lag" },
    { navn: "P8.7 Bekkenklaring", fokus: "Full rotasjon og hofteekstensjon mot målet" },
    { navn: "P8.8 Hodefrigjøring", fokus: "Hodet begynner å følge ballflukten naturlig" },
    { navn: "P8.9 Svingbueretning", fokus: "Jevn kurve opp i avslutningen" },
  ],
  9: [
    { navn: "P9.0 Høyre arm parallel", fokus: "Høyre arm parallel med bakken i oppsving" },
    { navn: "P9.1 Full armforlengelse", fokus: "Høyre arm peker rett mot målet med full ekstensjon" },
    { navn: "P9.2 Kroppshøyde (re-centering)", fokus: "Kroppen reiser seg naturlig opp i full høyde" },
    { navn: "P9.3 Høyre fot rotasjon", fokus: "Høyre fot oppe på tåspissen, sålen peker bakover" },
    { navn: "P9.4 Overkroppsrotasjon", fokus: "Brystet vender vinkelrett eller forbi målet" },
    { navn: "P9.5 Skafthelling release", fokus: "Køllen henger fritt på vei bak nakken" },
    { navn: "P9.6 Skuldre i balanse", fokus: "Skuldrene i vinkel over et oppreist bekken" },
    { navn: "P9.7 Blikk mot ball", fokus: "Øynene følger ballflukt og landing" },
    { navn: "P9.8 Hals- og nakkeavspenning", fokus: "Avspente skuldre uten spenninger i nakke" },
    { navn: "P9.9 Overgang til finish", fokus: "Bevegelsen avsluttes jevnt uten bråstopp" },
  ],
  10: [
    { navn: "P10.0 Full finish og balanse", fokus: "Full oppreist avslutning, 100 % vekt på venstre fot, holdt i 3 sekunder" },
  ],
};

// Generer komplett katalog over alle 91 posisjoner
export const ALLE_POSISJONER: PosisjonsInfo[] = (function () {
  const liste: PosisjonsInfo[] = [];
  for (let p = 1 as HovedPosisjonNummer; p <= 10; p = (p + 1) as HovedPosisjonNummer) {
    const underListe = UNDERPOSISJON_DATA[p] ?? [];
    for (let u = 0; u < underListe.length; u++) {
      const data = underListe[u];
      const kode = `P${p}.${u}`;
      liste.push({
        kode,
        hovedP: p,
        underIndex: u,
        navn: data.navn,
        fokus: data.fokus,
      });
    }
  }
  return liste;
})();

export const POSISJON_KART = new Map<string, PosisjonsInfo>(
  ALLE_POSISJONER.map((p) => [p.kode, p]),
);

export function finnPosisjonsInfo(kode: string): PosisjonsInfo | undefined {
  return POSISJON_KART.get(kode);
}

// ============================================================================
// 8. Teknisk Arbeidsoppgave (PositionTask) — Struktur med før/etter og referanse
// ============================================================================

export type ForEtterSammenligning = {
  forBildeUrl: string;
  etterBildeUrl: string;
  beskrivelse?: string;
};

export type LaeringstrappRepetisjonsMaal = {
  // Trinn 1: Foran speil (tørrsving)
  speilLavFartReps: number;
  speilAutoReps: number;

  // Trinn 2: Matte inn i nett (ballkontakt uten utfallsangst)
  nettLavFartReps: number;
  nettAutoReps: number;

  // Trinn 3: Range / treningsfelt (med full ballflukt og radar/TrackMan)
  rangeFullFartReps: number;

  // Trinn 4: Banespill / simulator (under press og varierte spillsituasjoner)
  baneSpillReps: number;
};

export type TekniskPosisjonsOppgave = {
  id: string;
  posisjonKode: string; // f.eks. "P3.4"
  overskrift: string;
  beskrivelse: string;

  // Media
  bildeUrl?: string;
  videoUrl?: string;
  forEtter?: ForEtterSammenligning;
  referanseBildeUrl?: string; // Modellbilde / pro-referanse

  // Repetisjonsmål per trinn i læringstrappen
  repsMaal: LaeringstrappRepetisjonsMaal;

  // Faktisk gjennomførte repetisjoner
  repsLogget: {
    speilLavFart: number;
    speilAuto: number;
    nettLavFart: number;
    nettAuto: number;
    rangeFullFart: number;
    baneSpill: number;
  };
};

// ============================================================================
// 9. Golfslag-spesifikasjon (Kombinasjon av kølle, kurve og høyde)
// ============================================================================

export type SlagSpesifikasjon = {
  omraade: TrenOmraadeKode;
  kolle: GolfkolleKode;
  kurve: SlagkurveKode;
  kurveMeter?: number; // f.eks. 5 meter draw
  hoyde: SlaghoydeKode;
  tekniskPlanReferanse?: {
    posisjonKode: string; // f.eks. "P3.4"
    oppgaveTittel: string;
  };
};

export function formaterSlagBeskrivelse(s: SlagSpesifikasjon): string {
  const kolleNavn = GOLFKOLLE_LABEL[s.kolle];
  const hoydeNavn = SLAGHOYDE_INFO[s.hoyde].label;
  const kurveNavn = s.kurveMeter
    ? `${s.kurveMeter} m ${SLAGKURVE_LABEL[s.kurve].toLowerCase()}`
    : SLAGKURVE_LABEL[s.kurve];

  return `${kolleNavn} · ${hoydeNavn} · ${kurveNavn}`;
}
