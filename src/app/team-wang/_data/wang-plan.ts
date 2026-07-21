// =========================================================================
// WANG Toppidrett Fredrikstad — Golf-fellessiden: datamodell og generatorer.
// Portert mest mulig ordrett fra Claude Design-skjermen
// «WANG Toppidrett Fredrikstad Golf v2» (fellesside-v2-script.js).
//
// VIKTIG: Modulen er deterministisk — ALL dato-aritmetikk skjer i UTC på
// faste konstanter (aldri `new Date()`/`Date.now()` på modulnivå), slik at
// server (UTC) og klient (Oslo) genererer identiske data. «Nå»-avhengige
// valg (neste økt, «Du er her», gjeldende uke) gjøres klient-side i
// komponentene via Oslo-korrekt nå-ISO som sendes inn som parameter.
// =========================================================================

export const MONTHS_NO = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
];
export const MON_SHORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "des",
];
export const WD_SHORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
export const WD_LONG = [
  "søndag",
  "mandag",
  "tirsdag",
  "onsdag",
  "torsdag",
  "fredag",
  "lørdag",
];

function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

/** ISO-dato ('YYYY-MM-DD') → Date ved UTC-midnatt (tidssone-uavhengig). */
export function d(isoStr: string): Date {
  return new Date(isoStr + "T00:00:00Z");
}

export function iso(dt: Date): string {
  return dt.getUTCFullYear() + "-" + pad(dt.getUTCMonth() + 1) + "-" + pad(dt.getUTCDate());
}

export function fmt(dt: Date): string {
  return WD_SHORT[dt.getUTCDay()] + ". " + dt.getUTCDate() + ". " + MON_SHORT[dt.getUTCMonth()];
}

export function fmtComp(s: string): string {
  const dt = d(s);
  return dt.getUTCDate() + ". " + MON_SHORT[dt.getUTCMonth()] + " " + dt.getUTCFullYear();
}

export const SPAN_START_ISO = "2026-08-10";
export const SPAN_END_ISO = "2027-06-19";
const SPAN_START = d(SPAN_START_ISO);
const SPAN_END = d(SPAN_END_ISO);
const SPAN_MS = SPAN_END.getTime() - SPAN_START.getTime();

/** Posisjon i sesongen 0–100 % for en ISO-dato. */
export function pct(s: string): number {
  return ((d(s).getTime() - SPAN_START.getTime()) / SPAN_MS) * 100;
}

/** Klem en ISO-dato inn i sesongspennet (brukes på ekte Oslo-nå i prod). */
export function klampTilSesong(isoStr: string): string {
  if (isoStr < SPAN_START_ISO) return SPAN_START_ISO;
  if (isoStr > SPAN_END_ISO) return SPAN_END_ISO;
  return isoStr;
}

// ---- Steder ------------------------------------------------------------

export type WangFarge =
  | "navy"
  | "teal"
  | "mint"
  | "blue"
  | "orange"
  | "purple"
  | "pink"
  | "gray";

export type LokKey = "gfgk" | "salat" | "active";

export interface Lokasjon {
  name: string;
  short: string;
  addr: string;
  season: string;
  icon: string;
  color: WangFarge;
}

export const LOCATIONS: Record<LokKey, Lokasjon> = {
  gfgk: {
    name: "GFGK – Fredrikstad Golfklubb",
    short: "GFGK",
    addr: "Utendørs golfbane",
    season: "15. apr – 1. okt",
    icon: "flag",
    color: "teal",
  },
  salat: {
    name: "Salatamesteren",
    short: "Salatamesteren",
    addr: "Innendørs golftrening",
    season: "1. okt – 1. apr",
    icon: "home",
    color: "blue",
  },
  active: {
    name: "Active Trening",
    short: "Active Trening",
    addr: "Fysisk trening og styrke",
    season: "Hele året",
    icon: "dumbbell",
    color: "navy",
  },
};

// ---- Perioder ----------------------------------------------------------

export type PeriodeKey = "grunn" | "spes" | "turn";

export interface Periode {
  key: PeriodeKey;
  name: string;
  color: string;
  start: string;
  end: string;
  label: string;
  focus: string;
  loc: string;
  weeks: number;
}

export const PERIODS: Periode[] = [
  {
    key: "grunn",
    name: "Grunnperiode",
    color: "var(--wang-teal)",
    start: "2026-08-10",
    end: "2026-11-30",
    label: "aug – nov 2026",
    focus:
      "Bygge et solid teknisk og fysisk fundament. Mengdetrening, grunnleggende svingteknikk, nærspill og bevegelighet.",
    loc: "GFGK ute → Salatamesteren inne",
    weeks: 0,
  },
  {
    key: "spes",
    name: "Spesialiseringsperiode",
    color: "var(--cat-blue)",
    start: "2026-12-01",
    end: "2027-03-31",
    label: "des 2026 – mar 2027",
    focus:
      "Spisse ferdigheter innendørs. Simulator og launch monitor, maksstyrke, scoringsspill og teknisk finpuss.",
    loc: "Salatamesteren inne + Active Trening",
    weeks: 0,
  },
  {
    key: "turn",
    name: "Turneringsperiode",
    color: "var(--cat-orange)",
    start: "2027-04-01",
    end: "2027-06-19",
    label: "apr – jun 2027",
    focus:
      "Omsette trening til score. Banespill, konkurransesimulering, scoringsspill under press og turneringer.",
    loc: "GFGK ute + turneringer",
    weeks: 0,
  },
];
PERIODS.forEach((p) => {
  p.weeks = Math.round((d(p.end).getTime() - d(p.start).getTime()) / (7 * 864e5));
});

export function periodKey(dt: Date): PeriodeKey {
  const s = iso(dt);
  if (s < "2026-12-01") return "grunn";
  if (s < "2027-04-01") return "spes";
  return "turn";
}

export function golfLoc(dt: Date): LokKey {
  const s = iso(dt);
  if (s < "2026-10-01") return "gfgk";
  if (s < "2027-04-15") return "salat";
  return "gfgk";
}

export const HOLIDAYS: [string, string, string][] = [
  ["2026-09-28", "2026-10-02", "Høstferie"],
  ["2026-12-21", "2027-01-02", "Juleferie"],
  ["2027-02-23", "2027-02-27", "Vinterferie"],
  ["2027-03-22", "2027-03-28", "Påskeferie"],
];

export function inHoliday(s: string): boolean {
  return HOLIDAYS.some((h) => s >= h[0] && s <= h[1]);
}

// ---- Økt-typer ---------------------------------------------------------

export type DagType = "teknikk" | "fysisk" | "spill";

export const DAYTYPE: Record<
  DagType,
  { icon: string; color: WangFarge; label: string; short: string; card: string }
> = {
  teknikk: { icon: "target", color: "blue", label: "Golfteknikk", short: "Golfteknikk", card: "teknikk" },
  fysisk: { icon: "dumbbell", color: "navy", label: "Fysisk trening", short: "Fysisk", card: "styrke" },
  spill: { icon: "flag", color: "teal", label: "Spill og nærspill", short: "Nærspill", card: "utholdenhet" },
};

export interface OktMal {
  title: string;
  goal: string;
  comp: { VG1: string; VG2: string; VG3: string };
  warmup: string;
  main: string[];
  test: string;
  eval: string;
}

