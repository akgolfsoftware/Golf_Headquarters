"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { DrillParametersSchema } from "@/lib/taxonomy";

const OvelseInputSchema = z.object({
  name: z.string().min(1, "Navn er paakrevd"),
  description: z.string().nullable().default(null),
  videoUrl: z.string().nullable().default(null),
  pyramidArea: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]),
  lPhase: z.enum(["GRUNN", "SPESIAL", "TURNERING"]).nullable().default(null),
  defaultRepsSets: z.string().nullable().default(null),
  csMin: z.number().int().min(0).max(100).nullable().default(null),
  csMax: z.number().int().min(0).max(100).nullable().default(null),
  durationMin: z.number().int().min(1).nullable().default(null),
  parametersJson: DrillParametersSchema.nullable().default(null),
});

export type OvelseInput = z.infer<typeof OvelseInputSchema>;

export async function opprettOvelse(input: OvelseInput) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = OvelseInputSchema.parse(input);

  await prisma.exerciseDefinition.create({
    data: {
      name: data.name,
      description: data.description,
      videoUrl: data.videoUrl,
      pyramidArea: data.pyramidArea,
      lPhase: data.lPhase,
      defaultRepsSets: data.defaultRepsSets,
      csMin: data.csMin,
      csMax: data.csMax,
      durationMin: data.durationMin,
      parametersJson: data.parametersJson ?? undefined,
      createdBy: user.id,
    },
  });

  revalidatePath("/portal/tren/ovelser");
  revalidatePath("/portal/coach/ovelser");
  redirect("/portal/coach/ovelser");
}

export async function oppdaterOvelse(id: string, input: OvelseInput) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = OvelseInputSchema.parse(input);

  await prisma.exerciseDefinition.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      videoUrl: data.videoUrl,
      pyramidArea: data.pyramidArea,
      lPhase: data.lPhase,
      defaultRepsSets: data.defaultRepsSets,
      csMin: data.csMin,
      csMax: data.csMax,
      durationMin: data.durationMin,
      parametersJson: data.parametersJson ?? undefined,
    },
  });

  revalidatePath("/portal/tren/ovelser");
  revalidatePath("/portal/coach/ovelser");
  redirect("/portal/coach/ovelser");
}

export async function slettOvelse(id: string) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const brukt = await prisma.sessionDrill.count({ where: { exerciseId: id } });
  if (brukt > 0) {
    throw new Error(`Kan ikke slette — ovelsen brukes i ${brukt} treningsokt(er)`);
  }

  await prisma.exerciseDefinition.delete({ where: { id } });

  revalidatePath("/portal/tren/ovelser");
  revalidatePath("/portal/coach/ovelser");
}
