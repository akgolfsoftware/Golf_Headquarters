// Agent: Vinn Tilbake — identifiserer inaktive spillere og foreslår
// personlig oppfølgings-melding for hver.
//
// Inaktiv = ingen runder eller treningsøkter siste 30 dager.
// Hver melding bruker spillerens navn, sist trente type, sist mål,
// og coachens navn — slik at den føles personlig og ekte.

import "server-only";
import { anthropic, modelFor, isAiEnabled } from "../client";
import { kjorGuards } from "@/lib/agenticos";
import { loggInteraksjon } from "@/lib/agenticos/logg";
import { prisma } from "@/lib/prisma";

export const VINN_TILBAKE_SYSTEM = `
Du er Vinn Tilbake-agent for AK Golf HQ.
Du genererer personlige oppfølgings-meldinger til inaktive spillere.

Hver melding må:
- Bruke spillerens fornavn
- Referere til sist trente fokus eller siste mål hvis tilgjengelig
- Avsluttes med en konkret invitasjon (booke time, planlegge runde, etc.)
- Være under 80 ord
- Skrives på norsk bokmål, varm men profesjonell tone
- Aldri emoji, aldri utropstegn

Ikke skriv "Hei [navn]," — start med en personlig observasjon.
`.trim();

export type InaktivSpillerForslag = {
  spillerId: string;
  spillerName: string;
  sistAktiv: Date | null;
  dagerInaktiv: number;
  foreslattMelding: string;
  sisteFokus: string | null;
  sisteMaal: string | null;
  /**
   * AgenticOS-interaksjonen som skrev meldingen. Null når demo-fallbacken
   * kjørte, eller når modellkallet feilet — da fantes det ikke noe å måle.
   */
  interaksjonId?: string | null;
};

/** Versjon av vinn-tilbake-prompten. BUMP ved endring i VINN_TILBAKE_SYSTEM. */
export const VINN_TILBAKE_PROMPT_ID = "vinn-tilbake";
export const VINN_TILBAKE_PROMPT_VERSJON = 1;