export const TEMPLATES: Record<PeriodeKey, Record<DagType, OktMal[]>> = {
  grunn: {
    teknikk: [
      {
        title: "Grep, oppsett og ballposisjon",
        goal: "Etablere et nøytralt grep, balansert oppsett og riktig ballposisjon for jern.",
        comp: {
          VG1: "Vise korrekt grep og oppsett uten veiledning.",
          VG2: "Beholde oppsett og balanse gjennom fulle jernsvinger.",
          VG3: "Tilpasse oppsett til ulike køller, lies og ønsket ballflukt.",
        },
        warmup:
          "10 min dynamisk mobilitet for skuldre, hofter og rygg, deretter 15 rolige puttinger for følelse.",
        main: [
          "Speil- og alignment-drill: grep og oppsett, 3×10 repetisjoner",
          "Halvsvinger med 7-jern mot nærmål, 3×10 baller",
          "Video av oppsett forfra og bakfra – sammenlign med referansebilde",
        ],
        test: "Baseline treffpunkt på 7-jern (impact-tape) registreres i PlayerHQ.",
        eval: "Egenvurdering av oppsett 1–5 og ett fokuspunkt til neste økt.",
      },
      {
        title: "Svingbane og treffpunkt",
        goal: "Forbedre konsistent, sentrert treff med jern gjennom en stabil svingbane.",
        comp: {
          VG1: "Treffe ballen før bakken med korte jern.",
          VG2: "Holde jevnt treffpunkt gjennom en kurv med baller.",
          VG3: "Styre treffpunkt og lavpunkt bevisst for ulike slag.",
        },
        warmup: "Bevegelighet for rygg og hofter, deretter stigende svinger fra 50 % til 90 % fart.",
        main: [
          "Tee-gate-drill for sentrert treff, 3×8",
          "Trinnvis fra halv til full sving med 7-jern",
          "Nærmålskonkurranse: flest innenfor 10 m av 15 baller",
        ],
        test: "Andel sentrerte treff (impact-tape) på 20 baller.",
        eval: "Notér snittavstand til mål og opplevd kvalitet på treffet.",
      },
    ],
    fysisk: [
      {
        title: "Bevegelighet og grunnstyrke",
        goal: "Bygge bevegelseskontroll og grunnstyrke som fundament for sesongen.",
        comp: {
          VG1: "Utføre grunnøvelser med riktig teknikk og kontroll.",
          VG2: "Øke belastning med opprettholdt teknikk.",
          VG3: "Selvstendig justere øvelser etter dagsform og mål.",
        },
        warmup: "Rullende oppvarming 8 min og aktiveringsøvelser for kjerne og setemuskulatur.",
        main: [
          "Knebøy og markløft med teknikkfokus, 3×8",
          "Push- og pull-øvelser for overkropp, 3×10",
          "Kjernestabilitet: planke-varianter og Pallof press",
        ],
        test: "Overhead squat-screening og planke på tid.",
        eval: "Registrer belastning og opplevd anstrengelse (RPE) i PlayerHQ.",
      },
      {
        title: "Rotasjonskraft og stabilitet",
        goal: "Utvikle rotasjonskraft og stabilitet som overføres til golfsvingen.",
        comp: {
          VG1: "Gjennomføre rotasjonsøvelser kontrollert.",
          VG2: "Koble rotasjon til hofte- og skulderseparasjon.",
          VG3: "Produsere kraft med god sekvensering fra bakke til kølle.",
        },
        warmup: "Dynamisk mobilitet for brystrygg og aktivering med medisinball.",
        main: [
          "Medisinball-kast med rotasjon, 4×6 per side",
          "Enbens balanse og landing, 3×8",
          "Kabelrotasjoner med kontrollert tempo, 3×10",
        ],
        test: "Rotasjonskast med medisinball – avstand.",
        eval: "Sammenlign kastavstand mot forrige måling.",
      },
    ],
    spill: [
      {
        title: "Nærspill – chipping",
        goal: "Bygge et sikkert og repeterbart chippeslag rundt greenen.",
        comp: {
          VG1: "Utføre standard chip med god kontakt.",
          VG2: "Kontrollere lengde med tre ulike køller.",
          VG3: "Velge slag og landingspunkt ut fra situasjon og lie.",
        },
        warmup: "Følelsesputting og korte chip for kontaktfølelse.",
        main: [
          "Landingssone-drill: treff håndkle-mål, 3×10",
          "Chip med tre køller til samme flagg",
          "Opp-og-inn-konkurranse fra seks posisjoner",
        ],
        test: "Opp-og-inn-prosent fra 10 m (20 forsøk).",
        eval: "Registrer opp-og-inn-prosent og beste køllevalg.",
      },
      {
        title: "Putting – distansekontroll",
        goal: "Utvikle distansekontroll og en trygg rutine på greenen.",
        comp: {
          VG1: "Treffe innenfor sikkerhetsradius på lange putter.",
          VG2: "Holde jevn lengdekontroll over ulike avstander.",
          VG3: "Lese fall og hastighet og tilpasse rutine under press.",
        },
        warmup: "Speed-drill med økende og minkende lengde.",
        main: [
          "Lengdekontroll til sikkerhetssoner på 4, 8 og 12 m",
          "Kortputt-gate 1–2 m, 3×10",
          "Rutine-putting med full pre-shot på hver putt",
        ],
        test: "Antall tre-putter fra 12 m (15 putter).",
        eval: "Antall innenfor sikkerhetsradius og notat om rutine.",
      },
    ],
  },
  spes: {
    teknikk: [
      {
        title: "Simulatorøkt – launch monitor",
        goal: "Bruke data fra launch monitor til å forbedre ballflukt og treff.",
        comp: {
          VG1: "Forstå nøkkeltall som ballhastighet og launch.",
          VG2: "Bruke data til å justere ett teknisk element.",
          VG3: "Optimalisere spinn og utgangsvinkel per kølle.",
        },
        warmup: "Innendørs mobilitet og stigende svinger på matte.",
        main: [
          "Baseline-måling med driver og 7-jern",
          "Endre ett element (angrepsvinkel) og mål effekten",
          "Ballflukt-vindu: treff høyt og lavt på kommando",
        ],
        test: "Smash factor og carry-spredning på 7-jern.",
        eval: "Loggfør nøkkeltall og valgt fokusparameter.",
      },
      {
        title: "Teknisk finpuss innendørs",
        goal: "Isolere og forbedre ett teknisk nøkkelelement i svingen.",
        comp: {
          VG1: "Gjenkjenne eget nøkkelelement med hjelp.",
          VG2: "Trene målrettet på elementet med driller.",
          VG3: "Overføre endringen til full fart og ulike køller.",
        },
        warmup: "Aktivering og sakte-film-svinger foran speil eller skjerm.",
        main: [
          "Isolert drill for valgt element, 4×8",
          "Progresjon fra halv til full fart",
          "Kontroll med video hver 10. ball",
        ],
        test: "Konsistens i valgt parameter (10 baller).",
        eval: "Video før og etter, samt egenvurdering av endringen.",
      },
    ],
    fysisk: [
      {
        title: "Maksstyrke og eksplosivitet",
        goal: "Øke maksimal kraft og eksplosivitet i vinterens styrkeblokk.",
        comp: {
          VG1: "Utføre tunge basisløft med trygg teknikk.",
          VG2: "Progrediere belastning systematisk.",
          VG3: "Periodisere egen belastning mot sesongmål.",
        },
        warmup: "Grundig ledd-for-ledd oppvarming og rampesett.",
        main: [
          "Knebøy 4×5 med økende belastning",
          "Markløft eller hoftehengsel 4×5",
          "Eksplosivt: hopp og kast, 4×4",
        ],
        test: "Estimert 3RM knebøy og hopphøyde.",
        eval: "Registrer løftetall og hopphøyde i PlayerHQ.",
      },
      {
        title: "Kraftutvikling og hurtighet",
        goal: "Overføre styrke til hastighet i svingrelevant bevegelse.",
        comp: {
          VG1: "Gjennomføre hurtighetsøvelser kontrollert.",
          VG2: "Øke bevegelsesfart med god kvalitet.",
          VG3: "Koble hurtighet til køllehastighet.",
        },
        warmup: "Dynamisk oppvarming og hurtighetsstiger.",
        main: [
          "Speed-swings med treningskølle, 5×5",
          "Eksplosive medisinballkast, 4×5",
          "Plyometrisk hopp og landing, 4×5",
        ],
        test: "Køllehastighet (speed radar) – snitt av fem.",
        eval: "Sammenlign køllehastighet mot baseline.",
      },
    ],
    spill: [
      {
        title: "Scoringsspill innendørs",
        goal: "Bygge sikkerhet i scoringsslag fra 100 m og inn på simulator og matte.",
        comp: {
          VG1: "Treffe green-mål fra fast avstand.",
          VG2: "Kontrollere lengde på wedge-avstander.",
          VG3: "Planlegge en avstandsmatrise for egne wedger.",
        },
        warmup: "Følelsesslag med korte wedger og rytmefokus.",
        main: [
          "Wedge-matrise: 40, 60 og 80 m klokkeslett-svinger",
          "Mål-vindu på skjerm med poeng per treff",
          "Nærmest flagg av 12 baller",
        ],
        test: "Spredning på 60 m wedge (10 baller).",
        eval: "Loggfør snittavstand og beste svinglengde.",
      },
      {
        title: "Putting- og nærspill-lab",
        goal: "Kvalitetstrene putting og nærspill med tydelige mål innendørs.",
        comp: {
          VG1: "Holde rutine på korte putter.",
          VG2: "Kontrollere lengde og retning konsistent.",
          VG3: "Prestere under simulert konkurransepress.",
        },
        warmup: "Gate-drill for korte putter og tempo-stige.",
        main: [
          "Klokke-drill 1 m rundt hull, to runder",
          "Lengdekontroll på matte 5–12 m",
          "Press-putting: fullfør serien for å gå videre",
        ],
        test: "Antall strake korte putter (maks 15).",
        eval: "Registrer serieresultat og opplevd press.",
      },
    ],
  },
  turn: {
    teknikk: [
      {
        title: "Banespill og strategi",
        goal: "Omsette teknikk til gode valg og lavere score i banespill.",
        comp: {
          VG1: "Følge en enkel spillplan på ni hull.",
          VG2: "Velge trygge mål og køller etter situasjon.",
          VG3: "Styre risiko og lage en kjøreplan per hull.",
        },
        warmup: "Full oppvarmingsrutine på range og green som før en runde.",
        main: [
          "Ni hull med kjøreplan og målsetting",
          "Beslutningslogg per slag (trygt eller aggressivt)",
          "Debrief: hvor ble slag vunnet og tapt",
        ],
        test: "Fairways truffet og greener i regulering på ni hull.",
        eval: "Score, statistikk og tre læringspunkter i PlayerHQ.",
      },
      {
        title: "Trøkktrening på banen",
        goal: "Trene ferdigheter i konkurranselignende situasjoner ute på banen.",
        comp: {
          VG1: "Fullføre øvelser med score-konsekvens.",
          VG2: "Holde rutine når det teller.",
          VG3: "Prestere stabilt under press og uro.",
        },
        warmup: "Kort, målrettet oppvarming som på konkurransedag.",
        main: [
          "Par-18-utfordring i nærspill",
          "Straffe- og bonusformat på banen",
          "Én ball, én sjanse-slag mot mål",
        ],
        test: "Poeng i pressformat mot forrige gang.",
        eval: "Notér hva som fungerte under press.",
      },
    ],
    fysisk: [
      {
        title: "Vedlikehold og hurtighet",
        goal: "Vedlikeholde styrke og prioritere hurtighet i konkurranseperioden.",
        comp: {
          VG1: "Gjennomføre vedlikeholdsøkt selvstendig.",
          VG2: "Balansere belastning mot spilling.",
          VG3: "Styre egen belastning rundt turneringer.",
        },
        warmup: "Effektiv helkroppsaktivering.",
        main: [
          "Redusert volum basisstyrke, 3×4",
          "Køllehastighet med speed-protokoll",
          "Bevegelighet og restitusjon",
        ],
        test: "Køllehastighet og kort mobilitetssjekk.",
        eval: "Registrer belastning og restitusjonsbehov.",
      },
      {
        title: "Restitusjon og bevegelighet",
        goal: "Sikre god restitusjon og bevegelighet mellom turneringer.",
        comp: {
          VG1: "Utføre mobilitetsrutine korrekt.",
          VG2: "Kjenne igjen egne restitusjonsbehov.",
          VG3: "Planlegge restitusjon rundt konkurranseuker.",
        },
        warmup: "Rolig pulsøkning og pustefokus.",
        main: [
          "Helkroppsmobilitet 20 min",
          "Lett stabilitet og balanse",
          "Puste- og nedtrappingsrutine",
        ],
        test: "Bevegelighetssjekk (sit-and-reach og lignende).",
        eval: "Egenvurdering av form og søvn siste uke.",
      },
    ],
    spill: [
      {
        title: "Konkurransesimulering",
        goal: "Spille under mest mulig realistiske konkurranseforhold.",
        comp: {
          VG1: "Følge konkurranserutiner fra start til slutt.",
          VG2: "Holde fokus og tempo gjennom runden.",
          VG3: "Håndtere motgang og ta smarte valg i konkurranse.",
        },
        warmup: "Konkurranseoppvarming med fast tidsskjema.",
        main: [
          "Tellende runde med markør og regler",
          "Full pre- og post-shot-rutine",
          "Håndtere ett dårlig hull bevisst",
        ],
        test: "Score mot personlig mål eller handicap.",
        eval: "Rundeanalyse og mål til neste turnering.",
      },
      {
        title: "Scoring og pressputting",
        goal: "Spisse scoringsspill og putting mot turneringene.",
        comp: {
          VG1: "Fullføre nærspill-rutine på banen.",
          VG2: "Konvertere flere opp-og-inn.",
          VG3: "Levere korte putter under press.",
        },
        warmup: "Nærspill- og putting-oppvarming som før en runde.",
        main: [
          "Opp-og-inn fra ni posisjoner rundt green",
          "Press-putting 1–2 m med konsekvens",
          "Lengdekontroll på ekte green",
        ],
        test: "Opp-og-inn-prosent (ni forsøk) og korte putter.",
        eval: "Registrer scoringsstatistikk i PlayerHQ.",
      },
    ],
  },
};

