// Admin kalender-side — Server Component.
//
// Henter spillere, perioder, turneringer og økter, og delegerer rendering til
// KalenderRoot (client). Auth via canAccessMissionControl(). Hvis databasen
// er tom, faller vi tilbake til demo-data fra __demoData.ts.

import { redirect } from "next/navigation";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { KalenderRoot, type KalenderData, type KalenderOkt } from "@/components/shared/calendar/KalenderRoot";
import type { KalenderVy } from "@/components/shared/calendar/CalendarShell";
import {
  DEMO_SPILLERE,
  lagDemoPerioder,
  lagDemoTurneringer,
  lagDemoOkterForMaaned,
} from "@/components/shared/calendar/__demoData";
import { lesPeriodeType } from "@/app/admin/kalender/actions/perioder";
import { prisma } from "@/lib/prisma";
import type { AarsplanPeriode, AarsplanTurnering } from "@/components/shared/calendar/AarsplanView";

const URL_TIL_VY: Record<string, KalenderVy> = {
  ar: "AAR",
  aar: "AAR",
  maaned: "MAANED",
  uke: "UKE",
  dag: "DAG",
};

type SearchParams = Promise<{ view?: string }>;

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await canAccessMissionControl();
  if (!user) redirect("/admin");

  const { view } = await searchParams;
  const vy: KalenderVy = view ? URL_TIL_VY[view] ?? "AAR" : "AAR";

  const data = await byggKalenderData(vy);

  return (
    <div className="h-[calc(100vh-3.5rem)]">
      <KalenderRoot data={data} />
    </div>
  );
}

async function byggKalenderData(vy: KalenderVy): Promise<KalenderData> {
  const basisdato = new Date();
  const aar = basisdato.getFullYear();

  // Hent spillere (PORTAL_USER + role STUDENT). Hvis tomt, fall til demo.
  const dbSpillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: { id: true, name: true },
    take: 12,
    orderBy: { name: "asc" },
  });

  if (dbSpillere.length === 0) {
    return byggDemoData(vy, basisdato, aar);
  }

  const spillere: { id: string; navn: string }[] = dbSpillere.map(
    (s: { id: string; name: string | null }) => ({
      id: s.id,
      navn: s.name ?? "Uten navn",
    }),
  );
  const spilllerIder = spillere.map((s) => s.id);

  // Hent økter for de første 12 spillerne, intervall +/- 3 mnd
  const fra = new Date(aar, 0, 1);
  const til = new Date(aar, 11, 31);

  const dbOkter = await prisma.trainingSessionV2.findMany({
    where: {
      studentId: { in: spilllerIder },
      startTime: { gte: fra, lte: til },
    },
    include: { drills: { take: 1 } },
    take: 1000,
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

  // Hent perioder via season plans
  const seasonPlaner = await prisma.seasonPlan.findMany({
    where: { userId: { in: spilllerIder }, year: aar },
    include: { periodBlocks: { orderBy: { startDate: "asc" } } },
  });

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

  // Turneringer henter vi ikke ennå — demo for nå
  const turneringer: AarsplanTurnering[] = spillere.flatMap((sp: { id: string; navn: string }) =>
    lagDemoTurneringer(aar, sp.id).map((t) => ({
      id: t.id,
      spilllerId: sp.id,
      navn: t.navn,
      dato: t.dato,
      prioritet: t.prioritet,
    })),
  );

  // Finn aktiv periode for første spiller
  const aktivBlock = perioder.find(
    (p) =>
      p.spilllerId === spillere[0]?.id &&
      basisdato >= p.fra &&
      basisdato <= p.til,
  );
  const aktivPeriode = aktivBlock
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
    : null;

  return {
    startVy: vy,
    basisdato,
    spillere,
    perioder,
    turneringer,
    okter,
    aktivPeriode,
    planNavn: `Sesong ${aar}`,
  };
}

function byggDemoData(vy: KalenderVy, basisdato: Date, aar: number): KalenderData {
  const spillere = DEMO_SPILLERE;
  const perioder: AarsplanPeriode[] = spillere.flatMap((s) =>
    lagDemoPerioder(aar, s.id).map((p) => ({
      id: p.id,
      spilllerId: p.spilllerId,
      type: p.type,
      fra: p.fra,
      til: p.til,
      focus: p.focus,
    })),
  );
  const turneringer: AarsplanTurnering[] = spillere.flatMap((s) =>
    lagDemoTurneringer(aar, s.id).map((t) => ({
      id: t.id,
      spilllerId: t.spilllerId,
      navn: t.navn,
      dato: t.dato,
      prioritet: t.prioritet,
    })),
  );
  const okter: KalenderOkt[] = spillere.flatMap((s) =>
    lagDemoOkterForMaaned(basisdato, s.id).map((o) => ({
      id: o.id,
      spilllerId: o.spilllerId,
      title: o.title,
      startTime: o.startTime,
      endTime: o.endTime,
      pyramide: o.pyramide,
      practiceType: o.practiceType,
      notes: o.notes ?? null,
    })),
  );

  const aktiv = perioder.find(
    (p) =>
      p.spilllerId === spillere[0].id &&
      basisdato >= p.fra &&
      basisdato <= p.til,
  );

  return {
    startVy: vy,
    basisdato,
    spillere,
    perioder,
    turneringer,
    okter,
    aktivPeriode: aktiv
      ? {
          type: aktiv.type,
          navn: aktiv.focus ?? aktiv.type,
          startDato: aktiv.fra,
          sluttDato: aktiv.til,
          prosentFullført:
            ((basisdato.getTime() - aktiv.fra.getTime()) /
              (aktiv.til.getTime() - aktiv.fra.getTime())) *
            100,
        }
      : null,
    planNavn: `Sesong ${aar} (demo)`,
  };
}
