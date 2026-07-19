// GFGK Junior & Elite — alt innhold for micrositen (gfgkjunior.no).
// Kilde: Claude Design-prosjektet «GFGK Junior og Elite» (forside, Treningsplaner,
// Gruppeplan). Hardkodet v1 — kobles mot AgencyOS/DB i et senere steg.
// Ukeplan-kanon: tirsdag/torsdag (Treningsplaner + Gruppeplan i designet);
// forsidens avvikende ukedata er bevisst ikke brukt.

export type GruppeKey = "U10" | "U13" | "U15" | "U19";
export type OktType = "teknikk" | "spill" | "fysisk" | "lek";
export type FaseNavn = "Evaluering" | "Grunnperiode" | "Spesialisering" | "Turnering";

export const GRUPPE_KEYS: GruppeKey[] = ["U10", "U13", "U15", "U19"];

export interface Gruppe {
  key: GruppeKey;
  navn: string;
  alder: string;
  kat: string;
  motto: string;
  beskrivelse: string;
  okter: string;
  timer: string;
  farge: string; // topplinje/kategorimarkør
}

export const GRUPPER: Record<GruppeKey, Gruppe> = {
  U10: {
    key: "U10",
    navn: "Junior Mini",
    alder: "6–10 år",
    kat: "kategori L–K",
    motto: "Lek, bevegelse og mestringsfølelse",
    beskrivelse:
      "Introduksjon til golf gjennom lek, bevegelse og mestringsfølelse. Spillerne utvikler koordinasjon, motorikk og kjærlighet til spillet i et trygt og inkluderende miljø.",
    okter: "1 økt/uke",
    timer: "1–2 timer/uke",
    farge: "var(--gfgk-gold)",
  },
  U13: {
    key: "U13",
    navn: "Junior Basis",
    alder: "11–13 år",
    kat: "kategori J–I",
    motto: "Bred motorisk utvikling og spilleglede",
    beskrivelse:
      "Bred motorisk utvikling, teknisk grunnlag og spilleglede. Spillerne lærer golfens grunnleggende ferdigheter gjennom variert og lekpreget trening i et trygt miljø.",
    okter: "2 økter/uke",
    timer: "3–5 timer/uke",
    farge: "var(--gfgk-teal)",
  },
  U15: {
    key: "U15",
    navn: "Junior Utvikling",
    alder: "13–15 år",
    kat: "kategori H–G",
    motto: "Spesialisering, konkurranse og gode vaner",
    beskrivelse:
      "Målrettet trening med vekt på spesialisering, konkurranseerfaring og mental styrke. Spillerne utvikler sin egen spillestil og bygger gode treningsvaner.",
    okter: "2 økter/uke",
    timer: "2–5 timer/uke",
    farge: "var(--gfgk-red)",
  },
  U19: {
    key: "U19",
    navn: "Junior Elite",
    alder: "16–19 år",
    kat: "kategori F–E",
    motto: "Helhetlig satsing mot elite- og collegegolf",
    beskrivelse:
      "Helhetlig satsing for spillere med ambisjoner om elite- og collegegolf. Individualisert trening, periodisering og profesjonell tilnærming til alle aspekter av spillet.",
    okter: "2 økter/uke",
    timer: "2–5 timer/uke",
    farge: "var(--gfgk-ink)",
  },
};

// ---- Treningspyramiden (forside) ----
export const PYRAMIDE_OMRADER = ["Turnering", "Spill", "Golfslag", "Teknikk", "Fysisk"] as const;

export const PYRAMIDE: Record<GruppeKey, Record<(typeof PYRAMIDE_OMRADER)[number], number>> = {
  U10: { Turnering: 0, Spill: 20, Golfslag: 15, Teknikk: 35, Fysisk: 30 },
  U13: { Turnering: 0, Spill: 10, Golfslag: 20, Teknikk: 45, Fysisk: 25 },
  U15: { Turnering: 10, Spill: 20, Golfslag: 25, Teknikk: 30, Fysisk: 15 },
  U19: { Turnering: 20, Spill: 25, Golfslag: 25, Teknikk: 15, Fysisk: 15 },
};

export const PYRAMIDE_FARGER: Record<(typeof PYRAMIDE_OMRADER)[number], string> = {
  Turnering: "var(--gfgk-red)",
  Spill: "var(--green-500)",
  Golfslag: "var(--gfgk-teal)",
  Teknikk: "var(--gfgk-gold)",
  Fysisk: "var(--n-400)",
};

