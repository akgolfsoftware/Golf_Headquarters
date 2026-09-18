export const COACH = {
  name: "Sofie Aas",
  role: "Coach · AK Golf",
};

export const PLAYER = {
  id: "mina",
  name: "Mina Løken",
  hcp: "8,2",
  club: "Onsøy GK",
  coach: "Sofie Aas",
};

export const STALL = [
  { id: "mina", name: "Mina Løken", hcp: "8,2", next: "I dag 16:00 · nærspill", flag: "2 avvik belastning" },
  { id: "iver", name: "Iver Sandnes", hcp: "1,4", next: "I morgen 09:00 · runde", flag: "Ingen økt siden 4. sept" },
  { id: "jonas", name: "Jonas Five", hcp: "12,1", next: "I dag 12:30 · teknikk", flag: null },
  { id: "nora-berg", name: "Nora Berg", hcp: "4,1", next: "Ons 16:00 · nærspill", flag: "JENTER 16 · GFGK · WANG" },
  { id: "emil", name: "Emil Berg", hcp: "6,0", next: "Lør 10:00 · simulering", flag: null },
] as const;

export const TODAY_PLAYER = {
  id: "okt-mina-38",
  title: "Nærspill 30 m",
  place: "Kortbane · Onsøy",
  time: "16:00–17:00",
  status: "planlagt" as const,
  focus: "Landingssone 4 m · lav ballflukt",
  drills: [
    { id: "d1", name: "Chip 30 m til 4 m-sone", dose: "12 forsøk", form: "slag" },
    { id: "d2", name: "Putting 2,1 m inn", dose: "3 × 8", form: "serie" },
    { id: "d3", name: "Bunker kort", dose: "2 × 6", form: "serie" },
  ],
};

export const WEEK_PLAN = [
  { day: "Man 15.09", title: "Putting · tempo", time: "17:00", status: "gjennomført" },
  { day: "Ons 17.09", title: "Nærspill 30 m", time: "16:00", status: "planlagt" },
  { day: "Fre 19.09", title: "Belastning · styrke", time: "07:00", status: "foreslått-flytt" },
  { day: "Lør 20.09", title: "Runde · 9 hull", time: "10:00", status: "planlagt" },
];

export const SG = [
  { cat: "Putting", value: "+0,31", tone: "ok" as const },
  { cat: "Approach", value: "−0,18", tone: "svak" as const },
  { cat: "Around", value: "+0,04", tone: "ok" as const },
  { cat: "Tee", value: "—", tone: "ukjent" as const },
  { cat: "OTT", value: "−0,11", tone: "svak" as const },
];

export const GOALS = [
  {
    id: "mal-1",
    title: "Approach fra 100–125 m",
    start: "−0,32",
    now: "−0,18",
    target: "0,00",
    kind: "MÅLT",
  },
  {
    id: "mal-2",
    title: "HCP under 7",
    start: "9,4",
    now: "8,2",
    target: "6,9",
    kind: "ESTIMAT",
  },
];

export const ROUNDS = [
  { id: "R-6201", date: "12.09.2026", course: "Onsøy GK", score: 78, toPar: "+6", status: "klar" },
  { id: "R-6194", date: "04.09.2026", course: "Hankø GK", score: 81, toPar: "+9", status: "korrigert" },
  { id: "R-6188", date: "28.08.2026", course: "Onsøy GK", score: null, toPar: "—", status: "ufullstendig" },
];

export const SCORECARD = [
  { hole: 1, par: 4, score: 5, putts: 2, fir: false },
  { hole: 2, par: 3, score: 3, putts: 1, fir: null },
  { hole: 3, par: 5, score: 5, putts: 2, fir: true },
  { hole: 4, par: 4, score: 4, putts: 1, fir: true },
  { hole: 5, par: 4, score: 6, putts: 3, fir: false },
  { hole: 6, par: 3, score: 4, putts: 2, fir: null },
  { hole: 7, par: 4, score: 4, putts: 2, fir: true },
  { hole: 8, par: 5, score: 5, putts: 2, fir: true },
  { hole: 9, par: 4, score: 4, putts: 1, fir: false },
];

export const DRILLS = [
  { id: "ØV-2105", name: "Chip 30 m til 4 m-sone", pyramid: "Ferdighet", area: "Nærspill", motor: "Kontakt", load: "Lav", press: "Lav" },
  { id: "ØV-1188", name: "Putting 2,1 m inn", pyramid: "Ferdighet", area: "Putting", motor: "Tempo", load: "Lav", press: "Høy" },
  { id: "ØV-4401", name: "Styrke hofte · unilateral", pyramid: "Fysisk", area: "FYS", motor: "—", load: "Høy", press: "Lav" },
  { id: "ØV-3302", name: "Startlinje driver", pyramid: "Teknikk", area: "Tee", motor: "Ansikt", load: "Middels", press: "Middels" },
];

