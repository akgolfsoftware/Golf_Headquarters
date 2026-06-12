/**
 * PlayerHQ · Slag-registrering (/portal/mal/runder/[id]/slag)
 *
 * RE-ETABLERT 2026-06-12 (review-funn B3): SlagWizard + UpGameImportModal
 * mistet eneste render-sted i fasit-omskrivingen av runde-detaljsiden —
 * ingen flyt kunne produsere Shot-data lenger. Detaljsiden er bevisst ren
 * visning (fasit-paritet); registreringsverktøyet bor nå på denne undersiden
 * og nås fra scorecard-blokken der.
 *
 * Skrive-tilgang håndheves i actions (assertRoundOwner) — kun rundens eier.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { SlagWizard } from "../slag-wizard";
import { UpGameImportModal } from "../upgame-import-modal";

export const dynamic = "force-dynamic";

export default async function SlagRegistreringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: { select: { name: true } },
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
    },
  });
  if (!runde) notFound();
  // Kun eieren registrerer slag (actions håndhever det samme ved skriving).
  if (runde.userId !== user.id) notFound();

  const datoTekst = runde.playedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });

  const serialiserteSlag = runde.shots.map((s) => ({
    id: s.id,
    holeNumber: s.holeNumber,
    holePar: s.holePar,
    shotNumber: s.shotNumber,
    club: s.club,
    lie: s.lie as string,
    distanceToPin: s.distanceToPin,
    distanceHit: s.distanceHit,
    windDir: s.windDir as string | null,
    shotType: s.shotType as string,
    isPenalty: s.isPenalty,
    notes: s.notes,
  }));

  return (
    <div className="mx-auto w-full max-w-[460px] px-1 pb-8 pt-3 sm:px-5 md:max-w-[860px] md:px-8 md:pt-6">
      <Link
        href={`/portal/mal/runder/${id}`}
        className="mb-2 inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Tilbake til runden
      </Link>

      <div className="flex items-end justify-between gap-3">
        <div>
          <AthleticEyebrow>
            {runde.course.name} · {datoTekst}
          </AthleticEyebrow>
          <h1 className="mt-2 font-display text-[26px] font-bold leading-[1.04] tracking-[-0.025em] text-foreground md:text-[30px]">
            Slag-for-slag
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Registrer hvert slag manuelt, eller importer fra UpGame.
          </p>
        </div>
        <UpGameImportModal roundId={id} />
      </div>

      <div className="mt-5">
        <SlagWizard roundId={id} eksisterendeSlag={serialiserteSlag} />
      </div>
    </div>
  );
}
