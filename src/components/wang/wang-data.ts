/**
 * WANG Toppidrett Golf — Datamodell og syntetiske kildedata
 * Basert på Claude Design «WANG Golf UI prototype» (6cfa623c).
 * Kun syntetiske data — ingen ekte PII.
 */

export interface WangElev {
  id: string;
  navn: string;
  trinn: "VG1" | "VG2" | "VG3";
  klasse: string; // Alias for trinn
  campus: string;
  alder: number;
  kjonn: "g" | "j";
  klubb: string;
  delingsStatus: "delt" | "venter" | "invitert" | "ikke";
  trenere: string[];
  fodselsdato: string;
  snittscore: number;
  hcp: string;
  handicap: string; // Alias for hcp
  fravaerProsent: number;
  oppmoteAntall: number;
  etterlevelseProsent: number;
  planlagtMinutter: number;
  gjennomfortMinutter: number;
  etterlevelseSiste4Uker: {
    planlagtTimer: number;
    gjennomfortTimer: number;
    prosent: number;
  };
  trengerOppfolging?: boolean;
  oppfolgingAarsak?: string;
  iup: {
    sesongMaal: string;
    hovedFokus: string[];
    tiltak: string[];
    nesteEvaluering: string;
  };
}

export interface WangOkt {
  id: string;
  dato: string;
  dag: string;
  tid: string;
  tittel: string;
  type: "morgen" | "skole" | "klubb" | "egen" | "turn" | "fravaer";
  sted: string;
  trener: string;
  fokus: string;
  antallPameldt: number;
  totaltElever: number;
  status: "Planlagt" | "Pågår" | "Gjennomført" | "Avlyst";
}

export interface WangFysiskTest {
  id: string;
  navn: string;
  enhet: string;
  kategori: string;
  beskrivelse: string;
  nasjonaltSnitt: number;
  nasjonalTopp: number;
  resultater: Record<string, number>;
}

export interface WangTestResultat {
  id: string;
  testId?: string;
  testNavn: string;
  protokoll: string;
  elevId: string;
  elevNavn: string;
  verdi: string | number;
  enhet: string;
  dato: string;
  godkjent?: boolean;
  registrertAv: string;
  status: "Ført" | "Kontrollert" | "Avvist";
  notat?: string;
}

export interface WangTurnering {
  id: string;
  navn: string;
  dato: string;
  bane: string;
  par: number;
  serie: string;
  format: string;
  status: "kommende" | "gjennomfort" | "paagaar";
  pamelteElever: string[];
  resultater?: {
    plassering: number;
    elevNavn: string;
    runder: number[];
    totalScore: number;
    tilPar: string;
  }[];
}

export interface WangMelding {
  id: string;
  tittel: string;
  avsender: string;
  rolle: string;
  mottakerType: "gruppe" | "elev" | "forelder";
  mottakerNavn: string;
  opprettetDato: string;
  innhold: string;
  status: "kladd" | "publisert";
  lestAvAntall: number;
  totaltMottakere: number;
}

export interface WangKandidat {
  id: string;
  navn: string;
  klubb: string;
  handicap: number;
  onsketCampus: string;
  status: "sokt" | "vurdert" | "provespill" | "intervju" | "tilbudt" | "takket_ja";
  notat?: string;
}

export interface WangSkjermDef {
  id: string;
  navn: string;
  kort?: string;
  fane?: string;
  omraade: "idag" | "trening" | "tester" | "konkurranse" | "meldinger" | "elever" | "admin" | "system";
  fil?: string;
  hash?: string;
  r?: string;
  sti?: string;
  dg?: string;
  under?: string;
  arkiv?: boolean;
  som?: string;
  aapen?: boolean;
  skjul?: string[];
  roller: ("Sportssjef" | "Trener")[];
  beskrivelse?: string;
  ikon?: string;
  [key: string]: unknown;
}

