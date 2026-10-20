import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentWangTestdag, hentWangTestTilgang } from "@/app/team-wang/_data/wang-testdag-data";
import { WangUnderside } from "@/components/wang/WangUnderside";
import { WangIngenTilgang } from "@/components/wang/WangSystemside";
import { WangTestdagVis } from "@/components/wang/WangTestdag";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Testdag — WANG", robots: { index: false, follow: false } };

/** Én testdag i WANG-gruppa: stasjonene og elevene som deler testene. */
export default async function WangTestdagPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: `/wang?next=${encodeURIComponent(`/team-wang/coach/tester/testdag/${encodeURIComponent(eventId)}`)}`,
  });
  const tilgang = await hentWangTestTilgang(bruker);
  if (!tilgang) return <WangIngenTilgang epost={bruker.email} />;
  const d = await hentWangTestdag(tilgang, eventId);
  if (!d) notFound();
  return (
    <WangUnderside bruker={bruker} omraade="tester">
      <WangTestdagVis d={d} />
    </WangUnderside>
  );
}
