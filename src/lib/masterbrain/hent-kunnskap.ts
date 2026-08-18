/**
 * hentMasterbrainKunnskap — velger riktig del av Masterbrain-fasiten for en
 * gitt oppgavetype, og pakker den som prompt-blokker med sporbarhet.
 *
 * Hvorfor denne finnes: fasiten har ligget synket i ./knowledge/ uten at noe
 * spurte den. Eneste faktiske bruk var `masterbrain.canonMethodology.categories`
 * i fabrikk-agent.ts. Alt annet — MORAD-posisjoner, svingfeil, ordbok,
 * mikroperiodisering — lå ubrukt. Denne funksjonen er broen.
 *
 * Designvalg:
 * - Statiske JSON-importer, ikke fs. Fungerer i serverless/edge uten filsystem,
 *   samme mønster som index.ts. (rag-select.ts bruker fs fordi den leser .md.)
 * - Ren funksjon uten I/O — enkel å teste, ingen nettverkskall, ingen DB.
 * - Returnerer BÅDE tekstblokker (til prompten) og versjonsinfo (til logging),
 *   slik at vi senere kan korrelere plan-kvalitet mot hvilken fasit-versjon
 *   som faktisk ble brukt.
 *
 * Oppdater ALDRI JSON-filene under knowledge/ her — endre kilden i
 * masterbrain-repoet og kjør `npm run sync:masterbrain`.
 */

import canonMethodology from "./knowledge/concepts/canon-methodology.json";
import ltadFramework from "./knowledge/concepts/ltad-framework.json";
import mikroperiodisering from "./knowledge/concepts/mikroperiodisering-og-tidsdimensjon.json";
import sgPrinciples from "./knowledge/concepts/sg-principles.json";
import drills from "./knowledge/entities/drills.json";
import faults from "./knowledge/entities/faults.json";
import ordbok from "./knowledge/entities/ordbok.json";
import positions from "./knowledge/entities/positions.json";

/**
 * Oppgavetyper. Bevisst få og grovkornede — én per reell agent-jobb, ikke én
 * per PlanAction.actionType. Flere actionTypes trenger samme kunnskap
 * (PYRAMID_ADJUST og WEEKLY_PROPOSAL leser begge CANON + mikroperiodisering),
 * så mapping fra actionType gjøres i AKSJON_TIL_OPPGAVE under.
 */
export type Oppgavetype =
  | "plan-generering"
  | "sg-diagnose"
  | "drill-forslag"
  | "periodisering"
  | "terminologi";

/** Kilde brukt i et svar — logges for sporbarhet. */
export type Kilde = {
  fil: string;
  versjon: string;
  status: string;
};

export type MasterbrainKunnskap = {
  oppgavetype: Oppgavetype;
  /** Ferdige tekstblokker til prompt-injeksjon. */
  blokker: string[];
  /** Hvilke fasit-filer og versjoner som ble brukt. */
  kilder: Kilde[];
  /** Kompakt versjonsstreng for logging, f.eks. "canon@3.5.0,faults@2.0.0". */
  versjonsnokkel: string;
  /**
   * Filer som ikke fikk plass innenfor tegnbudsjettet. Tom i normaltilfellet.
   * Aldri stilltiende — en agent som mangler kunnskap skal kunne se hvorfor.
   */
  utelatt: Kilde[];
};

export type HentOptions = {
  /**
   * Maks antall tegn på tvers av alle blokker. Blokker droppes HELE fra
   * slutten av rutinglista, aldri kuttet midt i — en avkortet hypotese-regel
   * er farligere enn å mangle blokken.
   * Rutinglista er sortert med mest oppgavekritiske fil først.
   */
  maksTegn?: number;
};

type Fasitfil = {
  fil: string;
  versjon: string;
  status: string;
  /** Bygger tekstblokken. Returnerer null hvis fila ikke har noe å bidra med. */
  blokk: () => string | null;
};

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

function felt(kilde: unknown, navn: string, fallback: string): string {
  if (kilde && typeof kilde === "object" && navn in kilde) {
    const v = (kilde as Record<string, unknown>)[navn];
    if (typeof v === "string") return v;
  }
  return fallback;
}

function json(verdi: unknown): string {
  return JSON.stringify(verdi, null, 2);
}

