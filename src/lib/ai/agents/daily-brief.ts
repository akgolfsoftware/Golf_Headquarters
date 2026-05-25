// Agent: Daily Brief — genererer 200-ord brief til coach hver morgen.
//
// Henter dagens økter, spillere med flagg (overdue tester,
// plan-adherence-fall, HRV-anomali), neste turnering og avsluttende
// anbefaling. Output struktureres slik at coachen leser den raskt.
//
// Demo-modus: hvis ANTHROPIC_API_KEY mangler returneres en deterministisk
// brief generert fra Prisma-data uten Claude-kall.

import "server-only";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "../client";
import { ALL_SKILLS } from "../skills";
import { prisma } from "@/lib/prisma";

const SKILLS_BLOCK = ALL_SKILLS.map(
  (s) => `\n## ${s.name}\n${s.knowledge}`,
).join("\n");

export const DAILY_BRIEF_SYSTEM = `
Du er Daily Brief-agent for AK Golf HQ.
Generer en kort dagsbrief (maks 200 ord) til coach.

Struktur:
1. Antall spillere med økter i dag
2. 3-5 viktigste flagg (sortert etter prioritet)
3. Neste turnering + spillere
4. Avsluttende anbefaling

Tone: konsis, ikke fluff. Aktiv stemme. Norsk bokmål.
Aldri emoji. Aldri utropstegn. Bruk "Solid", "Sterkt" — ikke "Bra jobba!".

KUNNSKAP:
${SKILLS_BLOCK}
`.trim();

export type DailyBriefMetrics = {
  coachId: string;
  dato: string; // ISO YYYY-MM-DD
  okterIdag: number;
  spillereMedOkterIdag: number;
  flagg: Array<{
    spillerId: string;
    spillerNavn: string;
    type: "OVERDUE_TEST" | "PLAN_ADHERENCE" | "HRV_ANOMALI" | "INAKTIV";
    severity: 1 | 2 | 3 | 4 | 5;
    melding: string;
  }>;
  nesteTurnering: {
    id: string;
    navn: string;
    startDato: string;
    dagerTil: number;
    spillere: Array<{ id: string; navn: string }>;
  } | null;
};

export type DailyBriefResult = {
  brief: string;
  metrics: DailyBriefMetrics;
};

/**
 * Hovedfunksjon — bygger brief til coach.
 *
 * 1. Henter alle spillere coachen følger (CoachingSession.coachId).
 * 2. Teller dagens TrainingSessionV2-økter.
 * 3. Identifiserer 3-5 viktigste flagg.
 * 4. Finner neste turnering med deltakere.
 * 5. Sender til Claude (eller demo-fallback) for brief-tekst.
 */
export async function genererDailyBrief(opts: {
  coachId: string;
  dato: Date;
}): Promise<DailyBriefResult> {
  const metrics = await samleMetrics(opts.coachId, opts.dato);

  // Demo-fallback uten Claude.
  if (!isAiEnabled() || !anthropic) {
    return {
      brief: byggDemoBrief(metrics),
      metrics,
    };
  }

  const userPrompt = byggUserPrompt(metrics);
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    system: DAILY_BRIEF_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();

  return {
    brief: text || byggDemoBrief(metrics),
    metrics,
  };
}

// ---------- Datasamling ----------