// ---- AK-formelen (chips per økt/drill) ---------------------------------

export const AK_TIPS = {
  pyr: "Hva økten trener på — én av FYS · TEK · SLAG · SPILL · TURN. Vektingen følger periodens pyramide.",
  fase: "Læringsfase — styrer resten av formelen. Uten ball → Lav hastighet → Auto. Tidlig fase prioriteres over data og turnering.",
  cs: "Køllehastighet i % av maks. Uten ball = lav · Lav hastighet = CS50–80 · Auto = CS80–100.",
  miljo: "Miljø/kontekst fra M0 (isolert) til M5 (helt banelikt). Følger fasen.",
  press:
    "Konsekvens-trapp: Fri (feil er gratis) → Krav (score mot deg selv) → Utfordring (én sjanse) → Konkurranse (poeng teller).",
  p: "MORAD svingposisjon P1–P10 (halvsteg tillatt). P1 Setup · P4 Top · P7 Impact er viktigst diagnostisk.",
};

export interface AkVerdier {
  pyr: string;
  fase: string;
  cs: string;
  miljo: string;
  press: string;
  p: string;
}

export interface AkChipData {
  label: string;
  value: string;
  tip: string;
  color: WangFarge;
}

export function akChipsFrom(a: AkVerdier): AkChipData[] {
  const chips: AkChipData[] = [
    { label: "PYR", value: a.pyr, tip: AK_TIPS.pyr, color: "navy" },
    { label: "FASE", value: a.fase, tip: AK_TIPS.fase, color: "teal" },
    { label: "CS", value: a.cs, tip: AK_TIPS.cs, color: "blue" },
    { label: "MILJØ", value: a.miljo, tip: AK_TIPS.miljo, color: "purple" },
    { label: "PRESS", value: a.press, tip: AK_TIPS.press, color: "orange" },
    { label: "P", value: a.p, tip: AK_TIPS.p, color: "pink" },
  ];
  return chips.filter((c) => c.value && c.value !== "—");
}

const AK_BY_OKT: Record<string, AkVerdier> = {
  grunn_teknikk: { pyr: "TEK", fase: "Uten ball", cs: "—", miljo: "M1", press: "Fri", p: "P4" },
  grunn_fysisk: { pyr: "FYS", fase: "Uten ball", cs: "—", miljo: "M0", press: "Fri", p: "—" },
  grunn_spill: { pyr: "SPILL", fase: "Lav hastighet", cs: "CS60", miljo: "M2", press: "Krav", p: "—" },
  spes_teknikk: { pyr: "SLAG", fase: "Lav hastighet", cs: "CS70", miljo: "M3", press: "Krav", p: "P7" },
  spes_fysisk: { pyr: "FYS", fase: "Uten ball", cs: "—", miljo: "M0", press: "Krav", p: "—" },
  spes_spill: { pyr: "SLAG", fase: "Auto", cs: "CS85", miljo: "M4", press: "Utfordring", p: "—" },
  turn_teknikk: { pyr: "SPILL", fase: "Auto", cs: "CS90", miljo: "M5", press: "Utfordring", p: "—" },
  turn_fysisk: { pyr: "FYS", fase: "Auto", cs: "—", miljo: "M1", press: "Krav", p: "—" },
  turn_spill: { pyr: "TURN", fase: "Auto", cs: "CS95", miljo: "M5", press: "Konkurranse", p: "—" },
};

export function akForOkt(pk: PeriodeKey, dt: DagType): AkVerdier {
  return AK_BY_OKT[pk + "_" + dt] || AK_BY_OKT.grunn_teknikk;
}

const PRESS_LADDER = ["Fri", "Krav", "Utfordring", "Konkurranse"];

function stepPress(p: string, delta: number): string {
  const i = PRESS_LADDER.indexOf(p);
  if (i < 0) return p;
  return PRESS_LADDER[Math.max(0, Math.min(3, i + delta))];
}

function stepMiljo(mv: string, delta: number): string {
  const m = /M(\d)/.exec(mv);
  if (!m) return mv;
  return "M" + Math.max(0, Math.min(5, parseInt(m[1], 10) + delta));
}

function drillAk(base: AkVerdier, idx: number, total: number): AkVerdier {
  const a = { ...base };
  if (total > 1) {
    if (idx === 0) {
      a.press = stepPress(base.press, -1);
      a.miljo = stepMiljo(base.miljo, -1);
    } else if (idx === total - 1) {
      a.press = stepPress(base.press, 1);
      a.miljo = stepMiljo(base.miljo, 1);
    }
  }
  return a;
}

function parseVol(str: string): { label: string; value: string } {
  let m = /(\d+)\s*[×x]\s*(\d+)/.exec(str);
  if (m) return { label: "Sett × reps", value: m[1] + "×" + m[2] };
  m = /(\d+)\s*baller/i.exec(str);
  if (m) return { label: "Baller", value: m[1] };
  m = /(\d+)\s*(?:min|minutter)/i.exec(str);
  if (m) return { label: "Tid", value: m[1] + " min" };
  m = /(\d+)\s*(?:forsøk|putter|slag|posisjoner)/i.exec(str);
  if (m) return { label: "Antall", value: m[1] };
  return { label: "", value: "—" };
}

const PYR_COLOR: Record<string, [string, string, string]> = {
  FYS: ["var(--wang-navy)", "var(--tint-navy)", "var(--wang-navy)"],
  TEK: ["var(--wang-teal)", "var(--tint-teal)", "var(--wang-teal-text)"],
  SLAG: ["var(--cat-orange)", "var(--tint-orange)", "var(--cat-orange)"],
  SPILL: ["var(--cat-blue)", "var(--tint-blue)", "var(--cat-blue)"],
  TURN: ["var(--cat-purple)", "var(--tint-purple)", "var(--cat-purple)"],
};

export interface Drill {
  name: string;
  num: number;
  accent: string;
  tint: string;
  fg: string;
  chips: AkChipData[];
  volLabel: string;
  volValue: string;
  hasVol: boolean;
}

function buildDrills(pk: PeriodeKey, dt: DagType, main: string[]): Drill[] {
  const base = akForOkt(pk, dt);
  const c = PYR_COLOR[base.pyr] || PYR_COLOR.TEK;
  return main.map((str, i) => {
    const v = parseVol(str);
    return {
      name: str,
      num: i + 1,
      accent: c[0],
      tint: c[1],
      fg: c[2],
      chips: akChipsFrom(drillAk(base, i, main.length)),
      volLabel: v.label,
      volValue: v.value,
      hasVol: v.value !== "—",
    };
  });
}

// ---- Økt-generering ----------------------------------------------------

export interface Okt {
  id: string;
  iso: string;
  title: string;
  typeLabel: string;
  short: string;
  chipIcon: string;
  chipColor: WangFarge;
  cardType: string;
  dateLabel: string;
  dateShort: string;
  longDate: string;
  weekdayName: string;
  timeLabel: string;
  locKey: LokKey;
  locName: string;
  locShort: string;
  locAddr: string;
  locIcon: string;
  locColor: WangFarge;
  periodKey: PeriodeKey;
  periodName: string;
  goal: string;
  comp: { VG1: string; VG2: string; VG3: string };
  warmup: string;
  main: string[];
  test: string;
  eval: string;
  ak: AkVerdier;
  akChips: AkChipData[];
  drills: Drill[];
}

function buildSession(
  dt: Date,
  wd: number,
  dagType: DagType,
  pk: PeriodeKey,
  locKey: LokKey,
  tpl: OktMal,
): Okt {
  const loc = LOCATIONS[locKey];
  const meta = DAYTYPE[dagType];
  const s = iso(dt);
  return {
    id: s + "-" + wd,
    iso: s,
    title: tpl.title,
    typeLabel: meta.label,
    short: meta.short,
    chipIcon: meta.icon,
    chipColor: meta.color,
    cardType: meta.card,
    dateLabel: fmt(dt),
    dateShort: dt.getUTCDate() + ". " + MON_SHORT[dt.getUTCMonth()],
    longDate: dt.getUTCDate() + ". " + MONTHS_NO[dt.getUTCMonth()] + " " + dt.getUTCFullYear(),
    weekdayName: WD_LONG[wd],
    timeLabel: "08:00–10:00",
    locKey,
    locName: loc.name,
    locShort: loc.short,
    locAddr: loc.addr,
    locIcon: loc.icon,
    locColor: loc.color,
    periodKey: pk,
    periodName: PERIODS.find((p) => p.key === pk)!.name,
    goal: tpl.goal,
    comp: tpl.comp,
    warmup: tpl.warmup,
    main: tpl.main,
    test: tpl.test,
    eval: tpl.eval,
    ak: akForOkt(pk, dagType),
    akChips: akChipsFrom(akForOkt(pk, dagType)),
    drills: buildDrills(pk, dagType, tpl.main),
  };
}