// ---------------------------------------------------------------------------
// Fasitfilene — hver vet hvordan den presenterer seg selv for en modell
// ---------------------------------------------------------------------------

const CANON: Fasitfil = {
  fil: "knowledge/concepts/canon-methodology.json",
  versjon: felt(canonMethodology, "version", "ukjent"),
  status: "FASIT",
  blokk: () =>
    [
      "## CANON — kategorier, pyramide, L-faser og perioder",
      "",
      "Pyramidens standardfordeling:",
      json(canonMethodology.pyramid_defaults),
      "",
      "L-faser (CS-spenn, miljø, TEK-andel):",
      json(canonMethodology.l_faser),
      "",
      "Perioder:",
      json(canonMethodology.periods),
    ].join("\n"),
};

const MIKROPERIODISERING: Fasitfil = {
  fil: "knowledge/concepts/mikroperiodisering-og-tidsdimensjon.json",
  versjon: felt(mikroperiodisering, "version", "ukjent"),
  status: felt(mikroperiodisering, "status", "ukjent"),
  blokk: () =>
    [
      "## Tidsdimensjon og mikroperiodisering",
      "",
      "4-ukers mikrosyklus:",
      json(mikroperiodisering.mikrosyklus_4_uker),
      "",
      "Regler for antall økter:",
      json(mikroperiodisering.okt_antall_regler),
      "",
      "Volumfordeling per spillernivå:",
      json(mikroperiodisering.volumfordeling_per_spillernivaa),
      "",
      "Fasilitets- og sesongregler (absolutte, ikke preferanser):",
      json(mikroperiodisering.fasilitet_og_sesong_regler),
      "",
      "VIKTIG — periodenavn skrives ulikt i CANON og i databasen.",
      "Skriv aldri CANON-strengen rått til et Prisma-felt. Oversett først:",
      json(mikroperiodisering.periodenavn_oversettelsestabell),
    ].join("\n"),
};

const SG_PRINSIPPER: Fasitfil = {
  fil: "knowledge/concepts/sg-principles.json",
  versjon: felt(sgPrinciples, "version", "ukjent"),
  status: "FASIT",
  blokk: () =>
    [
      "## Strokes Gained — bånd, konfidens og diagnostisk logikk",
      "",
      "APP-bånd med baselines og konfidens:",
      json(sgPrinciples.app_bands),
      "",
      "Diagnostisk logikk:",
      json(sgPrinciples.diagnostic_logic),
      "",
      "SG → MORAD-feil (ENESTE gyldige kopi av denne koblingen):",
      json(sgPrinciples.sg_to_morad_faults),
    ].join("\n"),
};

const FEIL: Fasitfil = {
  fil: "knowledge/entities/faults.json",
  versjon: felt(faults, "version", "ukjent"),
  status: felt(faults, "status", "ukjent"),
  blokk: () =>
    [
      "## MORAD svingfeil — HYPOTESER, ikke diagnoser",
      "",
      "Les denne regelen før du bruker noe under:",
      json(faults.diagnose_regel),
      "",
      "Feilkatalog med deteksjon, korreksjon og symptomer:",
      json(faults.entities),
    ].join("\n"),
};

const POSISJONER: Fasitfil = {
  fil: "knowledge/entities/positions.json",
  versjon: felt(positions, "version", "ukjent"),
  status: felt(positions, "status", "ukjent"),
  blokk: () =>
    [
      "## MORAD P1.0–P10.0 — posisjoner og målefelt",
      "",
      "Toleranser og poengskala:",
      json({ tolerances: positions.tolerances, scoring: positions.scoring }),
      "",
      "Bærende prinsipper:",
      json(positions.key_principles),
      "",
      "Posisjoner:",
      json(positions.entities),
    ].join("\n"),
};