// ---- Økt-typer ----
export const TYPE_FARGER: Record<OktType, { fg: string; bg: string; dot: string }> = {
  teknikk: { fg: "var(--teal-700)", bg: "var(--teal-100)", dot: "var(--gfgk-teal)" },
  spill: { fg: "var(--green-600)", bg: "var(--green-100)", dot: "var(--green-500)" },
  fysisk: { fg: "var(--red-600)", bg: "var(--red-100)", dot: "var(--gfgk-red)" },
  lek: { fg: "var(--gold-700)", bg: "var(--gold-100)", dot: "var(--gfgk-red)" },
};

// ---- Ukeplan (kanon: tirsdag/torsdag) ----
export interface UkeOkt {
  wd: number; // JS getDay(): 0 = søndag
  dag: string;
  tid: string;
  type: OktType;
  sted: string;
  beskrivelse: string;
}

export const UKEPLAN: Record<GruppeKey, UkeOkt[]> = {
  U10: [
    { wd: 2, dag: "Tirsdag", tid: "17:00–18:00", type: "lek", sted: "Treningsområdet", beskrivelse: "Lekbasert trening – motorikk, putting og korte slag" },
    { wd: 4, dag: "Torsdag", tid: "17:00–18:00", type: "spill", sted: "Korthullsbanen", beskrivelse: "Spill og aktiviteter med foreldre velkommen" },
  ],
  U13: [
    { wd: 2, dag: "Tirsdag", tid: "16:00–18:00", type: "teknikk", sted: "Driving Range", beskrivelse: "Teknisk trening – fullt sving, nærspill" },
    { wd: 4, dag: "Torsdag", tid: "16:00–18:00", type: "spill", sted: "Golfbanen", beskrivelse: "Spill på banen – kursmanagement, regler" },
  ],
  U15: [
    { wd: 2, dag: "Tirsdag", tid: "16:00–18:00", type: "teknikk", sted: "Driving Range", beskrivelse: "Teknisk trening med video – sving og nærspill" },
    { wd: 4, dag: "Torsdag", tid: "16:00–18:00", type: "spill", sted: "Golfbanen", beskrivelse: "Banespill – scoring, strategi og mental trening" },
  ],
  U19: [
    { wd: 2, dag: "Tirsdag", tid: "16:00–18:30", type: "teknikk", sted: "Driving Range", beskrivelse: "Individualisert teknisk trening etter utviklingsplan" },
    { wd: 4, dag: "Torsdag", tid: "16:00–18:30", type: "spill", sted: "Golfbanen", beskrivelse: "Banespill, turneringsforberedelse og fysisk avslutning" },
  ],
};

export const UKE_NOTATER: Record<GruppeKey, string> = {
  U10: "I tillegg: fri lek på treningsområdet når en voksen er med. Alt utstyr lånes av klubben.",
  U13: "Egentrening anbefales: 1–2 økter/uke på range eller korthullsbane med venner.",
  U15: "Egentrening etter individuell plan: 2–3 økter/uke. Turneringshelger kan erstatte torsdagsøkten.",
  U19: "I tillegg egentrening 3–4 økter/uke etter årsplan, og individuelle timer med trener. WANG-elever følger egen skoleplan.",
};

// ---- Sesongfaser ----
export const FASE_FARGER: Record<FaseNavn, string> = {
  Evaluering: "var(--n-400)",
  Grunnperiode: "var(--gfgk-teal)",
  Spesialisering: "var(--gfgk-gold)",
  Turnering: "var(--gfgk-red)",
};

export const FASE_BADGE: Record<FaseNavn, { fg: string; bg: string }> = {
  Evaluering: { fg: "var(--n-600)", bg: "var(--n-100)" },
  Grunnperiode: { fg: "var(--teal-700)", bg: "var(--teal-100)" },
  Spesialisering: { fg: "var(--gold-700)", bg: "var(--gold-100)" },
  Turnering: { fg: "var(--red-600)", bg: "var(--red-100)" },
};

export const FASE_TEKST: Record<FaseNavn, string> = {
  Evaluering: "testuker, samtaler og planlegging",
  Grunnperiode: "teknikk og fysisk grunnlag innendørs",
  Spesialisering: "ferdighetene tas med ut på banen",
  Turnering: "full sesong – prestasjon og restitusjon",
};

