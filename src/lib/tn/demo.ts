import type { Role } from "../wang/access";

/** Demospiller for hele Team Norway-flaten. Syntetisk. */
export const OYVIND = {
  id: "u-oyvind",
  navn: "Øyvind Royan",
  fornavn: "Øyvind",
  init: "ØR",
  age: 17,
  skole: "WANG Toppidrett Fredrikstad",
  gruppe: "TNG junior",
  foresatt: "Kari Royan",
  snitt: "74,2",
  pei: "11,4",
  wagr: "1 842",
  owgr: "—",
  laveste: "69",
  kildelinje: "Målt 14.09.2026 · protokoll v3 · AK",
} as const;

export const SQUAD = [
  OYVIND,
  { id: "u-nora", navn: "Nora Fjeld", fornavn: "Nora", init: "NF", age: 16, skole: "WANG Toppidrett Fredrikstad", gruppe: "TNG junior", foresatt: "Tone Fjeld", snitt: "76,1", pei: "12,8", wagr: "2 104", owgr: "—", laveste: "71", kildelinje: "Målt 14.09.2026 · protokoll v3 · AK" },
  { id: "u-sindre", navn: "Sindre Dahl", fornavn: "Sindre", init: "SD", age: 18, skole: "Glemmen vgs", gruppe: "TNG junior", foresatt: "", snitt: "72,8", pei: "10,1", wagr: "1 220", owgr: "—", laveste: "68", kildelinje: "Målt 14.09.2026 · protokoll v3 · AK" },
  { id: "u-jonas", navn: "Jonas Bratlie", fornavn: "Jonas", init: "JB", age: 17, skole: "St. Olav vgs", gruppe: "TNG junior", foresatt: "Per Bratlie", snitt: "75,4", pei: "12,0", wagr: "1 990", owgr: "—", laveste: "70", kildelinje: "Målt 14.09.2026 · protokoll v3 · AK" },
] as const;

export const TN_ACTORS: { role: Role; userId: string; label: string; hint: string }[] = [
  { role: "SS", userId: "u-anders", label: "Sportssjef", hint: "Anders K. · alle grupper" },
  { role: "TR", userId: "u-marte", label: "Trener", hint: "Marte Berg · TNG junior" },
  { role: "HJ", userId: "u-jonas-trener", label: "Hjelpetrener", hint: "Jonas Nilsen · innsyn" },
  { role: "SP", userId: "u-oyvind", label: "Spiller", hint: "Øyvind Royan · 17 år" },
  { role: "FO", userId: "u-kari-royan", label: "Foresatt", hint: "Kari Royan · ser Øyvind" },
  { role: "EL", userId: "u-per", label: "Ekstern leser", hint: "Kun aggregat" },
];

const MENY = [
  { isHeading: true, isItem: false, label: "Daglig", badge: "" },
  { isHeading: false, isItem: true, label: "Oversikt", badge: "" },
  { isHeading: false, isItem: true, label: "Workdesk", badge: "" },
  { isHeading: false, isItem: true, label: "Fellestesting", badge: "" },
  { isHeading: true, isItem: false, label: "Uttak", badge: "" },
  { isHeading: false, isItem: true, label: "Uttaksliste", badge: "2" },
  { isHeading: false, isItem: true, label: "Rangliste", badge: "" },
  { isHeading: true, isItem: false, label: "Skoler", badge: "" },
  { isHeading: false, isItem: true, label: "Skoleoversikt", badge: "4" },
  { isHeading: true, isItem: false, label: "Kommunikasjon", badge: "" },
  { isHeading: false, isItem: true, label: "Gruppeposter", badge: "3" },
  { isHeading: true, isItem: false, label: "Data", badge: "" },
  { isHeading: false, isItem: true, label: "Turneringer", badge: "" },
  { isHeading: true, isItem: false, label: "Administrasjon", badge: "" },
  { isHeading: false, isItem: true, label: "Trenere og tilgang", badge: "" },
];