export const WANG_ELEVER: WangElev[] = [
  {
    id: "emil",
    navn: "Emil Nilsen",
    trinn: "VG1",
    klasse: "VG1",
    campus: "Fredrikstad",
    alder: 16,
    kjonn: "g",
    klubb: "Fredrikstad GK",
    delingsStatus: "delt",
    trenere: ["Anders Kristiansen"],
    fodselsdato: "18.08.2010",
    snittscore: 76.8,
    hcp: "5,4",
    handicap: "5.4",
    fravaerProsent: 2.1,
    oppmoteAntall: 18,
    etterlevelseProsent: 94,
    planlagtMinutter: 1200,
    gjennomfortMinutter: 1128,
    etterlevelseSiste4Uker: {
      planlagtTimer: 80,
      gjennomfortTimer: 75,
      prosent: 94,
    },
    iup: {
      sesongMaal: "Topp 10 Srixon Tour U19",
      hovedFokus: ["Svinghastighet driver (+4 mph)", "Putting under 3 meter"],
      tiltak: ["Fysisk eksplosivitet trapbar 2x/uke", "Gate-drill putting 45 min/uke"],
      nesteEvaluering: "15.10.2026",
    },
  },
  {
    id: "ida",
    navn: "Ida Johansen",
    trinn: "VG1",
    klasse: "VG1",
    campus: "Fredrikstad",
    alder: 16,
    kjonn: "j",
    klubb: "Onsøy GK",
    delingsStatus: "delt",
    trenere: ["Anders Kristiansen"],
    fodselsdato: "19.08.2010",
    snittscore: 79.2,
    hcp: "8,1",
    handicap: "8.1",
    fravaerProsent: 4.5,
    oppmoteAntall: 17,
    etterlevelseProsent: 88,
    planlagtMinutter: 1100,
    gjennomfortMinutter: 968,
    etterlevelseSiste4Uker: {
      planlagtTimer: 72,
      gjennomfortTimer: 63,
      prosent: 88,
    },
    iup: {
      sesongMaal: "Stabil under 78 slag brutto",
      hovedFokus: ["Nærspill wedge 40-70m", "Mental rutine før slag"],
      tiltak: ["Clock-drill med 58 grader", "Pre-shot rutine 12 sekunder"],
      nesteEvaluering: "20.10.2026",
    },
  },
  {
    id: "marius",
    navn: "Marius Olsen",
    trinn: "VG1",
    klasse: "VG1",
    campus: "Fredrikstad",
    alder: 15,
    kjonn: "g",
    klubb: "Fredrikstad GK",
    delingsStatus: "venter",
    trenere: ["Anders Kristiansen"],
    fodselsdato: "15.09.2011",
    snittscore: 82.5,
    hcp: "11,2",
    handicap: "11.2",
    fravaerProsent: 12.0,
    oppmoteAntall: 14,
    etterlevelseProsent: 68,
    planlagtMinutter: 1000,
    gjennomfortMinutter: 680,
    etterlevelseSiste4Uker: {
      planlagtTimer: 64,
      gjennomfortTimer: 43,
      prosent: 68,
    },
    trengerOppfolging: true,
    oppfolgingAarsak: "Lav etterlevelse (68 %) og 12 % fravær siste 4 uker.",
    iup: {
      sesongMaal: "Etablere treningsrutine og redusere fravær",
      hovedFokus: ["Grunntrening og oppmøte", "Stabilitet i jernslag"],
      tiltak: ["Følge morgenøkter tirsdag/onsdag/fredag", "Ukentlig oppfølgingssamtale"],
      nesteEvaluering: "08.10.2026",
    },
  },
  {
    id: "thea",
    navn: "Thea Larsen",
    trinn: "VG1",
    klasse: "VG1",
    campus: "Fredrikstad",
    alder: 16,
    kjonn: "j",
    klubb: "Borre GK",
    delingsStatus: "invitert",
    trenere: ["Anders Kristiansen"],
    fodselsdato: "21.09.2010",
    snittscore: 78.4,
    hcp: "7,0",
    handicap: "7.0",
    fravaerProsent: 5.0,
    oppmoteAntall: 16,
    etterlevelseProsent: 82,
    planlagtMinutter: 1050,
    gjennomfortMinutter: 861,
    etterlevelseSiste4Uker: {
      planlagtTimer: 70,
      gjennomfortTimer: 57,
      prosent: 82,
    },
    iup: {
      sesongMaal: "Kvalifisere til Garmin Norgescup",
      hovedFokus: ["Lengdekontroll med putter", "Kjernestyrke"],
      tiltak: ["Lange putter 10-15 meter", "Planke og rotasjonsstyrke"],
      nesteEvaluering: "22.10.2026",
    },
  },
  {
    id: "sofie",
    navn: "Sofie Hansen",
    trinn: "VG2",
    klasse: "VG2",
    campus: "Fredrikstad",
    alder: 17,
    kjonn: "j",
    klubb: "Fredrikstad GK",
    delingsStatus: "delt",
    trenere: ["Anders Kristiansen"],
    fodselsdato: "10.05.2009",
    snittscore: 73.4,
    hcp: "1,2",
    handicap: "1.2",
    fravaerProsent: 1.5,
    oppmoteAntall: 20,
    etterlevelseProsent: 96,
    planlagtMinutter: 1400,
    gjennomfortMinutter: 1344,
    etterlevelseSiste4Uker: {
      planlagtTimer: 90,
      gjennomfortTimer: 86,
      prosent: 96,
    },
    iup: {
      sesongMaal: "Landslagsuttak Team Norway Junior",
      hovedFokus: ["SG Approach fra 120-160 meter", "Putting 1.5 - 3 meter"],
      tiltak: ["Trackman kombinasjonstrening tirsdager", "Putting green hastighetskontroll"],
      nesteEvaluering: "10.10.2026",
    },
  },
  {
    id: "mikkel",
    navn: "Mikkel Thon",
    trinn: "VG2",
    klasse: "VG2",
    campus: "Fredrikstad",
    alder: 17,
    kjonn: "g",
    klubb: "Onsøy GK",
    delingsStatus: "delt",
    trenere: ["Anders Kristiansen"],
    fodselsdato: "14.03.2009",
    snittscore: 74.8,
    hcp: "2,8",
    handicap: "2.8",
    fravaerProsent: 3.0,
    oppmoteAntall: 19,
    etterlevelseProsent: 91,
    planlagtMinutter: 1300,
    gjennomfortMinutter: 1183,
    etterlevelseSiste4Uker: {
      planlagtTimer: 85,
      gjennomfortTimer: 77,
      prosent: 91,
    },
    iup: {
      sesongMaal: "Topp 5 i Srixon Tour Order of Merit",
      hovedFokus: ["Driver fairwaytreff %", "Banestrategi par 5 hull"],
      tiltak: ["Fokus på ballhastighet 165 mph", "Scoringstaktikk på samlinger"],
      nesteEvaluering: "12.10.2026",
    },
  },
  {
    id: "celine",
    navn: "Celine Brovold",
    trinn: "VG3",
    klasse: "VG3",
    campus: "Fredrikstad",
    alder: 18,
    kjonn: "j",
    klubb: "Fredrikstad GK",
    delingsStatus: "delt",
    trenere: ["Anders Kristiansen"],
    fodselsdato: "04.01.2008",
    snittscore: 71.9,
    hcp: "+1,5",
    handicap: "+1.5",
    fravaerProsent: 1.0,
    oppmoteAntall: 20,
    etterlevelseProsent: 98,
    planlagtMinutter: 1500,
    gjennomfortMinutter: 1470,
    etterlevelseSiste4Uker: {
      planlagtTimer: 96,
      gjennomfortTimer: 94,
      prosent: 98,
    },
    iup: {
      sesongMaal: "Overgang til NCAA Div 1 College Golf",
      hovedFokus: ["Wedge matrix 50-100 meter", "Styrke og skadeforebygging"],
      tiltak: ["Wedgekalibrering ukentlig", "Skulderstabilitet 3x/uke"],
      nesteEvaluering: "14.10.2026",
    },
  },
];

