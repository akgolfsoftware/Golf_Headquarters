import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { SPILLER_SYNLIGE_STATUSER } from "./wb-map";

/** Et tilbaketrukket gruppeutkast kan ikke hentes gjennom spillerens generelle planhandlinger. */
export function canReadOwnGroupCopy(row: { sourceGroupSessionId: string | null; localOverride: boolean; status: string }): boolean {
  return !row.sourceGroupSessionId || row.localOverride || (SPILLER_SYNLIGE_STATUSER as readonly string[]).includes(row.status);
}

export function ownGroupPublicationWhere(): Prisma.WorkbenchSessionWhereInput {
  return { OR: [{ sourceGroupSessionId: null }, { localOverride: true }, { status: { in: [...SPILLER_SYNLIGE_STATUSER] } }] };
}

/** Samme redigeringsregel som gruppe-actions: eier, aktiv COACH eller ADMIN. */
export function editableGroupWhere(viewer: { id: string; role: string }): Prisma.GroupWhereInput {
  if (viewer.role === "ADMIN") return { arkivertAt: null };
  if (viewer.role !== "COACH") return { id: { in: [] } };
  return { arkivertAt: null, OR: [
    { coachId: viewer.id },
    { members: { some: { userId: viewer.id, role: "COACH", endedAt: null } } },
  ] };
}

/**
 * Innsyn i en gruppe (lesing): ADMIN ser alle; COACH ser grupper han eier eller
 * er aktivt COACH-/ASSISTANT-medlem i (samme regel som gruppesiden). Redigering
 * styres av `editableGroupWhere`.
 */
export function gruppeInnsynWhere(viewer: { id: string; role: string }): Prisma.GroupWhereInput {
  if (viewer.role === "ADMIN") return {};
  if (viewer.role !== "COACH") return { id: { in: [] } };
  return { OR: [
    { coachId: viewer.id },
    { members: { some: { userId: viewer.id, role: { in: ["COACH", "ASSISTANT"] }, endedAt: null } } },
  ] };
}

export async function canEditGroup(
  viewer: { id: string; role: string }, groupId: string,
  db: Pick<Prisma.TransactionClient, "group"> = prisma,
): Promise<boolean> {
  return Boolean(await db.group.findFirst({
    where: { id: groupId, ...editableGroupWhere(viewer) }, select: { id: true },
  }));
}
