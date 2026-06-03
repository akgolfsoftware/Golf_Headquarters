/**
 * PlayerHQ · Drill-detalj (/portal/drills/[id]) — v10-design.
 *
 * Rendrer <DrillDetalj> (v10-fasit fra pl-drill, @/components/portal/drills)
 * med EKTE data fra loadDrillDetalj (Prisma · én ExerciseDefinition).
 * mapDrillData oversetter loader-output → v10 DrillDetaljData.
 *
 * Tom-tilstander bevares: csBadge=null når CS mangler, mediaUrl=null gir
 * «Media kommer»-placeholder, params=[] skjuler parameter-tabellen.
 * Ingen fabrikerte tall — alt utledes fra faktiske felter.
 *
 * Server component. Auth-guard: PLAYER + PARENT. Not-found-fallback beholdt.
 *
 * 3. juni: byttet fra @/components/portal/drill-detalj (gammelt design +
 * MestringsLoggClient/DrillDetailClient) til v10-komponenten i
 * @/components/portal/drills.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  loadDrillDetalj,
  type DrillDetaljData as LoaderDrillData,
} from "@/lib/portal-drilldetalj/drill-detalj-data";
import {
  DrillDetalj,
  type DrillDetaljData,
} from "@/components/portal/drills/drill-detalj";

/** Faste feedback-etiketter (UI-affordans, ikke spillerdata) — matcher v10. */
const FEEDBACK_OPTIONS = [
  "Aha!",
  "Utfordrende",
  "Passe",
  "Kjedelig",
  "For vanskelig",
];

/** Oversetter ekte loader-output → v10 DrillDetaljData. Tom-tilstander bevart. */
function mapDrillData(d: LoaderDrillData): DrillDetaljData {
  return {
    topbarTag: d.topbarTag,
    axis: d.axis,
    eyebrow: d.eyebrow,
    name: d.name,
    csBadge: d.csForMeg !== null ? `CS ${d.csForMeg}` : null,
    description: d.description,
    mediaUrl: d.media.find((m) => m.kind === "video")?.url ?? null,
    params: d.params,
    feedbackOptions: FEEDBACK_OPTIONS,
    hrefs: {
      bibliotek: "/portal/drills",
      startOkt: "/portal/ny-okt",
    },
  };
}

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
    <div className="mx-auto max-w-2xl">
      <DrillDetalj data={mapDrillData(data)} />
    </div>
  );
}
