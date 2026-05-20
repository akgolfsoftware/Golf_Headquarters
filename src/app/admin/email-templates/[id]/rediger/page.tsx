/**
 * CoachHQ — Rediger e-postmal
 *
 * 2-pane editor med live preview. Tilgang: COACH og ADMIN.
 * Trigger fra /admin/email-templates ved klikk på rad.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EditorClient } from "./editor-client";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function RedigerEmailTemplatePage({ params }: Params) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const template = await prisma.emailTemplate.findUnique({
    where: { id },
  });

  if (!template) notFound();

  return (
    <EditorClient
      template={{
        id: template.id,
        slug: template.slug,
        name: template.name,
        subject: template.subject,
        body: template.body,
        active: template.active,
      }}
      testRecipient={user.email}
    />
  );
}
