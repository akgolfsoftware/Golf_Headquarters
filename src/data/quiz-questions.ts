/**
 * Golf-statistikk quiz-spørsmål
 * 10 hardkodede spørsmål basert på PGA Tour og internasjonal golfstatistikk.
 */

export interface QuizChoice {
  tekst: string;
  korrekt: boolean;
}

export interface QuizSporsmal {
  id: number;
  sporsmaal: string;
  valg: QuizChoice[];
  forklaring: string;
  kilde: string;
  kategori: "OTT" | "APP" | "ARG" | "PUTT" | "GENERELT";
}

export const QUIZ_SPORSMAL: QuizSporsmal[] = [
  {
    id: 1,
    sporsmaal: "Hvor stor andel av 3-meters putter synker PGA Tour-snittet?",
    valg: [
      { tekst: "65%", korrekt: false },
      { tekst: "82%", korrekt: true },
      { tekst: "94%", korrekt: false },
      { tekst: "75%", korrekt: false },
    ],
    forklaring:
      "Faktisk 82% — selv proffer bommer 1 av 5 fra 3 meter. Amatører tror ofte tallet er høyere.",
    kilde: "PGA Tour ShotLink 2024",
    kategori: "PUTT",
  },
  {
    id: 2,
    sporsmaal: "Hvor langt driver gjennomsnittlig PGA Tour-spiller i 2024?",
    valg: [
      { tekst: "285 yds", korrekt: false },
      { tekst: "295 yds", korrekt: true },
      { tekst: "310 yds", korrekt: false },
      { tekst: "320 yds", korrekt: false },
    ],
    forklaring:
      "295 yards i snitt på PGA Tour 2024. Bryson DeChambeau og Cameron Champ topper over 320.",
    kilde: "PGA Tour Driving Distance 2024",
    kategori: "OTT",
  },
  {
    id: 3,
    sporsmaal: "Hvilken SG-kategori er mest forutsigbar fra år til år?",
    valg: [
      { tekst: "SG: Putting", korrekt: false },
      { tekst: "SG: Off the Tee", korrekt: false },
      { tekst: "SG: Approach", korrekt: true },
      { tekst: "SG: Around Green", korrekt: false },
    ],
    forklaring:
      "Approach-spillet er mest forutsigbart — jernspill er en svært trenat ferdighet med høy konsistens mellom sesonger.",
    kilde: "Broadie: Every Shot Counts (2014)",
    kategori: "APP",
  },
  {
    id: 4,
    sporsmaal: "Hva er den gjennomsnittlige fairway-treffprosenten på PGA Tour?",
    valg: [
      { tekst: "52%", korrekt: false },
      { tekst: "57%", korrekt: true },
      { tekst: "63%", korrekt: false },
      { tekst: "70%", korrekt: false },
    ],
    forklaring:
      "57% — proffer treffer under 2 av 3 fairways i snitt. Nøyaktighet er en avveining mot distanse.",
    kilde: "PGA Tour Driving Accuracy 2024",
    kategori: "OTT",
  },
  {
    id: 5,
    sporsmaal: "Hvor mange runder logger en norsk amatørgolfer i gjennomsnitt per år?",
    valg: [
      { tekst: "14 runder", korrekt: false },
      { tekst: "20 runder", korrekt: false },
      { tekst: "28 runder", korrekt: true },
      { tekst: "40 runder", korrekt: false },
    ],
    forklaring:
      "28 runder er norsk amatørsnitt ifølge NGF-data. Aktive turneringsspillere logger ofte 40+.",
    kilde: "Norges Golfforbund, 2025",
    kategori: "GENERELT",
  },
  {
    id: 6,
    sporsmaal: "Hva er PGA Tour-snittet for greener i regulasjon (GIR)?",
    valg: [
      { tekst: "58%", korrekt: false },
      { tekst: "65%", korrekt: true },
      { tekst: "72%", korrekt: false },
      { tekst: "80%", korrekt: false },
    ],
    forklaring:
      "65% GIR er PGA Tour-snittet — det betyr ca. 11-12 greener per runde. Topp-spillere ligger over 70%.",
    kilde: "PGA Tour Greens in Regulation 2024",
    kategori: "APP",
  },
  {
    id: 7,
    sporsmaal: "Hva er gjennomsnittlig antall putter per runde på PGA Tour?",
    valg: [
      { tekst: "26.2", korrekt: false },
      { tekst: "28.4", korrekt: true },
      { tekst: "30.1", korrekt: false },
      { tekst: "32.0", korrekt: false },
    ],
    forklaring:
      "28.4 putter per runde i snitt. Brandt Snedeker er historisk lavest, under 27 i toppsesonger.",
    kilde: "PGA Tour Putting Average 2024",
    kategori: "PUTT",
  },
  {
    id: 8,
    sporsmaal: "Hvor stor prosentandel av bunker-slagene ender 'up and down' på PGA Tour?",
    valg: [
      { tekst: "45%", korrekt: false },
      { tekst: "54%", korrekt: true },
      { tekst: "63%", korrekt: false },
      { tekst: "72%", korrekt: false },
    ],
    forklaring:
      "54% sand save på Tour. Seve Ballesteros-niveau var over 70% — det var en legendarisk ferdighet.",
    kilde: "PGA Tour Sand Save Percentage 2024",
    kategori: "ARG",
  },
  {
    id: 9,
    sporsmaal: "Hva er Viktor Hovlands beste offisielle SG-sesong (total)?",
    valg: [
      { tekst: "+1.8 per runde", korrekt: false },
      { tekst: "+2.4 per runde", korrekt: true },
      { tekst: "+3.1 per runde", korrekt: false },
      { tekst: "+0.9 per runde", korrekt: false },
    ],
    forklaring:
      "Viktor Hovland leverte over +2.4 SG totalt i sin beste sesong — som plasserte ham i topp 5 på world rankings.",
    kilde: "PGA Tour ShotLink / DataGolf",
    kategori: "GENERELT",
  },
  {
    id: 10,
    sporsmaal: "Hva er turneringsfeilvariansen per runde på PGA Tour? (slag som ikke skyldes ferdighet)",
    valg: [
      { tekst: "±0.5 slag", korrekt: false },
      { tekst: "±1.2 slag", korrekt: false },
      { tekst: "±2.0 slag", korrekt: true },
      { tekst: "±3.5 slag", korrekt: false },
    ],
    forklaring:
      "Forskning viser ±2 slag variasjon per runde som skyldes tilfeldig variasjon, ikke ferdighet. Derfor trenger man mange runder for pålitelig SG.",
    kilde: "Broadie & Rendleman, Journal of Quantitative Analysis in Sports",
    kategori: "GENERELT",
  },
];

export const KATEGORI_LABELS: Record<QuizSporsmal["kategori"], string> = {
  OTT: "Off the Tee",
  APP: "Approach",
  ARG: "Kort spill",
  PUTT: "Putting",
  GENERELT: "Generelt",
};
