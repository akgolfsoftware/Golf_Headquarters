import type { PyramidArea } from "@/generated/prisma/client";

/**
 * Anti-AI farger: kun 3 lime-relaterte aksentpunkter
 *  1) primary (mørk grønn) i CTAer/lenker
 *  2) accent (lime) i status-pill/highlight
 *  3) pyr-fargene som data-koder (FYS/TEK/SLAG/SPILL/TURN)
 */
export const PYR_COLOR: Record<PyramidArea, string> = {
  FYS: "var(--color-pyr-fys)",
  TEK: "var(--color-pyr-tek)",
  SLAG: "var(--color-pyr-slag)",
  SPILL: "var(--color-pyr-spill)",
  TURN: "var(--color-pyr-turn)",
};

export type PhaseStatus = "done" | "current" | "upcoming";
