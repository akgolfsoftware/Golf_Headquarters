/**
 * L-fasen som fargeløs badge med steg-prikker (fase X av 5). Lukket
 * rekkefølge fra CANON v1: L-KROPP → L-ARM → L-KØLLE → L-BALL → L-AUTO.
 * AVGJORT 05.08.2026 (Anders): badgen tas IKKE i bruk — AK-formel v2 har
 * ikke L-faser; appens Vei B-motorikksteg (UTEN_BALL/LAV_HAST/AUTO) er
 * erstatningen. Ligger ubrukt i biblioteket; ikke plasser den på noen flate.
 */
export type LFase = "L-KROPP" | "L-ARM" | "L-KØLLE" | "L-BALL" | "L-AUTO";
export interface LFaseBadgeProps {
  value: LFase | string;
  /** Skjul prikk-indikatoren i tette lister */
  showSteps?: boolean;
  dataOdId?: string;
}
