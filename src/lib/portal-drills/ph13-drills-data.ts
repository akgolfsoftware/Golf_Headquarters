/**
 * Datamodell og hjelpere for PH-13 Øvelsesbank i Precision Athletics.
 * Kilde: Claude Design ui_kits/playerhq/screens/PH-13.jsx og ui_kits/playerhq/data.js.
 */

import type { DrillDetail } from "./drills-data";

export type PH13Akse = "fys" | "tek" | "slag" | "spill" | "turn";

export type PH13Drill = {
  id: string;
  axis: PH13Akse;
  area: string;
  name: string;
  code: string;
  mot: string | null;
  dim: string | null;
  bel: string | null;
  press: string | null;
  p: string | null;
  qty: string;
  min: number;
  goal: string | null;
  src: "coach" | "mine" | "caddie";
  desc: string | null;
  draft?: boolean;
  why?: string | null;
  bruktTekst?: string | null;
};

export const PH13_AKSER: readonly PH13Akse[] = ["fys", "tek", "slag", "spill", "turn"] as const;

export const AKSE_TITLER: Record<PH13Akse, string> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

/**
 * Beregner break i cm ved gitt avstand i fot, helningsprosent og stimp.
 * Fasitformel fra Claude Design PH-13: Math.round(0.55 * fot * slope * (stimp / 10))
 */
export function beregnBreakCm(fot: number, slopeProsent: number, stimp: number): number {
  const k = stimp / 10;
  return Math.round(0.55 * fot * slopeProsent * k);
}

/**
 * Filtrerer drills basert på kilde ("Alle", "Fra coach", "Mine"),
 * akse ("alle", "fys", "tek", "slag", "spill", "turn") og søkestreng.
 */
