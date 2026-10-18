import type { UtfAkse } from "@/components/portal/precision/PHUtfordringer";

/** Øvelsens pyramide (FYS, TEK, SLAG, SPILL, TURN) til aksenøkkelen i utfordringsskjermene. */
export function utfordringAkse(pyramide: string | null | undefined): UtfAkse {
  const k = pyramide?.toLowerCase();
  return k === "fys" || k === "tek" || k === "slag" || k === "spill" || k === "turn" ? k : null;
}
