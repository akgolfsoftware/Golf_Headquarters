/**
 * Data-loader for /portal/planlegge — Workbench-mobil "Treningsplan"-modus
 * (ph-workbench.jsx · TreningCanvas). Ukens TrainingSessionV2-økter gruppert
 * per dag, med dominerende pyramide-område (farge + tag). Ekte Prisma.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export type PyrKey = "fys" | "tek" | "slag" | "spill" | "turn";

export type PlanOkt = {
  id: string;
  tid: string;
  tittel: string;
  tag: string;
  omr: PyrKey;
  dur: string;
  naa: boolean;
  href: string;
};
export type PlanDag = { dag: string; dato: number; items: PlanOkt[] };

export type PlanleggeData = {
  ukeLabel: string;
  antall: number;
  dager: PlanDag[];
};

const PYR_FRA_AREA: Record<string, PyrKey> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };
const TAG: Record<PyrKey, string> = { fys: "Fysisk", tek: "Teknisk", slag: "Golfslag", spill: "Spill", turn: "Turnering" };
const UKEDAG = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

function tid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}
function ukenummer(d: Date): number {
  const t = new Date(d.valueOf());
  const dag = (d.getDay() + 6) % 7;
  t.setDate(t.getDate() - dag + 3);
  const first = t.valueOf();
  t.setMonth(0, 1);
  if (t.getDay() !== 4) t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
  return 1 + Math.ceil((first - t.valueOf()) / 604_800_000);
}

export async function getPlanleggeData(userId: string): Promise<PlanleggeData> {
  const now = new Date();
  const dag = (now.getDay() + 6) % 7; // 0 = mandag
  const mandag = new Date(now);
  mandag.setDate(now.getDate() - dag);
  mandag.setHours(0, 0, 0, 0);
  const sondag = new Date(mandag);
  sondag.setDate(mandag.getDate() + 7);

  const okter = await prisma.trainingSessionV2
    .findMany({
      where: { studentId: userId, startTime: { gte: mandag, lt: sondag } },
      orderBy: { startTime: "asc" },
      select: {
        id: true, title: true, startTime: true, endTime: true, status: true, practiceType: true,
        drills: { select: { pyramide: true } },
      },
    })
    .catch(() => []);

  const dominerende = (drills: { pyramide: string }[], pt: string): PyrKey => {
    if (drills.length) {
      const tell = new Map<string, number>();
      for (const d of drills) tell.set(d.pyramide, (tell.get(d.pyramide) ?? 0) + 1);
      const top = [...tell.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (top && PYR_FRA_AREA[top]) return PYR_FRA_AREA[top];
    }
    return ({ BLOKK: "tek", RANDOM: "slag", KONKURRANSE: "turn", SPILL_TEST: "spill" } as Record<string, PyrKey>)[pt] ?? "tek";
  };

  // Grupper per dag (man → søn), kun dager med økter.
  const perDag = new Map<number, PlanDag>();
  for (const o of okter) {
    const dagNr = (o.startTime.getDay() + 6) % 7;
    if (!perDag.has(dagNr)) {
      perDag.set(dagNr, { dag: UKEDAG[o.startTime.getDay()], dato: o.startTime.getDate(), items: [] });
    }
    const omr = dominerende(o.drills, o.practiceType);
    perDag.get(dagNr)!.items.push({
      id: o.id,
      tid: tid(o.startTime),
      tittel: o.title,
      tag: TAG[omr],
      omr,
      dur: `${Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000))} min`,
      naa: o.status === "IN_PROGRESS",
      href: `/portal/gjennomfore/${o.id}`,
    });
  }

  const dager = [...perDag.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  const fmt = (d: Date) => `${d.getDate()}. ${["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"][d.getMonth()]}`;
  const sluttVis = new Date(sondag);
  sluttVis.setDate(sluttVis.getDate() - 1);

  return {
    ukeLabel: `Uke ${ukenummer(now)} · ${fmt(mandag)} – ${fmt(sluttVis)}`,
    antall: okter.length,
    dager,
  };
}