export function filtrerDrills(
  drills: PH13Drill[],
  kilde: string,
  akse: string,
  sok: string
): PH13Drill[] {
  const q = sok.trim().toLowerCase();
  return drills.filter((d) => {
    // Kilde-filter
    if (kilde === "Fra coach" && d.src !== "coach") return false;
    if (kilde === "Mine" && d.src !== "mine") return false;

    // Akse-filter
    if (akse !== "alle" && d.axis !== akse) return false;

    // Søk
    if (q) {
      const match =
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.area.toLowerCase().includes(q) ||
        (d.desc && d.desc.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Konverterer en rik ExerciseDefinition / DrillDetail til en PH13Drill.
 */
export function konverterExerciseTilPH13(
  d: DrillDetail,
  okterBrukt = 0
): PH13Drill {
  const axis = d.axis.toLowerCase() as PH13Akse;
  const area = d.skillArea
    ? d.skillArea.replace("_", " ").toLowerCase()
    : d.axis;

  const codeParts: string[] = [d.axis];
  if (d.skillArea) codeParts.push(d.skillArea);
  if (d.lPhase) codeParts.push(d.lPhase);
  if (d.environment.length > 0) codeParts.push(d.environment[0]);

  const qty =
    d.defaultSets && d.defaultReps
      ? `${d.defaultSets} × ${d.defaultReps}`
      : d.defaultRepsSets || (d.durationMin ? `${d.durationMin} min` : "1 økt");

  return {
    id: d.id,
    axis,
    area: area.charAt(0).toUpperCase() + area.slice(1),
    name: d.title,
    code: codeParts.join("_"),
    mot: d.lPhase ? d.lPhase : null,
    dim: d.practiceType ? d.practiceType : null,
    bel: d.environment.length > 0 ? d.environment.join(", ") : null,
    press: null,
    p: null,
    qty,
    min: d.durationMin ?? 15,
    goal: null,
    src: d.source === "PLAYER" ? "mine" : "coach",
    desc: d.description,
    bruktTekst:
      okterBrukt > 0
        ? `brukt i ${okterBrukt} ${okterBrukt === 1 ? "økt" : "økter"} siste 30 dager`
        : "ny for deg",
  };
}

export const SYNTETISKE_PH13_DRILLS: PH13Drill[] = [
  {
    id: "o1",
    axis: "slag",
    area: "Innspill 50–100 m",
    name: "Innspill 50–100 m · Lengdekontroll · Automatikk",
    code: "SLAG_INNSPILL50_AUTO_TRENINGSOMRÅDE_ALENE",
    mot: "Automatikk",
    dim: "Lengdekontroll",
    bel: "Utendørs treningsområde",
    press: "Alene",
    p: "P4.0–P7.0",
    qty: "40 slag",
    min: 20,
    goal: "7 av 10 innenfor 4 m",
    src: "coach",
    desc: "Tre lengder: 40, 50 og 60 m. Bytt lengde hvert slag. Registrer avstand fra flagget på hvert slag.",
    bruktTekst: "brukt i 3 økter siste 30 dager",
  },
  {
    id: "o2",
    axis: "slag",
    area: "Innspill 100–150 m",
    name: "Innspill 100–150 m · Lengdekontroll · Automatikk",
    code: "SLAG_INNSPILL100_AUTO_TRENINGSOMRÅDE_OBSERVERT",
    mot: "Automatikk",
    dim: "Lengdekontroll",
    bel: "Utendørs treningsområde",
    press: "Observert",
    p: "P6.0–P8.0",
    qty: "30 slag",
    min: 20,
    goal: "Snitt innenfor 6 m",
    src: "coach",
    desc: "Samme kølle, tre mål. Coach eller medspiller noterer carry fra TrackMan.",
    bruktTekst: "brukt i 1 økt siste 30 dager",
  },
  {
    id: "o3",
    axis: "tek",
    area: "Innspill 150–200 m",
    name: "Innspill 150–200 m · Kurve · Lav hastighet",
    code: "TEK_INNSPILL150_LH_INNENDØRS_ALENE",
    mot: "Lav hastighet",
    dim: "Kurve",
    bel: "Innendørs golf",
    press: "Alene",
    p: "P6.0–P7.0",
    qty: "30 slag",
    min: 25,
    goal: "Club Path mellom −1° og +1°",
    src: "coach",
    desc: "Halv hastighet. Fokus på Club Path fra P6.0 til P7. Se på TrackMan etter hvert femte slag.",
    bruktTekst: "ny for deg",
  },
  {
    id: "o4",
    axis: "tek",
    area: "Utslag",
    name: "Utslag · Sikte og oppstilling · Uten ball",
    code: "TEK_UTSLAG_UB_INNENDØRS_ALENE",
    mot: "Uten ball",
    dim: "Sikte og oppstilling",
    bel: "Innendørs golf",
    press: "Alene",
    p: "P1.0",
    qty: "20 repetisjoner",
    min: 10,
    goal: "Samme oppstilling 20 av 20",
    src: "mine",
    desc: "Stav på bakken for sikte. Film forfra og fra siden annenhver repetisjon.",
    bruktTekst: "brukt i 2 økter siste 30 dager",
  },
  {
    id: "o5",
    axis: "slag",
    area: "Pitch",
    name: "Pitch · Landingspunkt",
    code: "SLAG_PITCH_TRENINGSOMRÅDE_OBSERVERT",
    mot: null,
    dim: "Landingspunkt",
    bel: "Utendørs treningsområde",
    press: "Observert",
    p: null,
    qty: "30 slag",
    min: 15,
    goal: "20 av 30 i landingssonen",
    src: "coach",
    desc: "Håndkle som landingssone 1 m × 1 m. Tre lengder mellom 15 og 30 m.",
    bruktTekst: "ny for deg",
  },
  {
    id: "o6",
    axis: "slag",
    area: "Putting 3–5",
    name: "Putting 3–5 fot · Ballstart",
    code: "SLAG_PUTTING3-5_TRENINGSOMRÅDE_KONKURRANSE",
    mot: null,
    dim: "Ballstart",
    bel: "Utendørs treningsområde",
    press: "Konkurranse",
    p: null,
    qty: "50 putter",
    min: 20,
    goal: "45 av 50 i hull",
    src: "coach",
    desc: "Port med to tees foran ballen. Seks posisjoner rundt hullet. Start på nytt ved bom.",
    bruktTekst: "brukt i 4 økter siste 30 dager",
  },
  {
    id: "o7",
    axis: "slag",
    area: "Bunker",
    name: "Bunker · Sandinngang · Med ball",
    code: "SLAG_BUNKER_TRENINGSOMRÅDE_ALENE",
    mot: null,
    dim: "Sandinngang",
    bel: "Utendørs treningsområde",
    press: "Alene",
    p: null,
    qty: "30 slag",
    min: 15,
    goal: "Sandinngang innenfor linja 25 av 30",
    src: "mine",
    desc: "Tegn en linje i sanden. Treff sanden på eller bak linja.",
    bruktTekst: "ny for deg",
  },
  {
    id: "o8",
    axis: "fys",
    area: "Styrke",
    name: "Styrke · Knebøy",
    code: "FYS_STYRKE_INNENDØRS_ALENE",
    mot: null,
    dim: null,
    bel: "Innendørs golf",
    press: "Alene",
    p: null,
    qty: "4 × 6 @ 40 kg · RIR 2",
    min: 20,
    goal: "Alle serier med RIR 2",
    src: "coach",
    desc: "Kontrollert ned, eksplosivt opp. Hvile 2 min mellom serier.",
    bruktTekst: "brukt i 5 økter siste 30 dager",
  },
  {
    id: "o9",
    axis: "fys",
    area: "Bevegelighet",
    name: "Bevegelighet · Hofte og thorax",
    code: "FYS_BEVEGELIGHET_INNENDØRS_ALENE",
    mot: null,
    dim: null,
    bel: "Innendørs golf",
    press: "Alene",
    p: null,
    qty: "15 min",
    min: 15,
    goal: "—",
    src: "coach",
    desc: "Fem øvelser à 3 minutter. Rolig pust.",
    bruktTekst: "brukt i 2 økter siste 30 dager",
  },
  {
    id: "o10",
    axis: "spill",
    area: "Banespill",
    name: "Banespill · Strategioppgave · 9 hull",
    code: "SPILL_BANESPILL_BANE_OBSERVERT",
    mot: null,
    dim: "Strategioppgave",
    bel: "Golfbane",
    press: "Observert",
    p: null,
    qty: "9 hull",
    min: 120,
    goal: "Følg gameplan på 9 av 9 hull",
    src: "coach",
    desc: "Skriv gameplan før runden. Marker avvik på scorekortet.",
    bruktTekst: "ny for deg",
  },
  {
    id: "o11",
    axis: "turn",
    area: "Banespill",
    name: "Treningsturnering",
    code: "TURN_TRENINGSTURNERING",
    mot: null,
    dim: null,
    bel: null,
    press: null,
    p: null,
    qty: "18 hull",
    min: 270,
    goal: "Brutto score under 80 slag",
    src: "coach",
    desc: "Klubbturnering. Registrer brutto score og SG etter runden.",
    bruktTekst: "brukt i 1 økt siste 30 dager",
  },
];

export const SYNTETISKE_PH13_CADDIE_FORSLAG: PH13Drill[] = [
  {
    id: "c1",
    axis: "slag",
    area: "Putting 3–5 fot",
    name: "Putting 3–5 fot · Lengdekontroll",
    code: "SLAG_PUTTING3-5_TRENINGSOMRÅDE_ALENE",
    mot: null,
    dim: "Lengdekontroll",
    bel: "Utendørs treningsområde",
    press: "Alene",
    p: null,
    qty: "40 putter",
    min: 15,
    goal: "—",
    src: "caddie",
    draft: true,
    desc: "Fokus på jevn pendel og konsekvent rull på korte putter.",
    why: "Tre av fire tapte putter siste 5 runder var fra 3–5 fot. SG PUTT −0,6.",
  },
  {
    id: "c2",
    axis: "slag",
    area: "Innspill 50–100 m",
    name: "Innspill 50–100 m · Høyde · Lav hastighet",
    code: "SLAG_INNSPILL50_LH_TRENINGSOMRÅDE_ALENE",
    mot: "Lav hastighet",
    dim: "Høyde",
    bel: "Utendørs treningsområde",
    press: "Alene",
    p: null,
    qty: "30 slag",
    min: 15,
    goal: "—",
    src: "caddie",
    draft: true,
    desc: "Rolige slag for å stabilisere utgangsvinkel og spinntall.",
    why: "Launch Angle på 54° varierer 6° mellom slag. Snitt 31,2°.",
  },
];
