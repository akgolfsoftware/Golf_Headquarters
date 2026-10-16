/**
 * Datakontrakten for Plan-hub (AG-14, /admin/plan). Ren type-modul, trygg å
 * importere fra klientkomponenter. Lasteren er `planhub-data.ts`.
 */
import type { LPhase } from "@/generated/prisma/enums";
import type { PyramideKode } from "@/lib/domain/ak-formel-v2";
import type { PlanhubOvelse } from "./planhub-ovelse";

export type { PlanhubOvelse };

export type PlanhubAksetall = { akse: PyramideKode; verdi: number };

export type PlanhubUkeblokk = { fraUke: number; tilUke: number; akse: PyramideKode; oktAntall: number };

/** En PlanTemplate. Ukemal = varighet én uke eller mindre; program = flere uker. */
export type PlanhubMal = {
  id: string;
  navn: string;
  beskrivelse: string | null;
  /** NGF-kategori A–K. */
  kategori: string;
  fase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  usageCount: number;
  oktAntall: number;
  godkjent: boolean;
  /** Andel per akse i prosent fra malens fordeling (0–100). Tom = ugyldig kilde. */
  fordeling: PlanhubAksetall[];
  /** Planlagte minutter per akse fra øktene i malen. Tom = ingen økter. */
  minutter: PlanhubAksetall[];
  ukeOversikt: PlanhubUkeblokk[];
  /** Snitt SG-Total-delta fra PlanEffectiveness; null = ingen målinger. */
  effektAvg: number | null;
  effektAntall: number;
};

/** En OktMal (standardøkt). */
export type PlanhubStandardokt = {
  id: string;
  navn: string;
  akse: PyramideKode;
  minutter: number;
  ovelseAntall: number;
};

export type PlanhubUke = {
  nr: number;
  spillere: number;
  okter: number;
  /** Aktive spillere uten noen økt i uka (manglende planlegging, ikke gjennomføring). */
  udekket: number;
};

export type PlanhubData = {
  uke: PlanhubUke;
  /** «Åpne uka i Workbench»: dagens økt → første spiller med økt i uka → første spiller → stallen. */
  workbenchHref: string;
  ukemaler: PlanhubMal[];
  program: PlanhubMal[];
  standardokter: PlanhubStandardokt[];
  ovelser: PlanhubOvelse[];
  /** Antall øvelser coachen ser i alt; lista viser de sist endrede. */
  ovelserTotalt: number;
};

export type PlanhubFane = "ukemaler" | "program" | "standardokter" | "ovelser";
export const PLANHUB_FANER: readonly PlanhubFane[] = ["ukemaler", "program", "standardokter", "ovelser"];
export function erPlanhubFane(v: unknown): v is PlanhubFane {
  return typeof v === "string" && (PLANHUB_FANER as readonly string[]).includes(v);
}
