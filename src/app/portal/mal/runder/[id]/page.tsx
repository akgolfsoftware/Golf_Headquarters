import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { SlagWizard } from "./slag-wizard";
import { UpGameImportModal } from "./upgame-import-modal";

export default async function RundeDetalj({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: { course: true, shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] } },
  });

  if (!runde) notFound();
  if (runde.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  const datoTekst = runde.playedAt.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Aggreger per hull
  const hullMap = new Map<number, typeof runde.shots>();
  for (const s of runde.shots) {
    const arr = hullMap.get(s.holeNumber) ?? [];
    arr.push(s);
    hullMap.set(s.holeNumber, arr);
  }

  const antallHullMedSlag = hullMap.size;
  const totaltAntallSlag = runde.shots.length;
  const totaltPutter = runde.shots.filter((s) => s.shotType === "PUTT").length;
  const antallFairways = (() => {
    let hit = 0;
    let mulig = 0;
    for (const [, slag] of hullMap) {
      const forsteSlag = slag[0];
      if (!forsteSlag || forsteSlag.holePar < 4) continue;
      mulig++;
      if (forsteSlag.lie === "FAIRWAY") hit++;
    }
    return { hit, mulig };
  })();
  const antallGir = (() => {
    let hit = 0;
    let mulig = 0;
    for (const [, slag] of hullMap) {
      if (slag.length === 0) continue;
      mulig++;
      const holePar = slag[0].holePar;
      const maalslagForGir = holePar - 2;
      const forstePutt = slag.find((s) => s.shotType === "PUTT");
      if (forstePutt && forstePutt.shotNumber - 1 <= maalslagForGir) hit++;
    }
    return { hit, mulig };
  })();

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
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
      <Link
        href="/portal/mal/runder"
        className="inline-flex h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Alle runder
      </Link>

      <PageHeader
        eyebrow={`PlayerHQ · Runder · ${runde.course.name}`}
        titleLead="Runde"
        titleItalic={datoTekst}
        sub={`Score ${runde.score} · ${totaltAntallSlag} slag registrert · ${antallHullMedSlag}/18 hull`}
      />

      {/* KPI-strip */}
      {antallHullMedSlag > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <KpiKort label="Slag" verdi={String(totaltAntallSlag)} sub={`${antallHullMedSlag} hull`} />
          <KpiKort label="Putter" verdi={String(totaltPutter)} sub={`snitt ${(totaltPutter / antallHullMedSlag).toFixed(1)} / hull`} />
          <KpiKort
            label="FIR"
            verdi={antallFairways.mulig > 0 ? `${antallFairways.hit}/${antallFairways.mulig}` : "—"}
            sub={antallFairways.mulig > 0 ? `${Math.round((antallFairways.hit / antallFairways.mulig) * 100)} %` : ""}
          />
          <KpiKort
            label="GIR"
            verdi={antallGir.mulig > 0 ? `${antallGir.hit}/${antallGir.mulig}` : "—"}
            sub={antallGir.mulig > 0 ? `${Math.round((antallGir.hit / antallGir.mulig) * 100)} %` : ""}
          />
        </div>
      )}

      {/* Import-knapp */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Slag-for-slag registrering
        </h2>
        <UpGameImportModal roundId={id} />
      </div>

      {/* Wizard */}
      <SlagWizard roundId={id} eksisterendeSlag={serialiserteSlag} />
    </div>
  );
}

function KpiKort({ label, verdi, sub }: { label: string; verdi: string; sub: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {verdi}
      </div>
      <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
