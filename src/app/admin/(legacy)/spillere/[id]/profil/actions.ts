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
import { emailLayout, primaryButton } from "@/lib/email/templates/shared";
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
  const body = `
    <p style="margin:0 0 16px 0;">Du er invitert som <strong>${input.rel}</strong> til ${input.navn} i AK Golf-portalen.</p>
    <p style="margin:0 0 24px 0;">Klikk lenken under for å registrere deg og få tilgang til ${input.navn} sin treningsprofil:</p>
    <p style="margin:0 0 8px 0;">${primaryButton("Godta invitasjon", input.lenke)}</p>
    <p style="margin:0 0 24px 0;font-size:13px;color:#5E5C57;">Lenken er gyldig i 7 dager.</p>
    <p style="margin:0;font-size:12px;color:#5E5C57;">Du mottar denne fordi en coach oppga e-posten din i AK Golf-portalen.</p>
  `;

  return emailLayout({
    preheader: `Du er invitert som ${input.rel} til ${input.navn} i AK Golf-portalen.`,
    heading: "Hei —",
    body,
  });
}
