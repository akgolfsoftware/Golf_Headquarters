import "server-only";

import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";
import { prisma } from "@/lib/prisma";
import { byggApneSpillerrader, tilWagrSpillerId, type TnApenSpillerRad, type TnWagrPlass } from "./tn-spillerliste-regler";

export * from "./tn-spillerliste-regler";

/**
 * Alle aktive spillere i TN-gruppa med navn og offentlig WAGR-plass. Kalleren har allerede
 * sjekket at brukeren er trener i gruppa (`hentTnSpillere`); dette er bare åpne tall.
 * Kobling: `users.publicPlayerId` → `public_players."wagrId"` → `wagr_ref_players`.
 */
export async function hentTnApneSpillere(gruppeId: string, deltIder: ReadonlySet<string>): Promise<TnApenSpillerRad[]> {
  const medlemmer = await prisma.groupMember.findMany({
    where: { groupId: gruppeId, ...aktivtSpillerMedlemskapWhere(), user: { role: "PLAYER", deletedAt: null, anonymisertAt: null } },
    select: { user: { select: { id: true, name: true, publicPlayer: { select: { wagrId: true } } } } },
  });
  const inn = medlemmer.map((m) => ({ id: m.user.id, navn: m.user.name, wagrId: m.user.publicPlayer?.wagrId ?? null }));
  const wagrIder = [...new Set(inn.flatMap((m) => tilWagrSpillerId(m.wagrId) ?? []))];
  const refRader = wagrIder.length
    ? await prisma.wagrRefPlayer.findMany({ where: { wagrPlayerId: { in: wagrIder } }, select: { wagrPlayerId: true, rank: true, wagrDate: true } })
    : [];
  const wagr = new Map<number, TnWagrPlass>(refRader.map((r) => [r.wagrPlayerId, { plass: r.rank, dato: r.wagrDate }]));
  return byggApneSpillerrader(inn, deltIder, wagr);
}
