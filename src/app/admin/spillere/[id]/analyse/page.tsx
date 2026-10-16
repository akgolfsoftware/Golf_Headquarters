import { redirect } from "next/navigation";

/**
 * `/admin/spillere/[id]/analyse` → Spiller 360 (`?fane=stats`), 29.09.2026.
 *
 * Stats-fanen (AG-A02 + AG-A04 + AG-RD-01) dekker alt analysesiden viste: SG-status, mot seg selv,
 * neste fokus, putting, nivåkrav, Tiger 5, runder, TrackMan per kølle, tester, treningshistorikk
 * med filter, utvikling per sesong og turneringshistorikk.
 * Tilgangssjekken skjer på Spiller 360 (requirePortalUser + coachScopedPlayerWhere).
 */
export default async function Spiller360AnalyseRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/admin/spillere/${id}?fane=stats`);
}
