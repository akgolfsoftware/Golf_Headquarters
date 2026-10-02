"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireCoachActionUser } from "@/lib/auth/action-guards";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { templateExample } from "@/lib/email/template-example";

const idSchema = z.string().trim().min(1).max(128);
const contentSchema = z.object({
  subject: z.string().trim().min(2, "Emne er påkrevd").max(200).regex(/^[^\r\n]*$/, "Emne må være én linje"),
  body: z.string().trim().min(2, "Innhold er påkrevd").max(50_000),
});

const saveSchema = contentSchema.extend({
  name: z.string().trim().min(2, "Navn må være minst 2 tegn").max(120),
  active: z.boolean(),
});

export type SaveTemplateInput = z.infer<typeof saveSchema>;

export async function saveTemplate(id: string, raw: unknown) {
  const user = await requireCoachActionUser();
  id = idSchema.parse(id);
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

/** Eksplisitt test kan også sendes fra en inaktiv mal, kun til egen bekreftede adresse. */
export async function sendTestEmail(id: string, raw?: unknown) {
  const user = await requireCoachActionUser();
  id = idSchema.parse(id);
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  const auth = data.user;
  const recipient = auth?.email?.trim().toLowerCase();
  if (error || !auth || auth.id !== user.authId || !auth.email_confirmed_at ||
      !recipient || recipient !== user.email.trim().toLowerCase()) {
    throw new Error("Bekreft din egen e-postadresse før du sender en test.");
  }
  const tpl = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!tpl) throw new Error("Mal ikke funnet");
  const parsed = contentSchema.safeParse(raw ?? tpl);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Ugyldig maltekst");
  const limit = await rateLimit({ key: `email-template-test:${user.id}`, max: 5, windowMs: 60_000 });
  if (!limit.ok) throw new Error("Vent ett minutt før du sender flere tester.");
  const content = templateExample({ ...parsed.data, slug: tpl.slug });
  try {
    const result = await resendKlient().emails.send({ from: FRA_EPOST, to: recipient,
      subject: `[TEST] ${content.subject}`, html: content.html });
    if (result.error || !result.data?.id) throw new Error("provider-rejected");
  } catch {
    throw new Error("Testen kunne ikke sendes. Prøv igjen senere.");
  }
  await audit({ actorId: user.id, action: "email_template.test_sent", target: `EmailTemplate:${id}` });
  return { ok: true, recipient };
}

export async function setAsDefault(id: string) {
  const user = await requireCoachActionUser();
  id = idSchema.parse(id);
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
  id = idSchema.parse(id);
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