const DRILLS: Fasitfil = {
  fil: "knowledge/entities/drills.json",
  versjon: felt(drills, "version", "ukjent"),
  status: felt(drills, "status", "ukjent"),
  blokk: () => {
    const antall = Object.keys(drills.entities ?? {}).length;
    if (antall === 0) {
      // Tom bank er en bevisst beslutning, ikke en feil. Blokken må si tydelig
      // at dette gjelder MORAD-banken — appens egen ExerciseDefinition-katalog
      // er noe annet og leveres separat i konteksten. Uten den presiseringen
      // motsier blokken systempromptens «bruk kun drill-navn fra listen».
      return [
        "## MORAD drill-banken i fasiten er TOM — under oppbygging",
        "",
        "Dette gjelder MORAD-drillene i Masterbrain. Appens egen øvelseskatalog",
        "(ExerciseDefinition) er en separat kilde og leveres eventuelt i",
        "konteksten som «tilgjengeligeDrills» — får du en slik liste, bruk den.",
        "",
        felt(drills, "agent_regel", "Ikke foreslå navngitte MORAD-drills."),
        "",
        "Begrunnelse for at MORAD-banken ble tømt:",
        json(drills.begrunnelse),
        "",
        "Uten en katalog i konteksten: beskriv HVA som bør trenes",
        "(pyramideområde, P-posisjon), men finn aldri på et drill-navn.",
      ].join("\n");
    }
    return [
      `## MORAD drill-bank (${antall} drills)`,
      "",
      "Bruk KUN navn herfra. Finn aldri på nye.",
      json(drills.entities),
    ].join("\n");
  },
};

const ORDBOK: Fasitfil = {
  fil: "knowledge/entities/ordbok.json",
  versjon: felt(ordbok, "version", "ukjent"),
  status: felt(ordbok, "status", "ukjent"),
  blokk: () => {
    const termer = Object.entries(ordbok.terms ?? {}).map(([navn, t]) => {
      const term = t as { norwegian_explanation?: string; category_name?: string };
      return {
        term: navn,
        kategori: term.category_name,
        forklaring: term.norwegian_explanation,
      };
    });
    if (termer.length === 0) return null;
    return [
      "## MORAD fagspråk (Mac O'Grady)",
      "",
      "Engelske fagtermer beholdes uoversatt. Forklaringene er på norsk.",
      json(termer),
    ].join("\n");
  },
};

const LTAD: Fasitfil = {
  fil: "knowledge/concepts/ltad-framework.json",
  versjon: felt(ltadFramework, "version", "ukjent"),
  status: "FASIT",
  blokk: () => {
    // Kun det planlegging trenger: volumtak og aldersspenn. Fasenes
    // prosa-lister (physical_focus, mental_focus, coaching_principles) er
    // ~4 000 tegn og hører hjemme i en samtale om utviklingsfilosofi, ikke i
    // en plan-generering som skal treffe riktig timetall.
    const faser = ltadFramework.phases.map((f) => ({
      id: f.id,
      navn: f.name_no,
      alder: `${f.age_min}-${f.age_max}`,
      golftimer_uke: `${f.golf_hours_per_week_min}-${f.golf_hours_per_week_max}`,
      treningstimer_uke: `${f.training_hours_per_week_min}-${f.training_hours_per_week_max}`,
    }));
    return [
      "## LTAD — aldersfaser og volumtak",
      "",
      "Volumtak per alder. Se også invariant inv_3: for spillere under 18 kan",
      "ukentlig volum aldri overstige spillerens alder i timer.",
      json(ltadFramework.golf_volumes),
      "",
      "Faser (aldersspenn og timetall):",
      json(faser),
    ].join("\n");
  },
};

// ---------------------------------------------------------------------------
// Rutingtabell — oppgavetype til fasitfiler
// ---------------------------------------------------------------------------

/**
 * Rutingtabell. Rekkefølgen er prioritet — mest oppgavekritiske fil først,
 * fordi tegnbudsjettet dropper fra slutten.
 *
 * Merk at DRILLS bevisst IKKE er med i plan-generering: der leverer appen sin
 * egen ExerciseDefinition-katalog i konteksten (`tilgjengeligeDrills`), og
 * MORAD-bankens «den er tom»-melding ville stått rett mot systempromptens
 * «bruk kun drill-navn fra listen». De to katalogene er ulike ting.
 */
const RUTING: Record<Oppgavetype, Fasitfil[]> = {
  "plan-generering": [CANON, MIKROPERIODISERING, LTAD],
  "sg-diagnose": [SG_PRINSIPPER, FEIL, POSISJONER],
  "drill-forslag": [DRILLS, FEIL, CANON],
  periodisering: [CANON, MIKROPERIODISERING],
  terminologi: [ORDBOK, POSISJONER],
};