// Fase per kalendermåned (indeks 0 = januar)
export const MANED_FASE: FaseNavn[] = [
  "Grunnperiode", "Grunnperiode", "Grunnperiode",
  "Spesialisering", "Spesialisering",
  "Turnering", "Turnering", "Turnering", "Turnering",
  "Evaluering", "Evaluering",
  "Grunnperiode",
];

export const PERIODE_NOKKEL: Record<FaseNavn, string[]> = {
  Evaluering: [
    "Standardiserte tester av slag, nærspill og fysikk",
    "Utviklingssamtale med spiller og foresatte",
    "Ny individuell plan legges for kommende sesong",
  ],
  Grunnperiode: [
    "Bygge og stabilisere teknikk innendørs",
    "Fysisk grunntrening: styrke og mobilitet",
    "Video og ferdighetsmål styrer arbeidet",
  ],
  Spesialisering: [
    "Overføre teknikk fra range til bane",
    "Nærspill og scoring under økende press",
    "Regelforståelse og kursstrategi",
  ],
  Turnering: [
    "Prestere i turnering og lagspill",
    "Periodisert belastning og restitusjon",
    "Mentale rutiner og evaluering etter runder",
  ],
};

// ---- Årsplan per gruppe (fire perioder) ----
export interface ArsFase {
  navn: FaseNavn;
  mnd: string;
  timer: string;
  fokus: string;
}

export const ARS_FASER: Record<GruppeKey, ArsFase[]> = {
  U10: [
    { navn: "Evaluering", mnd: "Okt–Nov", timer: "1 t/uke", fokus: "Enkle ferdighetsleker som «test» – merkeprøver og samtale med foresatte." },
    { navn: "Grunnperiode", mnd: "Nov–Mar", timer: "1 t/uke", fokus: "Innendørs lek og motorikk annenhver uke – kaste, balansere, rulle og putte." },
    { navn: "Spesialisering", mnd: "Apr–Mai", timer: "1–2 t/uke", fokus: "Ut på treningsområdet – korte slag, putting og de første hullene på korthullsbanen." },
    { navn: "Turnering", mnd: "Jun–Okt", timer: "2 t/uke", fokus: "Spill, aktivitetsdager og uhøytidelige minikonkurranser med premie til alle." },
  ],
  U13: [
    { navn: "Evaluering", mnd: "Okt–Nov", timer: "2–3 t/uke", fokus: "Testuke med standardiserte tester, utviklingssamtale og plan for vinteren." },
    { navn: "Grunnperiode", mnd: "Nov–Mar", timer: "3 t/uke", fokus: "Teknikk i simulator med video, fysisk grunntrening og ferdighetsmål inne." },
    { navn: "Spesialisering", mnd: "Apr–Jun", timer: "4 t/uke", fokus: "Overføring til bane – nærspillstasjoner, banespill og regelforståelse." },
    { navn: "Turnering", mnd: "Jun–Okt", timer: "4–5 t/uke", fokus: "Klubbturneringer og Narvesen Tour for de som vil – spilleglede først." },
  ],
  U15: [
    { navn: "Evaluering", mnd: "Okt–Nov", timer: "3 t/uke", fokus: "Fullt testbatteri (slag, nærspill, fysikk), individuell utviklingsplan settes." },
    { navn: "Grunnperiode", mnd: "Nov–Mar", timer: "4 t/uke", fokus: "Teknisk ombygging med video (BUILD/STAB), styrke og mobilitet to økter/uke." },
    { navn: "Spesialisering", mnd: "Apr–Jun", timer: "5 t/uke", fokus: "TEST→TRANSFER: ferdigheter ut på banen med økende konkurranseintensitet." },
    { navn: "Turnering", mnd: "Jun–Okt", timer: "5 t/uke", fokus: "Narvesen Tour og lagmatcher – taktikk, restitusjon og prestasjonsrutiner." },
  ],
  U19: [
    { navn: "Evaluering", mnd: "Okt–Nov", timer: "4 t/uke", fokus: "TrackMan-screening, fysiske tester og sesongevaluering – ny årsplan per spiller." },
    { navn: "Grunnperiode", mnd: "Nov–Mar", timer: "6–8 t/uke", fokus: "Individualisert teknisk periode (BUILD/STAB), styrketrening og mental trening." },
    { navn: "Spesialisering", mnd: "Apr–Jun", timer: "8 t/uke", fokus: "TRANSFER mot turneringsform – banespill under press, scoring og strategi." },
    { navn: "Turnering", mnd: "Jun–Okt", timer: "8–10 t/uke", fokus: "Full turneringskalender (PERFORM) – periodisert belastning og restitusjon." },
  ],
};

