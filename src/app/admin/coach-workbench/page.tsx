/**
 * /admin/coach-workbench — legacy prototype, redirect til hybrid Workbench.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CoachWorkbenchRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ spiller?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  if (params.spiller) {
    redirect(`/admin/spillere/${params.spiller}/workbench`);
  }

  const player = await prisma.user.findFirst({
    where: { role: "PLAYER", deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true },
  });

  if (player) {
    redirect(`/admin/spillere/${player.id}/workbench`);
  }

  redirect("/admin/spillere");
}