function row(p: (typeof SQUAD)[number], extra: Record<string, unknown> = {}) {
  return {
    navn: p.navn,
    init: p.init,
    skole: p.skole,
    meta: `${p.age} år · ${p.skole}`,
    title: p.navn,
    tittel: p.navn,
    label: p.navn,
    tekst: p.navn,
    tall: p.pei,
    verdi: p.pei,
    kilde: p.kildelinje,
    kildelinje: p.kildelinje,
    status: "Åpen",
    merke: "Lest",
    action: "Åpne",
    handling: "Åpne",
    ...extra,
  };
}

const DEKNING = [
  { label: "Komplett profil", tall: "4" },
  { label: "Delvis profil", tall: "3" },
  { label: "Samtykket, ingen data", tall: "2" },
  { label: "Ikke samtykket", tall: "2" },
];

const KREVER = [
  { title: "Øyvind Royan · 7 målinger venter på attestering", meta: "Målt 14.09.2026 · Clubhead speed v2 · AK", action: "Attester" },
  { title: "Øyvind Royan har ikke svart på høstsamlingen", meta: "Frist 01.10 · Høstsamling Fornebu", action: "Purr" },
  { title: "Uttak til NM junior mangler bekreftelse fra Øyvind", meta: "Sendt 12.09 · 4 av 6 har svart", action: "Se uttak" },
  { title: "Kari Royan må bekrefte deling med TNG", meta: "Forespørsel sendt 12.08", action: "Følg opp" },
];

const TABS = [
  { label: "Oversikt", aktiv: true },
  { label: "Samling", aktiv: false },
  { label: "Uttak", aktiv: false },
  { label: "Poster", aktiv: false },
  { label: "Mer", aktiv: false },
];

