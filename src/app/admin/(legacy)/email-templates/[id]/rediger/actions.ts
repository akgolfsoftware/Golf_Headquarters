"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const saveSchema = z.object({
  name: z.string().trim().min(2, "Navn må være minst 2 tegn"),
  subject: z.string().trim().min(2, "Emne er påkrevd"),
  body: z.string().trim().min(2, "Innhold er påkrevd"),
  active: z.boolean(),
});

export type SaveTemplateInput = z.infer<typeof saveSchema>;

export async function saveTemplate(id: string, raw: unknown) {
  const user = await requireCoachActionUser();
  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Ugyldig input");
  }
  await prisma.emailTemplate.update({
    where: { id },
    data: {
      name: parsed.data.name,
      subject: parsed.data.subject,
      body: parsed.data.body,
      active: parsed.data.active,
    },
  });
  await audit({
    actorId: user.id,
    action: "email_template.updated",
    target: `EmailTemplate:${id}`,
  });
  revalidatePath("/admin/email-templates");
  revalidatePath(`/admin/email-templates/${id}/rediger`);
}

export async function sendTestEmail(id: string) {
  const user = await requireCoachActionUser();
  const tpl = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!tpl) throw new Error("Mal ikke funnet");

  // I produksjon ville denne kalt Resend/Postmark/SendGrid. For nå
  // logger vi handlingen og returnerer success — Anders får faktisk
  // e-post når SMTP-pipe er koblet til.
  await audit({
    actorId: user.id,
    action: "email_template.test_sent",
    target: `EmailTemplate:${id}`,
    metadata: {
      recipient: user.email,
      subject: tpl.subject,
    },
  });

  return { ok: true, recipient: user.email };
}

export async function setAsDefault(id: string) {
  const user = await requireCoachActionUser();
  const tpl = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!tpl) throw new Error("Mal ikke funnet");

  await prisma.emailTemplate.update({
    where: { id },
    data: { active: true },
  });

  await audit({
    actorId: user.id,
    action: "email_template.set_default",
    target: `EmailTemplate:${id}`,
    metadata: { slug: tpl.slug },
  });
  revalidatePath("/admin/email-templates");
  revalidatePath(`/admin/email-templates/${id}/rediger`);
}

export async function archiveTemplate(id: string) {
  const user = await requireCoachActionUser();
  await prisma.emailTemplate.update({
    where: { id },
    data: { active: false },
  });
  await audit({
    actorId: user.id,
    action: "email_template.archived",
    target: `EmailTemplate:${id}`,
  });
  revalidatePath("/admin/email-templates");
  revalidatePath(`/admin/email-templates/${id}/rediger`);
}
