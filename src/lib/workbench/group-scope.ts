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

/**
 * Redigering av GRUPPEplanen (gruppeøkter, gruppeperioder, samlinger): eier,
 * aktivt COACH-medlem eller ADMIN. Gjelder også WANG/TN: organisasjonen eier
 * gruppeplanen for sine grupper (D-49). Skriving i medlemmenes egne planer
 * styres av `canWriteMemberPlans`.
 */
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

/**
 * Utrulling som skriver rett i hvert medlems EGEN plan (SeasonPlan/PeriodBlock):
 * bare ADMIN eller gruppens eier (Group.coachId). Trener-medlemskap gir ingen
 * skriverett i spillerens plan (D-25), og en organisasjonstrener kan bare
 * foreslå endringer der (D-05, D-49).
 */
export async function canWriteMemberPlans(
  viewer: { id: string; role: string }, groupId: string,
  db: Pick<Prisma.TransactionClient, "group"> = prisma,
): Promise<boolean> {
  if (viewer.role !== "ADMIN" && viewer.role !== "COACH") return false;
  return Boolean(await db.group.findFirst({
    where: { id: groupId, arkivertAt: null, ...(viewer.role === "ADMIN" ? {} : { coachId: viewer.id }) },
    select: { id: true },
  }));
}
