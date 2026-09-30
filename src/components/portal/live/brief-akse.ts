import type { Akse } from "@/components/precision/pa";

/** PyramidArea («FYS», «TEK» …) til aksen designsystemet bruker («fys», «tek» …). */
export function akseFraPyramide(p: string | null | undefined): Akse | null {
  const v = (p ?? "").toLowerCase();
  return v === "fys" || v === "tek" || v === "slag" || v === "spill" || v === "turn" ? v : null;
}
