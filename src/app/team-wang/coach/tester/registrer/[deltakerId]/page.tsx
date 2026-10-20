import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentWangRegistrering, hentWangTestTilgang } from "@/app/team-wang/_data/wang-testdag-data";
import { WangUnderside } from "@/components/wang/WangUnderside";
import { WangIngenTilgang } from "@/components/wang/WangSystemside";
import { WangRegistrer } from "@/components/wang/WangTestdag";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Registrer test — WANG", robots: { index: false, follow: false } };

/**
 * Trenerføring for én elev på én stasjon. Lagringen (saveTnTestSomCoach) sjekker tilgangen på nytt;
 * her slipper bare elever i WANG-gruppa som deler testene inn.
 */
export default async function WangRegistrerPage({ params }: { params: Promise<{ deltakerId: string }> }) {
  const { deltakerId } = await params;
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: `/wang?next=${encodeURIComponent(`/team-wang/coach/tester/registrer/${encodeURIComponent(deltakerId)}`)}`,
  });
  const tilgang = await hentWangTestTilgang(bruker);
  if (!tilgang) return <WangIngenTilgang epost={bruker.email} />;
  const d = await hentWangRegistrering(bruker, tilgang, deltakerId);
  if (!d) notFound();
  return (
    <WangUnderside bruker={bruker} omraade="tester">
      {/* key: feltene skal aldri følge med til neste elev. */}
      <WangRegistrer key={d.deltakerId} d={d} />
    </WangUnderside>
  );
}