// ---- Periodisering: fem treningsfaser per gruppe ----
export interface TreningsFase {
  kode: string;
  navn: string;
  pct: number;
  tekst: string;
}

export const TRENINGSFASER: Record<GruppeKey, TreningsFase[]> = {
  U10: [
    { kode: "LEK", navn: "Lek & motorikk", pct: 45, tekst: "Allsidig bevegelse – grunnlaget for alt som kommer senere." },
    { kode: "BUILD", navn: "Bygge", pct: 25, tekst: "Enkle tekniske grunnmønstre: grep, oppstilling, balanse." },
    { kode: "STAB", navn: "Stabilisere", pct: 15, tekst: "Gjenta det som fungerer – mestring gjennom repetisjon." },
    { kode: "TRANSFER", navn: "Overføre", pct: 15, tekst: "Fra stasjon til spill: korte runder på korthullsbanen." },
    { kode: "PERFORM", navn: "Prestere", pct: 0, tekst: "Ingen prestasjonskrav i denne alderen – bare spilleglede." },
  ],
  U13: [
    { kode: "BUILD", navn: "Bygge", pct: 35, tekst: "Ny teknikk læres inn – fullt sving og nærspill fra grunnen." },
    { kode: "STAB", navn: "Stabilisere", pct: 30, tekst: "Repetisjon med variasjon til bevegelsen sitter." },
    { kode: "TEST", navn: "Teste", pct: 10, tekst: "Standardiserte tester viser om treningen virker." },
    { kode: "TRANSFER", navn: "Overføre", pct: 20, tekst: "Ferdighetene tas med ut på banen i spill-lignende øvelser." },
    { kode: "PERFORM", navn: "Prestere", pct: 5, tekst: "Første turneringserfaring – uten resultatpress." },
  ],
  U15: [
    { kode: "BUILD", navn: "Bygge", pct: 25, tekst: "Målrettet teknisk utvikling etter individuell plan." },
    { kode: "STAB", navn: "Stabilisere", pct: 25, tekst: "Automatisere teknikken under økende vanskelighetsgrad." },
    { kode: "TEST", navn: "Teste", pct: 15, tekst: "Testuker vår og høst styrer treningsfokus." },
    { kode: "TRANSFER", navn: "Overføre", pct: 20, tekst: "Banespill med scoring, strategi og mental trening." },
    { kode: "PERFORM", navn: "Prestere", pct: 15, tekst: "Turneringer som treningsarena – rutiner og evaluering." },
  ],
  U19: [
    { kode: "BUILD", navn: "Bygge", pct: 15, tekst: "Tekniske justeringer i grunnperioden – aldri i sesong." },
    { kode: "STAB", navn: "Stabilisere", pct: 20, tekst: "Trykktesting av teknikk under turneringslignende forhold." },
    { kode: "TEST", navn: "Teste", pct: 15, tekst: "TrackMan, nærspillprotokoller og fysiske tester hver periode." },
    { kode: "TRANSFER", navn: "Overføre", pct: 25, tekst: "Scoring under press – simulerte turneringsrunder." },
    { kode: "PERFORM", navn: "Prestere", pct: 25, tekst: "Full turneringskalender med taktisk forberedelse og restitusjon." },
  ],
};

export const TRENINGSFASE_FARGER = [
  "var(--gfgk-gold)",
  "var(--gfgk-teal)",
  "var(--n-300)",
  "var(--green-300)",
  "var(--gfgk-red)",
];

