/**
 * /admin/tester/tildel/[spillerId] — Coach tildel-test-modal (T5)
 *
 * Pixel-perfekt fra Claude Design-bundle _SEBg4QyodvbW2k06JWiGw
 * (test-modul/tildel-test-modal.html).
 *
 * Route-baserte modaler (åpnes fra "Tildel"-CTAene på /admin/tester).
 * Spilleren hentes fra Prisma, tester fra TestDefinition.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TildelModal } from "./tildel-modal";

export const dynamic = "force-dynamic";

export default async function TildelTestPage({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { spillerId } = await params;

  const [spiller, tester] = await Promise.all([
    prisma.user.findUnique({
      where: { id: spillerId },
      select: { id: true, name: true, hcp: true },
    }),
    prisma.testDefinition
      .findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, description: true, pyramidArea: true },
      })
      .catch(() => []),
  ]);

  if (!spiller) notFound();

  const initials = spiller.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  // Aggregér count per pyramide
  const pyrCounts = tester.reduce(
    (acc, t) => {
      acc[t.pyramidArea] = (acc[t.pyramidArea] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <TildelModal
      spiller={{
        id: spiller.id,
        name: spiller.name,
        initials,
        hcp: spiller.hcp != null ? String(spiller.hcp) : "—",
      }}
      tester={tester.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description ?? "",
        pyramidArea: t.pyramidArea,
      }))}
      pyrCounts={pyrCounts}
    />
  );
}
