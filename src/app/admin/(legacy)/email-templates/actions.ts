"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";


export type EmailTemplateInput = {
  slug: string;
  name: string;
  subject: string;
  body: string;
  active: boolean;
};

export async function createTemplate(input: EmailTemplateInput) {
  const user = await requireCoachActionUser();
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("invalid-slug");

  const ny = await prisma.emailTemplate.create({
    data: {
      slug,
      name: input.name.trim(),
      subject: input.subject.trim(),
      body: input.body,
      active: input.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "email_template.created",
    target: `EmailTemplate:${ny.id}`,
    metadata: { slug },
  });
  revalidatePath("/admin/email-templates");
}

export async function updateTemplate(id: string, input: Omit<EmailTemplateInput, "slug">) {
  const user = await requireCoachActionUser();
  await prisma.emailTemplate.update({
    where: { id },
    data: {
      name: input.name.trim(),
      subject: input.subject.trim(),
      body: input.body,
      active: input.active,
    },
  });
  await audit({ actorId: user.id, action: "email_template.updated", target: `EmailTemplate:${id}` });
  revalidatePath("/admin/email-templates");
}

export async function deleteTemplate(id: string) {
  const user = await requireCoachActionUser();
  await prisma.emailTemplate.delete({ where: { id } });
  await audit({ actorId: user.id, action: "email_template.deleted", target: `EmailTemplate:${id}` });
  revalidatePath("/admin/email-templates");
  redirect("/admin/email-templates");
}
