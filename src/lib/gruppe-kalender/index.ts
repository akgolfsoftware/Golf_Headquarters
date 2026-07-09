/**
 * Gruppe-kalender — generisk inngang for offentlige gruppeoversikter.
 * WANG er én konsument; GFGK og andre grupper bruker samme motor.
 */
export {
  hentGruppeKalenderData,
  hentWangGruppeOversikt,
} from "@/lib/wang-kalender/hent-data";
export type {
  GruppeKalenderData,
  Samling,
  WangGruppeOversikt,
} from "@/lib/wang-kalender/types";