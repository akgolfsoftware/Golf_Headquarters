"use server";

/**
 * Bruker-vendte server actions for å OPPRETTE ModerationCase (D5-deltråd,
 * rapporteringsflyt, besluttet 2026-07-17). Motstykket til admin-køen i
 * src/app/admin/(legacy)/stats/moderering/actions.ts som BEHANDLER sakene.
 *
 * To innganger:
 *   - opprettRapport        → RAPPORTERT_INNHOLD (en bruker melder en annens
 *                             synlige innhold; reporterId = innmelder,
 *                             userId = eier av innholdet)
 *   - opprettGdprForesporsel → GDPR_SLETTING (spilleren ber om sletting av
 *                             egen konto; reporterId = userId = seg selv)
 *
 * Begge oppretter status "OPEN" → dukker opp i admin-/coach-køen. Vi lager
 * ALDRI selve slettingen her — det er en to-stegs, coach-godkjent handling
 * (se utforGdprSletting i admin-actions). Zod-validering + audit som mønsteret
 * i admin-actions.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { audit } from "@/lib/audit";

// Tillatte innholdstyper for en rapport. Holdes stramt (allowlist) selv om
// modell-feltet er fri String — nye flater legges til her bevisst.
const RAPPORT_TARGET_TYPES = ["SPILLERPROFIL"] as const;

const rapportSchema = z.object({
  targetType: z.enum(RAPPORT_TARGET_TYPES),
  targetId: z.string().min(1).max(200),
  begrunnelse: z.string().trim().min(1, "Skriv en kort begrunnelse.").max(1000),
});

const gdprSchema = z.object({
  begrunnelse: z.string().trim().max(1000).optional(),
});

/**
 * RAPPORTERT_INNHOLD: en innlogget bruker melder en annen brukers synlige
 * innhold. targetId for SPILLERPROFIL er bruker-ID-en til eieren av profilen.
 * Vi slår opp eieren og setter userId = eier, reporterId = innmelder.
 */
export async function opprettRapport(
  targetType: string,
  targetId: string,
  begrunnelse: string,
) {
  const meg = await requirePortalUser();
  const parsed = rapportSchema.safeParse({ targetType, targetId, begrunnelse });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Ugyldig rapport." };
  }

  // For SPILLERPROFIL er targetId = eierens bruker-ID. Verifiser at brukeren
  // finnes (og ikke er anonymisert bort) før vi oppretter saken.
  const eier = await prisma.user.findUnique({
    where: { id: parsed.data.targetId },
    select: { id: true, deletedAt: true },
  });
  if (!eier || eier.deletedAt) {
    return { ok: false as const, error: "Fant ikke innholdet du prøver å rapportere." };
  }

  // Kan ikke rapportere seg selv.
  if (eier.id === meg.id) {
    return { ok: false as const, error: "Du kan ikke rapportere ditt eget innhold." };
  }

  const sak = await prisma.moderationCase.create({
    data: {
      type: "RAPPORTERT_INNHOLD",
      status: "OPEN",
      userId: eier.id,
      reporterId: meg.id,
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      begrunnelse: parsed.data.begrunnelse,
    },
    select: { id: true },
  });

  await audit({
    actorId: meg.id,
    action: "moderation.reported",
    target: `ModerationCase:${sak.id}`,
    metadata: {
      type: "RAPPORTERT_INNHOLD",
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      userId: eier.id,
    },
  });

  return { ok: true as const };
}

/**
 * GDPR_SLETTING: spilleren ber om sletting av EGEN konto. reporterId = userId
 * = seg selv. Behandles av coach/admin (anonymisering, ikke kaskade-slett).
 * Idempotent-vennlig: hvis brukeren allerede har en åpen forespørsel, returner
 * ok uten å lage duplikat.
 */
export async function opprettGdprForesporsel(begrunnelse?: string) {
  const meg = await requirePortalUser();
  const parsed = gdprSchema.safeParse({ begrunnelse });
  if (!parsed.success) {
    return { ok: false as const, error: "Begrunnelsen er for lang (maks 1000 tegn)." };
  }

  const finnesAlt = await prisma.moderationCase.findFirst({
    where: { type: "GDPR_SLETTING", userId: meg.id, status: "OPEN" },
    select: { id: true },
  });
  if (finnesAlt) {
    return { ok: true as const, alleredeSendt: true };
  }

  const sak = await prisma.moderationCase.create({
    data: {
      type: "GDPR_SLETTING",
      status: "OPEN",
      userId: meg.id,
      reporterId: meg.id,
      begrunnelse: parsed.data.begrunnelse || null,
    },
    select: { id: true },
  });

  await audit({
    actorId: meg.id,
    action: "moderation.gdpr_requested",
    target: `ModerationCase:${sak.id}`,
    metadata: { type: "GDPR_SLETTING", userId: meg.id },
  });

  return { ok: true as const, alleredeSendt: false };
}
