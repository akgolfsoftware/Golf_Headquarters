/**
 * AgencyOS — Rediger e-postmal (`/admin/email-templates/[id]/rediger`), v2.
 * Port av `(legacy)/email-templates/[id]/rediger/page.tsx` (2026-07-14,
 * AgencyOS Bølge 3.9) — samme datamodell, ny v2-presentasjon i
 * `AdminEpostmalRedigerV2`. `(legacy)/email-templates/[id]/rediger/actions.ts`
 * bor fortsatt der — delt server actions, uendret.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminEpostmalRedigerV2 } from "@/components/admin/v2/AdminEpostmalRedigerV2";

export const dynamic = "force-dynamic";

export default async function RedigerEmailTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminEpostmalRedigerV2
        template={{ id: template.id, slug: template.slug, name: template.name, subject: template.subject, body: template.body, active: template.active }}
        testRecipient={user.email}
      />
    </V2Shell>
  );
}