export async function identifiserInaktiveSpillere(
  coachId: string,
): Promise<InaktivSpillerForslag[]> {
  const now = new Date();
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);

  // Coachens spillere — fra CoachingSession + TrainingSessionV2.
  const coachensSpillereSet = new Set<string>();
  const coachingSessions = await prisma.coachingSession.findMany({
    where: { coachId },
    select: { userId: true },
    distinct: ["userId"],
  });
  for (const cs of coachingSessions) coachensSpillereSet.add(cs.userId);

  const v2Sessions = await prisma.trainingSessionV2.findMany({
    where: { coachId },
    select: { studentId: true },
    distinct: ["studentId"],
  });
  for (const s of v2Sessions) {
    if (s.studentId) coachensSpillereSet.add(s.studentId);
  }

  const spillereIds = Array.from(coachensSpillereSet);
  if (spillereIds.length === 0) return [];

  // Coachens navn (brukes i meldinger).
  const coach = await prisma.user.findUnique({
    where: { id: coachId },
    select: { name: true },
  });
  const coachNavn = coach?.name ?? "din coach";

  // Hent spillerdata + finn siste aktivitet.
  const spillere = await prisma.user.findMany({
    where: { id: { in: spillereIds } },
    select: {
      id: true,
      name: true,
      hcp: true,
      ambition: true,
    },
  });

  const forslag: InaktivSpillerForslag[] = [];

  for (const sp of spillere) {
    // Siste runde.
    const sisteRunde = await prisma.round.findFirst({
      where: { userId: sp.id },
      orderBy: { playedAt: "desc" },
      select: { playedAt: true },
    });

    // Siste økt (V2).
    const sisteOkt = await prisma.trainingSessionV2.findFirst({
      where: { studentId: sp.id, status: "COMPLETED" },
      orderBy: { endTime: "desc" },
      select: {
        endTime: true,
        practiceType: true,
        title: true,
      },
    });

    const sisteAktivitetTime = Math.max(
      sisteRunde ? sisteRunde.playedAt.getTime() : 0,
      sisteOkt ? sisteOkt.endTime.getTime() : 0,
    );
    const sistAktiv = sisteAktivitetTime > 0 ? new Date(sisteAktivitetTime) : null;

    // Inaktiv hvis ingen aktivitet siste 30 dager.
    if (sistAktiv && sistAktiv >= tretti) continue;

    const dagerInaktiv = sistAktiv
      ? Math.floor((now.getTime() - sistAktiv.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Siste mål (aktivt).
    const sisteMaal = await prisma.goal.findFirst({
      where: { userId: sp.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      select: { title: true },
    });

    const sisteFokus = sisteOkt?.title ?? null;

    const { melding, interaksjonId } = await byggMelding({
      spillerNavn: sp.name,
      coachNavn,
      dagerInaktiv,
      sisteFokus,
      sisteMaalTitle: sisteMaal?.title ?? sp.ambition ?? null,
      hcp: sp.hcp,
      spillerId: sp.id,
    });

    forslag.push({
      spillerId: sp.id,
      spillerName: sp.name,
      sistAktiv,
      dagerInaktiv,
      foreslattMelding: melding,
      sisteFokus,
      sisteMaal: sisteMaal?.title ?? null,
      interaksjonId,
    });
  }

  // Sortert etter mest inaktiv først.
  forslag.sort((a, b) => b.dagerInaktiv - a.dagerInaktiv);
  return forslag;
}

// ---------- Melding-bygging ----------

type MeldingResultat = { melding: string; interaksjonId: string | null };

async function byggMelding(opts: {
  spillerNavn: string;
  coachNavn: string;
  dagerInaktiv: number;
  sisteFokus: string | null;
  sisteMaalTitle: string | null;
  hcp: number | null;
  spillerId: string;
}): Promise<MeldingResultat> {
  // Demo-fallback uten Claude.
  if (!isAiEnabled() || !anthropic) {
    return { melding: byggDemoMelding(opts), interaksjonId: null };
  }

  const fornavn = opts.spillerNavn.split(" ")[0];
  const userPrompt = `
Skriv en personlig oppfølgings-melding på maks 80 ord.

Spiller: ${fornavn} (full: ${opts.spillerNavn})
Coach: ${opts.coachNavn}
Dager inaktiv: ${opts.dagerInaktiv}
${opts.sisteFokus ? `Sist trent på: ${opts.sisteFokus}` : ""}
${opts.sisteMaalTitle ? `Aktivt mål: ${opts.sisteMaalTitle}` : ""}
${opts.hcp !== null ? `HCP: ${opts.hcp}` : ""}

Start meldingen med en personlig observasjon (ikke "Hei [navn],").
Avslutt med en konkret invitasjon (booke time, planlegge runde, etc.).
`.trim();

  try {
    const modell = modelFor("caddie-proactive");
    const start = Date.now();
    const response = await anthropic.messages.create({
      model: modell,
      max_tokens: 300,
      system: VINN_TILBAKE_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
    });
    const latencyMs = Date.now() - start;
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("\n")
      .trim();

    // Meldingen går til en spiller, så domenet er ikke golfmetodikk — ingen
    // FASIT-oppslag er relevant her.
    const interaksjonId = await loggInteraksjon({
      prompt: {
        promptId: VINN_TILBAKE_PROMPT_ID,
        promptVersjon: VINN_TILBAKE_PROMPT_VERSJON,
        system: VINN_TILBAKE_SYSTEM,
        kontekstKilder: ["SPILLERDATA"],
      },
      klassifisering: {
        intent: "fritekst",
        domene: "GENERELT",
        rolle: "ADMIN",
        mindreaarig: false,
        confidence: 1,
      },
      modell,
      tokensInn: response.usage?.input_tokens,
      tokensUt: response.usage?.output_tokens,
      latencyMs,
      kontekstKilder: ["SPILLERDATA"],
      guardTreff: kjorGuards(text),
      userId: opts.spillerId,
      agentNavn: "caddie-proactive",
    });

    return { melding: text || byggDemoMelding(opts), interaksjonId };
  } catch {
    return { melding: byggDemoMelding(opts), interaksjonId: null };
  }
}

function byggDemoMelding(opts: {
  spillerNavn: string;
  coachNavn: string;
  dagerInaktiv: number;
  sisteFokus: string | null;
  sisteMaalTitle: string | null;
  hcp: number | null;
}): string {
  const fornavn = opts.spillerNavn.split(" ")[0];

  const linjer: string[] = [];

  // Personlig observasjon basert på data.
  if (opts.dagerInaktiv > 60) {
    linjer.push(
      `${fornavn}, det er en stund siden vi hørtes — over ${opts.dagerInaktiv} dager.`,
    );
  } else if (opts.sisteFokus) {
    linjer.push(
      `${fornavn}, du har vært borte i ${opts.dagerInaktiv} dager etter den siste økten på ${opts.sisteFokus}.`,
    );
  } else {
    linjer.push(
      `${fornavn}, savner deg på range — ${opts.dagerInaktiv} dager siden sist.`,
    );
  }

  // Referer til mål hvis vi har det.
  if (opts.sisteMaalTitle) {
    linjer.push(
      `Vi snakket om "${opts.sisteMaalTitle}" — det målet står fortsatt.`,
    );
  }

  // Invitasjon.
  if (opts.hcp !== null && opts.hcp < 10) {
    linjer.push(
      "La oss booke en time i denne uka — hold momentumet i gang før sesongen.",
    );
  } else {
    linjer.push(
      "Hva med en time denne uka? Vi kan starte rolig og bygge opp igjen.",
    );
  }

  linjer.push("");
  linjer.push(`Hilsen ${opts.coachNavn}`);

  return linjer.join("\n");
}
