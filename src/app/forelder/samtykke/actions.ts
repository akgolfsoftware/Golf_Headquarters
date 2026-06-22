"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

/**
 * Lagre samtykker for et barn. Krever at innloggede bruker er foresatt
 * for barnet (via ParentRelation).
 */
export async function lagreSamtykker(
  childId: string,
  samtykker: Record<string, boolean>,
): Promise<{ ok: true }> {
  const user = await requirePortalUser({ allow: ["PARENT", "ADMIN"] });

  if (user.role === "PARENT") {
    const relasjon = await prisma.parentRelation.findFirst({
      where: { parentId: user.id, childId, approved: true },
    });
    if (!relasjon) throw new Error("Du er ikke godkjent foresatt for dette barnet");
  }

  // Hent eksisterende preferences og merge inn nye samtykker
  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: { preferences: true },
  });
  if (!child) throw new Error("Barn finnes ikke");

  const eksisterende = (child.preferences as Record<string, unknown> | null) ?? {};
  const nye: Record<string, unknown> = { ...eksisterende, ...samtykker };

  await prisma.user.update({
    where: { id: childId },
    data: { preferences: nye as object },
  });

  await audit({
    actorId: user.id,
    action: "samtykke.updated",
    target: `User:${childId}`,
    metadata: { samtykker, role: user.role },
  });

  revalidatePath("/forelder/samtykke");
  revalidatePath(`/admin/spillere/${childId}`);

  return { ok: true };
}

/**
 * Sjekk at innlogget bruker har lov til å be om eksport/sletting for
 * et eventuelt subjekt (barn). PARENT må være godkjent foresatt; uten
 * subjekt gjelder forespørselen brukeren selv.
 */
async function assertSubjektTilgang(
  userId: string,
  role: string,
  subjectUserId?: string,
): Promise<void> {
  if (!subjectUserId || subjectUserId === userId) return;
  if (role === "ADMIN") return;
  const relasjon = await prisma.parentRelation.findFirst({
    where: { parentId: userId, childId: subjectUserId, approved: true },
  });
  if (!relasjon) throw new Error("Du er ikke godkjent foresatt for dette barnet");
}

/**
 * Registrer en GDPR-dataeksport-forespørsel (type EXPORT). Selve den ekte
 * eksporten lastes ned via GET /forelder/samtykke/eksport — denne raden
 * gir en sporbar kvittering på at forespørselen er registrert.
 */
export async function beOmDataeksport(
  subjectUserId?: string,
): Promise<{ ok: true }> {
  const user = await requirePortalUser({ allow: ["PARENT", "ADMIN"] });
  await assertSubjektTilgang(user.id, user.role, subjectUserId);

  await prisma.dataExportRequest.create({
    data: { userId: user.id, subjectUserId: subjectUserId ?? null, type: "EXPORT" },
  });

  await audit({
    actorId: user.id,
    action: "data.export.requested",
    target: subjectUserId ? `User:${subjectUserId}` : `User:${user.id}`,
    metadata: { role: user.role },
  });

  revalidatePath("/forelder/samtykke");
  return { ok: true };
}

/**
 * Registrer en GDPR-slette-forespørsel (type DELETE). Faktisk kaskade-
 * sletting gjøres IKKE her — det krever manuell behandling. Denne raden
 * er en sporbar forespørsel som AK Golf følger opp.
 */
export async function beOmDataSletting(
  subjectUserId?: string,
): Promise<{ ok: true }> {
  const user = await requirePortalUser({ allow: ["PARENT", "ADMIN"] });
  await assertSubjektTilgang(user.id, user.role, subjectUserId);

  await prisma.dataExportRequest.create({
    data: { userId: user.id, subjectUserId: subjectUserId ?? null, type: "DELETE" },
  });

  await audit({
    actorId: user.id,
    action: "data.delete.requested",
    target: subjectUserId ? `User:${subjectUserId}` : `User:${user.id}`,
    metadata: { role: user.role },
  });

  revalidatePath("/forelder/samtykke");
  return { ok: true };
}
