/**
 * «Fullfør kjeden» — /portal/mal/runder/[id]/fullfor
 * Før slag-kjeden per hull på en runde som har scorekort (import/hurtig
 * score) men mangler slag. SG låses opp når alle kjeder er komplette.
 */

import { notFound } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import {
  FullforKjedeKlient,
  type FullforHull,
} from "@/components/portal/runde-logg/fullfor-kjede-klient";

export const dynamic = "force-dynamic";

export default async function FullforKjedePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireConsentingUser();
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: { select: { name: true, baneId: true } },
      holeScores: { orderBy: { holeNumber: "asc" } },
      shots: {
        select: { holeNumber: true, isPenalty: true, distanceToPin: true },
      },
    },
  });
  if (!runde) notFound();
  // Kun rundens eier fullfører kjeden (lagreHullKjede håndhever det samme).
  if (runde.userId !== user.id) notFound();
  if (runde.holeScores.length === 0) notFound();

  // Hull-lengder fra baneregisteret (null → spilleren setter selv).
  const baneHull = runde.course.baneId
    ? await prisma.courseHole.findMany({
        where: { baneId: runde.course.baneId },
        select: { holeNumber: true, lengthMeter: true },
      })
    : [];
  const lengdePerHull = new Map(baneHull.map((h) => [h.holeNumber, h.lengthMeter]));

  // Kjede-status per hull — samme regel som shots-til-sg (rundedetaljsiden).
  const hullListe: FullforHull[] = runde.holeScores.map((h) => {
    const slag = runde.shots.filter((s) => s.holeNumber === h.holeNumber);
    const straffer = slag.filter((s) => s.isPenalty).length;
    const komplett =
      slag.length > 0 &&
      slag.length + straffer === h.strokes &&
      slag.every((s) => s.distanceToPin != null && s.distanceToPin > 0);
    return {
      holeNumber: h.holeNumber,
      par: h.par,
      strokes: h.strokes,
      putts: h.putts,
      fairway: h.fairway,
      lengdeMeter: lengdePerHull.get(h.holeNumber) ?? null,
      kjedeKomplett: komplett,
    };
  });

  return (
    <div className="mx-auto w-full max-w-[520px] px-4 pb-10 pt-4 sm:px-5 md:pt-6">
      <FullforKjedeKlient
        roundId={id}
        courseNavn={runde.course.name}
        hullListe={hullListe}
        sgTotal={runde.sgTotal}
      />
    </div>
  );
}
