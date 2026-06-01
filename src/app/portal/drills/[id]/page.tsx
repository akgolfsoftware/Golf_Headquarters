/**
 * PlayerHQ · Drill-detalj (/portal/drills/[id])
 *
 * Server Component. Mobile-first port av
 * public/design-handover/playerhq/components-drill-detalj.html.
 *
 * Henter én ekte ExerciseDefinition via loadDrillDetalj og rendrer:
 * - DrillDetalj: topbar · hero (akse-farge venstrekant) · beskrivelse · media ·
 *   utledede trinn · parameter-tabell · coach-notat
 * - MestringsLoggClient: mestringslogg + registrerings-skjema + rating-widget
 *   (eksisterende server-action-funksjonalitet på denne ruten)
 * - DrillDetailClient: handlinger («Legg til i plan» / Start økt / Del)
 *
 * Tilgang: PLAYER + PARENT (auth-guard beholdt).
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDrillDetalj } from "@/lib/portal-drilldetalj/drill-detalj-data";
import { DrillDetalj } from "@/components/portal/drill-detalj/drill-detalj";
import { DrillDetailClient } from "./drill-client";
import { MestringsLoggClient } from "./mestrings-logg-client";

export default async function DrillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { id } = await params;

  const data = await loadDrillDetalj(id, { hcp: user.hcp });

  // Fallback hvis drillen ikke finnes.
  if (!data) {
    return (
      <div className="mx-auto max-w-xl space-y-6 pb-20">
        <Link
          href="/portal/drills"
          className="inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Tilbake til drill-bibliotek
        </Link>
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="font-display text-xl italic text-muted-foreground">
            Denne drillen finnes ikke eller er ikke tilgjengelig.
          </p>
          <Link
            href="/portal/drills"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Se alle drills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 pb-24 md:pb-6">
      <DrillDetalj data={data} />

      {/* Mestringslogg + registrering + rating (eksisterende funksjonalitet) */}
      <MestringsLoggClient
        drillId={data.id}
        drillNavn={data.name}
        mestringsLogg={[]}
        ratings={[]}
        csForMeg={data.csForMeg}
      />

      {/* Handlinger — «Legg til i plan» som primær */}
      <DrillDetailClient drillId={data.id} drillTitle={data.name} />
    </div>
  );
}
