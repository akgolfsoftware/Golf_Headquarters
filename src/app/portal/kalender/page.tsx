// PlayerHQ Kalender — Server Component.
//
// Lik /admin/kalender, men:
//   - Auth: requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] })
//   - Filtrerer ALL data til kun innlogget spillers økter/perioder (lockedSpillerId)
//   - viewMode-toggle (Standard/Avansert) styres klientside via ViewModeContext
//   - Default tier-gating: GRATIS låser Avansert
//
// Standard skjuler ÅR-vyen + periodemodal. Avansert eksponerer alt — samme
// komponenter som CoachHQ-versjonen.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lesPeriodeType } from "@/app/admin/kalender/lib/periode-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { ViewModeProvider } from "@/components/shared/ViewModeContext";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import {
  type KalenderData,
  type KalenderOkt,
} from "@/components/shared/calendar/KalenderRoot";
import { PortalKalenderWrapper } from "@/components/shared/calendar/PortalKalenderWrapper";
import type { KalenderVy } from "@/components/shared/calendar/CalendarShell";
import {
  lagDemoPerioder,
  lagDemoTurneringer,
  lagDemoOkterForMaaned,
} from "@/components/shared/calendar/__demoData";
import type {
  AarsplanPeriode,
  AarsplanTurnering,
} from "@/components/shared/calendar/AarsplanView";

export const dynamic = "force-dynamic";

const URL_TIL_VY: Record<string, KalenderVy> = {
  ar: "AAR",
  aar: "AAR",
  maaned: "MAANED",
  uke: "UKE",
  dag: "DAG",
};

type SearchParams = Promise<{ view?: string }>;

export default async function PortalKalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });

  const { view } = await searchParams;
  // I PlayerHQ er MAANED det meningsfulle startpunktet — ÅR er coach-konsept.
  const vy: KalenderVy = view ? URL_TIL_VY[view] ?? "MAANED" : "MAANED";

  const data = await byggKalenderData(user.id, user.name ?? "Min plan", vy);
  const grunnleggendeTier = user.tier === "GRATIS";

  return (
    <ViewModeProvider initialMode="standard">
      <div className="flex h-[calc(100vh-9rem)] flex-col gap-4 pb-20 md:h-[calc(100vh-8rem)] md:pb-0">
        <div className="flex flex-col items-start justify-between gap-3 px-1 md:flex-row md:items-end md:gap-4">
          <PageHeader
            eyebrow="PlayerHQ · kalender"
            titleLead="Din"
            titleItalic="treningsplan"
            sub="Bytt mellom måned, uke og dag for å se hva som ligger foran deg."
          />
          <ViewModeToggle locked={grunnleggendeTier} />
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-border bg-card">
          <PortalKalenderWrapper
            data={data}
            lockedSpillerId={user.id}
          />
        </div>
      </div>
    </ViewModeProvider>
  );
}

async function byggKalenderData(
  spilllerId: string,
  navn: string,
  vy: KalenderVy,
): Promise<KalenderData> {
  const basisdato = new Date();
  const aar = basisdato.getFullYear();
  const fra = new Date(aar, 0, 1);
  const til = new Date(aar, 11, 31);

  // Hent kun innlogget spillers økter
  const dbOkter = await prisma.trainingSessionV2.findMany({
    where: {
      studentId: spilllerId,
      startTime: { gte: fra, lte: til },
    },
    include: { drills: { take: 1 } },
    take: 500,
  });

  type DbOkt = (typeof dbOkter)[number];
  const okter: KalenderOkt[] = dbOkter
    .filter((o: DbOkt) => o.studentId !== null)
    .map((o: DbOkt) => ({
      id: o.id,
      spilllerId: o.studentId as string,
      title: o.title,
      startTime: o.startTime,
      endTime: o.endTime,
      pyramide: o.drills[0]?.pyramide ?? "TEK",
      practiceType: o.practiceType,
      notes: o.notes,
    }));

  const seasonPlaner = await prisma.seasonPlan.findMany({
    where: { userId: spilllerId, year: aar },
    include: { periodBlocks: { orderBy: { startDate: "asc" } } },
  });

  // Hent reelle turneringer for spilleren i året
  const tournamentEntries = await prisma.tournamentEntry.findMany({
    where: {
      userId: spilllerId,
      OR: [
        { tournament: { startDate: { gte: fra, lte: til } } },
        { manualDate: { gte: fra, lte: til } },
      ],
    },
    include: { tournament: { select: { name: true, startDate: true } } },
  });
  type Entry = (typeof tournamentEntries)[number];
  const ekteTurneringer: AarsplanTurnering[] = tournamentEntries
    .map((e: Entry): AarsplanTurnering | null => {
      const dato = e.tournament?.startDate ?? e.manualDate;
      if (!dato) return null;
      const pri = e.priority as "MAJOR" | "NORMAL" | "LOCAL";
      return {
        id: e.id,
        spilllerId,
        navn: e.tournament?.name ?? e.manualName ?? "Turnering",
        dato,
        prioritet: pri,
      };
    })
    .filter((t): t is AarsplanTurnering => t !== null);

  type SeasonPlan = (typeof seasonPlaner)[number];
  type PeriodBlock = SeasonPlan["periodBlocks"][number];
  const perioder: AarsplanPeriode[] = seasonPlaner.flatMap((sp: SeasonPlan) =>
    sp.periodBlocks.map((b: PeriodBlock) => ({
      id: b.id,
      spilllerId: sp.userId,
      type: lesPeriodeType(b),
      fra: b.startDate,
      til: b.endDate,
      focus: b.focus,
    })),
  );

  // Hvis ingen ekte data: fyll med demo for å gi UI noe å vise
  const harData =
    okter.length > 0 || perioder.length > 0 || ekteTurneringer.length > 0;
  const turneringer: AarsplanTurnering[] = harData
    ? ekteTurneringer
    : lagDemoTurneringer(aar, spilllerId).map((t) => ({
        id: t.id,
        spilllerId,
        navn: t.navn,
        dato: t.dato,
        prioritet: t.prioritet,
      }));

  const finalPerioder: AarsplanPeriode[] = harData
    ? perioder
    : lagDemoPerioder(aar, spilllerId).map((p) => ({
        id: p.id,
        spilllerId,
        type: p.type,
        fra: p.fra,
        til: p.til,
        focus: p.focus,
      }));

  const finalOkter: KalenderOkt[] = harData
    ? okter
    : lagDemoOkterForMaaned(basisdato, spilllerId).map((o) => ({
        id: o.id,
        spilllerId,
        title: o.title,
        startTime: o.startTime,
        endTime: o.endTime,
        pyramide: o.pyramide,
        practiceType: o.practiceType,
        notes: o.notes ?? null,
      }));

  const aktivBlock = finalPerioder.find(
    (p) => basisdato >= p.fra && basisdato <= p.til,
  );

  return {
    startVy: vy,
    basisdato,
    spillere: [{ id: spilllerId, navn }],
    perioder: finalPerioder,
    turneringer,
    okter: finalOkter,
    aktivPeriode: aktivBlock
      ? {
          type: aktivBlock.type,
          navn: aktivBlock.focus ?? aktivBlock.type,
          startDato: aktivBlock.fra,
          sluttDato: aktivBlock.til,
          prosentFullført:
            ((basisdato.getTime() - aktivBlock.fra.getTime()) /
              (aktivBlock.til.getTime() - aktivBlock.fra.getTime())) *
            100,
        }
      : null,
    planNavn: `Sesong ${aar}`,
  };
}