// ---- Månedsplan per gruppe: [tema, nøkkelaktivitet] per måned (jan–des) ----
export const MANEDSPLAN: Record<GruppeKey, [string, string][]> = {
  U10: [
    ["Innelek: balanse, kast og koordinasjon i gymsal.", "Innendørssamling"],
    ["Putting og små spill i simulatoren.", "Vinterferie-aktivitet"],
    ["Grep, oppstilling og de første svingene inne.", "Foreldremøte vår"],
    ["Ut på treningsområdet – chipping og putting.", "Sesongåpning med grilling"],
    ["Korte slag og første hull på korthullsbanen.", "Familiedag"],
    ["Spill hver økt – poengleker og lagkonkurranser.", "Minimesterskap"],
    ["Sommergolfskole og fri lek på anlegget.", "Sommergolfskole (3 dager)"],
    ["Spill og merkeprøver – bronse og sølv.", "Merkeprøvedag"],
    ["Favorittøvelser og mini-turnering.", "Klubbdag"],
    ["Ferdighetsleker som test + sesongfest.", "Sesongavslutning 10. okt"],
    ["Overgang til innendørs lek annenhver uke.", "Oppstart vinterplan"],
    ["Juleavslutning med leker og premier.", "Juleavslutning"],
  ],
  U13: [
    ["Teknikk i simulator: fullt sving med video.", "Innendørs treningsleir"],
    ["Nærspill inne – chipping-matter og putting.", "Puttekonkurranse"],
    ["Fysisk grunntrening og svingfart.", "Testuke – vår"],
    ["Overføring til range – ballflukt og treffpunkt.", "Sesongåpning"],
    ["Banespill: kursmanagement og regler.", "Første klubbturnering"],
    ["Spill under press – mini-konkurranser hver økt.", "Klubbmesterskap junior"],
    ["Fritt spill og sommergolfskole.", "Sommergolfskole"],
    ["Scoring: nærspill nær hull, putting under 2 m.", "Narvesen Tour (frivillig)"],
    ["Matchspill og lagkonkurranser.", "Lagmatch mot naboklubb"],
    ["Testuke og utviklingssamtaler.", "Testuke 19. okt · Sesongfest 10. okt"],
    ["Vinterplan: teknikk-fokus fra testresultatene.", "Oppstart simulator"],
    ["Lett vedlikehold og sosial juleavslutning.", "Juleavslutning"],
  ],
  U15: [
    ["BUILD: teknisk ombygging med video og drills.", "Treningsleir innendørs"],
    ["BUILD→STAB: repetisjon med variasjon.", "Styrketest"],
    ["STAB: teknikk under fart – svinghastighet.", "Testuke – vår"],
    ["TEST→TRANSFER: fra simulator til bane.", "Sesongåpning"],
    ["Banespill med scoringsfokus og statistikk.", "Kvalik Narvesen Tour"],
    ["Konkurranseforberedelse: rutiner og taktikk.", "Klubbmesterskap junior"],
    ["Turneringsperiode – spill og restitusjon.", "Narvesen Tour"],
    ["PERFORM: turnering + vedlikeholdstrening.", "Narvesen Tour / lagmatch"],
    ["Evaluering av sesongstatistikk underveis.", "Lagmatch hjemme"],
    ["Full testuke og individuelle samtaler.", "Testuke 19. okt"],
    ["Ny utviklingsplan – vinterens teknikk-mål.", "Oppstart grunnperiode"],
    ["Fysisk base: styrke og mobilitet.", "Juleavslutning"],
  ],
  U19: [
    ["Individuell teknisk periode – BUILD etter årsplan.", "Treningsleir (helg)"],
    ["Styrke og power – periodisert fysisk blokk.", "Fysisk testbatteri"],
    ["STAB under press: simulerte runder i simulator.", "Testuke – vår"],
    ["TRANSFER: banespill, TrackMan-verifisering ute.", "Sesongåpning · treningsleir"],
    ["Turneringsoppkjøring – scoring og strategi.", "Første rankingturnering"],
    ["PERFORM: full turneringskalender starter.", "Klubbmesterskap · NM-kvalik"],
    ["Turneringsblokk med styrt belastning.", "Narvesen Tour / Srixon Tour"],
    ["Turnering + vedlikehold av fysikk.", "Rankingturneringer"],
    ["Sesonginnspurt – taktisk finpuss.", "Lagmatcher · NM junior"],
    ["Full evaluering: TrackMan, fysikk, statistikk.", "Testuke 19. okt"],
    ["Ny individuell årsplan legges med trener.", "Utviklingssamtaler"],
    ["Grunnperiode: teknikk og styrke.", "Samling med WANG Toppidrett"],
  ],
};

