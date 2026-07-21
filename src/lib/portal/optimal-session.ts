import "server-only";

import { prisma } from "@/lib/prisma";
import { aggregateSg } from "@/lib/sg";
import { SG_TO_SKILL } from "@/lib/training/skills";
import type { PyramidArea, SkillArea, SgCategory } from "@/generated/prisma/client";

export type OptimalSessionHint = {
  title: string;
  rationale: string;
  pyramidArea: PyramidArea;
  skillArea: SkillArea;
  durationMin: number;
};

const SG_TO_PYR: Record<SgCategory, PyramidArea> = {
  OTT: "SLAG",
  APP: "SLAG",
  ARG: "SLAG",
  PUTT: "TEK",
};

const SG_LABEL: Record<SgCategory, string> = {
  OTT: "Tee",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

/**
 * Foreslår dagens optimale økt når spilleren ikke har planlagt noe i dag.
 * Basert på svakeste SG-akse siste 30 dager.
 */
export async function hentOptimalOktHint(
  userId: string,
): Promise<OptimalSessionHint | null> {
  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const runder = await prisma.round.findMany({
    where: { userId, playedAt: { gte: tretti } },
    orderBy: { playedAt: "desc" },
    take: 8,
  });
  if (runder.length < 2) return null;

  const sg = aggregateSg(runder);
  const omraader: SgCategory[] = ["OTT", "APP", "ARG", "PUTT"];
  const medVerdi = omraader
    .map((a) => ({
      a,
      v:
        a === "OTT"
          ? sg.ott
          : a === "APP"
            ? sg.app
            : a === "ARG"
              ? sg.arg
              : sg.putt,
    }))
    .filter((x): x is { a: SgCategory; v: number } => x.v != null);

  if (medVerdi.length === 0) return null;

  const svakest = medVerdi.reduce((min, cur) => (cur.v < min.v ? cur : min));
  const skill = SG_TO_SKILL[svakest.a];
  const pyramid = SG_TO_PYR[svakest.a];
  const label = SG_LABEL[svakest.a];
  // Spiller-UI: klarspråk + norsk komma. Aldri rå kode som «SG ARG».
  const sgTekst = svakest.v.toFixed(2).replace(".", ",");
  const retning = svakest.v < 0 ? "koster deg slag" : "er svakest relativt";

  return {
    title: `${label}-fokus`,
    rationale: `${label} ${retning} (${sgTekst} slag/runde · siste ${runder.length} runder). Én målrettet økt her gir størst effekt — planlegg i Workbench.`,
    pyramidArea: pyramid,
    skillArea: skill,
    durationMin: 60,
  };
}