/**
 * Kø · fane-tellingene (MASTERPLAN 15.1).
 *
 * Billige count-spørringer for pillene. Selve FANEN lastes først når du står
 * i den — samlesiden henter aldri alle fem datasettene samtidig.
 *
 * Kun fanene brukeren faktisk ser, telles. Mangler en telling, vises ingen
 * teller på pillen — heller ingen tall enn et gjettet null.
 */

import { prisma } from "@/lib/prisma";
import { koTelling } from "@/lib/admin/ko-telling";
import { lastAgenticosGodkjennCount } from "@/lib/agencyos/last-agenticos";
import type { KoFane, KoFaneId } from "./faner";
import type { KoBruker } from "./last-godkjenninger";

export async function koFaneTellinger(
  user: KoBruker,
  synlige: KoFane[],
): Promise<Partial<Record<KoFaneId, number>>> {
  const vis = new Set(synlige.map((f) => f.id));
  const ut: Partial<Record<KoFaneId, number>> = {};

  await Promise.all([
    vis.has("godkjenninger")
      ? koTelling(user.id, user.role).then((t) => {
          ut.godkjenninger = t.totalt;
        })
      : null,
    // Agent-kø viser klar + pågår + venter; PlanAction-køen er den samme
    // kilden lastAgenticosKo bygger de tre bøttene av.
    vis.has("agentko")
      ? lastAgenticosGodkjennCount(user).then((n) => {
          ut.agentko = n;
        })
      : null,
    vis.has("agentgodkjenn")
      ? lastAgenticosGodkjennCount(user).then((n) => {
          ut.agentgodkjenn = n;
        })
      : null,
    vis.has("tester")
      ? prisma.testDefinition
          .count({
            where: { isCustom: true, visibility: "COACH", isCoachApproved: false },
          })
          .then((n) => {
            ut.tester = n;
          })
      : null,
    vis.has("dubletter")
      ? prisma.tournament
          .count({ where: { sourceOrigin: "MANUAL", mergedIntoId: null } })
          .then((n) => {
            ut.dubletter = n;
          })
      : null,
  ]);

  return ut;
}