async function samleMetrics(
  coachId: string,
  dato: Date,
): Promise<DailyBriefMetrics> {
  const dagStart = new Date(dato);
  dagStart.setHours(0, 0, 0, 0);
  const dagSlutt = new Date(dato);
  dagSlutt.setHours(23, 59, 59, 999);

  // Dagens økter (V2-modell).
  const okter = await prisma.trainingSessionV2.findMany({
    where: {
      coachId,
      startTime: { gte: dagStart, lte: dagSlutt },
    },
    select: {
      id: true,
      studentId: true,
    },
  });
  const spillereMedOkter = new Set(
    okter.map((o) => o.studentId).filter((s): s is string => s !== null),
  );

  // Hvilke spillere "tilhører" denne coachen? Vi bruker
  // CoachingSession + TrainingSessionV2 + Group som signal.
  const coachensSpillereSet = new Set<string>();
  const coachingSessions = await prisma.coachingSession.findMany({
    where: { coachId },
    select: { userId: true },
    distinct: ["userId"],
  });
  for (const cs of coachingSessions) coachensSpillereSet.add(cs.userId);
  for (const id of spillereMedOkter) coachensSpillereSet.add(id);

  const spillereIds = Array.from(coachensSpillereSet);
  const spillere = spillereIds.length
    ? await prisma.user.findMany({
        where: { id: { in: spillereIds } },
        select: { id: true, name: true },
      })
    : [];
  const navnMap = new Map(spillere.map((s) => [s.id, s.name]));

  const flagg: DailyBriefMetrics["flagg"] = [];

  // Flagg 1: Inaktive spillere (ingen runder siste 14 dager).
  const fjorten = new Date(dato);
  fjorten.setDate(fjorten.getDate() - 14);
  for (const id of spillereIds) {
    const sisteRunde = await prisma.round.findFirst({
      where: { userId: id },
      orderBy: { playedAt: "desc" },
      select: { playedAt: true },
    });
    if (!sisteRunde || sisteRunde.playedAt < fjorten) {
      const dagerInaktiv = sisteRunde
        ? Math.floor(
            (dato.getTime() - sisteRunde.playedAt.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : null;
      flagg.push({
        spillerId: id,
        spillerNavn: navnMap.get(id) ?? "Ukjent",
        type: "INAKTIV",
        severity: dagerInaktiv && dagerInaktiv > 30 ? 4 : 3,
        melding: dagerInaktiv
          ? `Ingen runder siste ${dagerInaktiv} dager`
          : "Ingen registrerte runder",
      });
    }
  }

  // Flagg 2: HRV/HR-anomali siste 7 dager (resting HR > 75 eller søvn < 6).
  const syvDager = new Date(dato);
  syvDager.setDate(syvDager.getDate() - 7);
  for (const id of spillereIds) {
    const senesteHelse = await prisma.healthEntry.findMany({
      where: { userId: id, date: { gte: syvDager } },
      orderBy: { date: "desc" },
      take: 7,
      select: { restingHr: true, sleepHours: true, date: true },
    });
    const hoyHR = senesteHelse.find(
      (h) => h.restingHr !== null && h.restingHr > 75,
    );
    const lavSovn = senesteHelse.find(
      (h) => h.sleepHours !== null && h.sleepHours < 6,
    );
    if (hoyHR) {
      flagg.push({
        spillerId: id,
        spillerNavn: navnMap.get(id) ?? "Ukjent",
        type: "HRV_ANOMALI",
        severity: 3,
        melding: `Resting HR ${hoyHR.restingHr} (anbefalt < 65)`,
      });
    } else if (lavSovn) {
      flagg.push({
        spillerId: id,
        spillerNavn: navnMap.get(id) ?? "Ukjent",
        type: "HRV_ANOMALI",
        severity: 2,
        melding: `Søvn ${lavSovn.sleepHours}t — under 6t flere ganger`,
      });
    }
  }

  // Flagg 3: Overdue test (definerer her som "ingen TestResult siste 60 dager"
  // for spillere som har minst én TestResult fra før).
  const sekstiDager = new Date(dato);
  sekstiDager.setDate(sekstiDager.getDate() - 60);
  for (const id of spillereIds) {
    const sisteTest = await prisma.testResult.findFirst({
      where: { userId: id },
      orderBy: { takenAt: "desc" },
      select: { takenAt: true },
    });
    if (sisteTest && sisteTest.takenAt < sekstiDager) {
      flagg.push({
        spillerId: id,
        spillerNavn: navnMap.get(id) ?? "Ukjent",
        type: "OVERDUE_TEST",
        severity: 2,
        melding: `Ingen test på ${Math.floor(
          (dato.getTime() - sisteTest.takenAt.getTime()) /
            (1000 * 60 * 60 * 24),
        )} dager`,
      });
    }
  }

  // Sorter flagg etter severity (høyest først), behold maks 5.
  flagg.sort((a, b) => b.severity - a.severity);
  const topFlagg = flagg.slice(0, 5);

  // Neste turnering for coachens spillere.
  let nesteTurnering: DailyBriefMetrics["nesteTurnering"] = null;
  if (spillereIds.length > 0) {
    const entry = await prisma.tournamentEntry.findFirst({
      where: {
        userId: { in: spillereIds },
        OR: [
          { tournament: { startDate: { gte: dato } } },
          { manualDate: { gte: dato } },
        ],
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
      },
      orderBy: [
        { tournament: { startDate: "asc" } },
        { manualDate: "asc" },
      ],
      include: {
        tournament: true,
      },
    });
    if (entry) {
      const startDato =
        entry.tournament?.startDate ?? entry.manualDate ?? dato;
      const navn = entry.tournament?.name ?? entry.manualName ?? "Ukjent";
      const dagerTil = Math.max(
        0,
        Math.floor(
          (startDato.getTime() - dato.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      // Alle spillere påmeldt samme turnering.
      const deltakere = entry.tournamentId
        ? await prisma.tournamentEntry.findMany({
            where: {
              tournamentId: entry.tournamentId,
              userId: { in: spillereIds },
              entryStatus: { in: ["PLANNED", "CONFIRMED"] },
            },
            select: { userId: true },
          })
        : [{ userId: entry.userId }];

      nesteTurnering = {
        id: entry.id,
        navn,
        startDato: startDato.toISOString(),
        dagerTil,
        spillere: deltakere
          .map((d) => ({
            id: d.userId,
            navn: navnMap.get(d.userId) ?? "Ukjent",
          }))
          .slice(0, 10),
      };
    }
  }

  return {
    coachId,
    dato: dato.toISOString().slice(0, 10),
    okterIdag: okter.length,
    spillereMedOkterIdag: spillereMedOkter.size,
    flagg: topFlagg,
    nesteTurnering,
  };
}

// ---------- Prompt-bygging ----------

function byggUserPrompt(m: DailyBriefMetrics): string {
  const flaggBlock = m.flagg.length
    ? m.flagg
        .map(
          (f, i) =>
            `${i + 1}. ${f.spillerNavn} — ${f.type} (severity ${f.severity}): ${f.melding}`,
        )
        .join("\n")
    : "Ingen flagg.";

  const turneringBlock = m.nesteTurnering
    ? `${m.nesteTurnering.navn} om ${m.nesteTurnering.dagerTil} dager (${
        m.nesteTurnering.spillere.length
      } spiller(e): ${m.nesteTurnering.spillere.map((s) => s.navn).join(", ")})`
    : "Ingen kommende turneringer.";

  return `
Generer dagsbrief for coach ${m.coachId} for ${m.dato}.

Dagens økter: ${m.okterIdag} (${m.spillereMedOkterIdag} unike spillere)

Flagg:
${flaggBlock}

Neste turnering:
${turneringBlock}

Skriv brief på 150-200 ord. Følg strukturen i system-prompten.
`.trim();
}

// ---------- Demo-fallback ----------

function byggDemoBrief(m: DailyBriefMetrics): string {
  const linjer: string[] = [];

  linjer.push(`Dagsbrief ${m.dato}.`);
  linjer.push("");

  if (m.okterIdag === 0) {
    linjer.push("Ingen økter planlagt i dag.");
  } else {
    linjer.push(
      `${m.okterIdag} økt(er) planlagt, fordelt på ${m.spillereMedOkterIdag} spillere.`,
    );
  }
  linjer.push("");

  if (m.flagg.length > 0) {
    linjer.push("Flagg:");
    for (const f of m.flagg) {
      linjer.push(`- ${f.spillerNavn}: ${f.melding}`);
    }
  } else {
    linjer.push("Ingen flagg. Solid status.");
  }
  linjer.push("");

  if (m.nesteTurnering) {
    linjer.push(
      `Neste turnering: ${m.nesteTurnering.navn} om ${m.nesteTurnering.dagerTil} dager. ${m.nesteTurnering.spillere.length} spiller(e) påmeldt.`,
    );
  } else {
    linjer.push("Ingen kommende turneringer.");
  }
  linjer.push("");

  // Avsluttende anbefaling.
  if (m.flagg.some((f) => f.severity >= 4)) {
    linjer.push(
      "Anbefaling: Adresser flagg med severity 4+ først. Vurder direkte kontakt.",
    );
  } else if (m.nesteTurnering && m.nesteTurnering.dagerTil <= 14) {
    linjer.push(
      "Anbefaling: Bruk dagen til turneringsforberedelse — fokus på pacing og mental.",
    );
  } else {
    linjer.push("Anbefaling: Hold tempo. Gjennomgang av siste runder etter dagens økter.");
  }

  return linjer.join("\n");
}
