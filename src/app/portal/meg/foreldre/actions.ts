"use server";

// Server actions for foreldre-invitasjoner (V2 Spor 3).
// Spilleren (innlogget User med role=PLAYER) inviterer foresatte
// via e-post. ParentInvitation lagres med token og 7 dagers utløp.

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import type { ParentLinkRelation } from "@/generated/prisma/client";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";

function relationLabel(r: ParentLinkRelation): string {
  if (r === "FATHER") return "far";
  if (r === "MOTHER") return "mor";
  return "foresatt";
}

export async function inviterForelder(input: {
  email: string;
  relation: ParentLinkRelation;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Ugyldig e-postadresse." };
  }

  // Sjekk om vi allerede har en åpen invitasjon til denne e-posten for
  // denne spilleren.
  const existing = await prisma.parentInvitation.findFirst({
    where: {
      playerId: user.id,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) {
    return { ok: false, error: "Du har allerede sendt invitasjon til denne e-posten." };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.parentInvitation.create({
    data: {
      playerId: user.id,
      email,
      relation: input.relation,
      expiresAt,
    },
  });

  const lenke = `${APP_URL}/inviter/forelder/${invitation.token}`;
  const rel = relationLabel(input.relation);
  const navn = user.name;

  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: email,
      subject: `${navn} har invitert deg som ${rel} i AK Golf-portalen`,
      html: bygInviteHtml({ navn, rel, lenke }),
    });
  } catch (err) {
    // Logg, men ikke rull tilbake. Spilleren kan resende.
    console.error("[inviterForelder] e-post feilet", err);
  }

  revalidatePath("/portal/meg/foreldre");
  return { ok: true };
}

export async function avbrytInvitasjon(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const inv = await prisma.parentInvitation.findUnique({ where: { id } });
  if (!inv || inv.playerId !== user.id) {
    return { ok: false, error: "Fant ikke invitasjonen." };
  }
  if (inv.acceptedAt) {
    return { ok: false, error: "Invitasjonen er allerede godtatt." };
  }

  await prisma.parentInvitation.delete({ where: { id } });
  revalidatePath("/portal/meg/foreldre");
  return { ok: true };
}

export async function fjernForelderTilgang(
  linkId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const rel = await prisma.parentRelation.findUnique({ where: { id: linkId } });
  if (!rel || rel.childId !== user.id) {
    return { ok: false, error: "Fant ikke koblingen." };
  }

  await prisma.parentRelation.delete({ where: { id: linkId } });
  revalidatePath("/portal/meg/foreldre");
  return { ok: true };
}

function bygInviteHtml(input: { navn: string; rel: string; lenke: string }): string {
  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 12px;">Hei —</h1>
  <p>${input.navn} har invitert deg som <strong>${input.rel}</strong> i AK Golf-portalen.</p>
  <p>Klikk lenken under for å registrere deg og få tilgang til ${input.navn} sin treningsprofil:</p>
  <p style="margin: 24px 0;">
    <a href="${input.lenke}"
       style="display: inline-block; padding: 12px 24px; background: #005840; color: #D1F843; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Godta invitasjon
    </a>
  </p>
  <p style="color: #5E5C57; font-size: 13px;">Lenken er gyldig i 7 dager.</p>
  <p style="margin-top: 32px; color: #5E5C57; font-size: 12px;">
    AK Golf Group · Du mottar denne fordi noen oppga e-posten din i AK Golf-portalen.
  </p>
</body>
</html>`;
}
