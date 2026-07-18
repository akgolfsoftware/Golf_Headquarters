/**
 * v2-preview: AgencyOS — Rediger e-postmal. Port av den ekte 2-pane-editoren
 * (src/app/admin/(legacy)/email-templates/[id]/rediger) til v2-skallet —
 * samme Prisma-loader og samme server-actions (saveTemplate/sendTestEmail/
 * setAsDefault/archiveTemplate), gjenbrukt 1:1 i AdminEmailTemplateEditorV2.
 * Auth er ADMIN/COACH, matcher legacy-skjermen.
 *
 * Server component.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AdminEmailTemplateEditorV2,
  type AdminEmailTemplateEditorV2Template,
} from "@/components/admin/v2/AdminEmailTemplateEditorV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rediger e-postmal · AgencyOS (v2)" };

export default async function V2RedigerEmailTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  const data: AdminEmailTemplateEditorV2Template = {
    id: template.id,
    slug: template.slug,
    name: template.name,
    subject: template.subject,
    body: template.body,
    active: template.active,
  };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/email-templates">E-postmaler</TilbakeLenke>
      <AdminEmailTemplateEditorV2 template={data} testRecipient={user.email} />
    </V2Shell>
  );
}
