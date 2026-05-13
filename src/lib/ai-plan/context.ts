// Kontekst-bygger for AI-plan-generering. Henter spillerens profil, siste
// planer, øktlogger, signaler, mål og evt. WAGR-snapshot fra Prisma og
// returnerer et strukturert objekt som serialiseres inn i AI-prompten.

import { prisma } from "@/lib/prisma";

export type SpillerKontekst = {
  spiller: {
    id: string;
    navn: string;
    hcp: number | null;
    rolle: string;
    tier: string;
    spilteAr: number | null;
    ambisjon: string | null;
    hjemmeklubb: string | null;
  };
  wagr: {
    rank: number;
    ngfKategori: string | null;
    ptsAvg: number;
  } | null;
  aktiveMal: {
    type: string;
    tittel: string;
    targetValue: number | null;
    targetDate: string | null;
  }[];
  sistePlaner: {
    navn: string;
    start: string;
    slutt: string | null;
    status: string;
    antallOkter: number;
  }[];
  sisteOkter: {
    sessionTittel: string;
    drills: { navn: string }[];
    rating: number | null;
    notes: string | null;
    dato: string;
  }[];
  signaler: {
    kind: string;
    value: number | null;
    computedAt: string;
  }[];
};

export async function byggSpillerKontekst(userId: string): Promise<SpillerKontekst> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      hcp: true,
      role: true,
      tier: true,
      playingYears: true,
      ambition: true,
      homeClub: true,
    },
  });
  if (!user) throw new Error(`Bruker ${userId} finnes ikke.`);

  const [wagr, goals, planer, signaler] = await Promise.all([
    prisma.wagrSnapshot.findUnique({
      where: { userId },
      select: { rank: true, ngfCategory: true, ptsAvg: true },
    }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { type: true, title: true, targetValue: true, targetDate: true },
    }),
    prisma.trainingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        name: true,
        startDate: true,
        endDate: true,
        status: true,
        _count: { select: { sessions: true } },
      },
    }),
    prisma.signal.findMany({
      where: { userId },
      orderBy: { computedAt: "desc" },
      take: 20,
      select: { kind: true, value: true, computedAt: true },
    }),
  ]);

  // Siste 20 økt-logger (loggsiden joiner mot session for drills)
  const logger = await prisma.trainingPlanSessionLog.findMany({
    where: { session: { plan: { userId } } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      rating: true,
      notes: true,
      createdAt: true,
      session: {
        select: {
          title: true,
          drills: { select: { exercise: { select: { name: true } } } },
        },
      },
    },
  });

  return {
    spiller: {
      id: user.id,
      navn: user.name,
      hcp: user.hcp,
      rolle: user.role,
      tier: user.tier,
      spilteAr: user.playingYears,
      ambisjon: user.ambition,
      hjemmeklubb: user.homeClub,
    },
    wagr: wagr
      ? { rank: wagr.rank, ngfKategori: wagr.ngfCategory, ptsAvg: wagr.ptsAvg }
      : null,
    aktiveMal: goals.map((g) => ({
      type: g.type,
      tittel: g.title,
      targetValue: g.targetValue,
      targetDate: g.targetDate ? g.targetDate.toISOString().slice(0, 10) : null,
    })),
    sistePlaner: planer.map((p) => ({
      navn: p.name,
      start: p.startDate.toISOString().slice(0, 10),
      slutt: p.endDate ? p.endDate.toISOString().slice(0, 10) : null,
      status: p.status,
      antallOkter: p._count.sessions,
    })),
    sisteOkter: logger.map((l) => ({
      sessionTittel: l.session.title,
      drills: l.session.drills.map((d) => ({ navn: d.exercise.name })),
      rating: l.rating,
      notes: l.notes,
      dato: l.createdAt.toISOString().slice(0, 10),
    })),
    signaler: signaler.map((s) => ({
      kind: s.kind,
      value: s.value,
      computedAt: s.computedAt.toISOString().slice(0, 10),
    })),
  };
}

export function kontekstSomBrukerMelding(
  ctx: SpillerKontekst,
  brukerPrompt: string,
  feedback?: string,
  forrigeForslag?: unknown,
): string {
  const linjer: string[] = [];
  linjer.push("KONTEKST OM SPILLEREN (JSON):");
  linjer.push("```json");
  linjer.push(JSON.stringify(ctx, null, 2));
  linjer.push("```");
  linjer.push("");
  linjer.push("COACH SIN INSTRUKS:");
  linjer.push(brukerPrompt);
  if (forrigeForslag && feedback) {
    linjer.push("");
    linjer.push("FORRIGE FORSLAG (revider basert på feedback):");
    linjer.push("```json");
    linjer.push(JSON.stringify(forrigeForslag, null, 2));
    linjer.push("```");
    linjer.push("");
    linjer.push("FEEDBACK FRA COACH:");
    linjer.push(feedback);
  }
  linjer.push("");
  linjer.push(
    "Lag en treningsplan tilpasset spilleren. Kall verktøyet \"lever_planforslag\" med en gang.",
  );
  return linjer.join("\n");
}