export const WEEK_BLOCKS = [
  { id: "b1", day: "Man", start: "17:00", end: "18:00", title: "Putting tempo", player: "Mina Løken", place: "Studio 1", pub: "publisert" },
  { id: "b2", day: "Ons", start: "16:00", end: "17:00", title: "Nærspill 30 m", player: "Mina Løken", place: "Kortbane", pub: "utkast" },
  { id: "b3", day: "Fre", start: "07:00", end: "08:00", title: "Belastning styrke", player: "Mina Løken", place: "Fys", pub: "konflikt" },
  { id: "b4", day: "Fre", start: "12:30", end: "13:20", title: "Teknikk", player: "Jonas Five", place: "Studio 2", pub: "publisert" },
  { id: "b5", day: "Lør", start: "10:00", end: "12:00", title: "Runde 9 hull", player: "Mina Løken", place: "Onsøy", pub: "plan" },
];

export const THREADS = [
  { id: "TR-7101", kind: "Spiller", from: "Mina Løken", preview: "Kan vi flytte fredag hvis styrken blir for tett?", time: "i dag 09:40", unread: true },
  { id: "TR-7104", kind: "Foresatt", from: "Kari Løken", preview: "Samtykke til deling av rundevideo.", time: "i går", unread: true },
  { id: "TR-7099", kind: "System", from: "AgenticOS", preview: "Utkast uke 38 · Mina venter godkjenning.", time: "i går", unread: false },
];

export const CADDIE_QUEUE = [
  { id: "CD-8401", title: "Tilbakemelding etter runde · Iver Sandnes", sub: "Utkast fra AI · ikke sendt", tone: "advarsel" as const },
  { id: "CD-8404", title: "Ukeplan uke 38 · Mina Løken", sub: "Flytter én belastende økt", tone: "haste" as const },
  { id: "CD-8390", title: "Øktoppskrift · Nærspill 30 m", sub: "Venter siden i går 16:40", tone: "advarsel" as const },
];

export const RUNS = [
  { id: "KJ-102", name: "Belastningsanalyse · GFGK-stigen", state: "kjører", started: "11:19", wrote: false },
  { id: "KJ-098", name: "Ukeplan Mina Løken", state: "venter", started: "09:12", wrote: false },
  { id: "KJ-091", name: "Oppsummering Iver · runde", state: "ferdig", started: "08:02", wrote: false },
];

export const SOURCES = [
  { name: "Egne runder", status: "koblet", detail: "14 runder · sist 12.09" },
  { name: "TrackMan", status: "delvis", detail: "1 økt uten klubb-mapping" },
  { name: "DataGolf", status: "koblet", detail: "Proffreferanse 2026" },
  { name: "Public player-id", status: "ikke-koblet", detail: "—" },
];

export const COURSES = [
  { id: "onsøy", name: "Onsøy GK", holes: 18, geo: "komplett", tee: true, green: true },
  { id: "hankø", name: "Hankø GK", holes: 18, geo: "mangler green 12", tee: true, green: false },
  { id: "hvaler", name: "Hvaler GK", holes: 9, geo: "—", tee: false, green: false },
];

export const BAG = [
  { club: "Driver", source: "TrackMan", loft: "9,0°", chosen: true },
  { club: "3-wood", source: "manuell", loft: "15°", chosen: true },
  { club: "4-hybrid", source: "—", loft: "—", chosen: false },
  { club: "Jern 7", source: "TrackMan", loft: "34°", chosen: true },
  { club: "SW 54", source: "manuell", loft: "54°", chosen: true },
];

export const CHALLENGES = [
  { id: "UTF-4407", title: "12 putter fra 2 m", group: "GFGK 3", ends: "søn 21.09", joined: true },
  { id: "UTF-4391", title: "Approach-sone 100–125", group: "AK Academy", ends: "—", joined: false },
];

export const NOTICES = [
  { id: "v1", title: "Ukeplan uke 38 er ikke publisert ennå", body: "Sofie har et utkast. Du ser den ikke før den er godkjent.", read: false },
  { id: "v2", title: "Runde 12.09 er lagret", body: "78 slag · Onsøy. Korrigering mulig til 19.09.", read: true },
];

export const AXES = {
  pyramid: "Ferdighet",
  area: "Nærspill",
  motor: "Kontakt",
  load: "Lav",
  press: "Lav",
};

export const UNKNOWN = "—";
