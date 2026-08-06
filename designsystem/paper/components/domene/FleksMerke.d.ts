/**
 * Fleks/anker-merket på økter (~6 skjermer — Workbench, plan, øktkort).
 * Lukket union: fleks (flyttbar) / anker (fast tid). Fargeløst — vokabular.
 * Informasjon, aldri knapp: flytting skjer i Workbench.
 */
export interface FleksMerkeProps {
  kind?: "fleks" | "anker";
  dataOdId?: string;
}
