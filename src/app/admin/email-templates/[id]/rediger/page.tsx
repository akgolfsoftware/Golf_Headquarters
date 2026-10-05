/**
 * AG-04-REST: Rediger e-postmal i Precision Athletics. Samme laster (Prisma),
 * samme tilgang (ADMIN/COACH) og samme server-handlinger som før — bare
 * visningen er byttet fra V2Shell til AgencyOSSkall + Precision-komponenter.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG04MalRediger } from "@/components/admin/precision/AG04MalRediger";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rediger e-postmal · AgencyOS" };

export default async function RedigerEmailTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) notFound();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG04MalRediger
        mal={{ id: template.id, slug: template.slug, name: template.name, subject: template.subject, body: template.body, active: template.active }}
        testMottaker={user.email}
      />
    </AgencyOSSkall>
  );
}