export const MANED_NAVN = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember",
];
export const MANED_KORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

// ---- Øktplaner (standardøkter) per gruppe ----
export interface OktBlokk {
  min: string;
  del: string;
  innhold: string;
}

export interface OktPlan {
  wd: number;
  tittel: string;
  meta: string;
  type: OktType;
  fokus: string;
  blokker: OktBlokk[];
}

export const OKTPLANER: Record<GruppeKey, OktPlan[]> = {
  U10: [
    {
      wd: 2, tittel: "Tirsdagsøkt", meta: "Tirsdag · 60 min", type: "lek",
      fokus: "Mestring og bevegelsesglede – alle skal lykkes hver økt.",
      blokker: [
        { min: "0–10", del: "Oppvarming", innhold: "Sisten, hinderløype eller ballek – puls og smil" },
        { min: "10–40", del: "Stasjoner", innhold: "3 stasjoner à 10 min: putting, chipping, store svinger med skumball" },
        { min: "40–55", del: "Spill", innhold: "Poenglek på stasjonene – samle poeng til laget" },
        { min: "55–60", del: "Avslutning", innhold: "Samling, high-fives og ukens «gullball»" },
      ],
    },
    {
      wd: 4, tittel: "Torsdagsspill", meta: "Torsdag · 60 min", type: "spill",
      fokus: "Overføre lek til ekte spill på korthullsbanen.",
      blokker: [
        { min: "0–10", del: "Oppvarming", innhold: "Putting-klokke rundt hullet – alle baller i før vi starter" },
        { min: "10–50", del: "Banespill", innhold: "2–3 hull på korthullsbanen i smågrupper med voksen" },
        { min: "50–60", del: "Avslutning", innhold: "Felles putte-konkurranse og oppsummering" },
      ],
    },
  ],
  U13: [
    {
      wd: 2, tittel: "Teknikkøkt", meta: "Tirsdag · 120 min", type: "teknikk",
      fokus: "Én teknisk prioritet per spiller – kvalitet foran mengde.",
      blokker: [
        { min: "0–15", del: "Oppvarming", innhold: "Dynamisk bevegelighet + innslåing med korte jern" },
        { min: "15–60", del: "Fullt sving", innhold: "Stasjonsarbeid med ukens tekniske tema, video på én stasjon" },
        { min: "60–100", del: "Nærspill", innhold: "Chipping og pitching – landingspunkt og lengdekontroll" },
        { min: "100–120", del: "Avslutning", innhold: "Putting-stige 1–5 m + kort oppsummering" },
      ],
    },
    {
      wd: 4, tittel: "Baneøkt", meta: "Torsdag · 120 min", type: "spill",
      fokus: "Ta valg som en golfspiller – ikke bare slå ballen.",
      blokker: [
        { min: "0–15", del: "Oppvarming", innhold: "Range: 20 baller med rutine før hvert slag" },
        { min: "15–90", del: "Banespill", innhold: "6–9 hull med tema: kursmanagement, regler, scoring" },
        { min: "90–110", del: "Minikonkurranse", innhold: "Kort spill-lignende konkurranse: nærmest hullet / opp-og-ned" },
        { min: "110–120", del: "Avslutning", innhold: "Scorekort-gjennomgang: hva var gode valg?" },
      ],
    },
  ],
  U15: [
    {
      wd: 2, tittel: "Teknikkøkt", meta: "Tirsdag · 120 min", type: "teknikk",
      fokus: "Individuell teknisk prioritet fra testuka – målbar fremgang.",
      blokker: [
        { min: "0–15", del: "Oppvarming", innhold: "Fysisk aktivering + svingfart med lett kølle" },
        { min: "15–70", del: "Teknisk blokk", innhold: "Individuelt fokusområde med video og constraints-øvelser" },
        { min: "70–105", del: "Nærspill", innhold: "Protokoll-trening: chipping/pitching mot målsoner, føre statistikk" },
        { min: "105–120", del: "Avslutning", innhold: "Putting under press: 10 putter må i fra 1,5 m" },
      ],
    },
    {
      wd: 4, tittel: "Baneøkt", meta: "Torsdag · 120 min", type: "spill",
      fokus: "TRANSFER: teknikk skal virke når det teller.",
      blokker: [
        { min: "0–15", del: "Oppvarming", innhold: "Turneringsrutine: range → nærspill → putting" },
        { min: "15–90", del: "Banespill", innhold: "9 hull med scoringstema og strategikort, statistikk føres" },
        { min: "90–120", del: "Avslutning", innhold: "Statistikk-gjennomgang og mental evaluering av runden" },
      ],
    },
  ],
  U19: [
    {
      wd: 2, tittel: "Teknikkøkt", meta: "Tirsdag · 150 min", type: "teknikk",
      fokus: "Presisjon i utviklingsarbeidet – alt måles og dokumenteres.",
      blokker: [
        { min: "0–20", del: "Oppvarming", innhold: "Individuell fysisk aktivering + TrackMan-baseline" },
        { min: "20–80", del: "Teknisk blokk", innhold: "Individuell plan: BUILD/STAB-arbeid med trener, video og data" },
        { min: "80–125", del: "Nærspill", innhold: "Testprotokoller: wedge-matrise, bunker, chipping-statistikk" },
        { min: "125–150", del: "Avslutning", innhold: "Putting: grønnlesing + pressøvelse med konsekvens" },
      ],
    },
    {
      wd: 4, tittel: "Bane- & fysisk økt", meta: "Torsdag · 150 min", type: "spill",
      fokus: "PERFORM: prestere under press – som i turnering.",
      blokker: [
        { min: "0–20", del: "Oppvarming", innhold: "Aktivering + full turneringsrutine på egenhånd" },
        { min: "20–120", del: "Banespill", innhold: "9–18 hull: simulert turnering med scoring og statistikk" },
        { min: "120–150", del: "Fysisk & restitusjon", innhold: "Styrke/power etter fase, mobilitet og mental trening" },
      ],
    },
  ],
};

