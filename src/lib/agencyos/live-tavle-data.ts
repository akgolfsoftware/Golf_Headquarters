/**
 * AgencyOS · Live-tavle (T9, 27.08.2026) — ekte data, ikke seed.
 *
 * Erstatter «Mission Control» (statisk innboks-mockup i `live-data.ts`) på
 * ruten `/admin/agencyos/live`. Den gamle koden (`AgencyLiveV2.tsx` +
 * `live-data.ts`) er et helt annet konsept (personlig innboks-dashboard) enn
 * fasiten `AG-09/AG-09b Live-tavle` (pågående treningsøkter med timer) — den
 * står urørt, men brukes ikke lenger på denne ruten. Se docs/natt/T9-DONE.md
 * for hvor Mission Control bør bo videre (Anders avgjør).
 *
 * ADMIN ser alle pågående økter; COACH ser kun egne (samme eierskapsmønster
 * som live-okt-actions.ts).
 */

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/uke-helpers";

export type LiveTavleOkt = {
  id: string;
  tittel: string;
  spillerNavn: string | null;
  startTime: string;
  endTime: string;
  varighetTotalMin: number;
  minIgjen: number;
  fremdriftPct: number;
};

export type LiveTavleKommer = {
  id: string;
  tittel: string;
  spillerNavn: string | null;
  startTime: string;
};

export type LiveTavleData = {
  liveOkter: LiveTavleOkt[];
  kommerIDag: LiveTavleKommer[];
};

async function navnForStudentIds(ids: (string | null)[]): Promise<Map<string, string>> {
  const unike = Array.from(new Set(ids.filter((id): id is string => id != null)));
  if (unike.length === 0) return new Map();
  const brukere = await prisma.user.findMany({ where: { id: { in: unike } }, select: { id: true, name: true } });
  return new Map(brukere.map((b) => [b.id, b.name ?? "Spiller"]));
}

export async function hentLiveTavle(coachId: string, erAdmin: boolean): Promise<LiveTavleData> {
  const naa = new Date();
  const eierFilter = erAdmin ? {} : { coachId };

  const [liveRader, kommerRader] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: { status: "IN_PROGRESS", ...eierFilter },
      orderBy: { startTime: "asc" },
      select: { id: true, title: true, studentId: true, startTime: true, endTime: true },
    }),
    prisma.trainingSessionV2.findMany({
      where: {
        status: "PLANNED",
        startTime: { gt: naa, gte: startOfDay(naa), lte: endOfDay(naa) },
        ...eierFilter,
      },
      orderBy: { startTime: "asc" },
      take: 6,
      select: { id: true, title: true, studentId: true, startTime: true },
    }),
  ]);

  const navnKart = await navnForStudentIds([...liveRader.map((r) => r.studentId), ...kommerRader.map((r) => r.studentId)]);

  const liveOkter: LiveTavleOkt[] = liveRader.map((r) => {
    const varighetTotalMin = Math.max(1, Math.round((r.endTime.getTime() - r.startTime.getTime()) / 60_000));
    const minIgjen = Math.max(0, Math.round((r.endTime.getTime() - naa.getTime()) / 60_000));
    const elapsedMin = varighetTotalMin - minIgjen;
    const fremdriftPct = Math.min(100, Math.max(0, Math.round((elapsedMin / varighetTotalMin) * 100)));
    return {
      id: r.id,
      tittel: r.title,
      spillerNavn: r.studentId ? (navnKart.get(r.studentId) ?? null) : null,
      startTime: r.startTime.toISOString(),
      endTime: r.endTime.toISOString(),
      varighetTotalMin,
      minIgjen,
      fremdriftPct,
    };
  });

  const kommerIDag: LiveTavleKommer[] = kommerRader.map((r) => ({
    id: r.id,
    tittel: r.title,
    spillerNavn: r.studentId ? (navnKart.get(r.studentId) ?? null) : null,
    startTime: r.startTime.toISOString(),
  }));

  return { liveOkter, kommerIDag };
}
