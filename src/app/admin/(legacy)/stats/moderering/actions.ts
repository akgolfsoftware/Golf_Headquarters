"use server";

/**
 * Server actions for /admin/stats/moderering — moderering-/GDPR-køen (D5,
 * besluttet 2026-07-17). Jobber mot ModerationCase (String-felter for
 * type/status — zod håndhever gyldige verdier og status-overganger her).
 *
 * Overganger (eneste lovlige):
 *   - OPEN → APPROVED  (godkjennSak)
 *   - OPEN → REJECTED  (avvisSak)
 *   - APPROVED + GDPR_SLETTING → EXECUTED (utforGdprSletting)
 *
 * GDPR-sletting er ANONYMISERING, aldri kaskade-slett: User-raden tømmes for
 * personopplysninger (navn/e-post/telefon/bilde/fødselsdato), men relasjoner
 * (bookinger, økter, treningsdata) beholdes urørt. Vi setter IKKE deletedAt —
 * det ville trigget cron-jobben som hard-sletter med kaskade etter 30 dager.
 *
 * PublicPlayer (offentlig turneringsidentitet): raden beholdes fordi
 * turneringsresultater refererer den (cascade), men navn/bio/bilde/instagram
 * anonymiseres og raden skjules (isActive=false) så den ikke lekker navnet.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const MODERERING_PATH = "/admin/stats/moderering";

async function krevCoach() {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.role !== "COACH" && user.role !== "ADMIN") throw new Error("forbidden");
  return user;
}

const idSchema = z.string().min(1);
const begrunnelseSchema = z.string().trim().max(1000).optional();

// Status-overganger håndheves med zod mot den FAKTISKE raden i DB —
// String-feltene i modellen gir ingen DB-garanti, så vakten bor her.
const kanBehandlesSchema = z.object({ status: z.literal("OPEN") });
const kanUtforesSchema = z.object({
  type: z.literal("GDPR_SLETTING"),
  status: z.literal("APPROVED"),
});

async function hentSak(id: string) {
  const sak = await prisma.moderationCase.findUnique({ where: { id } });
  if (!sak) throw new Error("Fant ikke saken — den kan være slettet.");
  return sak;
}

/** OPEN → APPROVED. For GDPR-saker er dette steg 1 av 2 (utføres separat). */
export async function godkjennSak(id: string) {
  const user = await krevCoach();
  const sakId = idSchema.parse(id);
  const sak = await hentSak(sakId);

  if (!kanBehandlesSchema.safeParse(sak).success) {
    throw new Error(`Saken er allerede behandlet (status: ${sak.status}).`);
  }

  await prisma.moderationCase.update({
    where: { id: sakId },
    data: { status: "APPROVED", resolvedById: user.id, resolvedAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "moderation.approved",
    target: `ModerationCase:${sakId}`,
    metadata: { type: sak.type, userId: sak.userId },
  });

  revalidatePath(MODERERING_PATH);
  return { ok: true as const };
}

/** OPEN → REJECTED. Avvisnings-begrunnelsen logges i audit-loggen —
 *  sakens eget begrunnelse-felt (innmelderens tekst) røres ikke. */
export async function avvisSak(id: string, begrunnelse?: string) {
  const user = await krevCoach();
  const sakId = idSchema.parse(id);
  const grunn = begrunnelseSchema.parse(begrunnelse);
  const sak = await hentSak(sakId);

  if (!kanBehandlesSchema.safeParse(sak).success) {
    throw new Error(`Saken er allerede behandlet (status: ${sak.status}).`);
  }

  await prisma.moderationCase.update({
    where: { id: sakId },
    data: { status: "REJECTED", resolvedById: user.id, resolvedAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "moderation.rejected",
    target: `ModerationCase:${sakId}`,
    metadata: { type: sak.type, userId: sak.userId, begrunnelse: grunn ?? null },
  });

  revalidatePath(MODERERING_PATH);
  return { ok: true as const };
}

/**
 * APPROVED GDPR_SLETTING → EXECUTED. Anonymiserer User-raden i samme
 * transaksjon som status-oppdateringen:
 *   name → «Slettet bruker» · email → deterministisk tombstone (unik per bruker)
 *   phone/avatarUrl/dateOfBirth → null
 * Relasjoner og treningsdata beholdes. deletedAt settes IKKE (se filhode).
 */
export async function utforGdprSletting(id: string) {
  const user = await krevCoach();
  const sakId = idSchema.parse(id);
  const sak = await hentSak(sakId);

  if (!kanUtforesSchema.safeParse(sak).success) {
    throw new Error(
      sak.type !== "GDPR_SLETTING"
        ? "Kun GDPR-slettesaker kan utføres."
        : sak.status === "OPEN"
          ? "Saken må godkjennes før slettingen kan bekreftes."
          : `Saken kan ikke utføres (status: ${sak.status}).`,
    );
  }

  const målBruker = await prisma.user.findUnique({
    where: { id: sak.userId },
    select: { id: true, role: true, publicPlayerId: true },
  });

  if (målBruker && målBruker.role !== "PLAYER" && målBruker.role !== "PARENT") {
    throw new Error("Coach-/admin-kontoer kan ikke GDPR-slettes herfra — kontakt support.");
  }

  const nå = new Date();
  const anonymisering = {
    name: "Slettet bruker",
    // Deterministisk og unik (email er @unique) — .invalid-domenet kan aldri rutes.
    email: `slettet-${sak.userId}@gdpr.akgolf.invalid`,
    phone: null,
    avatarUrl: null,
    dateOfBirth: null,
  };

  // Offentlig turneringsidentitet (PublicPlayer): raden BEHOLDES — turnerings-
  // resultater (PublicPlayerEntry) refererer den med onDelete: Cascade, så en
  // sletting ville tatt turneringshistorikken med seg. Men den offentlige
  // profilen skal ikke lekke navnet på en slettet person: vi anonymiserer de
  // synlige identitetsfeltene og skjuler raden fra listinger (isActive=false).
  // Koblingen User.publicPlayerId beholdes (intern, ingen lekkasje).
  const anonymisererPublicPlayer = Boolean(målBruker?.publicPlayerId);
  const publicPlayerAnonymisering = {
    name: "Anonymisert spiller",
    bio: null,
    photoUrl: null,
    instagramHandle: null,
    isActive: false,
  };

  await prisma.$transaction([
    // Brukeren kan allerede være hard-slettet (cron P20) — da er forespørselen
    // reelt oppfylt, og saken markeres utført med notat i audit-loggen.
    ...(målBruker
      ? [prisma.user.update({ where: { id: sak.userId }, data: anonymisering })]
      : []),
    ...(anonymisererPublicPlayer
      ? [
          prisma.publicPlayer.update({
            where: { id: målBruker!.publicPlayerId! },
            data: publicPlayerAnonymisering,
          }),
        ]
      : []),
    prisma.moderationCase.update({
      where: { id: sakId },
      data: { status: "EXECUTED", resolvedById: user.id, resolvedAt: nå },
    }),
  ]);

  await audit({
    actorId: user.id,
    action: "moderation.gdpr_executed",
    target: `User:${sak.userId}`,
    metadata: {
      sakId,
      anonymiserteFelter: ["name", "email", "phone", "avatarUrl", "dateOfBirth"],
      brukerFantesIkke: !målBruker,
      publicPlayerAnonymisert: anonymisererPublicPlayer,
      publicPlayerId: målBruker?.publicPlayerId ?? null,
    },
  });

  revalidatePath(MODERERING_PATH);
  return { ok: true as const };
}