// ---- Hendelser (ISO-dato, tittel, tekst) ----
export type Hendelse = [iso: string, tittel: string, tekst: string];

export const HENDELSER_FELLES: Hendelse[] = [
  ["2026-04-18", "Sesongåpning", "Grilling og første utedag for alle grupper"],
  ["2026-06-27", "Klubbmesterskap junior", "Egen juniorklasse – kortere sløyfer for de yngste"],
  ["2026-07-06", "Sommergolfskole", "3 dager med golf og Aktivitetsbyen (6.–8. juli)"],
  ["2026-10-10", "Sesongavslutning", "Premieutdeling, middag og feiring av sesongen"],
  ["2026-10-19", "Testuke – høst", "Standardiserte tester hele uken (19.–23. okt)"],
];

export const HENDELSER_GRUPPE: Record<GruppeKey, Hendelse[]> = {
  U10: [
    ["2026-05-30", "Familiedag", "Golf, footballgolf og minigolf med hele familien"],
    ["2026-06-13", "Minimesterskap", "Uhøytidelig konkurranse med premie til alle"],
    ["2026-08-15", "Merkeprøvedag", "NGF ferdighetsmerker – bronse og sølv"],
  ],
  U13: [
    ["2026-08-09", "Narvesen Tour (frivillig)", "Regionsturnering – vi reiser sammen"],
    ["2026-09-12", "Lagmatch mot Onsøy", "Vennskapsmatch borte"],
  ],
  U15: [
    ["2026-07-19", "Narvesen Tour", "Runde 3 – Moss & Rygge GK"],
    ["2026-08-09", "Narvesen Tour", "Runde 4 – hjemmebane"],
    ["2026-08-30", "Narvesen Tour", "Runde 5 – Borregaard GK"],
    ["2026-09-12", "Lagmatch mot Onsøy", "Vennskapsmatch borte"],
  ],
  U19: [
    ["2026-07-19", "Narvesen Tour", "Runde 3 – Moss & Rygge GK"],
    ["2026-08-09", "Srixon Tour", "Rankingturnering"],
    ["2026-09-03", "NM Junior", "3.–6. september – uttak via ranking"],
    ["2026-09-12", "Lagmatch mot Onsøy", "Vennskapsmatch borte"],
    ["2026-12-05", "Samling med WANG Toppidrett", "Felles vintersamling"],
  ],
};

