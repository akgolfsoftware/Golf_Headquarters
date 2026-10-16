"use server";

/**
 * Server Actions for Øvelsesbanken (ExerciseDefinition CRUD & Brukskontroll)
 * AK Golf HQ — AK Golf Design System & Workbench Integrasjon
 */

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { revalidatePath } from "next/cache";
import type { PyramidArea, SkillArea, SessionEnvironment, Omraade, Motorikk, Belastning, Press } from "@/generated/prisma/client";

export interface OpprettOvelseInput {
  name: string;
  description?: string;
  videoUrl?: string;
  pyramidArea: PyramidArea;
  skillArea?: SkillArea;
  defaultRepsSets?: string;
  durationMin?: number;
  environment?: SessionEnvironment[];
  utstyr?: string[];
  coachNotes?: string;
  morad?: boolean;
  higherIsBetter?: boolean;
  parametersJson?: Record<string, unknown>;
  // AK-formel v2-aksene på selve øvelsen (Plan-hub AG-14). Kolonnene finnes fra
  // 23.09.2026 (scripts/add-exercise-definition-v2-akser-2026-09-23.ts).
  omraadeKode?: Omraade | null;
  motorikk?: Motorikk | null;
  belastning?: Belastning | null;
  press?: Press | null;
}

/**
 * Opprett ny øvelse i Øvelsesbanken
 */
export async function opprettOvelseAction(input: OpprettOvelseInput) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  if (!input.name || input.name.trim().length === 0) {
    return { ok: false as const, error: "Navn på øvelsen er obligatorisk." };
  }

  try {
    const ovelse = await prisma.exerciseDefinition.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        videoUrl: input.videoUrl?.trim() || null,
        pyramidArea: input.pyramidArea,
        skillArea: input.skillArea || null,
        defaultRepsSets: input.defaultRepsSets?.trim() || null,
        durationMin: input.durationMin || null,
        environment: input.environment || [],
        utstyr: input.utstyr || [],
        coachNotes: input.coachNotes?.trim() || null,
        morad: input.morad ?? false,
        higherIsBetter: input.higherIsBetter ?? null,
        createdBy: user.id,
        source: "COACH",
        omraadeKode: input.omraadeKode ?? null,
        motorikk: input.motorikk ?? null,
        belastning: input.belastning ?? null,
        press: input.press ?? null,
        parametersJson: input.parametersJson ? JSON.parse(JSON.stringify(input.parametersJson)) : undefined,
      },
    });

    revalidatePath("/admin/plan");
    revalidatePath("/portal/planlegge");
    return { ok: true as const, ovelse };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke opprette øvelse.";
    return { ok: false as const, error: msg };
  }
}

/**
 * Oppdater eksisterende øvelse i Øvelsesbanken
 */
export async function oppdaterOvelseAction(
  id: string,
  input: Partial<OpprettOvelseInput>
) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  try {
    const eksisterende = await prisma.exerciseDefinition.findUnique({ where: { id } });
    if (!eksisterende) {
      return { ok: false as const, error: "Øvelsen ble ikke funnet." };
    }

    const ovelse = await prisma.exerciseDefinition.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
        ...(input.videoUrl !== undefined ? { videoUrl: input.videoUrl?.trim() || null } : {}),
        ...(input.pyramidArea ? { pyramidArea: input.pyramidArea } : {}),
        ...(input.skillArea !== undefined ? { skillArea: input.skillArea || null } : {}),
        ...(input.defaultRepsSets !== undefined ? { defaultRepsSets: input.defaultRepsSets?.trim() || null } : {}),
        ...(input.durationMin !== undefined ? { durationMin: input.durationMin || null } : {}),
        ...(input.environment ? { environment: input.environment } : {}),
        ...(input.utstyr ? { utstyr: input.utstyr } : {}),
        ...(input.coachNotes !== undefined ? { coachNotes: input.coachNotes?.trim() || null } : {}),
        ...(input.morad !== undefined ? { morad: input.morad } : {}),
        ...(input.higherIsBetter !== undefined ? { higherIsBetter: input.higherIsBetter } : {}),
        ...(input.parametersJson !== undefined ? { parametersJson: JSON.parse(JSON.stringify(input.parametersJson)) } : {}),
        ...(input.omraadeKode !== undefined ? { omraadeKode: input.omraadeKode } : {}),
        ...(input.motorikk !== undefined ? { motorikk: input.motorikk } : {}),
        ...(input.belastning !== undefined ? { belastning: input.belastning } : {}),
        ...(input.press !== undefined ? { press: input.press } : {}),
      },
    });

    revalidatePath("/admin/plan");
    revalidatePath("/portal/planlegge");
    return { ok: true as const, ovelse };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke oppdatere øvelse.";
    return { ok: false as const, error: msg };
  }
}

/**
 * Slett øvelse i Øvelsesbanken med sikkerhetskontroll for om den er i bruk
 */
export async function slettOvelseAction(id: string) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  try {
    // Sjekk om øvelsen er knyttet til SessionDrill eller SessionDrillInstance
    const [bruktIOkter, bruktIInstanser] = await Promise.all([
      prisma.sessionDrill.count({ where: { exerciseId: id } }),
      prisma.sessionDrillInstance.count({ where: { drillId: id } }),
    ]);

    const totaltBrukt = bruktIOkter + bruktIInstanser;

    if (totaltBrukt > 0) {
      return {
        ok: false as const,
        error: `Øvelsen kan ikke slettes fordi den er tilknyttet ${totaltBrukt} aktive økt(er). Fjern øvelsen fra øktene først.`,
      };
    }

    await prisma.exerciseDefinition.delete({ where: { id } });

    revalidatePath("/admin/drills");
    revalidatePath("/portal/planlegge");
    return { ok: true as const };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Kunne ikke slette øvelse.";
    return { ok: false as const, error: msg };
  }
}