export const WANG_OKTER: WangOkt[] = [
  {
    id: "okt-1",
    dato: "29.09.2026",
    dag: "Tirsdag",
    tid: "08:00–10:00",
    tittel: "Morgentrening Golfteknikk",
    type: "morgen",
    sted: "Simulator / Rangestudio",
    trener: "Anders Kristiansen",
    fokus: "Svingkapasitet og slagflatekontroll",
    antallPameldt: 7,
    totaltElever: 7,
    status: "Gjennomført",
  },
  {
    id: "okt-2",
    dato: "30.09.2026",
    dag: "Onsdag",
    tid: "08:00–10:00",
    tittel: "Fysisk trening: Maksstyrke Trapbar",
    type: "skole",
    sted: "Styrkerom WANG",
    trener: "Fysisk trener",
    fokus: "Eksplosiv kraft og rotasjonsstyrke",
    antallPameldt: 7,
    totaltElever: 7,
    status: "Gjennomført",
  },
  {
    id: "okt-3",
    dato: "02.10.2026",
    dag: "Fredag",
    tid: "08:00–10:00",
    tittel: "Morgentrening: Nærspill og TrackMan Combine",
    type: "morgen",
    sted: "Nærspillsområde / Studio",
    trener: "Anders Kristiansen",
    fokus: "Lengdekontroll 40–90 meter wedge",
    antallPameldt: 7,
    totaltElever: 7,
    status: "Planlagt",
  },
];

export const WANG_FYSISKE_TESTER: WangFysiskTest[] = [
  { id: "trapbar", navn: "Trapbar Markløft", enhet: "kg", kategori: "Maksstyrke", beskrivelse: "3RM Trapbar markløft målt i kg relativt til kroppsvekt.", nasjonaltSnitt: 140, nasjonalTopp: 200, resultater: { emil: 150, ida: 95, marius: 110, thea: 100, sofie: 115, mikkel: 165, celine: 130 } },
  { id: "kneboy", navn: "Knebøy", enhet: "kg", kategori: "Maksstyrke", beskrivelse: "3RM dyp knebøy med godkjent hoftevinkel.", nasjonaltSnitt: 110, nasjonalTopp: 160, resultater: { emil: 120, ida: 75, marius: 85, thea: 80, sofie: 90, mikkel: 135, celine: 105 } },
  { id: "benkpress", navn: "Benkpress", enhet: "kg", kategori: "Overkropp", beskrivelse: "3RM benkpress med stopp på brystet.", nasjonaltSnitt: 80, nasjonalTopp: 115, resultater: { emil: 85, ida: 50, marius: 60, thea: 52, sofie: 60, mikkel: 95, celine: 68 } },
  { id: "medball", navn: "Rotasjonskast Medisinball", enhet: "m", kategori: "Eksplosivitet", beskrivelse: "3 kg medisinball rotasjonskast for maksimal distanse.", nasjonaltSnitt: 12.5, nasjonalTopp: 17.5, resultater: { emil: 14.2, ida: 11.0, marius: 11.5, thea: 10.8, sofie: 12.4, mikkel: 15.6, celine: 13.5 } },
  { id: "cmj", navn: "Countermovement Jump (CMJ)", enhet: "cm", kategori: "Hopphøyde", beskrivelse: "Vertikalhopp målt med kraftplattform eller optojump.", nasjonaltSnitt: 42, nasjonalTopp: 58, resultater: { emil: 46, ida: 36, marius: 38, thea: 37, sofie: 41, mikkel: 50, celine: 44 } },
];