// Man/ons/fre 08:00–10:00 gjennom hele sesongen, utenom skoleferier.
// Deterministisk: bygges fra faste konstanter i UTC.
export const SESSIONS: Okt[] = (() => {
  const ut: Okt[] = [];
  const cur = d(SPAN_START_ISO);
  const end = d(SPAN_END_ISO);
  while (cur.getTime() <= end.getTime()) {
    const wd = cur.getUTCDay();
    const s = iso(cur);
    if ((wd === 1 || wd === 3 || wd === 5) && !inHoliday(s)) {
      const dagType: DagType = wd === 1 ? "teknikk" : wd === 3 ? "fysisk" : "spill";
      const pk = periodKey(cur);
      const locKey: LokKey = dagType === "fysisk" ? "active" : golfLoc(cur);
      const weeks = Math.floor((cur.getTime() - SPAN_START.getTime()) / (7 * 864e5));
      const tpl = TEMPLATES[pk][dagType][weeks % 2];
      ut.push(buildSession(new Date(cur.getTime()), wd, dagType, pk, locKey, tpl));
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return ut;
})();

export const SESSION_BY_ISO: Record<string, Okt> = {};
SESSIONS.forEach((s) => {
  SESSION_BY_ISO[s.iso] = s;
});
export const SESSION_BY_ID: Record<string, Okt> = {};
SESSIONS.forEach((s) => {
  SESSION_BY_ID[s.id] = s;
});

// ---- Turneringer, tester, skole ----------------------------------------

export interface Turnering {
  iso: string;
  name: string;
  place: string;
}

export const COMPS: Turnering[] = [
  { iso: "2026-09-11", name: "Klubbmesterskap", place: "GFGK" },
  { iso: "2026-10-23", name: "Høstavslutning – matchspill", place: "GFGK" },
  { iso: "2027-04-24", name: "Sesongåpning Srixon Tour", place: "Onsøy GK" },
  { iso: "2027-05-08", name: "Regionsmesterskap Øst", place: "Borregaard GK" },
  { iso: "2027-05-22", name: "Lag-NM kvalifisering", place: "GFGK" },
  { iso: "2027-06-05", name: "NM Junior", place: "Larvik GK" },
  { iso: "2027-06-12", name: "Srixon Tour finale", place: "Miklagard GK" },
];

export const TESTS: { iso: string; name: string }[] = [
  { iso: "2026-08-28", name: "Fysiske inngangstester" },
  { iso: "2027-01-15", name: "Vintertester – teknikk og fysisk" },
  { iso: "2027-05-28", name: "Sesongtester" },
];

export const SCHOOL: { iso: string; dato: string; name: string; type: string }[] = [
  { iso: "2026-08-17", dato: "17. aug 2026", name: "Skolestart", type: "Oppstart" },
  { iso: "2026-09-28", dato: "28. sep – 2. okt", name: "Høstferie (uke 40)", type: "Ferie" },
  { iso: "2026-11-13", dato: "13. nov 2026", name: "Planleggingsdag (elevfri)", type: "Elevfri" },
  { iso: "2026-12-21", dato: "21. des – 2. jan", name: "Juleferie", type: "Ferie" },
  { iso: "2027-02-23", dato: "22. – 26. feb", name: "Vinterferie (uke 8)", type: "Ferie" },
  { iso: "2027-03-22", dato: "22. – 28. mar", name: "Påskeferie", type: "Ferie" },
  { iso: "2027-05-01", dato: "1. mai 2027", name: "Offentlig fridag", type: "Fridag" },
  { iso: "2027-05-06", dato: "6. mai 2027", name: "Kristi himmelfartsdag", type: "Fridag" },
  { iso: "2027-05-17", dato: "17. mai 2027", name: "Grunnlovsdag", type: "Fridag" },
  { iso: "2027-06-18", dato: "18. jun 2027", name: "Siste skoledag", type: "Avslutning" },
];

export const PARENT_MEETINGS: {
  iso: string;
  dato: string;
  tid: string;
  hvor: string;
  tema: string;
}[] = [
  {
    iso: "2026-09-08",
    dato: "8. sep 2026",
    tid: "18:00",
    hvor: "WANG Fredrikstad, auditoriet",
    tema: "Oppstart og sesongplan",
  },
  {
    iso: "2026-11-26",
    dato: "26. nov 2026",
    tid: "18:00",
    hvor: "Digitalt (Teams)",
    tema: "Status og vinterperiode",
  },
  {
    iso: "2027-03-11",
    dato: "11. mar 2027",
    tid: "18:00",
    hvor: "WANG Fredrikstad, auditoriet",
    tema: "Turneringssesong og reise",
  },
  {
    iso: "2027-06-03",
    dato: "3. jun 2027",
    tid: "18:00",
    hvor: "GFGK klubbhus",
    tema: "Sesongavslutning",
  },
];

export const EXAM_PLAN: {
  iso: string;
  dato: string;
  fag: string;
  type: string;
  klasse: string;
}[] = [
  { iso: "2026-09-16", dato: "16. sep 2026", fag: "Norsk", type: "Skriftlig prøve", klasse: "VG2" },
  { iso: "2026-10-14", dato: "14. okt 2026", fag: "Matematikk", type: "Heldagsprøve", klasse: "VG1" },
  { iso: "2026-11-20", dato: "20. nov 2026", fag: "Treningslære", type: "Prøve", klasse: "VG3" },
  { iso: "2027-01-15", dato: "15. jan 2027", fag: "Engelsk", type: "Muntlig", klasse: "VG2" },
  { iso: "2027-03-03", dato: "3. mar 2027", fag: "Toppidrett", type: "Praktisk vurdering", klasse: "VG3" },
  { iso: "2027-05-20", dato: "20. mai 2027", fag: "Skriftlig eksamen", type: "Eksamensperiode", klasse: "VG3" },
];

// ---- Timeplan ----------------------------------------------------------

export const TT_DAYS = ["Man", "Tir", "Ons", "Tor", "Fre"];
export const TT_TIMES = ["08:00–10:00", "10:15–11:45", "12:15–13:45", "14:00–15:30"];

export interface TimeplanCelle {
  t: string;
  g: boolean; // true = Toppidrett golf-økt
}

const G = (t: string): TimeplanCelle => ({ t, g: true });
const S = (t: string): TimeplanCelle => ({ t, g: false });

export type Trinn = "VG1" | "VG2" | "VG3";

export const TIMETABLE: Record<Trinn, TimeplanCelle[][]> = {
  VG1: [
    [G("Toppidrett golf"), S("Matematikk"), G("Toppidrett golf"), S("Naturfag"), G("Toppidrett golf")],
    [S("Norsk"), S("Norsk"), S("Engelsk"), S("Historie"), S("Treningslære")],
    [S("Matematikk"), S("Engelsk"), S("Kroppsøving"), S("Naturfag"), S("Samfunnsfag")],
    [S("Naturfag"), S("Valgfag"), S("Historie"), S("Toppidrett teori"), S("Fri")],
  ],
  VG2: [
    [G("Toppidrett golf"), S("Norsk"), G("Toppidrett golf"), S("Matematikk"), G("Toppidrett golf")],
    [S("Engelsk"), S("Matematikk"), S("Historie"), S("Norsk"), S("Treningslære")],
    [S("Norsk"), S("Kjemi"), S("Kroppsøving"), S("Engelsk"), S("Samfunnsfag")],
    [S("Historie"), S("Valgfag"), S("Biologi"), S("Toppidrett teori"), S("Fri")],
  ],
  VG3: [
    [G("Toppidrett golf"), S("Matematikk R2"), G("Toppidrett golf"), S("Norsk"), G("Toppidrett golf")],
    [S("Treningslære"), S("Fysikk"), S("Norsk"), S("Historie"), S("Treningslære")],
    [S("Norsk"), S("Kroppsøving"), S("Biologi"), S("Engelsk"), S("Samfunnsfag")],
    [S("Historie"), S("Valgfag"), S("Toppidrett teori"), S("Eksamenstrening"), S("Fri")],
  ],
};

// ---- Samlinger ---------------------------------------------------------

export interface Treningssamling {
  name: string;
  dato: string;
  hvor: string;
  status: "Bekreftet" | "Planlegges";
  desc: string;
  arrangor: string;
  pamelding: string;
  pamfrist: string;
  egenandel: string;
  iso: string;
  fristIso: string | null;
}

export const TRAINING_CAMPS: Treningssamling[] = [
  {
    name: "Oppstartssamling",
    dato: "22.–24. aug 2026",
    hvor: "GFGK, Fredrikstad",
    status: "Bekreftet",
    desc: "Sparke i gang sesongen med teknikk, testing og bli-kjent.",
    arrangor: "WANG Toppidrett Fredrikstad",
    pamelding: "Automatisk påmeldt",
    pamfrist: "—",
    egenandel: "Ingen",
    iso: "2026-08-22",
    fristIso: null,
  },
  {
    name: "Høstsamling",
    dato: "17.–18. okt 2026",
    hvor: "GFGK + Salatamesteren",
    status: "Bekreftet",
    desc: "Overgang til innendørs – teknisk gjennomgang og fysisk testing.",
    arrangor: "WANG + GFGK",
    pamelding: "Via PlayerHQ",
    pamfrist: "10. okt 2026",
    egenandel: "200 kr",
    iso: "2026-10-17",
    fristIso: "2026-10-10",
  },
  {
    name: "Vintersamling",
    dato: "9.–11. jan 2027",
    hvor: "Salatamesteren + Active Trening",
    status: "Bekreftet",
    desc: "Simulator, styrke og spisstrening midt i spesialiseringsperioden.",
    arrangor: "WANG Toppidrett",
    pamelding: "Via PlayerHQ",
    pamfrist: "2. jan 2027",
    egenandel: "300 kr",
    iso: "2027-01-09",
    fristIso: "2027-01-02",
  },
  {
    name: "Treningsleir – Spania",
    dato: "22.–28. feb 2027",
    hvor: "La Cala Resort, Spania",
    status: "Planlegges",
    desc: "Uke 8: banespill i varmen. Bindende påmelding.",
    arrangor: "AK Golf Academy",
    pamelding: "Bindende via PlayerHQ",
    pamfrist: "1. des 2026",
    egenandel: "9 500 kr",
    iso: "2027-02-22",
    fristIso: "2026-12-01",
  },
  {
    name: "Vårsamling",
    dato: "17.–18. apr 2027",
    hvor: "GFGK, Fredrikstad",
    status: "Bekreftet",
    desc: "Ut på banen igjen – klargjøring mot turneringssesongen.",
    arrangor: "WANG + GFGK",
    pamelding: "Via PlayerHQ",
    pamfrist: "10. apr 2027",
    egenandel: "200 kr",
    iso: "2027-04-17",
    fristIso: "2027-04-10",
  },
  {
    name: "Sesongavslutning",
    dato: "19. jun 2027",
    hvor: "GFGK, Fredrikstad",
    status: "Planlegges",
    desc: "Oppsummering, sosialt og planer for neste sesong.",
    arrangor: "WANG Toppidrett",
    pamelding: "Åpen for foreldre",
    pamfrist: "12. jun 2027",
    egenandel: "Ingen",
    iso: "2027-06-19",
    fristIso: "2027-06-12",
  },
];

export interface Heldagssamling {
  dato: string;
  hvor: string;
  tema: string;
  iso: string;
}

export const FULL_DAY_CAMPS: Heldagssamling[] = [
  { dato: "5. sep 2026", hvor: "GFGK", tema: "Banestrategi og course management", iso: "2026-09-05" },
  { dato: "3. okt 2026", hvor: "Salatamesteren", tema: "Launch monitor og teknisk analyse", iso: "2026-10-03" },
  { dato: "14. nov 2026", hvor: "Active Trening", tema: "Fysisk testing og treningslære", iso: "2026-11-14" },
  { dato: "6. feb 2027", hvor: "Salatamesteren", tema: "Mentaltrening og pre-shot-rutiner", iso: "2027-02-06" },
  { dato: "13. mar 2027", hvor: "Salatamesteren", tema: "Scoringsspill og wedge-avstander", iso: "2027-03-13" },
  { dato: "8. mai 2027", hvor: "GFGK", tema: "Turneringsforberedelse og regler", iso: "2027-05-08" },
];

export function campStatus(s: Treningssamling["status"]): {
  statusColor: WangFarge;
  statusIcon: string;
  statusLabel: string;
} {
  return s === "Bekreftet"
    ? { statusColor: "teal", statusIcon: "check-circle", statusLabel: "Bekreftet" }
    : { statusColor: "orange", statusIcon: "clock", statusLabel: "Planlegges" };
}

// ---- «Krever handling» -------------------------------------------------

export interface Handling {
  iso: string;
  icon: string;
  title: string;
  sub: string;
  fane: "samlinger" | "foreldre";
  short: string;
}

/** Kommende frister/foreldremøter sett fra nå-ISO (klient-side Oslo-nå). */
export function byggHandlinger(naaIso: string): Handling[] {
  const ut: Handling[] = [];
  TRAINING_CAMPS.forEach((c) => {
    if (c.fristIso && c.fristIso >= naaIso) {
      ut.push({
        iso: c.fristIso,
        icon: "flag",
        title: "Påmeldingsfrist · " + c.name,
        sub: c.pamelding + (c.egenandel !== "Ingen" ? " · egenandel " + c.egenandel : ""),
        fane: "samlinger",
        short: c.name,
      });
    }
  });
  PARENT_MEETINGS.forEach((p) => {
    if (p.iso >= naaIso) {
      ut.push({
        iso: p.iso,
        icon: "users",
        title: "Foreldremøte · " + p.tema,
        sub: "kl. " + p.tid + " · " + p.hvor,
        fane: "foreldre",
        short: "Foreldremøte",
      });
    }
  });
  ut.sort((a, b) => (a.iso < b.iso ? -1 : 1));
  return ut;
}

export function daysUntil(isoStr: string, naaIso: string): number {
  return Math.round((d(isoStr).getTime() - d(naaIso).getTime()) / 864e5);
}

export function daysLabel(n: number): string {
  return n <= 0 ? "I dag" : n === 1 ? "I morgen" : n + " dager";
}

/** Mandag i uka for en UTC-dato. */
export function weekStartOf(dt: Date): Date {
  const x = d(iso(dt));
  x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7));
  return x;
}