// ---- Slik trener vi (forside) ----
export const SLIK_TRENER_VI = [
  {
    tittel: "Visjon",
    tekst: "Utvikle selvstendige, reflekterte golfspillere som presterer på sitt beste – uansett nivå og ambisjon.",
  },
  {
    tittel: "Filosofi",
    tekst: "Spillerutvikling over resultater. Langsiktig, evidensbasert trening tilpasset den enkelte – med spilleglede som fundament.",
  },
  {
    tittel: "Metode",
    tekst: "Periodisert treningsår med testing, individuell planlegging og systematisk evaluering. Fem treningsområder i en strukturert pyramide.",
  },
];

export const VERDIER = [
  "Langsiktighet",
  "Helhetlig utvikling",
  "Vitenskapsbasert",
  "Individuell tilpasning",
  "Miljøfokus",
];

// ---- Sesongperiodisering (forside) ----
export const SESONG_KORT: { navn: FaseNavn; mnd: string; tekst: string; tags: string[] }[] = [
  {
    navn: "Evaluering", mnd: "Okt–Nov",
    tekst: "Kartlegging av nåværende nivå gjennom standardiserte tester. Individuelle utviklingssamtaler, sesongevaluering og planlegging for neste sesong.",
    tags: ["Testing", "Evaluering", "Planlegging"],
  },
  {
    navn: "Grunnperiode", mnd: "Nov–Mar",
    tekst: "Langsiktig teknisk utvikling og fysisk grunnlag. Primært innendørs trening med fokus på repetisjon, videoanalyse og styrketrening. Fasene BUILD og STAB sikrer solid fundament.",
    tags: ["Teknikk", "Fysikk", "Grunnlag"],
  },
  {
    navn: "Spesialisering", mnd: "Apr–Jun",
    tekst: "Overgang til utendørsspill. Treningen beveger seg fra TEST til TRANSFER – ferdigheter overføres til baneforhold med økende konkurranseintensitet.",
    tags: ["Banespill", "Kursmanagement", "Overgang til bane"],
  },
  {
    navn: "Turnering", mnd: "Jun–Okt",
    tekst: "Full turneringssesong med fokus på TRANSFER og PERFORM. Treningen tilpasses turneringskalender med vekt på prestasjon, restitusjon og taktisk forberedelse.",
    tags: ["Turneringer", "Prestasjon", "Vedlikehold"],
  },
];

// ---- Trenere ----
export const TRENERE = [
  {
    rolle: "Juniorleder",
    navn: "Espen Kjølberg",
    tekst: "Ansvarlig for organiseringen av juniorprogrammet og kontaktpunkt for spillere og foresatte.",
    epost: "leder@gfgkjunior.no",
    initialer: "EK",
  },
  {
    rolle: "Head Coach · AK Golf Academy",
    navn: "Anders Kristiansen",
    tekst: "Sportslig ansvarlig for junior- og elitesatsingen. Fokus på helhetlig spillerutvikling gjennom evidensbasert trening og individuell oppfølging.",
    epost: "anders@akgolf.no",
    initialer: "AK",
  },
  {
    rolle: "Coach · Sportslig leder",
    navn: "Markus Røinås Pedersen",
    tekst: "Sportslig leder for juniorprogrammet. Tilbyr privat og gruppe-coaching for alle klubbens medlemmer.",
    epost: "markus@akgolf.no",
    initialer: "MP",
  },
];

// ---- Slik starter du ----
export const STARTER_STEG = [
  {
    nr: "01", tittel: "Ta kontakt",
    tekst: "Send en e-post for en uforpliktende prat. Vi svarer innen 48 timer og hjelper deg videre.",
  },
  {
    nr: "02", tittel: "Prøvetime",
    tekst: "Kom på en prøvetime i den gruppen som passer alderen. Du trenger ikke eget utstyr – vi låner ut det du trenger.",
  },
  {
    nr: "03", tittel: "Plasseres i gruppe",
    tekst: "Treneren plasserer deg i gruppen der snittscore og nivå passer treningsplanen. Utvikler du deg, flyttes du opp underveis.",
  },
  {
    nr: "04", tittel: "Meld på",
    tekst: "Fyll ut påmelding og få bekreftelse med startdato. Deretter er du i gang.",
  },
];

// ---- Kontakt / adresse ----
export const KONTAKT = {
  epost: "leder@gfgkjunior.no",
  adresse: "Torsnesveien 16, 1630 Gamle Fredrikstad",
  facebook: "https://www.facebook.com/groups/709396002416522/",
};