const SHARED: Record<string, unknown> = {
  meny: MENY,
  meny2: MENY,
  dekning: DEKNING,
  dekning2: DEKNING,
  krever: KREVER,
  krever2: KREVER,
  kreverMac: KREVER,
  tabs: TABS,
  tabs2: TABS,
  tabs3: TABS,
  tabs4: TABS,
  tabsTom: TABS,
  testperiode: [
    { navn: "Clubhead speed", andel: "12 av 14" },
    { navn: "Putt Gate", andel: "9 av 14" },
    { navn: "Benkpress", andel: "Øyvind 4×4 · 4 av 14" },
  ],
  samlinger: [
    { dag: "12", mnd: "OKT", navn: "Høstsamling Fornebu", meta: "Øyvind Royan uttatt · 11 bekreftet · Oslo GK" },
    { dag: "07", mnd: "NOV", navn: "Testdag TN-batteri Q4", meta: "Uke 45 · sted ikke satt" },
    { dag: "28", mnd: "NOV", navn: "Fysisk samling Fredrikstad", meta: "Med WANG Vg2 · Øyvind påmeldt" },
  ],
  poster: [
    { tittel: "Øyvind Royan — uttakskriterier vintersamling", meta: "ANDERS K. · 16.09", lest: "12/14", avsender: "Anders K.", init: "AK", tid: "16.09", til: "TNG junior", merke: "Lest", tekst: "Øyvind Royan: bekreft oppmøte søndag 06.10 kl. 05.30, Gardermoen.", harVedlegg: true, vedlegg: [{ type: "PDF", navn: "Uttakskriterier.pdf", storrelse: "240 kB" }] },
    { tittel: "Reiseinfo Fornebu", meta: "MARTE B. · 15.09", lest: "9/14", avsender: "Marte Berg", init: "MB", tid: "15.09", til: "TNG junior + foresatte", merke: "3 mangler", tekst: "Fly, hotell og dagsplan. Kari Royan er mottaker for Øyvind.", harVedlegg: true, vedlegg: [{ type: "PDF", navn: "Fornebu-dagsplan.pdf", storrelse: "180 kB" }] },
    { tittel: "Egentrening uke 38 og 39", meta: "MARTE B. · 12.09", lest: "13/14", avsender: "Marte Berg", init: "MB", tid: "12.09", til: "TNG junior", merke: "Lest", tekst: "Øyvind: innspill 100–150 m og putt 0–3 fot.", harVedlegg: false, vedlegg: [] },
  ],
  rader: SQUAD.map((p, i) =>
    row(p, {
      k1: i === 0 ? "Stabil i innspill 100–150 m" : "Delvis dekning",
      k1kilde: p.kildelinje,
      k2: i === 0 ? "PEI nærspill 11,4" : `PEI nærspill ${p.pei}`,
      k2kilde: p.kildelinje,
      k3: i === 0 ? "Prosess: møter øktplanen" : "Prosess: avvent",
      k3kilde: "Vurdering · Marte Berg · 16.09.2026",
      sist: "16.09.2026",
      handling: i === 0 ? "Åpen" : "Åpne",
      apen: i === 0,
      celler: [{ navn: p.pei }, { navn: p.snitt }, { navn: "mål" }],
      band: [{ navn: "uke 40" }],
      valg: [{ navn: "1" }, { navn: "2" }, { navn: "3" }, { navn: "4" }],
    }),
  ),
  spillere: SQUAD.map((p) => row(p)),
  spillereMac: SQUAD.map((p) => row(p)),
  dager: [
    { dag: "Fredag", okter: [{ navn: "Range · putt 0–3 fot" }, { navn: "Bane · 9 hull" }] },
    { dag: "Lørdag", okter: [{ navn: "Fys · vedlikehold" }] },
  ],
  koRader: [row(OYVIND, { status: "I kø" })],
  resRader: [row(OYVIND, { verdi: "11,4", kilde: OYVIND.kildelinje })],
  omrader: [
    { navn: "Nærspill", rader: [{ navn: "PEI nærspill v3", meta: "Øyvind 11,4" }] },
    { navn: "Innspill", rader: [{ navn: "Innspill 100–150 m", meta: "Øyvind" }] },
    { navn: "Fysisk", rader: [{ navn: "Benkpress", meta: "4×4" }] },
  ],
  versjoner: [{ navn: "v3", meta: "Låst 14.09.2026 · Anders K." }, { navn: "v2", meta: "Arkivert 02.05.2026" }],
  brukere: [{ navn: "TNG junior" }, { navn: "WANG Fredrikstad Vg2" }],
  attest: [{ navn: "Vitne", meta: "Mangler på Øyvind Royan" }],
  filtre: [{ label: "Alle" }, { label: "Nærspill" }, { label: "Innspill" }],
  trakt: [{ navn: "Sendt", tall: "2" }, { navn: "Åpnet", tall: "1" }, { navn: "Fullført", tall: "0" }],
  kanaler: [{ navn: "E-post" }, { navn: "SMS" }],
  grupper: [{ navn: "TNG junior" }],
  runder: [{ navn: "Runde 1", meta: "Øyvind · 73" }, { navn: "Runde 2", meta: "71" }],
  belegg: [{ navn: "Resultatlenke", meta: "Mangler — raden er utkast" }],
  begrensninger: [{ navn: "Kan aldri forveksles med GolfBox", meta: "Merke: lagt inn selv" }],
  handlinger: [{ label: "Bilde" }, { label: "Fil" }, { label: "Lenke" }],
  mottakere: [{ navn: "Øyvind Royan", meta: "Kari Royan (foresatt) i mottakerlinjen" }],
  vedleggValg: [{ label: "PDF" }, { label: "Bilde" }],
  reisedok: [{ navn: "Pass Øyvind Royan", meta: "Gyldig" }],
  mineGrupper: [
    { navn: "TNG junior", meta: "14 spillere · Øyvind Royan" },
    { navn: "WANG Fredrikstad Vg2", meta: "Øyvind Royan" },
  ],
  skallregler: [
    { nr: "01", tittel: "Egen flate", tekst: "Team Norway er aldri under AgencyOS." },
    { nr: "02", tittel: "Avgrenset utsnitt", tekst: "Du ser bare gruppene du er trener for." },
    { nr: "03", tittel: "Samtykke", tekst: "Målinger på Øyvind synes her bare med samtykke fra Kari Royan." },
  ],
  organisasjoner: [
    { navn: "Team Norway Golf", rolle: "Sportssjef", merke: "Aktiv" },
    { navn: "WANG Toppidrett", rolle: "Trener", merke: "" },
  ],
  brytere: [
    { navn: "Tester og resultater", meta: "På · satt av Kari Royan 01.09.2026", punkter: [{ tekst: "PEI nærspill" }, { tekst: "GolfBox-runder" }] },
    { navn: "Komplett profil", meta: "Av · ikke virksom", punkter: [{ tekst: "IUP" }, { tekst: "FYS-logg" }] },
  ],
  deles: [{ navn: "PEI nærspill 11,4", meta: OYVIND.kildelinje }],
  delesIkke: [{ navn: "Navn i NGF-skoleliste", meta: "Ikke samtykket" }],
  regler: [{ navn: "Modul på", meta: "Landslag" }],
  referanse: [{ navn: "Tour-median PEI", meta: "9,8" }],
  megRader: [
    { navn: "Bekreft Fornebu", meta: "Venter på meg · Øyvind Royan" },
    { navn: "Sett mål innspill 100–150 m", meta: "Frist uke 40" },
    { navn: "Last opp test", meta: "Putt 0–3 fot" },
  ],
  trenerRader: [
    { navn: "IUP-samtale uke 40", meta: "Marte Berg · Øyvind Royan" },
    { navn: "Attester Clubhead speed", meta: "Målt 14.09.2026" },
  ],
  nivaer: [{ navn: "Ung 13–15" }, { navn: "Junior –19" }, { navn: "Amatør 19–24" }, { navn: "Pro 21–" }],
  kategorier: [{ navn: "Teknisk" }, { navn: "Golfslag" }, { navn: "Fysisk" }, { navn: "Mentalt" }, { navn: "Strategisk" }, { navn: "Sosialt" }, { navn: "Turnering" }],
  sporsmal: [
    { navn: "Jeg møter øktplanen", valg: [{ navn: "1" }, { navn: "2" }, { navn: "3" }, { navn: "4" }] },
    { navn: "Jeg eier nærspillet", valg: [{ navn: "1" }, { navn: "2" }, { navn: "3" }, { navn: "4" }] },
  ],
};

const FALLBACK_LIST = SQUAD.map((p) => row(p));

export function dataFor(_screen: string): Record<string, unknown> {
  return new Proxy(SHARED, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      if (prop in target) return target[prop];
      return FALLBACK_LIST;
    },
  });
}

export function applyDemoCopy(html: string): string {
  return html
    .replaceAll("../../assets/logo/team-norway-golf.png", "/tn/team-norway-golf.png")
    .replaceAll("../assets/logo/team-norway-golf.png", "/tn/team-norway-golf.png")
    .replaceAll("Emma Hovden", "Øyvind Royan")
    .replaceAll("Emmas", "Øyvinds")
    .replaceAll("Emma (16)", "Øyvind (17)")
    .replaceAll("Marit Hovden", "Kari Royan")
    .replaceAll("Ingrid Vestby", "Øyvind Royan")
    .replaceAll("Amalie Vik", "Nora Fjeld")
    .replaceAll(">Elev<", ">Spiller<")
    .replaceAll(" elev", " spiller")
    .replaceAll("Elev ", "Spiller ")
    .replaceAll("session", "økt")
    .replaceAll("Session", "Økt")
    .replaceAll("kortspill", "nærspill")
    .replaceAll("Kortspill", "Nærspill");
}
