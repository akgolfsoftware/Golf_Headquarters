// Agent: Plan Revision — foreslår plan-justering basert på trigger.
//
// Triggere:
// - "siste-runde": ny runde lagt inn, vurder om plan trenger endring
// - "skade-flagg": Leave/skade lagt inn, plan må pauses eller redusere volum
// - "turnering-prep": turnering nær, plan må peake
//
// Output er en liste med konkrete endrings-forslag med rasjonale.
// Demo-modus genererer deterministisk forslag fra data.

import "server-only";
import { anthropic, AI_MODEL, AI_MAX_TOKENS, isAiEnabled } from "../client";
import { ALL_SKILLS } from "../skills";
import { prisma } from "@/lib/prisma";

const SKILLS_BLOCK = ALL_SKILLS.map(
  (s) => `\n## ${s.name}\n${s.knowledge}`,
).join("\n");

export const PLAN_REVISION_SYSTEM = `
Du er Plan Revision-agent for AK Golf HQ.
Foreslå konkrete plan-justeringer basert på siste data og trigger.

Hver justering må ha:
- En tydelig endring (f.eks. "Reduser FYS-volum fra 4 til 2 økter neste uke")
- Pyramide-akse(r) det gjelder
- Rasjonale (1-2 setninger som forklarer hvorfor)
- Foreslått varighet (f.eks. "2 uker", "til neste runde", "umiddelbart")

Tone: profesjonell, konkret, ingen fluff. Norsk bokmål. Ingen emoji.

KUNNSKAP:
${SKILLS_BLOCK}
`.trim();

export type PlanRevisionTrigger =
  | "siste-runde"
  | "skade-flagg"
  | "turnering-prep";

export type PlanRevisionEndring = {
  endring: string;
  pyramideAkser: Array<"FYS" | "TEK" | "SLAG" | "SPILL" | "TURN">;
  rasjonale: string;
  varighet: string;
};

export type PlanRevisionForslag = {
  planId: string;
  trigger: PlanRevisionTrigger;
  spillerId: string;
  spillerNavn: string;
  endringer: PlanRevisionEndring[];
  samletAnbefaling: string;
};

export async function foreslaPlanRevisjon(opts: {
  planId: string;
  trigger: PlanRevisionTrigger;
  context?: string;
}): Promise<PlanRevisionForslag> {
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: opts.planId },
    include: {
      user: { select: { id: true, name: true, hcp: true } },
      sessions: {
        orderBy: { scheduledAt: "desc" },
        take: 20,
        select: {
          id: true,
          scheduledAt: true,
          pyramidArea: true,
          status: true,
        },
      },
    },
  });

  if (!plan) {
    throw new Error(`Plan ikke funnet: ${opts.planId}`);
  }

  // Hent relevant kontekst basert på trigger.
  const kontekst = await samleKontekst(plan.userId, opts.trigger);

  // Demo-fallback uten Claude.
  if (!isAiEnabled() || !anthropic) {
    return byggDemoForslag(plan, opts.trigger, kontekst);
  }

  const userPrompt = byggUserPrompt(plan, opts.trigger, kontekst, opts.context);
  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    system: PLAN_REVISION_SYSTEM,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();

  // Parsing: Vi prøver å lese strukturert JSON fra svaret. Hvis Claude returnerer
  // markdown/prosa, fall tilbake til demo-forslag og bruk Claude-teksten som
  // samletAnbefaling.
  const parsed = forsokParseEndringer(text);
  if (parsed.length > 0) {
    return {
      planId: opts.planId,
      trigger: opts.trigger,
      spillerId: plan.userId,
      spillerNavn: plan.user.name,
      endringer: parsed,
      samletAnbefaling: text,
    };
  }

  const demo = byggDemoForslag(plan, opts.trigger, kontekst);
  return {
    ...demo,
    samletAnbefaling: text || demo.samletAnbefaling,
  };
}

// ---------- Kontekst-samling ----------

type PlanKontekst = {
  sisteRunde: {
    score: number;
    sgTotal: number | null;
    sgOtt: number | null;
    sgApp: number | null;
    sgArg: number | null;
    sgPutt: number | null;
    playedAt: Date;
  } | null;
  aktivSkade: {
    reason: string;
    startAt: Date;
    isInjury: boolean;
  } | null;
  nesteTurnering: {
    navn: string;
    dagerTil: number;
  } | null;
};

