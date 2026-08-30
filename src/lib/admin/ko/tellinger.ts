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
import { lastAgenticosKo, lastAgenticosGodkjenn } from "@/lib/agencyos/last-agenticos";
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
    // Agent-fanene teller det fanen FAKTISK viser, ikke antall PENDING
    // PlanActions. Begge listene er `take`-begrenset i loaderen, så tallet er
    // billig — og det matcher skjermen når du klikker. Målt 30.08: den
    // enkle PlanAction-tellingen ga 530 på begge fanene, mens Agent-kø viste
    // 23 rader. Et tall som ikke stemmer med innholdet er verre enn intet tall.
    vis.has("agentko")
      ? lastAgenticosKo(user).then((d) => {
          ut.agentko = d.klar.length + d.pagar.length + d.venter.length;
        })
      : null,
    vis.has("agentgodkjenn")
      ? lastAgenticosGodkjenn(user).then((d) => {
          ut.agentgodkjenn = d.rader.length;
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
