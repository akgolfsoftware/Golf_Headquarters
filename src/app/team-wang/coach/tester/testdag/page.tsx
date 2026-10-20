import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { stasjonsTester } from "@/lib/admin/tester/testdag-data";
import { hentWangTestdager, hentWangTestTilgang } from "@/app/team-wang/_data/wang-testdag-data";
import { WangUnderside } from "@/components/wang/WangUnderside";
import { WangIngenTilgang } from "@/components/wang/WangSystemside";
import { WangTestdagPlanlegg } from "@/components/wang/WangTestdag";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Planlegg testdag — WANG", robots: { index: false, follow: false } };

/** Tester › Planlegg testdag (canvas «WANG nøkkelskjermer», Tester-rada). Lagres med den felles planleggTestdag. */
export default async function WangPlanleggTestdagPage() {
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: `/wang?next=${encodeURIComponent("/team-wang/coach/tester/testdag")}`,
  });
  const tilgang = await hentWangTestTilgang(bruker);
  if (!tilgang) return <WangIngenTilgang epost={bruker.email} />;
  const [gruppe, testdager] = await Promise.all([
    prisma.group.findUnique({ where: { id: tilgang.gruppeId }, select: { name: true } }),
    hentWangTestdager(tilgang.gruppeId),
  ]);
  const idag = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
  return (
    <WangUnderside bruker={bruker} omraade="tester">
      <WangTestdagPlanlegg
        gruppeId={tilgang.gruppeId}
        gruppeNavn={gruppe?.name ?? "WANG"}
        antallElever={tilgang.delerIder.length}
        tester={stasjonsTester()}
        idag={idag}
        testdager={testdager}
      />
    </WangUnderside>
  );
}
