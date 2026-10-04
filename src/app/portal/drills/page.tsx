// PH13DrillListe — Precision Athletics. Data og handlinger er beholdt.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getDrillLibraryRich } from "@/lib/portal-drills/drills-data";
import { beregnSgGap } from "@/lib/workbench/sg-gap";
import { SG_FOKUS_LABEL, type SgKategori } from "@/lib/workbench/fokus";
import type { SkillArea } from "@/generated/prisma/client";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import {
  konverterExerciseTilPH13,
  SYNTETISKE_PH13_DRILLS,
  SYNTETISKE_PH13_CADDIE_FORSLAG,
  type PH13Drill,
} from "@/lib/portal-drills/ph13-drills-data";
import { PH13DrillBank } from "@/components/portal/precision/PH13DrillBank";

export const dynamic = "force-dynamic";

const SG_TIL_SKILL: Record<SgKategori, SkillArea> = {
  OTT: "TEE_TOTAL",
  APP: "TILNAERMING",
  ARG: "AROUND_GREEN",
  PUTT: "PUTTING",
};

function tredveDagerSiden(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

export default async function DrillsPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [dbDrills, gap] = await Promise.all([
    getDrillLibraryRich(user.id),
    beregnSgGap(user.id),
  ]);

  // Bruk siste 30 dager: distinkte egne økter per drill
  const bruk =
    dbDrills.length > 0
      ? await prisma.trainingDrillV2.findMany({
          where: {
            exerciseId: { in: dbDrills.map((d) => d.id) },
            session: { studentId: user.id, startTime: { gte: tredveDagerSiden() } },
          },
          select: { exerciseId: true, sessionId: true },
        })
      : [];

  const okterPerDrill = new Map<string, Set<string>>();
  for (const b of bruk) {
    if (!b.exerciseId) continue;
    const s = okterPerDrill.get(b.exerciseId) ?? new Set<string>();
    s.add(b.sessionId);
    okterPerDrill.set(b.exerciseId, s);
  }

  const initialDrills: PH13Drill[] =
    dbDrills.length > 0
      ? dbDrills.map((d) =>
          konverterExerciseTilPH13(d, okterPerDrill.get(d.id)?.size ?? 0)
        )
      : SYNTETISKE_PH13_DRILLS;

  // Caddie-forslag: hvis spilleren har et SG-gap, tilpasser vi forslaget
  let caddieDrafts: PH13Drill[] = [...SYNTETISKE_PH13_CADDIE_FORSLAG];
  if (gap) {
    const kandidat = dbDrills.find(
      (d) => d.skillArea === SG_TIL_SKILL[gap.kategori]
    );
    if (kandidat) {
      const label = SG_FOKUS_LABEL[gap.kategori];
      const sgNum = Math.round(gap.sg * 10) / 10;
      const caddieDrill: PH13Drill = {
        ...konverterExerciseTilPH13(kandidat),
        id: `caddie-${kandidat.id}`,
        draft: true,
        src: "caddie",
        why: `${label} er ditt største SG-gap (${sgNum} strokes gained). Caddie foreslår denne for neste økt.`,
      };
      caddieDrafts = [caddieDrill, ...caddieDrafts.filter((x) => x.id !== caddieDrill.id)];
    }
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH13DrillBank
        initialDrills={initialDrills}
        initialDrafts={caddieDrafts}
      />
    </PlayerHQSkall>
  );
}
