/**
 * Server actions for plan-mal-editor (/admin/plans/templates/[id]/rediger).
 *
 * Actions:
 *   - saveTemplate(id, input)    — lagre endringer
 *   - archiveTemplate(id)        — sett active=false
 *   - setAsDefault(id)           — marker som standard-mal
 *   - duplicateTemplate(id)      — kopier til ny mal
 *   - deleteTemplate(id)         — hard delete
 *
 * Alle krever COACH/ADMIN-rolle og skriver til audit-log.
 */

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import {
  AllokeringSchema,
  PlanTemplatePayloadSchema,
  UkeSkjemaSchema,
} from "@/lib/ai-plan/json-schemas";
import type { Prisma } from "@/generated/prisma/client";

const SaveTemplateInputSchema = z.object({
  navn: z.string().trim().min(2, "Navn må være minst 2 tegn").max(120),
  beskrivelse: z.string().trim().max(2000).optional().default(""),
  weeks: z.number().int().min(1, "Minst 1 uke").max(104, "Maks 104 uker"),
  allokering: AllokeringSchema,
  ukeSkjema: UkeSkjemaSchema,
  notater: z.string().trim().max(4000).optional().default(""),
  isDefault: z.boolean().optional().default(false),
});

export type SaveTemplateInput = z.input<typeof SaveTemplateInputSchema>;

export type SaveTemplateResult =
  | { ok: true; templateId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function krevCoach() {
  const me = await getCurrentUser();
  if (!me) throw new Error("unauthenticated");
  if (me.role !== "COACH" && me.role !== "ADMIN") throw new Error("forbidden");
  return me;
}

function readPayload(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return { ...(payload as Record<string, unknown>) };
  }
  return {};
}

export async function saveTemplate(
  id: string,
  input: SaveTemplateInput,
): Promise<SaveTemplateResult> {
  const me = await krevCoach();

  const parsed = SaveTemplateInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: "Skjemaet inneholder feil.",
      fieldErrors,
    };
  }
  const data = parsed.data;

  const sum =
    data.allokering.FYS +
    data.allokering.TEK +
    data.allokering.SLAG +
    data.allokering.SPILL +
    data.allokering.TURN;
  if (sum !== 100) {
    return {
      ok: false,
      error: `Allokering må summere til 100 % (er nå ${sum}).`,
    };
  }

  const eksisterende = await prisma.planTemplate.findUnique({ where: { id } });
  if (!eksisterende) {
    return { ok: false, error: "Malen finnes ikke." };
  }

  const eksisterendePayload = readPayload(eksisterende.disciplinFordeling);
  const nyPayload: Record<string, unknown> = {
    ...eksisterendePayload,
    weeks: data.weeks,
    allokering: data.allokering,
    ukeSkjema: data.ukeSkjema,
    notater: data.notater || null,
    isDefault: data.isDefault,
    // Bevar eksisterende sessions-array hvis tilstede; ellers tom liste.
    sessions: Array.isArray(eksisterendePayload.sessions)
      ? eksisterendePayload.sessions
      : [],
  };

  // Hvis vi skal sette denne som standard — fjern flagget fra alle andre.
  if (data.isDefault) {
    const alle = await prisma.planTemplate.findMany({
      where: { id: { not: id }, approved: true },
      select: { id: true, disciplinFordeling: true },
    });
    for (const t of alle) {
      const p = readPayload(t.disciplinFordeling);
      if (p.isDefault === true) {
        p.isDefault = false;
        await prisma.planTemplate.update({
          where: { id: t.id },
          data: { disciplinFordeling: p as Prisma.InputJsonValue },
        });
      }
    }
  }

  const oppdatert = await prisma.planTemplate.update({
    where: { id },
    data: {
      name: data.navn,
      description: data.beskrivelse || null,
      varighetUker: data.weeks,
      disciplinFordeling: nyPayload as Prisma.InputJsonValue,
    },
  });

  await audit({
    actorId: me.id,
    action: "plan.template.updated",
    target: `PlanTemplate:${id}`,
    metadata: {
      before: {
        name: eksisterende.name,
        weeks: eksisterende.varighetUker,
      },
      after: {
        name: oppdatert.name,
        weeks: oppdatert.varighetUker,
        isDefault: data.isDefault,
      },
    },
  });

  revalidatePath("/admin/plans/templates");
  revalidatePath(`/admin/plans/templates/${id}/rediger`);
  return { ok: true, templateId: oppdatert.id };
}

