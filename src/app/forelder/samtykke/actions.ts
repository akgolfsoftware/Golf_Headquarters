"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { registrerHelseSamtykke } from "@/lib/health/samtykke";
import { erHelseSamtykkeType } from "@/lib/health/samtykke-regler";
import { registrerDelingsSamtykke } from "@/lib/deling/samtykke";
import { erDelingScope } from "@/lib/deling/samtykke-regler";
import { aktivtSpillerMedlemskapWhere } from "@/lib/domain/grupper";

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
 * Foresatt gir eller trekker barnets samtykke til helsedata fra treningsklokke
 * (GDPR art. 9-2 a, kombinert med art. 8 for mindreårige).
 *
 * Egen action — ikke en del av `lagreSamtykker` — fordi dette samtykket ikke
 * er en bryter i en JSON-blob: hver endring blir en sporbar rad med tidspunkt,
 * tekstversjon og hvem som klikket, slik dokumentasjonsplikten krever for
 * særlige kategorier persondata.
 */
export async function settHelseSamtykkeForBarn(
  childId: string,
  type: string,
  gitt: boolean,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser({ allow: ["PARENT", "ADMIN"] });

  if (user.role === "PARENT") {
    const relasjon = await prisma.parentRelation.findFirst({
      where: { parentId: user.id, childId, approved: true },
    });
    if (!relasjon) {
      return { ok: false, feil: "Du er ikke godkjent foresatt for dette barnet" };
    }
  }

  if (!erHelseSamtykkeType(type)) {
    return { ok: false, feil: "Ukjent samtykketype." };
  }

  try {
    await registrerHelseSamtykke({
      userId: childId,
      type,
      gitt,
      gittAvUserId: user.id,
      gittAvRolle: "FORESATT",
    });
  } catch (err) {
    return {
      ok: false,
      feil: err instanceof Error ? err.message : "Kunne ikke lagre samtykket.",
    };
  }

  revalidatePath("/forelder/samtykke");
  revalidatePath(`/admin/spillere/${childId}`);

  return { ok: true };
}

/**
 * Foresatt gir eller trekker barnets delingssamtykke til tredjepart
 * (Team Norway/WANG — plan T8). Krever godkjent ParentRelation. Append-only
 * rad med gittAvRolle=FORESATT og gittAvUserId=foresattes id — for mindreårige
 * (requiresGuardianConsent) er dette den ENESTE raden som teller i
 * ekstern-leser-scopet.
 */
export async function settDelingsSamtykkeForBarn(
  childId: string,
  scope: string,
  mottakerGruppeId: string,
  gitt: boolean,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requirePortalUser({ allow: ["PARENT", "ADMIN"] });

  if (user.role === "PARENT") {
    const relasjon = await prisma.parentRelation.findFirst({
      where: { parentId: user.id, childId, approved: true },
    });
    if (!relasjon) {
      return { ok: false, feil: "Du er ikke godkjent foresatt for dette barnet" };
    }
  }

  if (!erDelingScope(scope)) {
    return { ok: false, feil: "Ukjent samtykketype." };
  }

  // Mottakergruppen må være en gruppe barnet faktisk er aktivt medlem i.
  const medlemskap = await prisma.groupMember.findFirst({
    where: {
      ...aktivtSpillerMedlemskapWhere(),
      userId: childId,
      groupId: mottakerGruppeId,
    },
    select: { id: true },
  });
  if (!medlemskap) {
    return { ok: false, feil: "Barnet er ikke medlem av denne gruppen." };
  }

  try {
    await registrerDelingsSamtykke({
      userId: childId,
      scope,
      mottakerGruppeId,
      gitt,
      gittAvUserId: user.id,
      gittAvRolle: "FORESATT",
    });
  } catch (err) {
    return {
      ok: false,
      feil: err instanceof Error ? err.message : "Kunne ikke lagre samtykket.",
    };
  }

  revalidatePath("/forelder/samtykke");
  revalidatePath("/portal/meg/innstillinger/personvern");
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