export function rangeLabel(a: Date, b: Date): string {
  return a.getUTCMonth() === b.getUTCMonth()
    ? a.getUTCDate() + ".–" + b.getUTCDate() + ". " + MON_SHORT[b.getUTCMonth()]
    : a.getUTCDate() +
        ". " +
        MON_SHORT[a.getUTCMonth()] +
        " – " +
        b.getUTCDate() +
        ". " +
        MON_SHORT[b.getUTCMonth()];
}

export const TOTAL_WEEKS = Math.floor(SPAN_MS / (7 * 864e5)) + 1;

export function seasonWeek(naaIso: string): number {
  return Math.floor((d(naaIso).getTime() - SPAN_START.getTime()) / (7 * 864e5)) + 1;
}

// ---- Kalenderhendelser -------------------------------------------------

export type HendelseType = "okt" | "konkurranse" | "prove" | "skole";

export interface KalenderHendelse {
  type: HendelseType;
  label: string;
  time?: string;
}

export const EVENTS: Record<string, KalenderHendelse[]> = {};
function pushEv(k: string, ev: KalenderHendelse) {
  (EVENTS[k] = EVENTS[k] || []).push(ev);
}
SESSIONS.forEach((s) => pushEv(s.iso, { type: "okt", label: s.short, time: "08:00" }));
COMPS.forEach((c) => pushEv(c.iso, { type: "konkurranse", label: c.name }));
TESTS.forEach((t) => pushEv(t.iso, { type: "prove", label: t.name }));
SCHOOL.forEach((s) => pushEv(s.iso, { type: "skole", label: s.name }));
PARENT_MEETINGS.forEach((p) => pushEv(p.iso, { type: "skole", label: "Foreldremøte" }));
EXAM_PLAN.forEach((e) => pushEv(e.iso, { type: "prove", label: e.fag }));
const EV_PRIORITY: Record<HendelseType, number> = { konkurranse: 0, prove: 1, skole: 2, okt: 3 };
Object.keys(EVENTS).forEach((k) =>
  EVENTS[k].sort((a, b) => (EV_PRIORITY[a.type] ?? 9) - (EV_PRIORITY[b.type] ?? 9)),
);

export const EVENT_FARGER: Record<HendelseType, string> = {
  okt: "var(--wang-teal)",
  konkurranse: "var(--cat-orange)",
  prove: "var(--cat-purple)",
  skole: "var(--cat-blue)",
};

// ---- Tidslinje ---------------------------------------------------------

export const TIMELINE_SEGS = PERIODS.map((p) => ({
  w: pct(p.end) - pct(p.start),
  color: p.color,
  short: p.name.replace("periode", ""),
}));

export const TIMELINE_MARKS = COMPS.map((c) => ({ left: pct(c.iso).toFixed(1) + "%" }));

// ---- Årshjul / måneddetalj ---------------------------------------------

/** [månedsindeks 0–11, år] i sesongrekkefølge aug 2026 → jul 2027. */
export const MONTH_ORDER: [number, number][] = [
  [7, 2026],
  [8, 2026],
  [9, 2026],
  [10, 2026],
  [11, 2026],
  [0, 2027],
  [1, 2027],
  [2, 2027],
  [3, 2027],
  [4, 2027],
  [5, 2027],
  [6, 2027],
];

export const PERIOD_COL: Record<PeriodeKey | "pause", string> = {
  grunn: "var(--wang-teal)",
  spes: "var(--cat-blue)",
  turn: "var(--cat-orange)",
  pause: "var(--neutral-300)",
};

function inMonth(s: string, m: number, y: number): boolean {
  const dt = d(s);
  return dt.getUTCMonth() === m && dt.getUTCFullYear() === y;
}

export function monthPk(m: number, y: number): PeriodeKey | "pause" {
  const mid = new Date(Date.UTC(y, m, 15));
  if (iso(mid) > SPAN_END_ISO || iso(mid) < SPAN_START_ISO) return "pause";
  return periodKey(mid);
}

export interface MonthInfo {
  key: string;
  name: string;
  year: number;
  isNow: boolean;
  periodName: string;
  periodShort: string;
  periodColor: string;
  sessionCount: number;
  compCount: number;
  testCount: number;
  campCount: number;
  focus: string;
  locLabel: string;
  events: { iso: string; icon: string; color: WangFarge; title: string; sub: string; dateShort: string }[];
  hasEvents: boolean;
}

export function monthInfo(m: number, y: number, naaIso: string | null): MonthInfo {
  const mid = new Date(Date.UTC(y, m, 15));
  const pk = monthPk(m, y);
  const P = pk === "pause" ? null : PERIODS.find((p) => p.key === pk)!;
  const sessions = SESSIONS.filter((s) => inMonth(s.iso, m, y));
  const comps = COMPS.filter((c) => inMonth(c.iso, m, y));
  const tests = TESTS.filter((t) => inMonth(t.iso, m, y));
  const camps = TRAINING_CAMPS.filter((c) => inMonth(c.iso, m, y));
  const fulldays = FULL_DAY_CAMPS.filter((c) => inMonth(c.iso, m, y));
  const meetings = PARENT_MEETINGS.filter((c) => inMonth(c.iso, m, y));
  const golf = LOCATIONS[golfLoc(mid)];
  const ev: { iso: string; icon: string; color: WangFarge; title: string; sub: string }[] = [];
  comps.forEach((c) =>
    ev.push({ iso: c.iso, icon: "trophy", color: "orange", title: c.name, sub: "Turnering · " + c.place }),
  );
  tests.forEach((t) =>
    ev.push({ iso: t.iso, icon: "clipboard-list", color: "purple", title: t.name, sub: "Testdag" }),
  );
  camps.forEach((c) =>
    ev.push({ iso: c.iso, icon: "users", color: "navy", title: c.name, sub: "Samling · " + c.hvor }),
  );
  fulldays.forEach((c) =>
    ev.push({ iso: c.iso, icon: "sun", color: "teal", title: c.tema, sub: "Heldagssamling · " + c.hvor }),
  );
  meetings.forEach((c) =>
    ev.push({ iso: c.iso, icon: "message-circle", color: "blue", title: "Foreldremøte", sub: c.tema }),
  );
  ev.sort((a, b) => (a.iso < b.iso ? -1 : 1));
  const hasSport = sessions.length > 0;
  const naa = naaIso ? d(naaIso) : null;
  return {
    key: y + "-" + m,
    name: MONTHS_NO[m].charAt(0).toUpperCase() + MONTHS_NO[m].slice(1),
    year: y,
    isNow: naa !== null && m === naa.getUTCMonth() && y === naa.getUTCFullYear(),
    periodName: pk === "pause" ? "Utenom sesong" : P!.name,
    periodShort: pk === "pause" ? "Pause" : P!.name.replace("periode", ""),
    periodColor: PERIOD_COL[pk],
    sessionCount: sessions.length,
    compCount: comps.length,
    testCount: tests.length,
    campCount: camps.length + fulldays.length,
    focus: P
      ? P.focus
      : "Ingen organisert fellestrening denne måneden – sesongen er utenom aktiv periode.",
    locLabel: hasSport ? golf.name + " + Active Trening" : "—",
    events: ev.map((e) => ({
      iso: e.iso,
      icon: e.icon,
      color: e.color,
      title: e.title,
      sub: e.sub,
      dateShort: d(e.iso).getUTCDate() + ". " + MON_SHORT[d(e.iso).getUTCMonth()],
    })),
    hasEvents: ev.length > 0,
  };
}

// ---- Kompetansemål og vurdering (Skole) --------------------------------

export const SKALA_STD = [
  "Lav kompetanse · karakter 2",
  "God kompetanse · karakter 4",
  "Fremragende kompetanse · karakter 6",
];

export interface Delmaal {
  t: string;
  mal: string;
  koder: string;
}

export interface Maalomraade {
  navn: string;
  delmaal: Delmaal[];
}

export interface FagNivaa {
  fagnavn: string;
  laerer: string;
  skala: string[];
  omraader: Maalomraade[];
  /** kode → [kompetansemål, kjennetegn lav, kjennetegn god, kjennetegn fremragende] */
  koder: Record<string, [string, string, string, string]>;
}

export type FagKey = "top" | "kro";

export interface Fag {
  label: string;
  levels: Record<Trinn, FagNivaa>;
}

