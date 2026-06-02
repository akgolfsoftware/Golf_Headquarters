"use server";

/**
 * Server actions for CoachHQ — spiller-detalj (`/admin/spillere/[id]`).
 *
 * - `lagreSpillerDNA`   — oppdater dominant miss, SG-breakdown, prioritert fokus og
 *                         svakhetsprofil for én spiller. Krever COACH eller ADMIN.
 * - `lagreCoachDirektiv` — upsert PIN/BLOCK/PRIORITER-direktiv for én drill per spiller.
 *                          Returnerer `{ ok: true; id: string }` ved suksess.
 * - `slettCoachDirektiv` — slett et direktiv (guards på coachId for å unngå cross-coach-sletting).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ActionResult<T extends object = {}> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// CoachDrillDirectiv-modellen finnes ikke i Prisma-schemaet ennå (planlagt migrasjon).
// Denne guarden hindrer runtime-krasj (kall på en undefined delegate) inntil
// migrasjonen er kjørt. Når modellen finnes, returnerer den true automatisk.
const MODELL_IKKE_KLAR = "Denne funksjonen aktiveres i en kommende oppdatering.";
function coachDirektivModellKlar(): boolean {
  return Boolean(
    (prisma as unknown as Record<string, unknown>).coachDrillDirectiv,
  );
}

// ─── Validerings-skjemaer ─────────────────────────────────────────────────────

const SgBreakdownSchema = z
  .object({
    ott: z.number().min(-5).max(5).nullable(),
    app: z.number().min(-5).max(5).nullable(),
    arg: z.number().min(-5).max(5).nullable(),
    putt: z.number().min(-5).max(5).nullable(),
  })
  .nullable();

const SvakhetItemSchema = z.object({
  svakhet: z.string().min(1).max(80),
  styrke: z.number().int().min(1).max(10),
});

const SpillerDNASchema = z.object({
  dominantMiss: z
    .enum(["HOOK", "SLICE", "PUSH", "PULL", "FAT", "THIN", "HIGH", "LOW"])
    .nullable(),
  sgBreakdown: SgBreakdownSchema,
  prioritertFokus: z
    .array(
      z.enum([
        "TEE_TOTAL",
        "TILNAERMING",
        "AROUND_GREEN",
        "PUTTING",
        "SPILL",
      ]),
    )
    .max(3),
  svakhetProfil: z.array(SvakhetItemSchema).max(30),
});

const LagreDirectivSchema = z.object({
  drillId: z.string().uuid("Ugyldig drill-ID"),
  type: z.enum(["PIN", "BLOCK", "PRIORITER"]),
  kommentar: z.string().max(500).optional(),
  gyldigTil: z.string().nullable(), // ISO-dato-streng eller null
});

// ─── lagreSpillerDNA ─────────────────────────────────────────────────────────

/**
 * Lagrer spillerens DNA-profil (dominant miss, SG, fokus, svakheter).
 * Kun COACH og ADMIN har tilgang.
 */
export async function lagreSpillerDNA(
  userId: string,
  data: unknown,
): Promise<ActionResult> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = SpillerDNASchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Ugyldig data: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const spiller = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });
  if (!spiller) return { ok: false, error: "Spiller ikke funnet" };

  const { dominantMiss, sgBreakdown, prioritertFokus, svakhetProfil } =
    parsed.data;

  // Disse feltene venter på Prisma-migrasjon (sgBreakdown, prioritertFokus,
  // svakhetProfil, dominantMiss). Inntil videre lagres de i preferences-JSON.
  const eksisterende = (
    (await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } }))
      ?.preferences as Record<string, unknown> | null
  ) ?? {};
  await prisma.user.update({
    where: { id: userId },
    data: {
      preferences: {
        ...eksisterende,
        spillerDna: { dominantMiss, sgBreakdown, prioritertFokus, svakhetProfil },
      },
    },
  });

  await audit({
    actorId: coach.id,
    action: "SPILLER_DNA_LAGRET",
    target: userId,
    metadata: { dominantMiss, prioritertFokus, svakhetCount: svakhetProfil.length },
  });

  revalidatePath(`/admin/spillere/${userId}`);

  return { ok: true };
}

// ─── lagreCoachDirektiv ──────────────────────────────────────────────────────

/**
 * Upsert PIN/BLOCK/PRIORITER-direktiv.
 * Unik-constraint: coachId + userId + drillId + type.
 * Returnerer id på opprettet/oppdatert direktiv ved suksess.
 */
