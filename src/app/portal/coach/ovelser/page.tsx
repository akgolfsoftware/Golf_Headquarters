// PH-13 Øvelser fra coach — Precision Athletics, pakke 11 og 12 (utkast booking-meldinger.html, godkjent 16.10.2026).
/**
 * PlayerHQ · Øvelser fra coach (/portal/coach/ovelser).
 * Før viste siden hele ExerciseDefinition-biblioteket med hardkodet coachnavn.
 * Nå: øvelsene i økter som en annen enn spilleren (coachen) har lagt i spillerens plan
 * (WorkbenchSession.createdBy ≠ spilleren). Coachnavnet er spillerens aktive coach (PlayerEnrollment).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH13CoachOvelser, type CoachAkse, type PH13CoachOvelse } from "@/components/portal/precision/PH13CoachOvelser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getMyCoachIds } from "@/lib/portal-drills/drills-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øvelser fra coach · PlayerHQ" };

const AKSER = new Set<CoachAkse>(["fys", "tek", "slag", "spill", "turn"]);
const tilAkse = (v: string | null | undefined): CoachAkse | null => {
  const a = (v ?? "").toLowerCase();
  return AKSER.has(a as CoachAkse) ? (a as CoachAkse) : null;
};

/** WorkbenchSession.date er @db.Date (UTC-midnatt): les med UTC. */
const fmtDato = (d: Date) => d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "UTC" });

function mengde(d: { repSett: number | null; repReps: number | null; repAntall: number | null; repMinutter: number | null }): string | null {
  if (d.repSett && d.repReps) return `${d.repSett} × ${d.repReps}`;
  if (d.repAntall) return `${d.repAntall} reps`;
  if (d.repMinutter) return `${d.repMinutter} min`;
  return null;
}

export default async function CoachOvelserPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const idag = new Date();
  const idagUtc = new Date(Date.UTC(idag.getUTCFullYear(), idag.getUTCMonth(), idag.getUTCDate()));

  const [okter, coachIds, uleste] = await Promise.all([
    prisma.workbenchSession.findMany({
      where: {
        playerId: user.id,
        createdBy: { not: user.id },
        isAgentProposal: false,
        status: { notIn: ["DRAFT", "CANCELLED", "WITHDRAWN"] },
      },
      orderBy: { date: "desc" },
      take: 200,
      select: {
        date: true, pyramid: true, createdBy: true,
        drills: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true, title: true, durationMinutes: true, exerciseId: true,
            repSett: true, repReps: true, repAntall: true, repMinutter: true,
            exercise: { select: { name: true, pyramidArea: true, imageUrl: true } },
          },
        },
      },
    }),
    getMyCoachIds(user.id),
    getUnreadNotifications(user.id, 1),
  ]);

  const personIder = [...new Set([...okter.map((o) => o.createdBy), ...coachIds.slice(0, 1)])];
  const personer = personIder.length
    ? await prisma.user.findMany({ where: { id: { in: personIder } }, select: { id: true, name: true } })
    : [];
  const fornavn = (id: string | undefined) => personer.find((p) => p.id === id)?.name.split(" ")[0] ?? null;

  // Én rad per øvelse (nyeste økt først, siden øktene er sortert synkende på dato).
  const perOvelse = new Map<string, PH13CoachOvelse>();
  for (const okt of okter) {
    for (const d of okt.drills) {
      const key = d.exerciseId ?? `t:${d.title.trim().toLowerCase()}`;
      const iPlanen = okt.date >= idagUtc;
      const finnes = perOvelse.get(key);
      if (finnes) {
        if (iPlanen) finnes.iPlanen = true;
        continue;
      }
      const info = [mengde(d), d.durationMinutes ? `${d.durationMinutes} min` : null].filter((x): x is string => !!x);
      perOvelse.set(key, {
        key,
        ovelseId: d.exerciseId,
        navn: d.exercise?.name ?? d.title,
        akse: tilAkse(d.exercise?.pyramidArea ?? okt.pyramid),
        info,
        fra: `Fra ${fornavn(okt.createdBy) ?? "coachen"} ${fmtDato(okt.date)}`,
        iPlanen,
        bilde: d.exercise?.imageUrl ?? null,
      });
    }
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH13CoachOvelser data={{ coachFornavn: fornavn(coachIds[0]), ovelser: [...perOvelse.values()] }} />
    </PlayerHQSkall>
  );
}