export const WANG_TEST_RESULTATER: WangTestResultat[] = [
  { id: "tr-1", testId: "trapbar", testNavn: "Trapbar Markløft", protokoll: "Toppidrett 2026", elevId: "sofie", elevNavn: "Sofie Hansen", verdi: "115", enhet: "kg", dato: "26.09.2026", registrertAv: "Anders Kristiansen", godkjent: true, status: "Kontrollert", notat: "Ny personlig rekord. Utmerket teknikk." },
  { id: "tr-2", testId: "medball", testNavn: "Rotasjonskast Medisinball", protokoll: "Toppidrett 2026", elevId: "sofie", elevNavn: "Sofie Hansen", verdi: "12.4", enhet: "m", dato: "26.09.2026", registrertAv: "Anders Kristiansen", godkjent: true, status: "Kontrollert" },
  { id: "tr-3", testId: "cmj", testNavn: "Countermovement Jump (CMJ)", protokoll: "Toppidrett 2026", elevId: "marius", elevNavn: "Marius Olsen", verdi: "38", enhet: "cm", dato: "25.09.2026", registrertAv: "Marius Olsen", godkjent: false, status: "Ført", notat: "Egenrapportert fra egentrening. Må verifiseres på kraftplattform." },
];

export const WANG_TURNERINGER: WangTurnering[] = [
  {
    id: "t1",
    navn: "Srixon Tour 7 — Holtsmark GK",
    dato: "12.–13. september 2026",
    bane: "Holtsmark Golfklubb",
    par: 72,
    serie: "Srixon Tour",
    format: "Slaggolf Brutto",
    status: "gjennomfort",
    pamelteElever: ["sofie", "mikkel", "celine", "emil"],
    resultater: [
      { plassering: 1, elevNavn: "Celine Brovold", runder: [70, 71], totalScore: 141, tilPar: "-3" },
      { plassering: 3, elevNavn: "Sofie Hansen", runder: [73, 72], totalScore: 145, tilPar: "+1" },
      { plassering: 5, elevNavn: "Mikkel Thon", runder: [74, 73], totalScore: 147, tilPar: "+3" },
    ],
  },
  {
    id: "t2",
    navn: "Garmin Norgescup Finale — Miklagard GK",
    dato: "19.–20. september 2026",
    bane: "Miklagard Golf",
    par: 72,
    serie: "Norgescup",
    format: "Slagspill Brutto",
    status: "gjennomfort",
    pamelteElever: ["celine", "sofie", "mikkel"],
    resultater: [
      { plassering: 2, elevNavn: "Celine Brovold", runder: [71, 70, 72], totalScore: 213, tilPar: "-3" },
      { plassering: 6, elevNavn: "Sofie Hansen", runder: [74, 73, 73], totalScore: 220, tilPar: "+4" },
    ],
  },
  {
    id: "t3",
    navn: "Nordic Golf League Kvalifisering",
    dato: "10.–12. oktober 2026",
    bane: "Kongsvingers Golfklubb",
    par: 72,
    serie: "Nordic Golf League",
    format: "Slagspill 54 hull",
    status: "kommende",
    pamelteElever: ["celine", "mikkel"],
  },
];

export const WANG_MELDINGER: WangMelding[] = [
  {
    id: "m-1",
    tittel: "Oppmøte morgentrening fredag 2. oktober",
    avsender: "Anders Kristiansen",
    rolle: "Sportssjef",
    mottakerType: "gruppe",
    mottakerNavn: "VG1 Golf Fredrikstad",
    opprettetDato: "28.09.2026 15:30",
    innhold: "Husk å ta med både joggesko til oppvarming og TrackMan-baller til testing av wedge-matrise. Vi starter presis 08:00.",
    status: "publisert",
    lestAvAntall: 6,
    totaltMottakere: 7,
  },
  {
    id: "m-2",
    tittel: "Evaluering av treningsuke og status IUP",
    avsender: "Anders Kristiansen",
    rolle: "Sportssjef",
    mottakerType: "elev",
    mottakerNavn: "Sofie Hansen",
    opprettetDato: "27.09.2026 18:00",
    innhold: "Veldig god innsats på nærspillsøkten i går. Se over delmålene i IUP før vi setter oss ned for samtalen neste tirsdag.",
    status: "publisert",
    lestAvAntall: 1,
    totaltMottakere: 1,
  },
  {
    id: "m-3",
    tittel: "Innkalling til foreldremøte høst 2026",
    avsender: "Anders Kristiansen",
    rolle: "Sportssjef",
    mottakerType: "forelder",
    mottakerNavn: "Foresatte VG1 Fredrikstad",
    opprettetDato: "20.09.2026 10:00",
    innhold: "Velkommen til høstens foreldremøte onsdag 14. oktober kl. 18:00 i auditorium B. Agenda: Årsplan, turneringsreise og skolekoordinering.",
    status: "publisert",
    lestAvAntall: 5,
    totaltMottakere: 7,
  },
];

