/**
 * PlayerHQ · Tren · Tester · Detalj — pixel-perfekt port av Claude Design
 * docs/design-handoff/test-modul/tester-detalj.html
 *
 * Demo-innhold (Driver Basic) for å matche design. Live data-hook kommer
 * når Prisma-kalkulering for percentiler + historikk er klar.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TesterDetaljScreen } from "@/components/test-modul-v2/tester-detalj-screen";

export const dynamic = "force-dynamic";

export default async function TestDetaljSpillerPage({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const user = await requirePortalUser();
  const { testId } = await params;

  const test = await prisma.testDefinition.findUnique({ where: { id: testId } });
  if (!test) notFound();

  const initials =
    user.name
      ?.split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "??";

  return (
    <TesterDetaljScreen
      testId={testId}
      playerName={user.name ?? "Spiller"}
      playerInitials={initials}
      hcp={user.hcp ?? null}
    />
  );
}
