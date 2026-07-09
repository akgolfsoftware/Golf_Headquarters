"use server";

/**
 * Server actions for plan-template-redaktøren under /admin/plan-templates.
 *
 * Alle mutasjoner går gjennom requirePortalUser({ allow: ["COACH","ADMIN"] }),
 * valideres med Zod, logges via audit() og revalidate-er listene.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import type { Prisma } from "@/generated/prisma/client";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

// --- Zod-skjemaer ------------------------------------------------------------

const KategoriEnum = z.enum([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
]);

const LPhaseEnum = z.enum(["GRUNN", "SPESIAL", "TURNERING"]);

const PyramidAreaEnum = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const SkillAreaEnum = z.enum([
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
]);
const EnvironmentEnum = z.enum([
  "RANGE",
  "BANE",
  "STUDIO",
  "HJEM",
  "SIMULATOR",
  "GYM",
]);

const DisciplinFordelingSchema = z.object({
  FYS: z.number().min(0).max(1),
  TEK: z.number().min(0).max(1),
  SLAG: z.number().min(0).max(1),
  SPILL: z.number().min(0).max(1),
  TURN: z.number().min(0).max(1),
});

const DrillEntrySchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().nonnegative().optional(),
  reps: z.number().int().nonnegative().optional(),
  csTarget: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

const SessionInputSchema = z.object({
  ukeNr: z.number().int().min(1).max(52),
  dagNr: z.number().int().min(1).max(7),
  title: z.string().min(1).max(120),
  varighetMin: z.number().int().min(5).max(480),
  pyramidArea: PyramidAreaEnum,
  skillArea: SkillAreaEnum.nullable().optional(),
  environment: EnvironmentEnum,
  drillsJson: z.array(DrillEntrySchema).default([]),
  focus: z.string().max(240).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

const TemplateUpdateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).nullable().optional(),
  kategori: KategoriEnum,
  lPhase: LPhaseEnum,
  varighetUker: z.number().int().min(1).max(52),
  ukentligOktAntall: z.number().int().min(1).max(14),
  disciplinFordeling: DisciplinFordelingSchema,
  minAlder: z.number().int().min(0).max(99).nullable().optional(),
  maxAlder: z.number().int().min(0).max(99).nullable().optional(),
  approved: z.boolean().optional(),
});

const TemplateCreateSchema = TemplateUpdateSchema;

export type SessionInput = z.infer<typeof SessionInputSchema>;
export type TemplateUpdateInput = z.infer<typeof TemplateUpdateSchema>;
export type TemplateCreateInput = z.infer<typeof TemplateCreateSchema>;

// --- Helpers -----------------------------------------------------------------

function err(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

function ok<T>(data: T): { ok: true; data: T } {
  return { ok: true, data };
}

function revalidate(templateId?: string) {
  revalidatePath("/admin/plan-templates");
  if (templateId) {
    revalidatePath(`/admin/plan-templates/${templateId}`);
    revalidatePath(`/admin/plan-templates/${templateId}/rediger`);
  }
}

// --- Template-mutasjoner -----------------------------------------------------

export async function updateTemplate(
  id: string,
  input: TemplateUpdateInput
): Promise<ActionResult<{ templateId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = TemplateUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err("Ugyldig input: " + parsed.error.issues.map((i) => i.message).join(", "));
  }

  const existing = await prisma.planTemplate.findUnique({ where: { id } });
  if (!existing) return err("Mal ikke funnet");

  const data = parsed.data;
  await prisma.planTemplate.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description ?? null,
      kategori: data.kategori,
      lPhase: data.lPhase,
      varighetUker: data.varighetUker,
      ukentligOktAntall: data.ukentligOktAntall,
      disciplinFordeling: data.disciplinFordeling as unknown as Prisma.InputJsonValue,
      minAlder: data.minAlder ?? null,
      maxAlder: data.maxAlder ?? null,
      approved: data.approved ?? existing.approved,
    },
  });

  await audit({
    actorId: user.id,
    action: "plan_template.update",
    target: id,
    metadata: { name: data.name, kategori: data.kategori, lPhase: data.lPhase },
  });

  revalidate(id);
  return ok({ templateId: id });
}

export async function createTemplate(
  input: TemplateCreateInput
): Promise<ActionResult<{ templateId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = TemplateCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err("Ugyldig input: " + parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;
  const created = await prisma.planTemplate.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      kategori: data.kategori,
      lPhase: data.lPhase,
      varighetUker: data.varighetUker,
      ukentligOktAntall: data.ukentligOktAntall,
      disciplinFordeling: data.disciplinFordeling as unknown as Prisma.InputJsonValue,
      minAlder: data.minAlder ?? null,
      maxAlder: data.maxAlder ?? null,
      approved: data.approved ?? false,
      byCoachId: user.id,
    },
  });

  await audit({
    actorId: user.id,
    action: "plan_template.create",
    target: created.id,
    metadata: { name: data.name, kategori: data.kategori, lPhase: data.lPhase },
  });

  revalidate(created.id);
  return ok({ templateId: created.id });
}

export async function duplicateTemplate(
  id: string
): Promise<ActionResult<{ templateId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const original = await prisma.planTemplate.findUnique({
    where: { id },
    include: { sessions: true },
  });
  if (!original) return err("Mal ikke funnet");

  // Finn unikt navn (suffix evt. med " (kopi N)" hvis (kopi) finnes)
  const baseName = `${original.name} (kopi)`;
  let name = baseName;
  let n = 2;
  while (
    await prisma.planTemplate.findFirst({
      where: { kategori: original.kategori, lPhase: original.lPhase, name },
    })
  ) {
    name = `${original.name} (kopi ${n})`;
    n += 1;
    if (n > 50) return err("For mange kopier — gi originalen nytt navn");
  }

  const created = await prisma.planTemplate.create({
    data: {
      name,
      description: original.description,
      kategori: original.kategori,
      lPhase: original.lPhase,
      varighetUker: original.varighetUker,
      ukentligOktAntall: original.ukentligOktAntall,
      disciplinFordeling: original.disciplinFordeling as Prisma.InputJsonValue,
      minAlder: original.minAlder,
      maxAlder: original.maxAlder,
      approved: false,
      byCoachId: user.id,
      sessions: {
        create: original.sessions.map((s) => ({
          ukeNr: s.ukeNr,
          dagNr: s.dagNr,
          title: s.title,
          varighetMin: s.varighetMin,
          pyramidArea: s.pyramidArea,
          skillArea: s.skillArea,
          environment: s.environment,
          drillsJson: s.drillsJson as Prisma.InputJsonValue,
          focus: s.focus,
          notes: s.notes,
        })),
      },
    },
  });

  await audit({
    actorId: user.id,
    action: "plan_template.duplicate",
    target: created.id,
    metadata: { originalId: id, newName: name },
  });

  revalidate();
  return ok({ templateId: created.id });
}

export async function archiveTemplate(
  id: string
): Promise<ActionResult<{ templateId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const existing = await prisma.planTemplate.findUnique({ where: { id } });
  if (!existing) return err("Mal ikke funnet");

  await prisma.planTemplate.update({
    where: { id },
    data: { approved: false },
  });

  await audit({
    actorId: user.id,
    action: "plan_template.archive",
    target: id,
  });

  revalidate(id);
  return ok({ templateId: id });
}

export async function unarchiveTemplate(
  id: string
): Promise<ActionResult<{ templateId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const existing = await prisma.planTemplate.findUnique({ where: { id } });
  if (!existing) return err("Mal ikke funnet");

  await prisma.planTemplate.update({
    where: { id },
    data: { approved: true, approvedById: user.id, approvedAt: new Date() },
  });

  await audit({
    actorId: user.id,
    action: "plan_template.unarchive",
    target: id,
  });

  revalidate(id);
  return ok({ templateId: id });
}

// --- Session-mutasjoner ------------------------------------------------------

export async function addTemplateSession(
  templateId: string,
  input: SessionInput
): Promise<ActionResult<{ sessionId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = SessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return err("Ugyldig input: " + parsed.error.issues.map((i) => i.message).join(", "));
  }

  const template = await prisma.planTemplate.findUnique({ where: { id: templateId } });
  if (!template) return err("Mal ikke funnet");

  const data = parsed.data;

  // Sjekk unik (templateId, ukeNr, dagNr)
  const dup = await prisma.planTemplateSession.findUnique({
    where: {
      templateId_ukeNr_dagNr: {
        templateId,
        ukeNr: data.ukeNr,
        dagNr: data.dagNr,
      },
    },
  });
  if (dup) return err(`Det finnes allerede en økt på uke ${data.ukeNr} dag ${data.dagNr}`);

  const created = await prisma.planTemplateSession.create({
    data: {
      templateId,
      ukeNr: data.ukeNr,
      dagNr: data.dagNr,
      title: data.title,
      varighetMin: data.varighetMin,
      pyramidArea: data.pyramidArea,
      skillArea: data.skillArea ?? null,
      environment: data.environment,
      drillsJson: data.drillsJson as unknown as Prisma.InputJsonValue,
      focus: data.focus ?? null,
      notes: data.notes ?? null,
    },
  });

  await audit({
    actorId: user.id,
    action: "plan_template.session.add",
    target: created.id,
    metadata: { templateId, ukeNr: data.ukeNr, dagNr: data.dagNr },
  });

  revalidate(templateId);
  return ok({ sessionId: created.id });
}

export async function updateTemplateSession(
  sessionId: string,
  input: SessionInput
): Promise<ActionResult<{ sessionId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = SessionInputSchema.safeParse(input);
  if (!parsed.success) {
    return err("Ugyldig input: " + parsed.error.issues.map((i) => i.message).join(", "));
  }

  const existing = await prisma.planTemplateSession.findUnique({
    where: { id: sessionId },
  });
  if (!existing) return err("Økt ikke funnet");

  const data = parsed.data;
  await prisma.planTemplateSession.update({
    where: { id: sessionId },
    data: {
      ukeNr: data.ukeNr,
      dagNr: data.dagNr,
      title: data.title,
      varighetMin: data.varighetMin,
      pyramidArea: data.pyramidArea,
      skillArea: data.skillArea ?? null,
      environment: data.environment,
      drillsJson: data.drillsJson as unknown as Prisma.InputJsonValue,
      focus: data.focus ?? null,
      notes: data.notes ?? null,
    },
  });

  await audit({
    actorId: user.id,
    action: "plan_template.session.update",
    target: sessionId,
    metadata: { templateId: existing.templateId },
  });

  revalidate(existing.templateId);
  return ok({ sessionId });
}

export async function deleteTemplateSession(
  sessionId: string
): Promise<ActionResult<{ sessionId: string }>> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const existing = await prisma.planTemplateSession.findUnique({
    where: { id: sessionId },
  });
  if (!existing) return err("Økt ikke funnet");

  await prisma.planTemplateSession.delete({ where: { id: sessionId } });

  await audit({
    actorId: user.id,
    action: "plan_template.session.delete",
    target: sessionId,
    metadata: { templateId: existing.templateId },
  });

  revalidate(existing.templateId);
  return ok({ sessionId });
}