async function samleKontekst(
  spillerId: string,
  trigger: PlanRevisionTrigger,
): Promise<PlanKontekst> {
  const now = new Date();

  // Siste runde
  const sisteRunde =
    trigger === "siste-runde"
      ? await prisma.round.findFirst({
          where: { userId: spillerId },
          orderBy: { playedAt: "desc" },
          select: {
            score: true,
            sgTotal: true,
            sgOtt: true,
            sgApp: true,
            sgArg: true,
            sgPutt: true,
            playedAt: true,
          },
        })
      : null;

  // Aktiv skade
  const aktivSkade =
    trigger === "skade-flagg"
      ? await prisma.leave.findFirst({
          where: {
            userId: spillerId,
            OR: [{ endAt: null }, { endAt: { gte: now } }],
          },
          orderBy: { startAt: "desc" },
          select: {
            reason: true,
            startAt: true,
            isInjury: true,
          },
        })
      : null;

  // Neste turnering
  const turneringEntry =
    trigger === "turnering-prep"
      ? await prisma.tournamentEntry.findFirst({
          where: {
            userId: spillerId,
            OR: [
              { tournament: { startDate: { gte: now } } },
              { manualDate: { gte: now } },
            ],
            entryStatus: { in: ["PLANNED", "CONFIRMED"] },
          },
          orderBy: [
            { tournament: { startDate: "asc" } },
            { manualDate: "asc" },
          ],
          include: { tournament: true },
        })
      : null;

  const nesteTurnering = turneringEntry
    ? {
        navn:
          turneringEntry.tournament?.name ??
          turneringEntry.manualName ??
          "Turnering",
        dagerTil: Math.max(
          0,
          Math.floor(
            ((turneringEntry.tournament?.startDate ??
              turneringEntry.manualDate ??
              now).getTime() -
              now.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        ),
      }
    : null;

  return {
    sisteRunde: sisteRunde
      ? {
          ...sisteRunde,
          playedAt: sisteRunde.playedAt,
        }
      : null,
    aktivSkade: aktivSkade
      ? {
          reason: String(aktivSkade.reason),
          startAt: aktivSkade.startAt,
          isInjury: aktivSkade.isInjury,
        }
      : null,
    nesteTurnering,
  };
}

// ---------- Prompt-bygging ----------

function byggUserPrompt(
  plan: { name: string; user: { name: string; hcp: number | null } },
  trigger: PlanRevisionTrigger,
  k: PlanKontekst,
  extraContext?: string,
): string {
  const linjer: string[] = [
    `Plan: ${plan.name}`,
    `Spiller: ${plan.user.name} (HCP ${plan.user.hcp ?? "ukjent"})`,
    `Trigger: ${trigger}`,
    "",
  ];

  if (k.sisteRunde) {
    linjer.push(
      `Siste runde: score ${k.sisteRunde.score}, SG total ${k.sisteRunde.sgTotal ?? "n/a"} ` +
        `(OTT ${k.sisteRunde.sgOtt ?? "n/a"}, APP ${k.sisteRunde.sgApp ?? "n/a"}, ` +
        `ARG ${k.sisteRunde.sgArg ?? "n/a"}, PUTT ${k.sisteRunde.sgPutt ?? "n/a"})`,
    );
  }
  if (k.aktivSkade) {
    linjer.push(
      `Aktiv skade/leave: ${k.aktivSkade.reason} (siden ${k.aktivSkade.startAt.toISOString().slice(0, 10)})`,
    );
  }
  if (k.nesteTurnering) {
    linjer.push(
      `Neste turnering: ${k.nesteTurnering.navn} om ${k.nesteTurnering.dagerTil} dager`,
    );
  }
  if (extraContext) {
    linjer.push("");
    linjer.push("Ekstra kontekst:");
    linjer.push(extraContext);
  }

  linjer.push("");
  linjer.push(
    "Returner 2-4 konkrete endrings-forslag som JSON-array. Format per element:",
  );
  linjer.push(
    '{"endring": "...", "pyramideAkser": ["TEK","SLAG"], "rasjonale": "...", "varighet": "..."}',
  );
  linjer.push("Etter JSON, skriv en samlet anbefaling på 1-2 setninger.");

  return linjer.join("\n");
}

// ---------- Parsing ----------

function forsokParseEndringer(text: string): PlanRevisionEndring[] {
  // Finn JSON-array i teksten — tar første matche.
  const matchArr = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
  if (!matchArr) return [];
  try {
    const parsed = JSON.parse(matchArr[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (e): e is PlanRevisionEndring =>
          typeof e === "object" &&
          e !== null &&
          typeof (e as PlanRevisionEndring).endring === "string" &&
          Array.isArray((e as PlanRevisionEndring).pyramideAkser) &&
          typeof (e as PlanRevisionEndring).rasjonale === "string" &&
          typeof (e as PlanRevisionEndring).varighet === "string",
      )
      .map((e) => ({
        endring: e.endring,
        pyramideAkser: e.pyramideAkser.filter((a): a is PlanRevisionEndring["pyramideAkser"][number] =>
          ["FYS", "TEK", "SLAG", "SPILL", "TURN"].includes(a),
        ),
        rasjonale: e.rasjonale,
        varighet: e.varighet,
      }));
  } catch {
    return [];
  }
}

// ---------- Demo-fallback ----------

function byggDemoForslag(
  plan: { id: string; userId: string; user: { name: string } },
  trigger: PlanRevisionTrigger,
  k: PlanKontekst,
): PlanRevisionForslag {
  const endringer: PlanRevisionEndring[] = [];
  let samlet = "";

  if (trigger === "siste-runde" && k.sisteRunde) {
    // Identifiser svakeste SG-kategori.
    const sg = k.sisteRunde;
    const kategorier: Array<{ navn: string; verdi: number | null; akse: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN" }> = [
      { navn: "OTT", verdi: sg.sgOtt, akse: "SLAG" },
      { navn: "APP", verdi: sg.sgApp, akse: "SLAG" },
      { navn: "ARG", verdi: sg.sgArg, akse: "SPILL" },
      { navn: "PUTT", verdi: sg.sgPutt, akse: "SPILL" },
    ];
    const med = kategorier.filter((k) => k.verdi !== null) as Array<{
      navn: string;
      verdi: number;
      akse: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
    }>;
    if (med.length > 0) {
      med.sort((a, b) => a.verdi - b.verdi);
      const svakest = med[0];
      endringer.push({
        endring: `Øk fokus på SG-${svakest.navn} med 2 ekstra økter neste 2 uker`,
        pyramideAkser: [svakest.akse],
        rasjonale: `Siste runde viste SG-${svakest.navn} = ${svakest.verdi.toFixed(2)} — svakeste kategori`,
        varighet: "2 uker",
      });
      samlet = `Plan justert mot SG-${svakest.navn} basert på siste runde.`;
    } else {
      samlet = "Manglende SG-data — ingen automatisk justering.";
    }
  } else if (trigger === "skade-flagg" && k.aktivSkade) {
    endringer.push({
      endring: "Pause alle FYS-økter umiddelbart",
      pyramideAkser: ["FYS"],
      rasjonale: `${k.aktivSkade.isInjury ? "Skade" : "Leave"}: ${k.aktivSkade.reason} — unngå overbelastning`,
      varighet: "til returnedAt er satt",
    });
    endringer.push({
      endring: "Erstatt med lett TEK på matte/simulator hvor mulig",
      pyramideAkser: ["TEK"],
      rasjonale: "Hold tekniske mønstre uten å belaste skadet område",
      varighet: "til returnedAt er satt",
    });
    samlet = "Plan pauset for FYS pga aktiv skade — TEK-vedlikehold prioriteres.";
  } else if (trigger === "turnering-prep" && k.nesteTurnering) {
    const dager = k.nesteTurnering.dagerTil;
    if (dager <= 7) {
      endringer.push({
        endring: "Kun touch + mental forberedelse siste uke",
        pyramideAkser: ["TURN"],
        rasjonale: `Turnering om ${dager} dager — taper-fase`,
        varighet: `${dager} dager`,
      });
      samlet = "Plan i konkurranseuken — kun touch og mental prep.";
    } else if (dager <= 21) {
      endringer.push({
        endring: "Spesialisering: 70% SLAG/SPILL, 30% TURN-simulering",
        pyramideAkser: ["SLAG", "SPILL", "TURN"],
        rasjonale: `Turnering om ${dager} dager — spesialiserings-fase`,
        varighet: `${dager - 7} dager før taper starter`,
      });
      samlet = `Plan dreiet mot spesialisering for turnering om ${dager} dager.`;
    } else {
      endringer.push({
        endring: "Oppbyggings-fase: balansert FYS/TEK/SLAG",
        pyramideAkser: ["FYS", "TEK", "SLAG"],
        rasjonale: `Turnering om ${dager} dager — fortsatt oppbygging`,
        varighet: `${dager - 21} dager`,
      });
      samlet = `Oppbyggings-fase aktiv — turnering om ${dager} dager.`;
    }
  } else {
    samlet = "Ikke nok data til konkrete forslag.";
  }

  return {
    planId: plan.id,
    trigger,
    spillerId: plan.userId,
    spillerNavn: plan.user.name,
    endringer,
    samletAnbefaling: samlet,
  };
}