/**
 * PlanAction.actionType → oppgavetype. Flere actionTypes deler kunnskapsbehov.
 * Ukjent actionType faller til plan-generering (bredeste, tryggeste sett).
 */
const AKSJON_TIL_OPPGAVE: Record<string, Oppgavetype> = {
  WEEKLY_PROPOSAL: "plan-generering",
  SESSION_ADD: "plan-generering",
  SESSION_REMOVE: "plan-generering",
  PYRAMID_ADJUST: "plan-generering",
  TRAINING_GAP: "plan-generering",
  FOCUS_CHANGE: "sg-diagnose",
  TM_BASELINE_PROPOSE: "sg-diagnose",
  DRILL_SUGGEST: "drill-forslag",
  DRILL_SWAP: "drill-forslag",
  PERIOD_SWITCH: "periodisering",
  DELOAD: "periodisering",
  TAPER_ENGAGE: "periodisering",
  INTENSITY_ADJUST: "periodisering",
  RECOVERY_ADD: "periodisering",
  REST_DAY_ADD: "periodisering",
};

// ---------------------------------------------------------------------------
// Offentlig API
// ---------------------------------------------------------------------------

/**
 * Henter Masterbrain-fasiten som trengs for en gitt oppgavetype.
 *
 * Ren funksjon: ingen I/O, ingen DB, ingen nettverkskall. Trygg å kalle
 * fra både server actions, cron-agenter og tester.
 */
export function hentMasterbrainKunnskap(
  oppgavetype: Oppgavetype,
  options: HentOptions = {},
): MasterbrainKunnskap {
  const filer = RUTING[oppgavetype];
  const blokker: string[] = [];
  const kilder: Kilde[] = [];
  const utelatt: Kilde[] = [];
  const maks = options.maksTegn ?? Number.POSITIVE_INFINITY;
  let brukt = 0;

  for (const f of filer) {
    const ref: Kilde = { fil: f.fil, versjon: f.versjon, status: f.status };
    const tekst = f.blokk();
    if (tekst == null) continue;
    // Første blokk tas alltid med, selv om den alene sprenger budsjettet —
    // et tomt kunnskapssett er verre enn et for stort.
    if (blokker.length > 0 && brukt + tekst.length > maks) {
      utelatt.push(ref);
      continue;
    }
    blokker.push(tekst);
    kilder.push(ref);
    brukt += tekst.length;
  }

  const versjonsnokkel = kilder
    .map((k) => `${k.fil.split("/").pop()?.replace(".json", "")}@${k.versjon}`)
    .join(",");

  return { oppgavetype, blokker, kilder, versjonsnokkel, utelatt };
}

/** Oversetter en PlanAction.actionType til oppgavetype. */
export function oppgavetypeForAksjon(actionType: string): Oppgavetype {
  return AKSJON_TIL_OPPGAVE[actionType] ?? "plan-generering";
}

/**
 * Ferdig prompt-blokk. Tom streng hvis ingenting er relevant — da endres
 * ikke prompten i det hele tatt.
 */
export function formatMasterbrainBlokk(kunnskap: MasterbrainKunnskap): string {
  if (kunnskap.blokker.length === 0) return "";

  // Utelatte filer nevnes eksplisitt i prompten. Uten dette svarer modellen
  // like selvsikkert på et mangelfullt grunnlag som på et komplett.
  const mangel =
    kunnskap.utelatt.length > 0
      ? [
          "",
          "MERK — følgende fasit-filer fikk ikke plass og er IKKE med under:",
          ...kunnskap.utelatt.map((k) => `  - ${k.fil}`),
          "Trenger du dem for å svare forsvarlig, si det i stedet for å gjette.",
        ].join("\n")
      : "";

  return [
    "",
    "",
    "<masterbrain-fasit>",
    "Dette er den autoritative fagkunnskapen for AK Golf. Ved motstrid mellom",
    "denne blokken og noe annet i prompten: denne gjelder. Mangler kunnskapen",
    "her, si at den mangler — finn aldri på golfmetodikk.",
    mangel,
    "",
    kunnskap.blokker.join("\n\n---\n\n"),
    "</masterbrain-fasit>",
  ].join("\n");
}
