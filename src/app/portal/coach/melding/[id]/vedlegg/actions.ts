/**
 * Vedlegg-galleri for en coaching-melding — server actions.
 *
 * Bucket 'message-attachments' (privat). Storage-helperen bruker service-role
 * og omgår RLS — DERFOR er access-sjekken (`krevTilgangTilMelding`) under det
 * eneste vernet. Den MÅ kjøres før enhver upload/sletting/visning.
 *
 * Mønster: speiler video.ts (auth → validering → storage → DB → revalidate).
 */
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import {
  uploadFile,
  deleteFile,
  STORAGE_BUCKETS,
} from "@/lib/storage/supabase-storage";
import type { User } from "@/generated/prisma/client";

const BUCKET = STORAGE_BUCKETS.MESSAGE_ATTACHMENTS;

/**
 * Verifiser at innlogget bruker er part i meldingen (spiller ELLER coach) eller
 * ADMIN. Kaster ved manglende tilgang. Returnerer brukeren for videre bruk.
 */
async function krevTilgangTilMelding(sessionId: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  const session = await prisma.coachingSession.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, coachId: true },
  });
  if (!session) throw new Error("not-found");

  const erPart = session.userId === user.id || session.coachId === user.id;
  const erAdmin = user.role === "ADMIN";
  if (!erPart && !erAdmin) throw new Error("forbidden");

  return user;
}

function extFor(fileName: string, fileType: string): string {
  const fraNavn = fileName.includes(".")
    ? fileName.split(".").pop()!.toLowerCase()
    : "";
  if (fraNavn) return fraNavn;
  // Fallback fra MIME hvis filnavnet mangler endelse.
  const fraType = fileType.split("/").pop()?.toLowerCase() ?? "bin";
  return fraType;
}

export type LastOppVedleggResultat =
  | { ok: true }
  | { ok: false; feil: string };

/**
 * Last opp et nytt vedlegg til en meldingstråd.
 * Krever at brukeren er part i meldingen (eller ADMIN).
 */
export async function lastOppVedlegg(
  sessionId: string,
  formData: FormData,
): Promise<LastOppVedleggResultat> {
  let user: User;
  try {
    user = await krevTilgangTilMelding(sessionId);
  } catch (e) {
    return { ok: false, feil: feiltekst(e) };
  }

  const fil = formData.get("file");
  if (!(fil instanceof File) || fil.size === 0) {
    return { ok: false, feil: "Ingen fil valgt." };
  }

  const path = `${sessionId}/${crypto.randomUUID()}.${extFor(fil.name, fil.type)}`;

  try {
    // Kaster ved for stor fil eller ikke-tillatt MIME-type (se buckets.ts).
    await uploadFile({ bucket: BUCKET, path, file: fil });
  } catch (e) {
    return { ok: false, feil: feiltekst(e) };
  }

  try {
    await prisma.messageAttachment.create({
      data: {
        sessionId,
        uploaderUserId: user.id,
        fileName: fil.name,
        fileType: fil.type,
        fileSize: fil.size,
        path,
      },
    });
  } catch (e) {
    // Rull tilbake opplastet fil hvis DB-raden feiler.
    await deleteFile(BUCKET, path);
    return { ok: false, feil: feiltekst(e) };
  }

  revalidatePath(`/portal/coach/melding/${sessionId}/vedlegg`);
  return { ok: true };
}

/**
 * Slett et vedlegg. Krever at brukeren er part i meldingen (eller ADMIN).
 */
export async function slettVedlegg(
  attachmentId: string,
): Promise<LastOppVedleggResultat> {
  const att = await prisma.messageAttachment.findUnique({
    where: { id: attachmentId },
    select: { id: true, sessionId: true, path: true },
  });
  if (!att) return { ok: false, feil: "Vedlegg finnes ikke." };

  try {
    await krevTilgangTilMelding(att.sessionId);
  } catch (e) {
    return { ok: false, feil: feiltekst(e) };
  }

  await deleteFile(BUCKET, att.path);
  await prisma.messageAttachment.delete({ where: { id: att.id } });

  revalidatePath(`/portal/coach/melding/${att.sessionId}/vedlegg`);
  return { ok: true };
}

function feiltekst(e: unknown): string {
  if (e instanceof Error) {
    if (e.message === "unauthenticated") return "Du er ikke innlogget.";
    if (e.message === "forbidden") return "Du har ikke tilgang til denne meldingen.";
    if (e.message === "not-found") return "Meldingen finnes ikke.";
    return e.message;
  }
  return "Noe gikk galt under opplasting.";
}
