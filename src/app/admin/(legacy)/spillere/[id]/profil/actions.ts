"use server";

// Server action for AgencyOS (coach/admin) — inviter forelder til en spiller.
// Speiler spiller-siden (src/app/portal/meg/foreldre/actions.ts) men er ADMIN/COACH-
// scopet og tar en eksplisitt playerId i stedet for innlogget bruker.
// ParentInvitation lagres med token + 7 dagers utløp; forelder fullfører via
// /inviter/forelder/[token].

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

export async function inviterForelderForSpiller(input: {
  playerId: string;
  email: string;
  relation: ParentLinkRelation;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Ugyldig e-postadresse." };
  }

  const player = await prisma.user.findUnique({
    where: { id: input.playerId },
    select: { id: true, name: true, role: true },
  });
  if (!player || player.role !== "PLAYER") {
    return { ok: false, error: "Fant ikke spilleren." };
  }

  // Sjekk om vi allerede har en åpen invitasjon til denne e-posten for
  // denne spilleren.
  const existing = await prisma.parentInvitation.findFirst({
    where: {
      playerId: player.id,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (existing) {
    return { ok: false, error: "Det finnes allerede en åpen invitasjon til denne e-posten." };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const invitation = await prisma.parentInvitation.create({
    data: {
      playerId: player.id,
      email,
      relation: input.relation,
      expiresAt,
    },
  });

  const lenke = `${APP_URL}/inviter/forelder/${invitation.token}`;
  const rel = relationLabel(input.relation);
  const navn = player.name;

  try {
    const klient = resendKlient();
    await klient.emails.send({
      from: FRA_EPOST,
      to: email,
      subject: `Du er invitert som ${rel} til ${navn} i AK Golf-portalen`,
      html: bygInviteHtml({ navn, rel, lenke }),
    });
  } catch (err) {
    // Logg, men ikke rull tilbake — invitasjonen finnes og kan resendes.
    console.error("[inviterForelderForSpiller] e-post feilet", err);
  }

  revalidatePath(`/admin/spillere/${player.id}/profil`);
  return { ok: true };
}

function bygInviteHtml(input: { navn: string; rel: string; lenke: string }): string {
  return `<!doctype html>
<html lang="nb">
<head><meta charset="UTF-8"></head>
<body style="font-family: system-ui, sans-serif; max-width: 580px; margin: 32px auto; color: #0A1F17;">
  <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 12px;">Hei —</h1>
  <p>Du er invitert som <strong>${input.rel}</strong> til ${input.navn} i AK Golf-portalen.</p>
  <p>Klikk lenken under for å registrere deg og få tilgang til ${input.navn} sin treningsprofil:</p>
  <p style="margin: 24px 0;">
    <a href="${input.lenke}"
       style="display: inline-block; padding: 12px 24px; background: #005840; color: #D1F843; text-decoration: none; border-radius: 6px; font-weight: 600;">
      Godta invitasjon
    </a>
  </p>
  <p style="color: #5E5C57; font-size: 13px;">Lenken er gyldig i 7 dager.</p>
  <p style="margin-top: 32px; color: #5E5C57; font-size: 12px;">
    AK Golf Group · Du mottar denne fordi en coach oppga e-posten din i AK Golf-portalen.
  </p>
</body>
</html>`;
}
