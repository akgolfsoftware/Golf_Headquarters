/**
 * Målsetninger i nytt design (PH-11-MAL og «Én målsetning»). Typer og ren logikk, ingen I/O.
 *
 * «Burde vært» regnes bare når start, målsetning og frist finnes: lineær vei fra start
 * (da målsetningen ble satt) til målsetningen på fristen. Mangler én av dem, er svaret null
 * og visningen skriver «—». Ingen verdi gjettes.
 */

import type { GoalProgressStatus } from "@/lib/portal/goals/progress";
import type { PlanNivaa, PlanNivaaKilde } from "@/lib/domain/maal-plannivaa";

export type MaalAkse = "fys" | "tek" | "slag" | "spill" | "turn";
export type MaalTempo = "nadd" | "foran" | "i-rute" | "bak" | "ingen-data";
export type MaalNivaFilter = "alle" | "ar" | "per" | "mnd" | "okt";

export type MaalKortNy = {
  id: string;
  navn: string;
  kategori: "OUTCOME" | "PROCESS";
  niva: PlanNivaa;
  nivaKilde: PlanNivaaKilde;
  /** «frist 31. mai 2027» eller «uten frist». */
  fristTekst: string;
  akse: MaalAkse | null;
  akseTekst: string | null;
  /** Ferdig formaterte tall. null = «—». */
  start: string | null;
  naa: string | null;
  maal: string | null;
  /** Bredde på fremdriftssporet (0–100). null = ingen måling, sporet vises ikke. */
  pst: number | null;
  /** «Burde vært»-streken (0–100). null når start, målsetning eller frist mangler. */
  burdePst: number | null;
  tempo: MaalTempo;
  statusTekst: string;
  kildeTekst: string | null;
};

export type MaalListeData = {
  goals: MaalKortNy[];
  milepael: { tittel: string; dato: string } | null;
};

export type MaalMaling = { id: string; tekst: string; verdi: string; kilde: string };
export type MaalKurvePunkt = { dato: string; verdi: number };
export type MaalOktNy = { id: string; tid: string; navn: string; info: string[]; akse: MaalAkse | null };

export type MaalEnNy = {
  id: string;
  navn: string;
  kategori: "OUTCOME" | "PROCESS";
  status: "ACTIVE" | "ACHIEVED" | "ABANDONED";
  /** «Målsetning · År · frist 31. mai 2027». */
  overlinje: string;
  akse: MaalAkse | null;
  akseTekst: string | null;
  naa: string | null;
  enhet: string;
  tempo: MaalTempo;
  trendTekst: string;
  fremdrift: { pst: number; burdePst: number; start: string; burde: string; maal: string } | null;
  /** Start og målsetning når fremdriftslinjen ikke kan tegnes. */
  start: string | null;
  maal: string | null;
  forklar: string;
  kildeTekst: string | null;
  kurve: { punkter: MaalKurvePunkt[]; tittel: string; kilde: string } | null;
  malinger: MaalMaling[];
  /** Tom-tekst når målingene mangler. */
  malingerTom: string;
  /** null = ingen ærlig kobling mellom målsetningen og økter; seksjonen utelates. */
  okter: { liste: MaalOktNy[]; kilde: string } | null;
  avsluttTekst: string | null;
  erEget: boolean;
  initial: {
    title: string;
    category: "OUTCOME" | "PROCESS";
    type: string;
    targetValue: number | null;
    targetDate: string | null;
    linkedPyramidArea: string | null;
    linkedTestId: string | null;
    sgOmrade: string | null;
    planNivaa: string | null;
  };
};

export const NIVA_FILTER: Record<PlanNivaa, Exclude<MaalNivaFilter, "alle">> = {
  AAR: "ar",
  PERIODE: "per",
  MANED: "mnd",
  UKE: "mnd",
  OKT: "okt",
};

const DAG = 86_400_000;

/** Andel av tiden fra start til frist som er gått (0–1). null uten gyldig spenn. */
export function tidsandel(startMs: number, fristMs: number | null, naaMs: number): number | null {
  if (fristMs == null || !Number.isFinite(startMs) || !Number.isFinite(fristMs)) return null;
  const spenn = fristMs - startMs;
  if (spenn < DAG) return null;
  return Math.max(0, Math.min(1, (naaMs - startMs) / spenn));
}

/** Verdien spilleren burde vært på nå, på en rett linje fra start til målsetning. */
export function burdeVaert(start: number | null, maal: number | null, andel: number | null): number | null {
  if (start == null || maal == null || andel == null || start === maal) return null;
  return start + (maal - start) * andel;
}

/**
 * Tempoet. Med «burde vært» sammenlignes fremdriften med tiden som er gått
 * (fem prosentpoeng slingringsmonn). Uten den brukes statusen fra beregnGoalProgress.
 */
export function vurderTempo(input: {
  status: GoalProgressStatus;
  hasData: boolean;
  pst: number | null;
  burdePst: number | null;
}): MaalTempo {
  const { status, hasData, pst, burdePst } = input;
  if (!hasData) return "ingen-data";
  if (status === "achieved") return "nadd";
  if (pst != null && burdePst != null) {
    if (pst >= burdePst + 5) return "foran";
    if (pst >= burdePst - 5) return "i-rute";
    return "bak";
  }
  return status === "behind" ? "bak" : "i-rute";
}

export const TEMPO_TEKST: Record<MaalTempo, string> = {
  nadd: "Nådd",
  foran: "Foran tidsplanen",
  "i-rute": "I rute",
  bak: "Bak tidsplanen",
  "ingen-data": "Ingen målinger",
};

export function erIRute(tempo: MaalTempo): boolean {
  return tempo === "nadd" || tempo === "foran" || tempo === "i-rute";
}

/** Norsk tall: desimalkomma, ekte minus, valgfritt plusstegn. */
export function formatTall(v: number | null, desimaler = 1, fortegn = false): string | null {
  if (v == null || !Number.isFinite(v)) return null;
  const avrundet = Number(v.toFixed(desimaler));
  const tekst = Math.abs(avrundet).toFixed(desimaler).replace(".", ",");
  if (avrundet < 0) return `−${tekst}`;
  return fortegn && avrundet > 0 ? `+${tekst}` : tekst;
}

/** Punkter i et SVG-felt. Y snus (høyere verdi høyere opp). Trenger minst to punkter. */
export function kurveKoordinater(
  verdier: number[],
  felt: { x0: number; x1: number; y0: number; y1: number },
): { x: number; y: number }[] {
  if (verdier.length < 2) return [];
  const min = Math.min(...verdier);
  const max = Math.max(...verdier);
  const span = max - min || 1;
  const steg = (felt.x1 - felt.x0) / (verdier.length - 1);
  return verdier.map((v, i) => ({
    x: Math.round((felt.x0 + i * steg) * 10) / 10,
    y: Math.round((felt.y1 - ((v - min) / span) * (felt.y1 - felt.y0)) * 10) / 10,
  }));
}
