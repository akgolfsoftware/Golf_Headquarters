/**
 * Compliance-innløpet: plan vs. faktisk gjennomføring per økt.
 *
 * Definisjonen av «gjennomført» (status === COMPLETED, minutt-vektet mot
 * durationMin) er den samme som stallen bruker (src/lib/admin/stallen-data.ts)
 * — stallen importerer `erOktGjennomfort` herfra så regelen bor ett sted.
 */

import type { SessionStatus } from "@/generated/prisma/client";

export type OktCompliance = "pa-plan" | "avvik" | "ikke-gjennomfort" | "fremtidig";

type ComplianceOkt = {
  scheduledAt: Date;
  durationMin: number;
  status: SessionStatus;
};

/** Én delt definisjon av «gjennomført» — brukes av både stallen og Workbench. */
export function erOktGjennomfort(status: SessionStatus): boolean {
  return status === "COMPLETED";
}

/** Statuser der spilleren/coachen aktivt har avveket fra planen. */
const AVVIK_STATUSER: ReadonlySet<SessionStatus> = new Set([
  "ABANDONED",
  "SKIPPED",
  "CANCELLED",
]);

/**
 * Compliance-status for én økt:
 * - `pa-plan`          — gjennomført (COMPLETED)
 * - `avvik`            — aktivt avbrutt/hoppet over/kansellert
 * - `ikke-gjennomfort` — forfalt (slutt-tid passert) uten registrert gjennomføring
 * - `fremtidig`        — ikke forfalt ennå; skal IKKE compliance-vurderes
 */
export function oktCompliance(okt: ComplianceOkt, now: Date): OktCompliance {
  if (erOktGjennomfort(okt.status)) return "pa-plan";
  if (AVVIK_STATUSER.has(okt.status)) return "avvik";
  const sluttMs = okt.scheduledAt.getTime() + okt.durationMin * 60_000;
  return sluttMs > now.getTime() ? "fremtidig" : "ikke-gjennomfort";
}

/**
 * Plan-adherence i prosent for et sett økter: gjennomførte minutter av
 * planlagte minutter, kun blant FORFALTE økter (fremtidige teller ikke —
 * de kan ennå gjennomføres på plan). `null` når ingen økter er forfalt.
 */
export function adherencePct(okter: ComplianceOkt[], now: Date): number | null {
  let planlagt = 0;
  let gjennomfort = 0;
  for (const okt of okter) {
    if (oktCompliance(okt, now) === "fremtidig") continue;
    planlagt += okt.durationMin;
    if (erOktGjennomfort(okt.status)) gjennomfort += okt.durationMin;
  }
  if (planlagt === 0) return null;
  return Math.round((gjennomfort / planlagt) * 100);
}