export async function archiveTemplate(id: string): Promise<SaveTemplateResult> {
  const me = await krevCoach();
  const eksisterende = await prisma.planTemplate.findUnique({ where: { id } });
  if (!eksisterende) return { ok: false, error: "Malen finnes ikke." };

  await prisma.planTemplate.update({
    where: { id },
    data: { approved: false },
  });

  await audit({
    actorId: me.id,
    action: "plan.template.archived",
    target: `PlanTemplate:${id}`,
    metadata: { name: eksisterende.name },
  });

  revalidatePath("/admin/plans/templates");
  return { ok: true, templateId: id };
}

export async function unarchiveTemplate(
  id: string,
): Promise<SaveTemplateResult> {
  const me = await krevCoach();
  const eksisterende = await prisma.planTemplate.findUnique({ where: { id } });
  if (!eksisterende) return { ok: false, error: "Malen finnes ikke." };

  await prisma.planTemplate.update({
    where: { id },
    data: { approved: true },
  });

  await audit({
    actorId: me.id,
    action: "plan.template.unarchived",
    target: `PlanTemplate:${id}`,
    metadata: { name: eksisterende.name },
  });

  revalidatePath("/admin/plans/templates");
  return { ok: true, templateId: id };
}

export async function setAsDefault(id: string): Promise<SaveTemplateResult> {
  const me = await krevCoach();
  const eksisterende = await prisma.planTemplate.findUnique({ where: { id } });
  if (!eksisterende) return { ok: false, error: "Malen finnes ikke." };

  // Fjern flagget fra alle andre maler.
  const andre = await prisma.planTemplate.findMany({
    where: { id: { not: id } },
    select: { id: true, disciplinFordeling: true },
  });
  for (const t of andre) {
    const p = readPayload(t.disciplinFordeling);
    if (p.isDefault === true) {
      p.isDefault = false;
      await prisma.planTemplate.update({
        where: { id: t.id },
        data: { disciplinFordeling: p as Prisma.InputJsonValue },
      });
    }
  }

  const p = readPayload(eksisterende.disciplinFordeling);
  p.isDefault = true;
  await prisma.planTemplate.update({
    where: { id },
    data: { disciplinFordeling: p as Prisma.InputJsonValue },
  });

  await audit({
    actorId: me.id,
    action: "plan.template.set_default",
    target: `PlanTemplate:${id}`,
    metadata: { name: eksisterende.name },
  });

  revalidatePath("/admin/plans/templates");
  revalidatePath(`/admin/plans/templates/${id}/rediger`);
  return { ok: true, templateId: id };
}

export async function duplicateTemplate(
  id: string,
): Promise<SaveTemplateResult> {
  const me = await krevCoach();
  const eksisterende = await prisma.planTemplate.findUnique({ where: { id } });
  if (!eksisterende) return { ok: false, error: "Malen finnes ikke." };

  // Vi sjekker payload-form for å unngå at duplikat arver ugyldig payload.
  const parsed = PlanTemplatePayloadSchema.safeParse(eksisterende.disciplinFordeling);
  const payloadData = parsed.success
    ? parsed.data
    : {
        weeks: eksisterende.varighetUker,
        allokering: { FYS: 20, TEK: 30, SLAG: 25, SPILL: 20, TURN: 5 },
        ukeSkjema: { okterPerUke: 3, varighetMin: 75 },
        sessions: [],
      };

  // Fjern isDefault-flagget på duplikat.
  const nyPayload: Record<string, unknown> = {
    ...payloadData,
    isDefault: false,
  };

  const duplikat = await prisma.planTemplate.create({
    data: {
      name: `${eksisterende.name} (kopi)`,
      description: eksisterende.description,
      varighetUker: eksisterende.varighetUker,
      kategori: eksisterende.kategori,
      lPhase: eksisterende.lPhase,
      disciplinFordeling: nyPayload as Prisma.InputJsonValue,
      approved: true,
    },
  });

  await audit({
    actorId: me.id,
    action: "plan.template.duplicated",
    target: `PlanTemplate:${duplikat.id}`,
    metadata: { fromId: id, name: duplikat.name },
  });

  revalidatePath("/admin/plans/templates");
  return { ok: true, templateId: duplikat.id };
}

export async function deleteTemplate(id: string): Promise<SaveTemplateResult> {
  const me = await krevCoach();
  if (me.role !== "ADMIN") {
    return { ok: false, error: "Kun ADMIN kan slette maler permanent." };
  }
  const eksisterende = await prisma.planTemplate.findUnique({ where: { id } });
  if (!eksisterende) return { ok: false, error: "Malen finnes ikke." };

  await prisma.planTemplate.delete({ where: { id } });

  await audit({
    actorId: me.id,
    action: "plan.template.deleted",
    target: `PlanTemplate:${id}`,
    metadata: { name: eksisterende.name },
  });

  revalidatePath("/admin/plans/templates");
  return { ok: true, templateId: id };
}