export const KM: Record<FagKey, Fag> = {
  top: {
    label: "Toppidrett golf",
    levels: {
      VG1: {
        fagnavn: "Toppidrett 1",
        laerer: "",
        skala: SKALA_STD,
        omraader: [
          {
            navn: "Ferdighetstrening",
            delmaal: [
              {
                t: "1. Ferdigheter i spesialidretten",
                mal: "Vise og anvende kunnskaper om spesialidretten for å utvikle egne ferdigheter, enten alene eller med andre til stede.",
                koder: "ACH",
              },
            ],
          },
          {
            navn: "Basistrening",
            delmaal: [
              {
                t: "2. Utfordre egen kapasitet",
                mal: "Utvikle sin fysiske og mentale kapasitet gjennom varierte og ulike former for trening.",
                koder: "DG",
              },
              {
                t: "3. Skadeforebyggende trening",
                mal: "Gjennomføre skadeforebyggende trening.",
                koder: "D",
              },
            ],
          },
          {
            navn: "Konkurransetrening",
            delmaal: [
              {
                t: "4. Konkurranseforberedelser",
                mal: "Forstå sin egen fysiske og mentale utvikling gjennom treningsdokumentasjon.",
                koder: "B",
              },
              {
                t: "5. Trene og leve som 24-timersutøver",
                mal: "Kunne reflektere over sitt eget treningsregime og speile det mot livet som toppidrettsutøver.",
                koder: "E",
              },
              {
                t: "6. Arbeid med mål og handlingsplan",
                mal: "Levere inn en mål- og handlingsplan som inneholder tilfredsstillende innhold i henhold til både kompetansemålene og trenings- og konkurranseerfaring.",
                koder: "F",
              },
            ],
          },
        ],
        koder: {
          A: [
            "Vise og utvikle ferdigheter i idretten og gjennomføre systematisk og målrettet trening",
            "Har vist lav teknisk og taktisk utførelse av ferdigheter i idretten. Viser liten evne til å gjennomføre systematisk og målrettet trening.",
            "Har vist god teknisk og taktisk utførelse av ferdigheter, samt utvikling i idretten gjennom systematisk og målrettet trening.",
            "Har vist svært god teknisk og taktisk utførelse av ferdigheter, og har stor utvikling i idretten gjennom systematisk og målrettet trening.",
          ],
          B: [
            "Dokumentere og evaluere en valgt treningsperiode",
            "Har i liten grad dokumentert eller evaluert en valgt treningsperiode med hjelp av treningsdagbok eller tilsvarende.",
            "Har god oversikt over egen trening og treningsobservasjoner i en treningsdagbok eller tilsvarende, og kan evaluere en treningsperiode.",
            "Har systematisk oversikt over egen trening og treningsobservasjoner i en systematisk treningsdagbok eller tilsvarende, og kan evaluere en treningsperiode.",
          ],
          C: [
            "Kjenne til ulike treningsformer, metoder, tester og øvelser som er relevant for ferdighetsutvikling i idretten og kunne bruke disse for å utvikle sin egen ferdighet",
            "Kjenner lite til ulike treningsformer, metoder, tester og øvelser som er relevant for ferdighetsutvikling i idretten.",
            "Kjenner i varierende grad til ulike treningsformer, metoder, tester og øvelser som er relevant for ferdighetsutvikling i idretten, og hvordan man kan bruke disse for å utvikle sin egen ferdighet.",
            "Kjenner i stor grad til ulike treningsformer, metoder, tester og øvelser som er relevant for ferdighetsutvikling i idretten, og hvordan man kan bruke disse for å utvikle sin egen ferdighet.",
          ],
          D: [
            "Gjennomføre basistrening og skadeforebyggende tiltak som gir grunnlag for økt treningsbelastning",
            "Har vist varierende innsatsvilje og motivasjon. Har til en viss grad gjennomført basistrening og skadeforebyggende tiltak som gir grunnlag for økt treningsbelastning.",
            "Har vist god motivasjon, intensitet og utholdenhet i timene. Har stort sett gjennomført basistrening og skadeforebyggende tiltak som gir grunnlag for økt treningsbelastning.",
            "Har vist høy innsats, motivasjon, intensitet og utholdenhet i timene. Har gjennomført all basistrening og skadeforebyggende tiltak som gir grunnlag for økt treningsbelastning.",
          ],
          E: [
            "Forstå forholdet mellom totalbelastning og restitusjon",
            "Viser liten forståelse for forholdet mellom totalbelastning og restitusjon.",
            "Viser middels forståelse for forholdet mellom totalbelastning og restitusjon.",
            "Viser stor grad av forståelse for forholdet mellom totalbelastning og restitusjon, og kan reflektere rundt dette.",
          ],
          F: [
            "Beskrive mentale forberedelser til trening og konkurranse",
            "Klarer i liten grad å beskrive mentale forberedelser til trening og konkurranse.",
            "Klarer i middels grad å beskrive mentale forberedelser til trening og konkurranse.",
            "Klarer i stor grad å beskrive mentale forberedelser til trening og konkurranse. Kjenner til bruk av mentale verktøy.",
          ],
          G: [
            "Bruke lyst- og lekbetonte oppvarmingsøvelser, aktiviteter, treningsformer og konkurranser for å stimulere til økt motivasjon",
            "Har liten gjennomføringsgrad og evne til å bruke lyst- og lekbetonte oppvarmingsøvelser, aktiviteter, treningsformer og konkurranser for å stimulere til økt motivasjon.",
            "Viser god forståelse og evne til å bruke lyst- og lekbetonte oppvarmingsøvelser, aktiviteter, treningsformer og konkurranser for å stimulere til økt motivasjon.",
            "Viser svært god forståelse, refleksjon og evne til å bruke lyst- og lekbetonte oppvarmingsøvelser, aktiviteter, treningsformer og konkurranser for å stimulere til økt motivasjon.",
          ],
          H: [
            "Vise god samhandling og respektfull treningsatferd som bidrar til aktivitetsglede og et godt lærings- og utviklingsmiljø",
            "Viser liten grad av samhandling og respektfull treningsatferd som bidrar til aktivitetsglede og et godt lærings- og utviklingsmiljø.",
            "Viser middels grad av samhandling og respektfull treningsatferd som bidrar til aktivitetsglede og et godt lærings- og utviklingsmiljø.",
            "Viser meget god samhandling og respektfull treningsatferd som bidrar til aktivitetsglede og et godt lærings- og utviklingsmiljø.",
          ],
        },
      },
      VG2: {
        fagnavn: "Konkurranse- og toppidrett 2",
        laerer: "",
        skala: SKALA_STD,
        omraader: [
          {
            navn: "Ferdighetstrening",
            delmaal: [
              {
                t: "1. Ferdigheter i spesialidretten",
                mal: "Kunne vise og videreutvikle ferdigheter og spisskompetanse for å kunne prestere i konkurranser, enten alene eller med andre til stede.",
                koder: "AIKJ",
              },
            ],
          },
          {
            navn: "Basistrening",
            delmaal: [
              {
                t: "2. Utfordre egen kapasitet",
                mal: "Vise vilje til egenutvikling gjennom å løse faglige utfordringer etter beste evne uten å gi opp, og kunne reflektere over sin fysiske og mentale kapasitet.",
                koder: "DH",
              },
              {
                t: "3. Skadeforebyggende trening",
                mal: "Anvende skadeforebyggende tiltak i sine daglige treningsrutiner.",
                koder: "D",
              },
            ],
          },
          {
            navn: "Konkurransetrening",
            delmaal: [
              {
                t: "4. Konkurranseforberedelser",
                mal: "Forstå sin egen fysiske og mentale utvikling gjennom treningsdokumentasjon, testing og idrettens krav, og deretter trene for og/eller mot konkurranser.",
                koder: "BCG",
              },
              {
                t: "5. Trene og leve som 24-timersutøver",
                mal: "Kunne reflektere over sitt eget treningsregime og sin egen livsstil, og speile det mot livet som toppidrettsutøver.",
                koder: "ELMOQ",
              },
              {
                t: "6. Arbeid med mål og handlingsplan",
                mal: "Levere inn en mål- og handlingsplan som inneholder tilfredsstillende innhold i henhold til både kompetansemålene og trenings- og konkurranseerfaring.",
                koder: "EGNP",
              },
            ],
          },
        ],
        koder: {
          A: ["Vise og videreutvikle ferdigheter som er sentrale for å prestere i konkurranser i idretten", "", "", ""],
          B: [
            "Gjennomføre systematisk og målrettet trening, og dokumentere og analysere resultatet av denne treningen",
            "",
            "",
            "",
          ],
          C: [
            "Gjøre rede for og gjennomføre relevante tester",
            "Kjenner til ulike tester.",
            "Kan planlegge og gjennomføre relevante tester.",
            "Kan planlegge og gjennomføre tester og retester med høy grad av validitet og reliabilitet (gyldighet og pålitelighet). Kan begrunne valget av tester.",
          ],
          D: [
            "Utvikle basisegenskaper og integrere skadeforebyggende tiltak i de daglige treningsrutinene",
            "",
            "",
            "",
          ],
          E: [
            "Gjøre rede for hvordan økt treningsmengde og totalbelastning stiller krav til organisering, planlegging, restitusjon og ernæring",
            "",
            "",
            "",
          ],
          F: [
            "Beskrive et utviklingsløp fra eget utgangspunkt og til ønsket nivå på kort og lang sikt",
            "",
            "",
            "",
          ],
          G: [
            "Reflektere over egne mentale behov og rutiner før, under og etter trening og i forbindelse med konkurranse",
            "",
            "",
            "",
          ],
          H: [
            "Gjøre rede for og bruke lyst- og lekbetonte aktiviteter, øvelser, treningsformer og konkurranser som kan stimulere til økt motivasjon",
            "",
            "",
            "",
          ],
          I: [
            "Utforske hvordan aktiviteter, øvelser, trening og konkurranse påvirker motivasjon og ferdighetsutvikling",
            "",
            "",
            "",
          ],
          J: ["Opptre på en måte som bidrar til et godt lærings- og utviklingsmiljø", "", "", ""],
          K: [
            "Utvikle spisskompetanse i spesialidretten i tråd med egne utviklingsmål",
            "Klarer i varierende grad å utvikle spisskompetanse i spesialidretten.",
            "Klarer ved bruk av sine egne utviklingsmål å utvikle spisskompetanse i spesialidretten.",
            "Klarer i høyeste grad ved bruk av sine egne utviklingsmål å utvikle spisskompetanse i spesialidretten.",
          ],
          L: [
            "Reflektere over gjennomføring av egne treningsøkter basert på egen opplevelse og tilbakemelding fra trener",
            "Kan i liten grad reflektere over gjennomføringen av egne treningsøkter basert på egen opplevelse og/eller tilbakemelding fra trener.",
            "Kan i middels grad reflektere over gjennomføringen av egne treningsøkter basert på egen opplevelse og/eller tilbakemelding fra trener.",
            "Kan i høy grad reflektere over gjennomføringen av egne treningsøkter basert både på egen opplevelse og tilbakemelding fra trener.",
          ],
          M: ["Reflektere over grunnleggende verdier som forventes av en toppidrettsutøver", "", "", ""],
          N: [
            "Utarbeide en plan for best mulig forberedelse til gjennomføring av konkurranse og kunne reflektere over denne planen",
            "Har utarbeidet en enkel plan for gjennomføring av konkurranse.",
            "Har utarbeidet en plan for forberedelse til gjennomføring av konkurranse. Kan i middels grad reflektere over denne planen.",
            "Har utarbeidet en plan for best mulig forberedelse til gjennomføring av konkurranse. Kan i høy grad reflektere over denne planen.",
          ],
          O: [
            "Forklare hvilke verdier og hvilke krav til livsstil og atferd som stilles til en toppidrettsutøver og utøve disse på treningssamling",
            "Kjenner til hvilke krav til livsstil og atferd som stilles til en toppidrettsutøver.",
            "Kan i middels grad redegjøre for hvilke krav til livsstil og atferd som stilles til en toppidrettsutøver, og utøve disse på treningssamling/treningsleir.",
            "Klarer i stor grad å redegjøre for hvilke krav til livsstil og atferd som stilles til en toppidrettsutøver, og utøve disse på treningssamling/treningsleir.",
          ],
          P: [
            "Analysere betydningen av restitusjonstiltak, kosthold og væsketilførsel i forberedelser til konkurransesituasjoner",
            "Kan i liten grad analysere betydningen av restitusjonstiltak, kosthold og væsketilførsel i forberedelser til konkurransesituasjoner.",
            "Kan i middels grad analysere betydningen av restitusjonstiltak, kosthold og væsketilførsel i forberedelser til konkurransesituasjoner.",
            "Kan i stor grad analysere betydningen av restitusjonstiltak, kosthold og væsketilførsel i forberedelser til konkurransesituasjoner.",
          ],
          Q: [
            "Reflektere over sammenhengen mellom en trygg identitet, et positivt selvbilde, toleranse for ulikheter og god psykisk og fysisk helse i en toppidrettshverdag",
            "",
            "",
            "",
          ],
        },
      },
      VG3: {
        fagnavn: "Konkurranse- og toppidrett 3",
        laerer: "",
        skala: SKALA_STD,
        omraader: [
          {
            navn: "Ferdighetstrening",
            delmaal: [
              {
                t: "1. Ferdigheter i spesialidretten",
                mal: "Kunne vise og utvikle spisskompetanse ved å trene på og anvende kunnskaper og ferdigheter i sin egen spesialidrett for å kunne prestere i konkurransesituasjoner, enten alene eller med andre til stede.",
                koder: "AEFGH",
              },
            ],
          },
          {
            navn: "Basistrening",
            delmaal: [
              {
                t: "2. Utfordre egen kapasitet",
                mal: "Vise vilje til egenutvikling gjennom å løse faglige utfordringer etter beste evne uten å gi opp, og kunne reflektere over sin fysiske og mentale kapasitet.",
                koder: "EH",
              },
              {
                t: "3. Skadeforebyggende trening",
                mal: "Anvende skadeforebyggende tiltak i sine daglige treningsrutiner.",
                koder: "D",
              },
            ],
          },
          {
            navn: "Konkurransetrening",
            delmaal: [
              {
                t: "4. Konkurranseforberedelser",
                mal: "Forstå sin egen fysiske og mentale utvikling gjennom treningsdokumentasjon, testing og idrettens krav, og deretter trene for og/eller mot konkurranser.",
                koder: "BCE",
              },
              {
                t: "5. Trene og leve som 24-timersutøver",
                mal: "Kunne reflektere over sitt eget treningsregime og sin egen livsstil, og speile det mot livet som toppidrettsutøver.",
                koder: "JKL",
              },
              {
                t: "6. Arbeid med mål og handlingsplan",
                mal: "Levere inn en mål- og handlingsplan som inneholder tilfredsstillende innhold i henhold til både kompetansemålene og trenings- og konkurranseerfaring.",
                koder: "CILM",
              },
            ],
          },
        ],
        koder: {
          A: ["Vise og utvikle ferdigheter som kan forbedre prestasjonen i konkurransesituasjoner", "", "", ""],
          B: [
            "Dokumentere, analysere og reflektere over gjennomført trening i lys av egne mål og resultater",
            "",
            "",
            "",
          ],
          C: [
            "Utarbeide planer og gjennomføre langsiktig, systematisk og målrettet trening i idretten med utgangspunkt i idrettens krav og egen kapasitet",
            "",
            "",
            "",
          ],
          D: [
            "Anvende skadeforebyggende øvelser og vurdere hvordan disse kan integreres i trening og forberedelse til konkurranse",
            "",
            "",
            "",
          ],
          E: [
            "Gjennomføre mentale forberedelser og mental trening, og reflektere over hvordan dette kan påvirke ferdighetsutvikling",
            "",
            "",
            "",
          ],
          F: [
            "Utforske og reflektere over hvordan aktiviteter, øvelser, trening og konkurranse påvirker motivasjon og ferdighetsutvikling",
            "",
            "",
            "",
          ],
          G: [
            "Opptre på en måte som fremmer treningsarbeidet og samhandlingen, og som bidrar til et trygt, positivt og godt utviklingsmiljø",
            "",
            "",
            "",
          ],
          H: ["Videreutvikle spisskompetanse i spesialidretten i tråd med egne utviklingsmål", "", "", ""],
          I: ["Analysere egen forberedelse til og gjennomføring av konkurranser", "", "", ""],
          J: [
            "Reflektere over egen adferd som idrettsutøver med bakgrunn i verdier og krav til livsstil og adferd som stilles til en toppidrettsutøver på treningssamling",
            "",
            "",
            "",
          ],
          K: [
            "Reflektere over hvilke egenskaper som bidrar til livsmestring og en god psykisk og fysisk helse i en toppidrettshverdag",
            "",
            "",
            "",
          ],
          L: [
            "Reflektere over eget ståsted i spesialidretten, samt vurdere hva som skal til for å komme videre i idrettskarrieren",
            "",
            "",
            "",
          ],
          M: [
            "Utarbeide egen plan for videre satsing og karriere i sin spesialidrett kombinert med plan for utdanning og framtidig yrkeskarriere",
            "",
            "",
            "",
          ],
        },
      },
    },
  },
  kro: {
    label: "Kroppsøving",
    levels: {
      VG1: {
        fagnavn: "Kroppsøving VG1",
        laerer: "Christian Lopez",
        skala: [
          "Lavt mestringsnivå · karakter 2",
          "Middels mestringsnivå · karakter 3–4",
          "Høyt mestringsnivå · karakter 5–6",
        ],
        omraader: [
          {
            navn: "Idrett- og bevegelsesaktivitet",
            delmaal: [
              {
                t: "1. Ferdigheter i ulike bevegelsesaktiviteter",
                mal: "Kunne gjennomføre leker, bevegelsesaktiviteter og dans sammen med andre.",
                koder: "A",
              },
              {
                t: "2. Samspill",
                mal: "Bruke egne ferdigheter og kunnskaper til å samarbeide og bidra til å gjøre andre gode i aktivitet og samspill.",
                koder: "C",
              },
            ],
          },
          {
            navn: "Helsefremmende livsstil",
            delmaal: [
              {
                t: "3. Egentrening",
                mal: "Kunne bruke egentrening for å fremme god psykisk og fysisk helse når man ikke fullt kan delta i aktiviteten. Kunne utføre grunnleggende førstehjelp.",
                koder: "BD",
              },
              {
                t: "4. Uteaktiviteter",
                mal: "Kunne gjennomføre uteaktiviteter til ulike årstider, og gjennomføre uteaktivitet med kart eller digitale verktøy i nærområdet.",
                koder: "EF",
              },
            ],
          },
        ],
        koder: {
          A: [
            "Trene på og skape nye varianter av lek, bevegelsesaktivitet og dans sammen med andre",
            "Har vist lav innsatsvilje og motivasjon for å trene på og skape nye varianter av lek, bevegelsesaktivitet og dans sammen med andre.",
            "Har vist middels innsatsvilje og motivasjon for å trene på og skape nye varianter av lek, bevegelsesaktivitet og dans sammen med andre.",
            "Har vist høy innsatsvilje, intensitet og motivasjon for å trene på og skape nye varianter av lek, bevegelsesaktivitet og dans sammen med andre.",
          ],
          B: [
            "Planlegge og gjennomføre metoder for øving og trening for å oppnå individuelle mål, og når man ikke fullt ut kan delta i aktiviteten",
            "Viser liten grad av forståelse for å planlegge og gjennomføre metoder for øving og trening for å oppnå individuelle mål.",
            "Viser middels grad av forståelse for å planlegge og gjennomføre metoder for øving og trening for å oppnå individuelle mål, og når man ikke fullt ut kan delta i aktiviteten.",
            "Viser høy grad av forståelse for å planlegge og gjennomføre metoder for øving og trening for å oppnå individuelle mål, og når man ikke fullt ut kan delta i aktiviteten.",
          ],
          C: [
            "Bruke egne ferdigheter og kunnskaper til å samarbeide og bidra til å gjøre andre gode i aktivitet og samspill",
            "Har vist lav innsatsvilje og motivasjon for å bruke egne ferdigheter og kunnskap til å samarbeide og bidra til å gjøre andre gode i aktivitet og samspill.",
            "Har vist middels innsatsvilje og motivasjon for å bruke egne ferdigheter og kunnskap til å samarbeide og bidra til å gjøre andre gode i aktivitet og samspill.",
            "Har vist innsatsvilje, engasjement og motivasjon for å bruke egne ferdigheter og kunnskap til å samarbeide og bidra til å gjøre andre gode i aktivitet og samspill.",
          ],
          D: [
            "Forebygge skader ved bevegelsesaktivitet og utføre grunnleggende førstehjelp",
            "Har vist liten kunnskap og gjennomføringsevne for å forebygge skader ved bevegelsesaktivitet.",
            "Har vist middels kunnskap og gjennomføringsevne for å forebygge skader ved bevegelsesaktivitet. Klarer å utføre grunnleggende førstehjelp.",
            "Har vist god forståelse, refleksjon og evne til å forebygge skader ved bevegelsesaktivitet. Klarer å utføre grunnleggende førstehjelp.",
          ],
          E: [
            "Bruke kart og digitale verktøy på en måte som sikrer trygg ferdsel for seg selv og for andre",
            "Kjenner lite til bruk av kart og digitale verktøy på en måte som sikrer trygg ferdsel for seg selv og for andre.",
            "Kjenner i varierende grad til bruk av kart og digitale verktøy på en måte som sikrer trygg ferdsel for seg selv og for andre.",
            "Kjenner i stor grad til bruk av kart og digitale verktøy på en måte som sikrer trygg ferdsel for seg selv og for andre.",
          ],
          F: [
            "Bruke lokale tradisjoner for ferdsel i naturen under vekslende årstider",
            "Har i liten grad brukt lokale tradisjoner for ferdsel i naturen under vekslende årstider.",
            "Har i middels grad brukt lokale tradisjoner for ferdsel i naturen under vekslende årstider.",
            "Har i stor grad brukt lokale tradisjoner for ferdsel i naturen under vekslende årstider.",
          ],
        },
      },
      VG2: {
        fagnavn: "Kroppsøving VG2",
        laerer: "Christian Lopez",
        skala: SKALA_STD,
        omraader: [
          {
            navn: "Idrett- og bevegelsesaktivitet",
            delmaal: [
              {
                t: "1. Ferdigheter i ulike bevegelsesaktiviteter",
                mal: "Fra egne forutsetninger og gjennom innsats kunne gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter for å forstå, påvirke og utvikle egne fysiske egenskaper.",
                koder: "A",
              },
              {
                t: "2. Samspill",
                mal: "Praktisere regler for å delta i ulike bevegelsesaktiviteter og medvirke til læring for andre.",
                koder: "C",
              },
            ],
          },
          {
            navn: "Helsefremmende livsstil",
            delmaal: [
              {
                t: "3. Egentrening",
                mal: "Fra egne forutsetninger og gjennom innsats kunne bruke egentrening for å fremme god psykisk og fysisk helse og bidra til en helsefremmende livsstil.",
                koder: "B",
              },
              {
                t: "4. Uteaktiviteter",
                mal: "Kunne gjennomføre uteaktiviteter til ulike årstider og gjennomføre friluftsliv i nærområdet.",
                koder: "DE",
              },
            ],
          },
        ],
        koder: {
          A: [
            "Gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter og forstå hvordan ulike aktiviteter påvirker og utvikler koordinasjon, styrke, utholdenhet og bevegelighet",
            "Har liten evne til å gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter, og har lite forståelse for hvordan ulike aktiviteter påvirker og utvikler koordinasjon, styrke, utholdenhet og bevegelighet.",
            "Har varierende evne til å gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter, og har middels forståelse for hvordan ulike aktiviteter påvirker og utvikler koordinasjon, styrke, utholdenhet og bevegelighet.",
            "Har god evne til å gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter, og viser forståelse og refleksjoner for hvordan ulike aktiviteter påvirker og utvikler koordinasjon, styrke, utholdenhet og bevegelighet.",
          ],
          B: [
            "Utføre trening på egenhånd og reflektere over hvordan fysisk aktivitet kan fremme god psykisk og fysisk helse og bidra til en helsefremmende livsstil etter avslutta skolegang og i fremtidig arbeidsliv",
            "Kan i liten grad utføre trening på egenhånd og reflektere over hvordan fysisk aktivitet kan fremme god psykisk og fysisk helse og bidra til en helsefremmende livsstil etter avslutta skolegang og i fremtidig arbeidsliv.",
            "Kan i middels grad utføre trening på egenhånd og reflektere over hvordan fysisk aktivitet kan fremme god psykisk og fysisk helse og bidra til en helsefremmende livsstil etter avslutta skolegang og i fremtidig arbeidsliv.",
            "Kan i høy grad utføre trening på egenhånd og reflektere over hvordan fysisk aktivitet kan fremme god psykisk og fysisk helse og bidra til en helsefremmende livsstil etter avslutta skolegang og i fremtidig arbeidsliv.",
          ],
          C: [
            "Praktisere regler for å delta i ulike bevegelsesaktiviteter og medvirke til læring for andre",
            "Har i liten grad praktisert regler for å delta i ulike bevegelsesaktiviteter og vist liten forståelse for hvordan dette medvirker til læring for andre.",
            "Har i varierende grad praktisert regler for å delta i ulike bevegelsesaktiviteter og vist middels forståelse for hvordan dette medvirker til læring for andre.",
            "Har i høy grad praktisert regler for å delta i ulike bevegelsesaktiviteter og vist god forståelse og refleksjoner for hvordan dette medvirker til læring for andre.",
          ],
          D: [
            "Planlegge og gjennomføre uteaktiviteter til ulike årstider, der formålet er å ha gode naturopplevelser",
            "Viser liten grad av forståelse for å planlegge og gjennomføre uteaktiviteter til ulike årstider, der formålet er å ha gode naturopplevelser.",
            "Viser middels grad av forståelse og evne for å planlegge og gjennomføre uteaktiviteter til ulike årstider, der formålet er å ha gode naturopplevelser.",
            "Viser høy grad av forståelse og evne for å planlegge og gjennomføre uteaktiviteter til ulike årstider, der formålet er å ha gode naturopplevelser.",
          ],
          E: [
            "Praktisere bærekraftig ferdsel i naturen og kunne gjennomføre friluftsliv i nærområdet",
            "Kjenner lite til bærekraftig ferdsel i naturen, og viser liten evne til å kunne gjennomføre friluftsliv i nærområdet.",
            "Kjenner i middels grad til bærekraftig ferdsel i naturen, og viser varierende evne til å kunne gjennomføre friluftsliv i nærområdet.",
            "Kjenner i høy grad til bærekraftig ferdsel i naturen, og viser god evne til å kunne gjennomføre friluftsliv i nærområdet.",
          ],
        },
      },
      VG3: {
        fagnavn: "Kroppsøving VG3",
        laerer: "Christian Lopez",
        skala: SKALA_STD,
        omraader: [
          {
            navn: "Idrett- og bevegelsesaktivitet",
            delmaal: [
              {
                t: "1. Ferdigheter i ulike bevegelsesaktiviteter",
                mal: "Kunne gjennomføre leker, idrettsaktiviteter og andre bevegelsesaktiviteter for å forstå, påvirke og utvikle egne fysiske egenskaper.",
                koder: "A",
              },
              {
                t: "2. Samspill",
                mal: "Kunne løse praktiske oppgaver i fellesskap og reflektere over hvordan egen medvirkning kan påvirke andre.",
                koder: "D",
              },
            ],
          },
          {
            navn: "Helsefremmende livsstil",
            delmaal: [
              {
                t: "3. Egentrening",
                mal: "Kunne reflektere rundt og bruke egentrening for å fremme god psykisk og fysisk helse og bidra til en helsefremmende livsstil.",
                koder: "BC",
              },
              {
                t: "4. Uteaktiviteter",
                mal: "Kunne gjennomføre uteaktiviteter til ulike årstider og gjennomføre friluftsliv i nærområdet.",
                koder: "E",
              },
            ],
          },
        ],
        koder: {
          A: [
            "Øve på og utvikle kunnskap og ferdigheter i ulike bevegelsesaktiviteter ut fra egne forutsetninger",
            "Har vist lav innsatsvilje og motivasjon for å øve på og utvikle kunnskap og ferdigheter i ulike bevegelsesaktiviteter ut fra egne forutsetninger.",
            "Har vist middels innsatsvilje og motivasjon for å øve på og utvikle kunnskap og ferdigheter i ulike bevegelsesaktiviteter ut fra egne forutsetninger.",
            "Har vist høy innsatsvilje, intensitet og motivasjon for å øve på og utvikle kunnskap og ferdigheter i ulike bevegelsesaktiviteter ut fra egne forutsetninger.",
          ],
          B: [
            "Planlegge, gjennomføre og vurdere egentrening og forklare hvordan dette kan medvirke til en fysisk aktiv og helsefremmende livsstil etter avslutta skolegang",
            "Har i liten grad planlagt, gjennomført og vurdert egentrening og forklart hvordan dette kan medvirke til en fysisk aktiv og helsefremmende livsstil etter avslutta skolegang.",
            "Har i middels grad planlagt, gjennomført og vurdert egentrening og forklart hvordan dette kan medvirke til en fysisk aktiv og helsefremmende livsstil etter avslutta skolegang.",
            "Har i høy grad planlagt, gjennomført og vurdert egentrening og forklart hvordan dette kan medvirke til en fysisk aktiv og helsefremmende livsstil etter avslutta skolegang.",
          ],
          C: [
            "Beskrive og drøfte sammenhengen mellom bevegelse, kropp, trening og helse i samfunnet",
            "Har vist liten evne i å beskrive og drøfte sammenhengen mellom bevegelse, kropp, trening og helse i samfunnet.",
            "Har vist varierende evne i å beskrive og drøfte sammenhengen mellom bevegelse, kropp, trening og helse i samfunnet.",
            "Har vist høy kunnskap og evne i å beskrive og drøfte sammenhengen mellom bevegelse, kropp, trening og helse i samfunnet.",
          ],
          D: [
            "Samarbeide om å løse praktiske oppgaver i et læringsfellesskap og ut fra øvelse og aktivitet reflektere over hvordan egen medvirkning kan påvirke andre",
            "Har vist liten evne for å samarbeide om å løse praktiske oppgaver i et læringsfellesskap, og ut fra øvelse og aktivitet vist lite refleksjon over hvordan egen medvirkning kan påvirke andre.",
            "Har vist varierende evne for å samarbeide om å løse praktiske oppgaver i et læringsfellesskap, og ut fra øvelse og aktivitet vist middels refleksjon over hvordan egen medvirkning kan påvirke andre.",
            "Har vist god evne for å samarbeide om å løse praktiske oppgaver i et læringsfellesskap, og ut fra øvelse og aktivitet vist høy grad av kunnskap og refleksjon over hvordan egen medvirkning kan påvirke andre.",
          ],
          E: [
            "Planlegge og gjennomføre uteaktiviteter og friluftsliv i nærområdet",
            "Har i liten grad planlagt og gjennomført uteaktiviteter og friluftsliv i nærområdet.",
            "Har i middels grad planlagt og gjennomført uteaktiviteter og friluftsliv i nærområdet.",
            "Har i høy grad planlagt og gjennomført uteaktiviteter og friluftsliv i nærområdet.",
          ],
        },
      },
    },
  },
};

