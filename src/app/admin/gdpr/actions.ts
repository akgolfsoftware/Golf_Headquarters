"use server";

/**
 * Admin-behandling av GDPR-forespørsler (`DataExportRequest`).
 *
 * EXPORT-krav fullføres inline når foresatt laster ned eksporten
 * (/forelder/samtykke/eksport). DELETE-krav ble derimot liggende PENDING uten
 * noen flate å behandle dem fra — art. 12 nr. 3 gir én måneds frist. Denne
 * køen gjør dem synlige og lukkbare.
 *
 * Selve slettingen er ANONYMISERING via den felles `anonymiserBruker` (samme
 * motor som selvbetjent sletting + oppryddingscron), som nå også rydder
 * Supabase Auth/Storage og Stripe.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { anonymiserBruker } from "@/lib/gdpr/anonymiser-bruker";

const idSchema = z.string().min(1).max(200);

const GDPR_PATH = "/admin/gdpr";

/** Utfør en DELETE-forespørsel: anonymiser subjektet, marker COMPLETED. */
export async function utforSletteforesporsel(
  formData: FormData,
): Promise<void> {
  const admin = await requireAdminActionUser();
  const id = idSchema.parse(String(formData.get("id") ?? ""));

  const req = await prisma.dataExportRequest.findUnique({ where: { id } });
  if (!req) throw new Error("Fant ikke forespørselen.");
  if (req.type !== "DELETE") throw new Error("Kun DELETE-forespørsler slettes her.");
  if (req.status !== "PENDING") throw new Error(`Allerede behandlet (${req.status}).`);

  // Subjektet er barnet (subjectUserId) eller den som ba, om ingen er satt.
  const subjektId = req.subjectUserId ?? req.userId;
  const resultat = await anonymiserBruker(subjektId);

  await prisma.dataExportRequest.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  await audit({
    actorId: admin.id,
    action: "gdpr.delete.executed",
    target: `User:${subjektId}`,
    metadata: {
      requestId: id,
      brukerFantes: resultat.brukerFantes,
      eksterntFeil: resultat.eksterntSlettet?.feil ?? [],
    },
  });

  revalidatePath(GDPR_PATH);
}

/** Avvis en forespørsel (marker REJECTED med sporbar audit). */
export async function avvisForesporsel(formData: FormData): Promise<void> {
  const admin = await requireAdminActionUser();
  const id = idSchema.parse(String(formData.get("id") ?? ""));

  const req = await prisma.dataExportRequest.findUnique({ where: { id } });
  if (!req) throw new Error("Fant ikke forespørselen.");
  if (req.status !== "PENDING") throw new Error(`Allerede behandlet (${req.status}).`);

  await prisma.dataExportRequest.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  await audit({
    actorId: admin.id,
    action: "gdpr.request.rejected",
    target: `DataExportRequest:${id}`,
    metadata: { type: req.type, subjectUserId: req.subjectUserId },
  });

  revalidatePath(GDPR_PATH);
}