export async function lagreCoachDirektiv(
  spillerId: string,
  data: unknown,
): Promise<ActionResult<{ id: string }>> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = LagreDirectivSchema.safeParse(data);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Ugyldig data: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { id: true },
  });
  if (!spiller) return { ok: false, error: "Spiller ikke funnet" };

  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id: parsed.data.drillId },
    select: { id: true },
  });
  if (!drill) return { ok: false, error: "Drill ikke funnet" };

  const { drillId, type, kommentar, gyldigTil } = parsed.data;

  if (!coachDirektivModellKlar()) return { ok: false, error: MODELL_IKKE_KLAR };

  // @ts-expect-error – CoachDrillDirectiv er planlagt i neste Prisma-migrasjon
  const direktiv = await prisma.coachDrillDirectiv.upsert({
    where: {
      coachId_userId_drillId_type: {
        coachId: coach.id,
        userId: spillerId,
        drillId,
        type,
      },
    },
    create: {
      coachId: coach.id,
      userId: spillerId,
      drillId,
      type,
      kommentar: kommentar ?? null,
      gyldigTil: gyldigTil ? new Date(gyldigTil) : null,
    },
    update: {
      kommentar: kommentar ?? null,
      gyldigTil: gyldigTil ? new Date(gyldigTil) : null,
    },
  });

  revalidatePath(`/admin/spillere/${spillerId}`);

  return { ok: true, id: direktiv.id };
}

// ─── slettCoachDirektiv ──────────────────────────────────────────────────────

/**
 * Sletter et coach-drill-direktiv.
 * Guard: kun coachen som opprettet direktivet kan slette det.
 */
export async function slettCoachDirektiv(
  spillerId: string,
  direktivId: string,
): Promise<ActionResult> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  if (!coachDirektivModellKlar()) return { ok: false, error: MODELL_IKKE_KLAR };

  // @ts-expect-error – CoachDrillDirectiv er planlagt i neste Prisma-migrasjon
  const direktiv = await prisma.coachDrillDirectiv.findUnique({
    where: { id: direktivId },
    select: { id: true, coachId: true, type: true, drillId: true },
  });

  if (!direktiv) return { ok: false, error: "Direktiv ikke funnet" };
  if (direktiv.coachId !== coach.id) {
    return { ok: false, error: "Ikke tilgang — kun opprettende coach kan slette" };
  }

  // @ts-expect-error – CoachDrillDirectiv er planlagt i neste Prisma-migrasjon
  await prisma.coachDrillDirectiv.delete({ where: { id: direktivId } });

  await audit({
    actorId: coach.id,
    action: "COACH_DIREKTIV_SLETTET",
    target: spillerId,
    metadata: { direktivId, type: direktiv.type, drillId: direktiv.drillId },
  });

  revalidatePath(`/admin/spillere/${spillerId}`);

  return { ok: true };
}

// ─── lagreSpillerFasiliteter ─────────────────────────────────────────────────

const GYLDIGE_FASILITETER = [
  "RADAR",
  "MAT_NET",
  "BUNKER",
  "KAMERA",
  "PUTTING_GREEN_KORT",
  "PUTTING_GREEN_LANG",
  "SHORT_GAME_AREA",
  "DRIVING_RANGE",
  "BANE",
  "SIMULATOR",
  "VEKTSTANG",
  "TRAPBAR",
  "LOPEBANE",
  "MED_BALL",
] as const;

const FasilitetListeSchema = z.array(z.enum(GYLDIGE_FASILITETER));

/**
 * Oppdaterer `User.tilgjengeligeFasiliteter` for én spiller.
 * Kun COACH og ADMIN har tilgang.
 */
export async function lagreSpillerFasiliteter(
  spillerId: string,
  fasiliteter: unknown,
): Promise<ActionResult> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = FasilitetListeSchema.safeParse(fasiliteter);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Ugyldige fasiliteter: ${parsed.error.issues.map((i) => i.message).join(", ")}`,
    };
  }

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    select: { id: true, name: true },
  });
  if (!spiller) return { ok: false, error: "Spiller ikke funnet" };

  await prisma.user.update({
    where: { id: spillerId },
    data: { tilgjengeligeFasiliteter: parsed.data },
  });

  await audit({
    actorId: coach.id,
    action: "SPILLER_FASILITETER_OPPDATERT",
    target: spillerId,
    metadata: { fasiliteter: parsed.data, antall: parsed.data.length },
  });

  revalidatePath(`/admin/spillere/${spillerId}`);

  return { ok: true };
}
