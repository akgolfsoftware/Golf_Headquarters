/**
 * /admin/spillere/[id]/workbench — Coach-Workbench.
 * Coach opererer i spillerens workbench (role=coach): tre-sidemeny,
 * uke-kalender, inspector med coach-handlinger + COACH-ONLY-blokk.
 *
 * Server Component med live Prisma-data via loadWorkbenchData(id).
 * notFound() hvis spiller-id ikke finnes.
 */

import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { Workbench } from "@/components/workbench/workbench";
import { loadWorkbenchData } from "@/lib/workbench/load-workbench";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CoachWorkbenchPage({ params }: Props) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "ADMIN" && me.role !== "COACH")) {
    redirect("/auth/login");
  }

  const { id } = await params;

  // W5b: ekte data for spilleren. null → spilleren finnes ikke → 404.
  const data = await loadWorkbenchData(id);
  if (data === null) notFound();

  // Spillernavn for coach-handlingenes etiketter (fornavn holder).
  const spiller = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });
  const fornavn = spiller?.name?.split(/\s+/)[0] ?? "spilleren";

  return <Workbench role="coach" data={data} playerId={id} playerName={fornavn} />;
}