export const WANG_KANDIDATER: WangKandidat[] = [
  { id: "kand-1", navn: "Kasper Strøm", klubb: "Moss & Rygge GK", handicap: 4.2, onsketCampus: "Fredrikstad", status: "vurdert", notat: "God ballhastighet, lovende jernspill." },
  { id: "kand-2", navn: "Linnea Vang", klubb: "Halden GK", handicap: 6.8, onsketCampus: "Fredrikstad", status: "sokt", notat: "Søknad mottatt." },
  { id: "kand-3", navn: "Tobias Lunde", klubb: "Bærum GK", handicap: 3.1, onsketCampus: "Oslo", status: "provespill", notat: "Kandidat til vurdering for Oslo og Fredrikstad." },
];

export const WANG_SKJERMER_KATALOG: WangSkjermDef[] = [
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-43",
    "navn": "Elever som trenger deg",
    "kort": "Trenger deg",
    "fane": "Trenger deg",
    "ikon": "ph-bell-simple",
    "hash": "trenger",
    "r": "trenger",
    "sti": "/team-wang/i-dag",
    "omraade": "idag"
  },
  {
    "id": "WANG-30",
    "navn": "Kalender og uke",
    "kort": "Kalender",
    "ikon": "ph-calendar-blank",
    "fil": "B10",
    "hash": "kalender",
    "r": "kalender",
    "sti": "/team-wang?fane=kalender",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "idag"
  },
  {
    "id": "WG-01",
    "navn": "Morgentrening og uke",
    "kort": "Uke",
    "ikon": "ph-sun-horizon",
    "fil": "B1",
    "hash": "uke",
    "r": "uke",
    "sti": "/team-wang",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "idag"
  },
  {
    "id": "WANG-12",
    "navn": "Ukessammendrag",
    "kort": "Uke",
    "ikon": "ph-newspaper",
    "fil": "B4",
    "hash": "uke",
    "r": "uke",
    "sti": "/team-wang/coach/ukessammendrag",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "idag"
  },
  {
    "id": "WANG-42",
    "navn": "Treningsoversikt",
    "kort": "Oversikt",
    "fane": "Oversikt",
    "ikon": "ph-chart-bar",
    "fil": "B17",
    "hash": "oversikt",
    "r": "oversikt",
    "sti": "/team-wang/trening",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-29",
    "navn": "Årsplan og periode",
    "kort": "Årsplan",
    "ikon": "ph-path",
    "fil": "B10",
    "hash": "trening",
    "r": "trening",
    "sti": "/team-wang?fane=trening",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-16",
    "navn": "Periodeplan",
    "kort": "Periode",
    "ikon": "ph-chart-bar-horizontal",
    "fil": "B6",
    "hash": "periode",
    "r": "periode",
    "sti": "/team-wang/plan/periode",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-17",
    "navn": "Månedsplan",
    "kort": "Måned",
    "ikon": "ph-calendar-dots",
    "fil": "B6",
    "hash": "maned",
    "r": "maned",
    "sti": "/team-wang/plan/maned",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-18",
    "navn": "Kalender og økt",
    "kort": "Økt",
    "ikon": "ph-calendar-check",
    "fil": "B6",
    "hash": "kalender",
    "r": "kalender",
    "sti": "/team-wang?fane=kalender&okt=[id]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-04",
    "navn": "Morgenøkter",
    "kort": "Morgenøkt",
    "ikon": "ph-sun",
    "fil": "B2",
    "hash": "morgen",
    "r": "morgen",
    "sti": "/team-wang/morgenokter",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WANG-38",
    "navn": "Oppmøte",
    "kort": "Oppmøte",
    "ikon": "ph-check-square",
    "fil": "B14",
    "hash": "oppmote",
    "r": "oppmote",
    "sti": "/team-wang/coach/oppmote",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "trening"
  },
  {
    "id": "WG-02",
    "navn": "IUP · Utgår 28.09",
    "kort": "IUP",
    "ikon": "ph-target",
    "fil": "B1",
    "hash": "iup",
    "r": "iup",
    "sti": "/team-wang/coach/iup/[elevId]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "under": "WANG-06",
    "utgar": "28.09.2026",
    "erstattet": "WANG-44",
    "omraade": "trening"
  },
  {
    "id": "WANG-06",
    "navn": "IUP-oversikt · Utgår 28.09",
    "kort": "IUP",
    "ikon": "ph-list-checks",
    "fil": "B2",
    "hash": "iup",
    "r": "iup",
    "sti": "/team-wang/iup",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "utgar": "28.09.2026",
    "erstattet": "WANG-44",
    "omraade": "trening"
  },
  {
    "id": "WG-03",
    "navn": "Fysiske tester",
    "kort": "Tester",
    "ikon": "ph-barbell",
    "fil": "B1",
    "hash": "tester",
    "r": "tester",
    "sti": "/team-wang/tester",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-08",
    "navn": "Testdag",
    "kort": "Testdag",
    "ikon": "ph-timer",
    "fil": "B3",
    "hash": "testdag",
    "r": "testdag",
    "sti": "/team-wang/coach/test/[id]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48",
    "navn": "Testbatteri",
    "kort": "Batteri",
    "ikon": "ph-list-checks",
    "hash": "oversikt",
    "r": "oversikt",
    "sti": "/team-wang/tester/batteri",
    "fane": "Batteri",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48A",
    "navn": "Testoppsett",
    "kort": "Oppsett",
    "ikon": "ph-sliders",
    "hash": "variant",
    "r": "variant",
    "sti": "/team-wang/tester/[test]",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48B",
    "navn": "Scorekort",
    "kort": "Scorekort",
    "ikon": "ph-note-pencil",
    "hash": "kort",
    "r": "kort",
    "sti": "/team-wang/tester/[test]/[spiller]",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-48C",
    "navn": "Testhistorikk",
    "kort": "Historikk",
    "ikon": "ph-clock-counter-clockwise",
    "hash": "hist",
    "r": "hist",
    "sti": "/team-wang/tester/historikk/[spiller]",
    "omraade": "tester"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B19",
    "id": "WANG-49",
    "navn": "Felles testdag",
    "kort": "Felles testdag",
    "ikon": "ph-users-three",
    "hash": "testdag",
    "r": "testdag",
    "sti": "/team-wang/tester/testdag/[id]",
    "fane": "Felles testdag",
    "omraade": "tester"
  },
  {
    "id": "WANG-37",
    "navn": "Testkø",
    "kort": "Testkø",
    "ikon": "ph-list-checks",
    "fil": "B14",
    "hash": "tester",
    "r": "tester",
    "sti": "/team-wang/coach/tester",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-22",
    "navn": "Testprotokoller",
    "kort": "Protokoller",
    "ikon": "ph-clipboard-text",
    "fil": "B8",
    "hash": "protokoll",
    "r": "protokoll",
    "sti": "/team-wang/protokoll",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-23",
    "navn": "Resultater per elev",
    "kort": "Tester",
    "ikon": "ph-chart-line-up",
    "fil": "B8",
    "hash": "tester",
    "r": "tester",
    "sti": "/team-wang/elev/[id]/tester",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-39",
    "navn": "Rangering",
    "kort": "Rangering",
    "ikon": "ph-ranking",
    "fil": "B14",
    "hash": "rangering",
    "r": "rangering",
    "sti": "/team-wang/coach/rangering",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "tester"
  },
  {
    "id": "WANG-10",
    "navn": "Turneringer",
    "kort": "Turneringer",
    "ikon": "ph-flag-pennant",
    "fil": "B4",
    "hash": "turneringer",
    "r": "turneringer",
    "sti": "/team-wang/turneringer",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-11",
    "navn": "Turneringsdetalj",
    "kort": "Detalj",
    "ikon": "ph-list-numbers",
    "fil": "B4",
    "hash": "turnering/nmj",
    "r": "turnering",
    "sti": "/team-wang/turnering/[id]",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "under": "WANG-10",
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-09",
    "navn": "Samlinger og uttak",
    "kort": "Samlinger",
    "ikon": "ph-airplane-tilt",
    "fil": "B3",
    "hash": "samlinger",
    "r": "samlinger",
    "sti": "/team-wang/samlinger",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-27",
    "navn": "Golfstatistikk",
    "kort": "Statistikk",
    "ikon": "ph-chart-bar",
    "fil": "B9",
    "hash": "statistikk",
    "r": "statistikk",
    "sti": "/team-wang/statistikk",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50",
    "navn": "DataGolf",
    "kort": "DataGolf",
    "ikon": "ph-chart-bar",
    "hash": "oversikt",
    "r": "oversikt",
    "sti": "/team-wang/konkurranse/datagolf",
    "dg": "DG-01",
    "fane": "DataGolf",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.02",
    "navn": "Spillerkatalog",
    "kort": "Spillerkatalog",
    "ikon": "ph-chart-line",
    "hash": "katalog",
    "r": "katalog",
    "sti": "/team-wang/konkurranse/datagolf/katalog",
    "dg": "DG-02",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.03",
    "navn": "Spillerprofil",
    "kort": "Spillerprofil",
    "ikon": "ph-chart-line",
    "hash": "profil",
    "r": "profil",
    "sti": "/team-wang/konkurranse/datagolf/profil",
    "dg": "DG-03",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.04",
    "navn": "Topplister",
    "kort": "Topplister",
    "ikon": "ph-chart-line",
    "hash": "topp",
    "r": "topp",
    "sti": "/team-wang/konkurranse/datagolf/topp",
    "dg": "DG-04",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.05",
    "navn": "Sammenligning",
    "kort": "Sammenligning",
    "ikon": "ph-chart-line",
    "hash": "sammen",
    "r": "sammen",
    "sti": "/team-wang/konkurranse/datagolf/sammen",
    "dg": "DG-05",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.06",
    "navn": "Innspill",
    "kort": "Innspill",
    "ikon": "ph-chart-line",
    "hash": "innspill",
    "r": "innspill",
    "sti": "/team-wang/konkurranse/datagolf/innspill",
    "dg": "DG-06",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.07",
    "navn": "Historikk",
    "kort": "Historikk",
    "ikon": "ph-chart-line",
    "hash": "hist",
    "r": "hist",
    "sti": "/team-wang/konkurranse/datagolf/hist",
    "dg": "DG-07",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.08",
    "navn": "Turneringskalender",
    "kort": "Turneringskalender",
    "ikon": "ph-chart-line",
    "hash": "kalender",
    "r": "kalender",
    "sti": "/team-wang/konkurranse/datagolf/kalender",
    "dg": "DG-08",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.09",
    "navn": "Turneringsanalyse",
    "kort": "Turneringsanalyse",
    "ikon": "ph-chart-line",
    "hash": "turnering",
    "r": "turnering",
    "sti": "/team-wang/konkurranse/datagolf/turnering",
    "dg": "DG-09",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.10",
    "navn": "Live",
    "kort": "Live",
    "ikon": "ph-chart-line",
    "hash": "live",
    "r": "live",
    "sti": "/team-wang/konkurranse/datagolf/live",
    "dg": "DG-10",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.11",
    "navn": "Modellanalyse",
    "kort": "Modellanalyse",
    "ikon": "ph-chart-line",
    "hash": "modell",
    "r": "modell",
    "sti": "/team-wang/konkurranse/datagolf/modell",
    "dg": "DG-11",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.12",
    "navn": "Bane og felt",
    "kort": "Bane og felt",
    "ikon": "ph-chart-line",
    "hash": "bane",
    "r": "bane",
    "sti": "/team-wang/konkurranse/datagolf/bane",
    "dg": "DG-12",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.13",
    "navn": "Trend og utvalg",
    "kort": "Trend og utvalg",
    "ikon": "ph-chart-line",
    "hash": "trend",
    "r": "trend",
    "sti": "/team-wang/konkurranse/datagolf/trend",
    "dg": "DG-13",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.14",
    "navn": "Datautforsker",
    "kort": "Datautforsker",
    "ikon": "ph-chart-line",
    "hash": "utforsker",
    "r": "utforsker",
    "sti": "/team-wang/konkurranse/datagolf/utforsker",
    "dg": "DG-14",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.15",
    "navn": "Kilde og dekning",
    "kort": "Kilde og dekning",
    "ikon": "ph-chart-line",
    "hash": "kilde",
    "r": "kilde",
    "sti": "/team-wang/konkurranse/datagolf/kilde",
    "dg": "DG-15",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.16",
    "navn": "Fra analyse til tiltak",
    "kort": "Fra analyse til tiltak",
    "ikon": "ph-chart-line",
    "hash": "tiltak",
    "r": "tiltak",
    "sti": "/team-wang/konkurranse/datagolf/tiltak",
    "dg": "DG-16",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B20",
    "id": "WANG-50.17",
    "navn": "Spesialistdata",
    "kort": "Spesialistdata",
    "ikon": "ph-chart-line",
    "hash": "spesialist",
    "r": "spesialist",
    "sti": "/team-wang/konkurranse/datagolf/spesialist",
    "dg": "DG-17",
    "under": "WANG-50",
    "omraade": "konkurranse"
  },
  {
    "id": "WANG-13",
    "navn": "Gruppeposter",
    "kort": "Poster",
    "ikon": "ph-megaphone-simple",
    "fil": "B5",
    "hash": "poster",
    "r": "poster",
    "sti": "/team-wang/gruppe/poster",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-14",
    "navn": "Post til elev",
    "kort": "Post",
    "ikon": "ph-envelope-simple",
    "fil": "B5",
    "hash": "post",
    "r": "post",
    "sti": "/team-wang/post",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-15",
    "navn": "Foreldremøte",
    "kort": "Møte",
    "ikon": "ph-users-four",
    "fil": "B5",
    "hash": "mote",
    "r": "mote",
    "sti": "/team-wang/foreldremote",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-21",
    "navn": "Dokumenter",
    "kort": "Dokumenter",
    "ikon": "ph-folder-simple",
    "fil": "B7",
    "hash": "dokumenter",
    "r": "dokumenter",
    "sti": "/team-wang/dokumenter",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "meldinger"
  },
  {
    "id": "WANG-07",
    "navn": "Elever",
    "kort": "Elever",
    "ikon": "ph-address-book",
    "fil": "B18",
    "hash": "elever",
    "r": "elever",
    "sti": "/team-wang/elever",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-44",
    "navn": "Elevprofil",
    "kort": "Profil",
    "ikon": "ph-user-circle",
    "hash": "profil/sofie",
    "r": "profil",
    "sti": "/team-wang/elev/[id]?fane=plan|stats|tester|iup|samtaler|turneringer",
    "under": "WANG-07",
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-45",
    "navn": "Fireukerssjekk",
    "kort": "Sjekk",
    "ikon": "ph-clipboard-text",
    "hash": "sjekk",
    "r": "sjekk",
    "sti": "/team-wang/fireukerssjekk",
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-46",
    "navn": "Forslag til elev",
    "kort": "Forslag",
    "ikon": "ph-paper-plane-tilt",
    "hash": "forslag",
    "r": "forslag",
    "sti": "/team-wang/forslag",
    "omraade": "elever"
  },
  {
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "fil": "B18",
    "id": "WANG-47",
    "navn": "Skjema og kildeversjoner",
    "kort": "Kilder",
    "ikon": "ph-books",
    "hash": "kilde",
    "r": "kilde",
    "sti": "/team-wang/kilder",
    "fane": "Kilder",
    "omraade": "elever"
  },
  {
    "id": "WG-05",
    "navn": "Trenerflate",
    "kort": "Trener",
    "ikon": "ph-users-three",
    "fil": "B1",
    "hash": "coach",
    "r": "coach",
    "sti": "/team-wang/coach",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WANG-05",
    "navn": "Skole og fravær",
    "kort": "Fravær",
    "ikon": "ph-graduation-cap",
    "fil": "B2",
    "hash": "fravaer",
    "r": "fravaer",
    "sti": "/team-wang/skole-fravaer",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WG-04",
    "navn": "Prøveplan",
    "kort": "Prøveplan",
    "ikon": "ph-exam",
    "fil": "B1",
    "hash": "prove",
    "r": "prove",
    "sti": "/team-wang/proveplan",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WANG-20",
    "navn": "Inviter elev",
    "kort": "Inviter",
    "ikon": "ph-user-plus",
    "fil": "B7",
    "hash": "inviter",
    "r": "inviter",
    "sti": "/team-wang/tilgang/inviter",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "elever"
  },
  {
    "id": "WANG-19",
    "navn": "Trenere og roller",
    "kort": "Trenere",
    "ikon": "ph-identification-badge",
    "fil": "B7",
    "hash": "trenere",
    "r": "trenere",
    "sti": "/team-wang/tilgang/trenere",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-34",
    "navn": "Samtykkeoversikt",
    "kort": "Samtykke",
    "ikon": "ph-handshake",
    "fil": "B18",
    "hash": "samtykke",
    "r": "samtykke",
    "sti": "/team-wang/admin/samtykke",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-26",
    "navn": "Timeplanføring",
    "kort": "Timeplan",
    "ikon": "ph-calendar-plus",
    "fil": "B9",
    "hash": "timeplan",
    "r": "timeplan",
    "sti": "/team-wang/skole/timeplan",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-31",
    "navn": "Rekruttering",
    "kort": "Rekruttering",
    "ikon": "ph-magnifying-glass",
    "fil": "B12",
    "hash": "rekruttering",
    "r": "rekruttering",
    "sti": "/team-wang/rekruttering",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-32",
    "navn": "Plasser",
    "kort": "Plasser",
    "ikon": "ph-chair",
    "fil": "B12",
    "hash": "plasser",
    "r": "plasser",
    "sti": "/team-wang/plasser",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-33",
    "navn": "Koordinering mellom skoler",
    "kort": "Koordinering",
    "ikon": "ph-arrows-left-right",
    "fil": "B12",
    "hash": "koordinering",
    "r": "koordinering",
    "sti": "/team-wang/rekruttering/koordinering",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "admin"
  },
  {
    "id": "WANG-28",
    "navn": "Hjem",
    "kort": "Hjem",
    "ikon": "ph-house",
    "fil": "B10",
    "hash": "hjem",
    "r": "hjem",
    "sti": "/team-wang",
    "roller": [],
    "arkiv": true,
    "som": "sofie",
    "aapen": true,
    "omraade": "system"
  },
  {
    "id": "WANG-36",
    "navn": "Foresattflaten",
    "kort": "Foresatt",
    "ikon": "ph-users",
    "fil": "B13",
    "hash": "foresatt",
    "r": "foresatt",
    "sti": "/team-wang/foresatt",
    "roller": [],
    "arkiv": true,
    "som": "kari",
    "omraade": "system"
  },
  {
    "id": "WANG-25",
    "navn": "Skolefanen",
    "kort": "Skole",
    "ikon": "ph-student",
    "fil": "B9",
    "hash": "skole",
    "r": "skole",
    "sti": "/team-wang?fane=skole",
    "roller": [],
    "arkiv": true,
    "som": "sofie",
    "omraade": "system"
  },
  {
    "id": "WANG-35",
    "navn": "Helse og belastning",
    "kort": "Helse",
    "ikon": "ph-first-aid-kit",
    "fil": "B13",
    "hash": "helse",
    "r": "helse",
    "sti": "/team-wang/helse",
    "roller": [],
    "arkiv": true,
    "som": "silje",
    "omraade": "system"
  },
  {
    "id": "WANG-24",
    "navn": "Logg inn og tilstander",
    "kort": "Logg inn",
    "ikon": "ph-sign-in",
    "fil": "B8",
    "hash": "logg-inn",
    "r": "logg-inn",
    "sti": "/team-wang/logg-inn",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "system"
  },
  {
    "id": "WANG-00",
    "navn": "Skjermoversikt",
    "kort": "Oversikt",
    "ikon": "ph-list-bullets",
    "fil": "B0",
    "hash": "",
    "r": "",
    "sti": "/team-wang/skjermer",
    "roller": [
      "Sportssjef",
      "Trener"
    ],
    "omraade": "system"
  },
  {
    "id": "WANG-41",
    "navn": "Gjennomgang",
    "kort": "Gjennomgang",
    "ikon": "ph-chat-circle-text",
    "fil": "B16",
    "hash": "",
    "r": "gjennomgang",
    "sti": "/team-wang/gjennomgang",
    "roller": [
      "Sportssjef"
    ],
    "omraade": "system"
  }
];