/** [tint-bakgrunn, tekstfarge] per nivå lav/god/fremragende. */
export const KM_LEVEL_COLORS: [string, string][] = [
  ["var(--tint-pink)", "var(--cat-pink)"],
  ["var(--tint-orange)", "var(--cat-orange)"],
  ["var(--tint-teal)", "var(--wang-teal-text)"],
];

// ---- Foreldrechat (mock) -----------------------------------------------

export interface ChatMelding {
  id: number;
  sender: string;
  text: string;
  time: string;
  own: boolean;
}

export const CHAT_SEED: ChatMelding[] = [
  {
    id: 1,
    sender: "Ida Strand (mor til Emma)",
    text: "Hei alle sammen! Blir det felles transport til Regionsmesterskap i mai?",
    time: "man 09:12",
    own: false,
  },
  {
    id: 2,
    sender: "Trener Jonas Bakke",
    text: "Hei! Ja, vi samkjører fra GFGK kl. 07:00. Detaljert reiseinfo legges ut her og i PlayerHQ.",
    time: "man 09:40",
    own: false,
  },
  {
    id: 3,
    sender: "Marius Dahl (far til Jonas)",
    text: "Hva er påmeldingsfristen for treningsleiren til Spania?",
    time: "man 18:03",
    own: false,
  },
  {
    id: 4,
    sender: "Trener Jonas Bakke",
    text: "1. desember – bindende påmelding via PlayerHQ. Egenandel 9 500 kr, fly er inkludert.",
    time: "man 18:20",
    own: false,
  },
  {
    id: 5,
    sender: "Sofie Holm (mor til Ida)",
    text: "Supert, takk for raskt svar!",
    time: "tir 07:55",
    own: false,
  },
];
