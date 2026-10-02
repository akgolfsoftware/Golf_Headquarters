/**
 * AG-TP-02 Før og nå (`/admin/spillere/[id]/plan/[planId]/for-og-na`).
 * Tegning: Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-TP.jsx › AGTP02.
 *
 * Tilgang som AG-10: COACH/ADMIN, spilleren i coachens stall
 * (coachScopedPlayerWhere), og planen må tilhøre spilleren. Leser bare
 * oppgavenes bilde og video — de to daterte bildene tegningen trenger finnes
 * ikke i basen ennå (katalog.js: «Krever tillegg i datamodellen»).
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { pNavn } from "@/components/teknisk-plan/constants";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AGTP02ForOgNaa } from "@/components/admin/precision/AGTP02ForOgNaa";

export const dynamic = "force-dynamic";
export const metadata = { title: "Før og nå · AgencyOS" };

export default async function ForOgNaaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; planId: string }>;
  searchParams: Promise<{ oppgave?: string }>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id, planId } = await params;
  const { oppgave } = await searchParams;

  const [spiller, plan] = await Promise.all([
    prisma.user.findFirst({ where: { AND: [coachScopedPlayerWhere(coach), { id }] }, select: { id: true, name: true } }),
    prisma.technicalPlan.findFirst({
      where: { id: planId, userId: id },
      select: {
        positions: {
          orderBy: { sortOrder: "asc" },
          select: { pNummer: true, tasks: { orderBy: { sortOrder: "asc" }, select: { id: true, tittel: true, bildeUrl: true, videoUrl: true } } },
        },
      },
    }),
  ]);
  if (!spiller || !plan) notFound();

  const oppgaver = plan.positions.flatMap((p) => p.tasks.map((t) => ({
    id: t.id, p: p.pNummer, posisjon: pNavn(p.pNummer), tittel: t.tittel, bildeUrl: t.bildeUrl, videoUrl: t.videoUrl,
  })));

  return (
    <AgencyOSSkall navn={coach.name ?? "Coach"}>
      <AGTP02ForOgNaa tilstand={oppgaver.length ? "data" : "tom"} spiller={{ id: spiller.id, navn: spiller.name ?? "Spiller" }} planId={planId} oppgaver={oppgaver} valgtId={oppgave ?? null} />
    </AgencyOSSkall>
  );
}
